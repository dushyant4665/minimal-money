import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { validateTransaction } from '@/lib/utils';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('finance-tracker');
    const collection = db.collection('transactions');

    const transactions = await collection
      .find({})
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = validateTransaction(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('finance-tracker');
    const collection = db.collection('transactions');

    const transaction = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(transaction);
    
    return NextResponse.json(
      { ...transaction, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
} 