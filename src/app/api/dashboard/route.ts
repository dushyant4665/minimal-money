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
    const transactions = await txCol.find({}).toArray() as unknown[];

    // Calculate total expenses and income
    const totalExpenses = transactions
      .filter((t) => (t as { type: string }).type === 'expense')
      .reduce((sum, t) => sum + (t as { amount: number }).amount, 0);
    const totalIncome = transactions
      .filter((t) => (t as { type: string }).type === 'income')
      .reduce((sum, t) => sum + (t as { amount: number }).amount, 0);
    const netAmount = totalIncome - totalExpenses;

    // Get recent transactions (last 5)
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date((b as { date: string }).date).getTime() - new Date((a as { date: string }).date).getTime())
      .slice(0, 5);

    // Calculate monthly expenses for the last 6 months
    const monthlyExpenses: { [key: string]: number } = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    transactions
      .filter((t) => (t as { type: string; date: string }).type === 'expense' && new Date((t as { date: string }).date) >= sixMonthsAgo)
      .forEach((t) => {
        const month = (t as { date: string }).date.substring(0, 7); // YYYY-MM format
        monthlyExpenses[month] = (monthlyExpenses[month] || 0) + (t as { amount: number }).amount;
      });
    const monthlyExpensesArray = Object.entries(monthlyExpenses)
      .map(([month, total]) => ({ month, total: total as number }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate category expenses (all time)
    const categoryExpenses: { [key: string]: number } = {};
    transactions
      .filter((t) => (t as { type: string; category?: string }).type === 'expense' && (t as { category?: string }).category)
      .forEach((t) => {
        const cat = (t as { category: string }).category;
        categoryExpenses[cat] = (categoryExpenses[cat] || 0) + (t as { amount: number }).amount;
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
    const budgets = await budgetCol.find({ month: currentMonth }).toArray() as unknown[];
    const budgetMap: { [key: string]: number } = Object.fromEntries((budgets as { category: string; amount: number }[]).map((b) => [b.category, b.amount]));
    // Calculate actual spent per category for current month
    const actuals: { [key: string]: number } = {};
    transactions
      .filter((t) => (t as { type: string; category?: string; date: string }).type === 'expense' && (t as { category?: string }).category && (t as { date: string }).date.startsWith(currentMonth))
      .forEach((t) => {
        const cat = (t as { category: string }).category;
        actuals[cat] = (actuals[cat] || 0) + (t as { amount: number }).amount;
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