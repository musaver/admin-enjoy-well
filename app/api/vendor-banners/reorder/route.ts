import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vendorBanners } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// PUT - Update sort order of multiple banners
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { banners } = body;

    if (!banners || !Array.isArray(banners)) {
      return NextResponse.json(
        { success: false, error: 'Banners array is required' },
        { status: 400 }
      );
    }

    // Update each banner's sort order
    await Promise.all(
      banners.map(async (banner: { id: string; sortOrder: number }) => {
        await db
          .update(vendorBanners)
          .set({ sortOrder: banner.sortOrder })
          .where(eq(vendorBanners.id, banner.id));
      })
    );

    return NextResponse.json({
      success: true,
      message: 'Banners reordered successfully',
    });
  } catch (error) {
    console.error('Error reordering vendor banners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder banners' },
      { status: 500 }
    );
  }
}

