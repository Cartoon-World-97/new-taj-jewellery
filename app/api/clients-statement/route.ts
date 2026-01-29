import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get employee details
    const employee = await db
      .collection('clients')
      .findOne({ _id: new ObjectId(employeeId) });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Get all transactions for this employee
    const transactions = await db
      .collection('clientsTransactions')
      .find({ employeeId })
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate summary from transactions
    let totalGoldGiven = 0;
    let totalGoldReturned = 0;

    transactions.forEach((txn) => {
      const goldAmount = txn.goldamount || 0;
      
      // For 'Cr' (Credit) - gold given to employee
      // For 'Dr' (Debit) - gold returned by employee
      if (txn.type === 'Cr') {
        totalGoldGiven += goldAmount;
      } else if (txn.type === 'Dr') {
        totalGoldReturned += goldAmount;
      }
    });

    // Calculate net gold balance (positive = we gave them gold, negative = they returned more)
    const netGoldBalance = totalGoldGiven - totalGoldReturned;

    const summary = {
      totalGoldGiven,
      totalGoldReturned,
      netGoldBalance,
      totalTransactions: transactions.length,
    };

    return NextResponse.json({
      employee: {
        ...employee,
        // Add calculated balance to employee object for display
        accountBalance: netGoldBalance,
      },
      transactions,
      summary,
    });
  } catch (error) {
    console.error('Error fetching employee statement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee statement' },
      { status: 500 }
    );
  }
}