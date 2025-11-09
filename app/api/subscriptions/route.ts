import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/schema';
import { v4 as uuidv4 } from 'uuid';
import { desc, asc, eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get('sortBy') || 'sortOrder';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const isActiveParam = searchParams.get('isActive');
    
    // Apply sorting
    const orderColumn = sortBy === 'name' ? subscriptions.name :
                        sortBy === 'price' ? subscriptions.price :
                        sortBy === 'createdAt' ? subscriptions.createdAt :
                        subscriptions.sortOrder;
    
    let allSubscriptions;
    
    // Apply filters
    if (isActiveParam !== null && isActiveParam !== undefined) {
      const isActiveValue = isActiveParam === 'true';
      allSubscriptions = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.isActive, isActiveValue))
        .orderBy(sortOrder === 'desc' ? desc(orderColumn) : asc(orderColumn));
    } else {
      allSubscriptions = await db
        .select()
        .from(subscriptions)
        .orderBy(sortOrder === 'desc' ? desc(orderColumn) : asc(orderColumn));
    }
    
    return NextResponse.json(allSubscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    if (!data.price || isNaN(parseFloat(data.price))) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
    }
    
    // Generate slug from name if not provided
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Parse features if it's a string
    let features = data.features;
    if (typeof features === 'string') {
      try {
        features = JSON.parse(features);
      } catch {
        features = features.split(',').map((f: string) => f.trim()).filter(Boolean);
      }
    }
    
    const newSubscription = {
      id: uuidv4(),
      name: data.name,
      slug,
      description: data.description || null,
      price: parseFloat(data.price).toFixed(2),
      currency: data.currency || 'PKR',
      billingCycle: data.billingCycle || 'monthly',
      billingIntervalCount: parseInt(data.billingIntervalCount) || 1,
      durationDays: data.durationDays ? parseInt(data.durationDays) : null,
      expiresAfterDays: data.expiresAfterDays ? parseInt(data.expiresAfterDays) : null,
      trialDays: parseInt(data.trialDays) || 0,
      features: features || null,
      maxUsers: data.maxUsers ? parseInt(data.maxUsers) : null,
      maxOrders: data.maxOrders ? parseInt(data.maxOrders) : null,
      maxProducts: data.maxProducts ? parseInt(data.maxProducts) : null,
      discountPercentage: data.discountPercentage ? parseFloat(data.discountPercentage).toFixed(2) : '0.00',
      comparePrice: data.comparePrice ? parseFloat(data.comparePrice).toFixed(2) : null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isFeatured: data.isFeatured || false,
      isPopular: data.isPopular || false,
      sortOrder: parseInt(data.sortOrder) || 0,
      color: data.color || null,
      icon: data.icon || null,
      badge: data.badge || null,
      image: data.image || null,
    };
    
    await db.insert(subscriptions).values(newSubscription);
    
    return NextResponse.json(newSubscription, { status: 201 });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    
    // Handle duplicate slug error
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'A subscription with this slug already exists' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

