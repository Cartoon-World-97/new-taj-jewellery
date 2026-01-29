import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();

    // Get total transactions from all three collections
    const clientTransactionsCount = await db
      .collection('clientsTransactions')
      .countDocuments();
    const employeeTransactionsCount = await db
      .collection('employeeTransactions')
      .countDocuments();
    const remoteEmployeeTransactionsCount = await db
      .collection('remoteEmployeeTransactions')
      .countDocuments();

    const totalTransactions =
      clientTransactionsCount +
      employeeTransactionsCount +
      remoteEmployeeTransactionsCount;

    // Get total users from all collections
    const totalClients = await db.collection('clients').countDocuments();
    const totalEmployees = await db.collection('employees').countDocuments();
    const totalRemoteEmployees = await db
      .collection('remoteEmployees')
      .countDocuments();

    const totalUsers = totalClients + totalEmployees + totalRemoteEmployees;

    // Get today's transactions from all three collections
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];

    const todayClientTransactions = await db
      .collection('clientsTransactions')
      .countDocuments({
        date: { $gte: todayString },
      });

    const todayEmployeeTransactions = await db
      .collection('employeeTransactions')
      .countDocuments({
        date: { $gte: todayString },
      });

    const todayRemoteEmployeeTransactions = await db
      .collection('remoteEmployeeTransactions')
      .countDocuments({
        date: { $gte: todayString },
      });

    const todayTransactions =
      todayClientTransactions +
      todayEmployeeTransactions +
      todayRemoteEmployeeTransactions;

    // Calculate total gold amount from all collections
    const clientTransactions = await db
      .collection('clientsTransactions')
      .find({})
      .toArray();
    const employeeTransactions = await db
      .collection('employeeTransactions')
      .find({})
      .toArray();
    const remoteEmployeeTransactions = await db
      .collection('remoteEmployeeTransactions')
      .find({})
      .toArray();

    const allTransactions = [
      ...clientTransactions,
      ...employeeTransactions,
      ...remoteEmployeeTransactions,
    ];

    const totalGoldAmount = allTransactions.reduce(
      (sum, t) => sum + (t.goldamount || 0),
      0
    );

    // Get recent transactions from all collections (last 10 combined)
    const recentClientTransactions = await db
      .collection('clientsTransactions')
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const recentEmployeeTransactions = await db
      .collection('employeeTransactions')
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const recentRemoteEmployeeTransactions = await db
      .collection('remoteEmployeeTransactions')
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Combine and sort all recent transactions
    const allRecentTransactions = [
      ...recentClientTransactions.map((t) => ({ ...t, source: 'client' })),
      ...recentEmployeeTransactions.map((t) => ({ ...t, source: 'employee' })),
      ...recentRemoteEmployeeTransactions.map((t) => ({
        ...t,
        source: 'remoteEmployee',
      })),
    ];

    // Sort by createdAt and take top 10
    const recentTransactions = allRecentTransactions
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);

    return NextResponse.json({
      stats: {
        totalTransactions,
        totalUsers,
        totalEmployees,
        totalClients,
        totalRemoteEmployees,
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