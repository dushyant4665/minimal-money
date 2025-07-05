import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('finance-tracker');
    const txCol = db.collection('transactions');
    const budgetCol = db.collection('budgets');

    // Get all transactions
    const transactions = await txCol.find({}).toArray();

    // Calculate total expenses and income
    const totalExpenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const totalIncome = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    const netAmount = totalIncome - totalExpenses;

    // Get recent transactions (last 5)
    const recentTransactions = transactions
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Calculate monthly expenses for the last 6 months
    const monthlyExpenses: { [key: string]: number } = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    transactions
      .filter((t: any) => t.type === 'expense' && new Date(t.date) >= sixMonthsAgo)
      .forEach((t: any) => {
        const month = t.date.substring(0, 7); // YYYY-MM format
        monthlyExpenses[month] = (monthlyExpenses[month] || 0) + t.amount;
      });
    const monthlyExpensesArray = Object.entries(monthlyExpenses)
      .map(([month, total]) => ({ month, total: total as number }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate category expenses (all time)
    const categoryExpenses: { [key: string]: number } = {};
    transactions
      .filter((t: any) => t.type === 'expense' && t.category)
      .forEach((t: any) => {
        categoryExpenses[t.category!] = (categoryExpenses[t.category!] || 0) + t.amount;
      });
    const categoryExpensesArray = Object.entries(categoryExpenses)
      .map(([category, total]) => ({
        category,
        total: total as number,
        percentage: totalExpenses > 0 ? ((total as number) / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => (b.total as number) - (a.total as number));

    // --- Budgeting ---
    const currentMonth = getCurrentMonth();
    const budgets = await budgetCol.find({ month: currentMonth }).toArray();
    const budgetMap: { [key: string]: number } = Object.fromEntries(budgets.map((b: any) => [b.category, b.amount]));
    // Calculate actual spent per category for current month
    const actuals: { [key: string]: number } = {};
    transactions
      .filter((t: any) => t.type === 'expense' && t.category && t.date.startsWith(currentMonth))
      .forEach((t: any) => {
        actuals[t.category!] = (actuals[t.category!] || 0) + t.amount;
      });
    // Budget vs actual array
    const budgetVsActual = Object.keys(budgetMap).map(category => ({
      category,
      budget: budgetMap[category],
      actual: actuals[category] || 0,
    }));
    // Insights
    const insights = budgetVsActual
      .filter(item => item.actual > item.budget)
      .map(item => `You are over budget in ${item.category} by $${(item.actual - item.budget).toFixed(2)}`);

    return NextResponse.json({
      totalExpenses,
      totalIncome,
      netAmount,
      recentTransactions,
      monthlyExpenses: monthlyExpensesArray,
      categoryExpenses: categoryExpensesArray,
      budgets,
      budgetVsActual,
      insights,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 