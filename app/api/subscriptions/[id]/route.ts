import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, id),
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Failed to get subscription' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();

    // Validate required fields if provided
    if (data.name !== undefined && !data.name) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    }
    
    if (data.price !== undefined && (isNaN(parseFloat(data.price)) || parseFloat(data.price) < 0)) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
    }

    // Parse features if it's a string
    let features = data.features;
    if (features && typeof features === 'string') {
      try {
        features = JSON.parse(features);
      } catch {
        features = features.split(',').map((f: string) => f.trim()).filter(Boolean);
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.price !== undefined) updateData.price = parseFloat(data.price).toFixed(2);
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.billingCycle !== undefined) updateData.billingCycle = data.billingCycle;
    if (data.billingIntervalCount !== undefined) updateData.billingIntervalCount = parseInt(data.billingIntervalCount);
    if (data.durationDays !== undefined) updateData.durationDays = data.durationDays ? parseInt(data.durationDays) : null;
    if (data.expiresAfterDays !== undefined) updateData.expiresAfterDays = data.expiresAfterDays ? parseInt(data.expiresAfterDays) : null;
    if (data.trialDays !== undefined) updateData.trialDays = parseInt(data.trialDays) || 0;
    if (features !== undefined) updateData.features = features || null;
    if (data.maxUsers !== undefined) updateData.maxUsers = data.maxUsers ? parseInt(data.maxUsers) : null;
    if (data.maxOrders !== undefined) updateData.maxOrders = data.maxOrders ? parseInt(data.maxOrders) : null;
    if (data.maxProducts !== undefined) updateData.maxProducts = data.maxProducts ? parseInt(data.maxProducts) : null;
    if (data.discountPercentage !== undefined) updateData.discountPercentage = parseFloat(data.discountPercentage).toFixed(2);
    if (data.comparePrice !== undefined) updateData.comparePrice = data.comparePrice ? parseFloat(data.comparePrice).toFixed(2) : null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isPopular !== undefined) updateData.isPopular = data.isPopular;
    if (data.sortOrder !== undefined) updateData.sortOrder = parseInt(data.sortOrder);
    if (data.color !== undefined) updateData.color = data.color || null;
    if (data.icon !== undefined) updateData.icon = data.icon || null;
    if (data.badge !== undefined) updateData.badge = data.badge || null;
    if (data.image !== undefined) updateData.image = data.image || null;

    await db
      .update(subscriptions)
      .set(updateData)
      .where(eq(subscriptions.id, id));

    const updatedSubscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, id),
    });

    if (!updatedSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json(updatedSubscription);
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    
    // Handle duplicate slug error
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'A subscription with this slug already exists' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if subscription exists
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, id),
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    await db
      .delete(subscriptions)
      .where(eq(subscriptions.id, id));

    return NextResponse.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
  }
}

