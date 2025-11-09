import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vendorBanners } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// GET - Fetch all banners for a vendor profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorProfileId = searchParams.get('vendorProfileId');

    if (!vendorProfileId) {
      return NextResponse.json(
        { success: false, error: 'Vendor Profile ID is required' },
        { status: 400 }
      );
    }

    const banners = await db
      .select()
      .from(vendorBanners)
      .where(eq(vendorBanners.vendorProfileId, vendorProfileId))
      .orderBy(vendorBanners.sortOrder);

    return NextResponse.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error('Error fetching vendor banners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

// POST - Create a new banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorProfileId, imageUrl, sortOrder } = body;

    if (!vendorProfileId || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Vendor Profile ID and image URL are required' },
        { status: 400 }
      );
    }

    const newBanner = {
      id: uuidv4(),
      vendorProfileId,
      imageUrl,
      sortOrder: sortOrder || 0,
      isActive: true,
    };

    await db.insert(vendorBanners).values(newBanner);

    return NextResponse.json({
      success: true,
      data: newBanner,
    });
  } catch (error) {
    console.error('Error creating vendor banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}

