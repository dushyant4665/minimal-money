import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export async function PUT(request: Request, { params }: { params: { id: string } }): Promise<Response> {
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
      return new Response(JSON.stringify({ error: 'Budget not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ message: 'Budget updated successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to update budget' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const client = await clientPromise;
    const db = client.db('finance-tracker');
    const collection = db.collection('budgets');
    const result = await collection.deleteOne({ _id: new ObjectId(params.id) });
    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: 'Budget not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ message: 'Budget deleted successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to delete budget' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
} 