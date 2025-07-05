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
      .filter((t: Record<string, unknown>) => t.type === 'expense')
      .reduce((sum: number, t: Record<string, unknown>) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0);
    const totalIncome = transactions
      .filter((t: Record<string, unknown>) => t.type === 'income')
      .reduce((sum: number, t: Record<string, unknown>) => sum + (typeof t.amount === 'number' ? t.amount : 0), 0);
    const netAmount = totalIncome - totalExpenses;

    // Get recent transactions (last 5)
    const recentTransactions = [...transactions]
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime())
      .slice(0, 5);

    // Calculate monthly expenses for the last 6 months
    const monthlyExpenses: { [key: string]: number } = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    transactions
      .filter((t: Record<string, unknown>) => t.type === 'expense' && new Date(String(t.date)) >= sixMonthsAgo)
      .forEach((t: Record<string, unknown>) => {
        const month = String(t.date).substring(0, 7); // YYYY-MM format
        monthlyExpenses[month] = (monthlyExpenses[month] || 0) + (typeof t.amount === 'number' ? t.amount : 0);
      });
    const monthlyExpensesArray = Object.entries(monthlyExpenses)
      .map(([month, total]) => ({ month, total: total as number }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate category expenses (all time)
    const categoryExpenses: { [key: string]: number } = {};
    transactions
      .filter((t: Record<string, unknown>) => t.type === 'expense' && t.category)
      .forEach((t: Record<string, unknown>) => {
        categoryExpenses[String(t.category)] = (categoryExpenses[String(t.category)] || 0) + (typeof t.amount === 'number' ? t.amount : 0);
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
    const budgetMap: { [key: string]: number } = Object.fromEntries(budgets.map((b: Record<string, unknown>) => [b.category, b.amount]));
    // Calculate actual spent per category for current month
    const actuals: { [key: string]: number } = {};
    transactions
      .filter((t: Record<string, unknown>) => t.type === 'expense' && t.category && String(t.date).startsWith(currentMonth))
      .forEach((t: Record<string, unknown>) => {
        actuals[String(t.category)] = (actuals[String(t.category)] || 0) + (typeof t.amount === 'number' ? t.amount : 0);
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
      .map(item => `You are over budget in ${item.category} by ₹${(item.actual - item.budget).toFixed(2)}`);

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
