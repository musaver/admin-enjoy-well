import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userSubscriptions, subscriptions, user } from '@/lib/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm';

// Get all user subscriptions or filter by userId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (userId) {
      // Get subscriptions for specific user
      const userSubs = await db
        .select({
          id: userSubscriptions.id,
          userId: userSubscriptions.userId,
          subscriptionId: userSubscriptions.subscriptionId,
          subscriptionName: userSubscriptions.subscriptionName,
          price: userSubscriptions.price,
          currency: userSubscriptions.currency,
          status: userSubscriptions.status,
          startDate: userSubscriptions.startDate,
          expiryDate: userSubscriptions.expiryDate,
          cancelledAt: userSubscriptions.cancelledAt,
          nextBillingDate: userSubscriptions.nextBillingDate,
          lastBillingDate: userSubscriptions.lastBillingDate,
          billingCycle: userSubscriptions.billingCycle,
          isTrialUsed: userSubscriptions.isTrialUsed,
          trialEndsAt: userSubscriptions.trialEndsAt,
          autoRenew: userSubscriptions.autoRenew,
          cancelReason: userSubscriptions.cancelReason,
          notes: userSubscriptions.notes,
          createdAt: userSubscriptions.createdAt,
          updatedAt: userSubscriptions.updatedAt,
        })
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId));
      
      return NextResponse.json(userSubs);
    }
    
    // Get all user subscriptions
    const allUserSubs = await db.select().from(userSubscriptions);
    return NextResponse.json(allUserSubs);
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch user subscriptions' }, { status: 500 });
  }
}

// Assign subscription to user
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    if (!data.subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
    }
    
    // Check if user exists
    const userExists = await db.select().from(user).where(eq(user.id, data.userId));
    if (userExists.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if subscription exists
    const subscription = await db.select().from(subscriptions).where(eq(subscriptions.id, data.subscriptionId));
    if (subscription.length === 0) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
    
    const subscriptionData = subscription[0];
    
    // Calculate dates
    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    let expiryDate = null;
    let nextBillingDate = null;
    let trialEndsAt = null;
    
    // Calculate expiry date based on billing cycle
    if (data.expiryDate) {
      expiryDate = new Date(data.expiryDate);
    } else if (subscriptionData.billingCycle && subscriptionData.billingCycle !== 'lifetime') {
      expiryDate = new Date(startDate);
      if (subscriptionData.billingCycle === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (subscriptionData.billingCycle === 'yearly') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else if (subscriptionData.billingCycle === 'weekly') {
        expiryDate.setDate(expiryDate.getDate() + 7);
      }
    }
    
    // Calculate trial end date
    if (subscriptionData.trialDays && subscriptionData.trialDays > 0) {
      trialEndsAt = new Date(startDate);
      trialEndsAt.setDate(trialEndsAt.getDate() + subscriptionData.trialDays);
    }
    
    // Set next billing date
    if (expiryDate && data.autoRenew !== false) {
      nextBillingDate = expiryDate;
    }
    
    const newUserSubscription = {
      id: uuidv4(),
      userId: data.userId,
      subscriptionId: data.subscriptionId,
      orderId: data.orderId || null,
      subscriptionName: subscriptionData.name,
      price: subscriptionData.price,
      currency: subscriptionData.currency || 'PKR',
      status: data.status || 'active',
      startDate,
      expiryDate,
      cancelledAt: null,
      nextBillingDate,
      lastBillingDate: null,
      billingCycle: subscriptionData.billingCycle,
      isTrialUsed: false,
      trialEndsAt,
      autoRenew: data.autoRenew !== undefined ? data.autoRenew : true,
      cancelReason: null,
      notes: data.notes || null,
    };
    
    await db.insert(userSubscriptions).values(newUserSubscription);
    
    return NextResponse.json(newUserSubscription, { status: 201 });
  } catch (error: any) {
    console.error('Error assigning subscription:', error);
    return NextResponse.json({ error: 'Failed to assign subscription' }, { status: 500 });
  }
}

