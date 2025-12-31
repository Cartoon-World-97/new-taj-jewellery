import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const db = await getDb();

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const clients = await db
      .collection('clients')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ clients });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const db = await getDb();

  await db.collection('clients').insertOne({
    ...body,
    isActive: true,
    accountBalance: 0,
    totalGoldGiven: 0,
    totalAmountPaid: 0,
    totalAmountReceived: 0,
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...data } = body;

  const db = await getDb();
  await db.collection('clients').updateOne(
    { _id: new ObjectId(id) },
    { $set: data }
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  const db = await getDb();
  await db.collection('clients').deleteOne({ _id: new ObjectId(id) });

  return NextResponse.json({ success: true });
}
