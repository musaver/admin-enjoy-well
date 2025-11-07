import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userSubscriptions } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Get single user subscription
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const userSub = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.id, id));
    
    if (userSub.length === 0) {
      return NextResponse.json({ error: 'User subscription not found' }, { status: 404 });
    }
    
    return NextResponse.json(userSub[0]);
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch user subscription' }, { status: 500 });
  }
}

// Update user subscription
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    
    // Check if subscription exists
    const existing = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.id, id));
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'User subscription not found' }, { status: 404 });
    }
    
    const updateData: any = {};
    
    if (data.status !== undefined) updateData.status = data.status;
    if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
    if (data.cancelledAt !== undefined) updateData.cancelledAt = data.cancelledAt ? new Date(data.cancelledAt) : null;
    if (data.nextBillingDate !== undefined) updateData.nextBillingDate = data.nextBillingDate ? new Date(data.nextBillingDate) : null;
    if (data.autoRenew !== undefined) updateData.autoRenew = data.autoRenew;
    if (data.cancelReason !== undefined) updateData.cancelReason = data.cancelReason;
    if (data.notes !== undefined) updateData.notes = data.notes;
    
    updateData.updatedAt = new Date();
    
    await db
      .update(userSubscriptions)
      .set(updateData)
      .where(eq(userSubscriptions.id, id));
    
    const updated = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.id, id));
    
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating user subscription:', error);
    return NextResponse.json({ error: 'Failed to update user subscription' }, { status: 500 });
  }
}

// Delete/Cancel user subscription
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if subscription exists
    const existing = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.id, id));
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'User subscription not found' }, { status: 404 });
    }
    
    await db
      .delete(userSubscriptions)
      .where(eq(userSubscriptions.id, id));
    
    return NextResponse.json({ message: 'User subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting user subscription:', error);
    return NextResponse.json({ error: 'Failed to delete user subscription' }, { status: 500 });
  }
}

