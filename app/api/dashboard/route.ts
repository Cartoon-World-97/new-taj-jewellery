import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Collections to aggregate
    const transactionCollections = [
      { name: 'clientsTransactions', source: 'client' },
      { name: 'employeeTransactions', source: 'employee' },
      { name: 'remoteEmployeeTransactions', source: 'remoteEmployee' },
    ];

    let totalTransactions = 0;
    let todayTransactions = 0;
    let totalGoldAmount = 0;
    let allRecentTransactions: any[] = [];

    for (const col of transactionCollections) {
      // Total transactions
      const totalCount = await db.collection(col.name).countDocuments();
      totalTransactions += totalCount;

      // Today's transactions
      const todayCount = await db
        .collection(col.name)
        .countDocuments({ date: { $gte: todayISO } });
      todayTransactions += todayCount;

      // Total gold amount
      const goldAgg = await db
        .collection(col.name)
        .aggregate([{ $group: { _id: null, sum: { $sum: '$goldamount' } } }])
        .toArray();
      totalGoldAmount += goldAgg[0]?.sum || 0;

      // Recent transactions (today)
      const recent = await db
        .collection(col.name)
        .find({ date: { $gte: todayISO } })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();
      allRecentTransactions.push(
        ...recent.map((t) => ({ ...t, source: col.source }))
      );
    }

    // Sort and pick top 10 recent transactions
    allRecentTransactions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const recentTransactions = allRecentTransactions.slice(0, 10);

    // Total users
    const totalClients = await db.collection('clients').countDocuments();
    const totalEmployees = await db.collection('employees').countDocuments();
    const totalRemoteEmployees = await db.collection('remoteEmployees').countDocuments();
    const totalUsers = totalClients + totalEmployees + totalRemoteEmployees;

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
