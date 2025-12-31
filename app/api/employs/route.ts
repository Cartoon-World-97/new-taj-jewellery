import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// GET all users
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const users = await db
      .collection('employees')
      .find({})
      .project({ password: 0 })
      .toArray();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, email, phone } = data;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if user exists
    const existingUser = await db.collection('employees').findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }
    const newUser = {
      name,
      email,
      phone: phone || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('employees').insertOne(newUser);

    return NextResponse.json({
      message: 'Employee created successfully',
      userId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, name, email,phone } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const updateData: any = {
      name,
      email,
      phone,
      updatedAt: new Date(),
    };
    const result = await db
      .collection('employees')
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Employee updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db
      .collection('employees')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
