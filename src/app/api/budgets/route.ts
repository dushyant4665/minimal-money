import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('finance-tracker');
    const collection = db.collection('budgets');
    const month = request.nextUrl.searchParams.get('month');
    const query = month ? { month } : {};
    const budgets = await collection.find(query).toArray();
    return NextResponse.json(budgets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('finance-tracker');
    const collection = db.collection('budgets');
    const result = await collection.insertOne({ ...body, createdAt: new Date(), updatedAt: new Date() });
    return NextResponse.json({ ...body, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
} 