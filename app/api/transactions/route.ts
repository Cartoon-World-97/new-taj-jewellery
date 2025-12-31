import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { generateTransactionId, getCurrentTime, getCurrentDate } from '@/lib/transactionUtils';

// GET all transactions with optional search and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const employeeId = searchParams.get('employeeId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = await getDb();
    let query: any = {};

    // Search by transaction ID, employee name
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { assignedToName: { $regex: search, $options: 'i' } },
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
      query.customerID = employeeId;
    }

    const transactions = await db
      .collection('transactions')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST create new transaction
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      customerID,
      assignedToName,
      items,
      total,
      goldBar,
      closingBalance,
      notes,
      createdBy,
      createdByName,
    } = data;

    // Validate required fields
    if (!customerID || !items || !total) {
      return NextResponse.json(
        { error: 'Missing required fields: customerID, items, and total are required' },
        { status: 404 }
      );
    }

    const db = await getDb();

    // Verify employee exists
    const employee = await db
      .collection('employees')
      .findOne({ _id: new ObjectId(customerID) });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Generate unique transaction ID
    const transactionId = await generateTransactionId();
    
    // Get current date and time
    const date = getCurrentDate();
    const time = getCurrentTime();

    // Create new transaction
    const newTransaction = {
      transactionId,
      date,
      time,
      customerID,
      assignedToName: assignedToName || employee.name,
      items,
      total,
      goldBar,
      closingBalance,
      notes: notes || '',
      createdBy,
      createdByName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert transaction
    const result = await db.collection('transactions').insertOne(newTransaction);

    // Fetch all transactions for this employee to recalculate totals
    const employeeTransactions = await db
      .collection('transactions')
      .find({ customerID })
      .toArray();

    // Check if there are any transactions
    if (employeeTransactions.length === 0) {
      // No transactions found - insert default values
      await db.collection('employees').updateOne(
        { _id: new ObjectId(customerID) },
        {
          $set: {
            totalPcs: 0,
            totalNetWt: 0,
            totalInchIbr: 0,
            totalGold: 0,
            totalGoldBarWeight: 0,
            totalGoldBarAmount: 0,
            closingGoldBalance: 0,
            closingCashBalance: 0,
            lastTransactionDate: null,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // Calculate aggregated totals from ALL transactions
      const aggregatedTotals = employeeTransactions.reduce(
        (acc, txn) => {
          return {
            totalPcs: acc.totalPcs + (txn.total?.pcs || 0),
            totalNetWt: acc.totalNetWt + (txn.total?.netWt || 0),
            totalInchIbr: acc.totalInchIbr + (txn.total?.inchIbr || 0),
            totalGold: acc.totalGold + (txn.total?.gold || 0),
            totalGoldBarWeight: acc.totalGoldBarWeight + (txn.goldBar?.weight || 0),
            totalGoldBarAmount: acc.totalGoldBarAmount + (txn.goldBar?.amount || 0),
            // Use the LATEST closing balances (from the most recent transaction)
            closingGoldBalance: txn.closingBalance?.gold ?? acc.closingGoldBalance,
            closingCashBalance: txn.closingBalance?.cash ?? acc.closingCashBalance,
          };
        },
        {
          totalPcs: 0,
          totalNetWt: 0,
          totalInchIbr: 0,
          totalGold: 0,
          totalGoldBarWeight: 0,
          totalGoldBarAmount: 0,
          closingGoldBalance: 0,
          closingCashBalance: 0,
        }
      );

      // Update employee document with aggregated totals
      await db.collection('emphloyees').updateOne(
        { _id: new ObjectId(customerID) },
        {
          $set: {
            totalPcs: aggregatedTotals.totalPcs,
            totalNetWt: aggregatedTotals.totalNetWt,
            totalInchIbr: aggregatedTotals.totalInchIbr,
            totalGold: aggregatedTotals.totalGold,
            totalGoldBarWeight: aggregatedTotals.totalGoldBarWeight,
            totalGoldBarAmount: aggregatedTotals.totalGoldBarAmount,
            closingGoldBalance: aggregatedTotals.closingGoldBalance,
            closingCashBalance: aggregatedTotals.closingCashBalance,
            lastTransactionDate: date,
            updatedAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({
      message: 'Transaction created successfully',
      transactionId: result.insertedId,
      generatedId: transactionId,
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

// PUT update transaction
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get old transaction
    const oldTxn = await db
      .collection('transactions')
      .findOne({ _id: new ObjectId(id) });

    if (!oldTxn) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Update transaction
    const result = await db
      .collection('transactions')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );

    // Recalculate for old employee if employee changed
    if (oldTxn.customerID) {
      const oldEmployeeTransactions = await db
        .collection('transactions')
        .find({ customerID: oldTxn.customerID })
        .toArray();

      const oldAggregated = oldEmployeeTransactions.reduce(
        (acc, txn) => ({
          totalPcs: acc.totalPcs + (txn.total?.pcs || 0),
          totalNetWt: acc.totalNetWt + (txn.total?.netWt || 0),
          totalInchIbr: acc.totalInchIbr + (txn.total?.inchIbr || 0),
          totalGold: acc.totalGold + (txn.total?.gold || 0),
          totalGoldBarWeight: acc.totalGoldBarWeight + (txn.goldBar?.weight || 0),
          totalGoldBarAmount: acc.totalGoldBarAmount + (txn.goldBar?.amount || 0),
          closingGoldBalance: txn.closingBalance?.gold || acc.closingGoldBalance,
          closingCashBalance: txn.closingBalance?.cash || acc.closingCashBalance,
        }),
        {
          totalPcs: 0,
          totalNetWt: 0,
          totalInchIbr: 0,
          totalGold: 0,
          totalGoldBarWeight: 0,
          totalGoldBarAmount: 0,
          closingGoldBalance: 0,
          closingCashBalance: 0,
        }
      );

      await db.collection('users').updateOne(
        { _id: new ObjectId(oldTxn.customerID) },
        {
          $set: {
            ...oldAggregated,
            updatedAt: new Date(),
          },
        }
      );
    }

    // Recalculate for new employee if employee was changed
    if (updateData.customerID && updateData.customerID !== oldTxn.customerID) {
      const newEmployeeTransactions = await db
        .collection('transactions')
        .find({ customerID: updateData.customerID })
        .toArray();

      const newAggregated = newEmployeeTransactions.reduce(
        (acc, txn) => ({
          totalPcs: acc.totalPcs + (txn.total?.pcs || 0),
          totalNetWt: acc.totalNetWt + (txn.total?.netWt || 0),
          totalInchIbr: acc.totalInchIbr + (txn.total?.inchIbr || 0),
          totalGold: acc.totalGold + (txn.total?.gold || 0),
          totalGoldBarWeight: acc.totalGoldBarWeight + (txn.goldBar?.weight || 0),
          totalGoldBarAmount: acc.totalGoldBarAmount + (txn.goldBar?.amount || 0),
          closingGoldBalance: txn.closingBalance?.gold || acc.closingGoldBalance,
          closingCashBalance: txn.closingBalance?.cash || acc.closingCashBalance,
        }),
        {
          totalPcs: 0,
          totalNetWt: 0,
          totalInchIbr: 0,
          totalGold: 0,
          totalGoldBarWeight: 0,
          totalGoldBarAmount: 0,
          closingGoldBalance: 0,
          closingCashBalance: 0,
        }
      );

      await db.collection('users').updateOne(
        { _id: new ObjectId(updateData.customerID) },
        {
          $set: {
            ...newAggregated,
            updatedAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({
      message: 'Transaction updated successfully',
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

// DELETE transaction
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
      .collection('transactions')
      .findOne({ _id: new ObjectId(id) });

    if (!txn) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Delete transaction
    await db
      .collection('transactions')
      .deleteOne({ _id: new ObjectId(id) });

    // Recalculate employee totals
    if (txn.customerID) {
      const employeeTransactions = await db
        .collection('transactions')
        .find({ customerID: txn.customerID })
        .toArray();

      if (employeeTransactions.length === 0) {
        // Reset all fields to 0 if no transactions left
        await db.collection('users').updateOne(
          { _id: new ObjectId(txn.customerID) },
          {
            $set: {
              totalPcs: 0,
              totalNetWt: 0,
              totalInchIbr: 0,
              totalGold: 0,
              totalGoldBarWeight: 0,
              totalGoldBarAmount: 0,
              closingGoldBalance: 0,
              closingCashBalance: 0,
              lastTransactionDate: null,
              updatedAt: new Date(),
            },
          }
        );
      } else {
        const aggregated = employeeTransactions.reduce(
          (acc, t) => ({
            totalPcs: acc.totalPcs + (t.total?.pcs || 0),
            totalNetWt: acc.totalNetWt + (t.total?.netWt || 0),
            totalInchIbr: acc.totalInchIbr + (t.total?.inchIbr || 0),
            totalGold: acc.totalGold + (t.total?.gold || 0),
            totalGoldBarWeight: acc.totalGoldBarWeight + (t.goldBar?.weight || 0),
            totalGoldBarAmount: acc.totalGoldBarAmount + (t.goldBar?.amount || 0),
            closingGoldBalance: t.closingBalance?.gold || acc.closingGoldBalance,
            closingCashBalance: t.closingBalance?.cash || acc.closingCashBalance,
          }),
          {
            totalPcs: 0,
            totalNetWt: 0,
            totalInchIbr: 0,
            totalGold: 0,
            totalGoldBarWeight: 0,
            totalGoldBarAmount: 0,
            closingGoldBalance: 0,
            closingCashBalance: 0,
          }
        );

        await db.collection('users').updateOne(
          { _id: new ObjectId(txn.customerID) },
          {
            $set: {
              ...aggregated,
              updatedAt: new Date(),
            },
          }
        );
      }
    }

    return NextResponse.json({
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}