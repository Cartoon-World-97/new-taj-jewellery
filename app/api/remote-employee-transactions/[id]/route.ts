import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET single employee transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

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
  } catch (error) {
    console.error('Error fetching employee transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee transaction' },
      { status: 500 }
    );
  }
}

// PUT update employee transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get old transaction
    const oldTxn = await db
      .collection('employeeTransactions')
      .findOne({ _id: new ObjectId(id) });

    if (!oldTxn) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Prepare update data (remove id if present)
    const { id: _, ...updateData } = data;

    // Update transaction
    await db
      .collection('employeeTransactions')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );

    // Recalculate for old employee
    if (oldTxn.employeeId) {
      const oldEmployeeTransactions = await db
        .collection('employeeTransactions')
        .find({ employeeId: oldTxn.employeeId })
        .toArray();

      const oldAggregated = oldEmployeeTransactions.reduce(
        (acc, txn) => {
          const goldAmount = txn.goldamount || 0;
          
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

      const oldNetGoldBalance = oldAggregated.totalGoldGiven - oldAggregated.totalGoldReturned;

      await db.collection('employees').updateOne(
        { _id: new ObjectId(oldTxn.employeeId) },
        {
          $set: {
            totalGoldGiven: oldAggregated.totalGoldGiven,
            totalGoldReturned: oldAggregated.totalGoldReturned,
            netGoldBalance: oldNetGoldBalance,
            updatedAt: new Date(),
          },
        }
      );
    }

    // Recalculate for new employee if employee was changed
    if (updateData.employeeId && updateData.employeeId !== oldTxn.employeeId) {
      const newEmployeeTransactions = await db
        .collection('employeeTransactions')
        .find({ employeeId: updateData.employeeId })
        .toArray();

      const newAggregated = newEmployeeTransactions.reduce(
        (acc, txn) => {
          const goldAmount = txn.goldamount || 0;
          
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

      const newNetGoldBalance = newAggregated.totalGoldGiven - newAggregated.totalGoldReturned;

      await db.collection('employees').updateOne(
        { _id: new ObjectId(updateData.employeeId) },
        {
          $set: {
            totalGoldGiven: newAggregated.totalGoldGiven,
            totalGoldReturned: newAggregated.totalGoldReturned,
            netGoldBalance: newNetGoldBalance,
            updatedAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({
      message: 'Employee transaction updated successfully',
    });
  } catch (error) {
    console.error('Error updating employee transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update employee transaction' },
      { status: 500 }
    );
  }
}

// DELETE employee transaction by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID' },
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