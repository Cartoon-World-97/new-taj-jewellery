import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getCurrentTime, getCurrentDate } from '@/lib/transactionUtils';

// GET all employee transactions with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const employeeId = searchParams.get('employeeId');
    const id = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = await getDb();

    // If ID is provided, return single transaction
    if (id) {
      const transaction = await db
        .collection('employeeTransactions')
        .findOne({ _id: new ObjectId(id) });

      if (!transaction) {
        return NextResponse.json(
          { error: 'Transaction not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ transaction });
    }

    let query: any = {};

    // Search by description or employee name
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { employeeName: { $regex: search, $options: 'i' } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = startDate;
      }
      if (endDate) {
        query.date.$lte = endDate;
      }
    }

    // Employee filter
    if (employeeId) {
      query.employeeId = employeeId;
    }

    const transactions = await db
      .collection('employeeTransactions')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching employee transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee transactions' },
      { status: 500 }
    );
  }
}

// POST create new employee transaction
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      employeeId,
      description,
      type, // 'Cr' or 'Dr'
      goldamount,
      islose,
      createdBy,
      createdByName,
    } = data;

    // Validate required fields
    if (!employeeId || !description || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: employeeId, description, and type are required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Verify employee exists
    const employee = await db
      .collection('employees')
      .findOne({ _id: new ObjectId(employeeId) });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Get current date and time
    const date = getCurrentDate();
    const time = getCurrentTime();
    var newgoldamount;
    if(islose){
        newgoldamount =Math.round(((goldamount / 100) * employee.lose) * 1000) / 1000;
        newgoldamount = goldamount + newgoldamount;
    }else{
       newgoldamount = goldamount;
    }
console.log(employee.lose);

    // Create new employee transaction
    const newTransaction = {
      employeeId,
      employeeName: employee.name,
      description,
      type, // 'Cr' or 'Dr'
      goldamount: newgoldamount || 0,
      islose: islose || false,
      date,
      time,
      createdBy,
      createdByName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Insert transaction
    const result = await db.collection('employeeTransactions').insertOne(newTransaction);

    // Fetch all transactions for this employee to recalculate totals
    const employeeTransactions = await db
      .collection('employeeTransactions')
      .find({ employeeId })
      .toArray();

    // Calculate aggregated totals from ALL transactions
    const aggregatedTotals = employeeTransactions.reduce(
      (acc, txn) => {
        const goldAmount = txn.goldamount || 0;
        
        // For 'Cr' (Credit) - add to gold given
        // For 'Dr' (Debit) - add to gold returned
        if (txn.type === 'Cr') {
          acc.totalGoldGiven += goldAmount;
        } else if (txn.type === 'Dr') {
          acc.totalGoldReturned += goldAmount;
        }

        return acc;
      },
      {
        totalGoldGiven: 0,
        totalGoldReturned: 0,
      }
    );

    // Calculate net gold balance (gold given - gold returned)
    const netGoldBalance = aggregatedTotals.totalGoldGiven - aggregatedTotals.totalGoldReturned;

    // Update employee document with aggregated totals
    await db.collection('employees').updateOne(
      { _id: new ObjectId(employeeId) },
      {
        $set: {
          totalGoldGiven: aggregatedTotals.totalGoldGiven,
          totalGoldReturned: aggregatedTotals.totalGoldReturned,
          netGoldBalance: netGoldBalance,
          lastTransactionDate: date,
          updatedAt: new Date(),
        },
      }
    );
    return NextResponse.json({
      message: 'Employee transaction created successfully',
      transactionId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating employee transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create employee transaction' },
      { status: 500 }
    );
  }
}

// DELETE employee transaction
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get transaction
    const txn = await db
      .collection('employeeTransactions')
      .findOne({ _id: new ObjectId(id) });

    if (!txn) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Delete transaction
    await db
      .collection('employeeTransactions')
      .deleteOne({ _id: new ObjectId(id) });

    // Recalculate employee totals
    if (txn.employeeId) {
      const employeeTransactions = await db
        .collection('employeeTransactions')
        .find({ employeeId: txn.employeeId })
        .toArray();

      if (employeeTransactions.length === 0) {
        // Reset all fields to 0 if no transactions left
        await db.collection('employees').updateOne(
          { _id: new ObjectId(txn.employeeId) },
          {
            $set: {
              totalGoldGiven: 0,
              totalGoldReturned: 0,
              netGoldBalance: 0,
              lastTransactionDate: null,
              updatedAt: new Date(),
            },
          }
        );
      } else {
        const aggregated = employeeTransactions.reduce(
          (acc, t) => {
            const goldAmount = t.goldamount || 0;
            
            if (t.type === 'Cr') {
              acc.totalGoldGiven += goldAmount;
            } else if (t.type === 'Dr') {
              acc.totalGoldReturned += goldAmount;
            }

            return acc;
          },
          {
            totalGoldGiven: 0,
            totalGoldReturned: 0,
          }
        );

        const netGoldBalance = aggregated.totalGoldGiven - aggregated.totalGoldReturned;

        await db.collection('employees').updateOne(
          { _id: new ObjectId(txn.employeeId) },
          {
            $set: {
              totalGoldGiven: aggregated.totalGoldGiven,
              totalGoldReturned: aggregated.totalGoldReturned,
              netGoldBalance: netGoldBalance,
              updatedAt: new Date(),
            },
          }
        );
      }
    }

    return NextResponse.json({
      message: 'Employee transaction deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting employee transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee transaction' },
      { status: 500 }
    );
  }
}