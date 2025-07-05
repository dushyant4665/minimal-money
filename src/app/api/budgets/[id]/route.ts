import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export async function PUT(request: NextRequest, context: any) {
  const { params } = context;
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('finance-tracker');
    const collection = db.collection('budgets');
    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { ...body, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Budget updated successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const { params } = context;
  try {
    const client = await clientPromise;
    const db = client.db('finance-tracker');
    const collection = db.collection('budgets');
    const result = await collection.deleteOne({ _id: new ObjectId(params.id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Budget deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
} 