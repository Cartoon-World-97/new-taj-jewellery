import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get all transactions assigned to this employee
    const allTransactions = await db
      .collection('employs')
      .find({ assignedTo: employeeId })
      .toArray();

    // Count by status
    const pendingCount = allTransactions.filter(t => t.status === 'pending').length;
    const approvedCount = allTransactions.filter(t => t.status === 'approved').length;
    const rejectedCount = allTransactions.filter(t => t.status === 'rejected').length;

    // Calculate total gold handled
    const totalGoldHandled = allTransactions.reduce(
      (sum, t) => sum + (t.total?.gold || 0),
      0
    );

    // Get recent transactions (last 10)
    const recentTransactions = await db
      .collection('transactions')
      .find({ assignedTo: employeeId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      stats: {
        totalAssigned: allTransactions.length,
        pendingCount,
        approvedCount,
        rejectedCount,
        totalGoldHandled: totalGoldHandled.toFixed(3),
        recentTransactions,
      },
    });
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee statistics' },
      { status: 500 }
    );
  }
}
