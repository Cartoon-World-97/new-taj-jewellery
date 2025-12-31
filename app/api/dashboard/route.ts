import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();

    // Get total transactions
    const totalTransactions = await db.collection('transactions').countDocuments();

    // Get total employees
    const totalEmployees = await db
      .collection('users')
      .countDocuments({ role: 'employee' });

    // Get today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];

    const todayTransactions = await db
      .collection('transactions')
      .countDocuments({
        date: { $gte: todayString },
      });

    // Calculate total gold amount
    const transactions = await db.collection('transactions').find({}).toArray();
    const totalGoldAmount = transactions.reduce(
      (sum, t) => sum + (t.total?.gold || 0),
      0
    );

    // Get recent transactions (last 10)
    const recentTransactions = await db
      .collection('transactions')
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      stats: {
        totalTransactions,
        totalEmployees,
        todayTransactions,
        totalGoldAmount: totalGoldAmount.toFixed(3),
        recentTransactions,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
