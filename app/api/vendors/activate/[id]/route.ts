import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user, vendorProfiles } from '@/lib/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { sendVendorActivationEmail } from '@/lib/email';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const vendorId = params.id;

    // Get the vendor profile
    const vendor = await db.query.vendorProfiles.findFirst({
      where: eq(vendorProfiles.id, vendorId),
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Check if vendor already has a user account
    if (vendor.userId) {
      // Just activate the existing user and vendor
      await db
        .update(user)
        .set({ status: 'approved' })
        .where(eq(user.id, vendor.userId));

      await db
        .update(vendorProfiles)
        .set({ 
          isActive: true,
          verificationStatus: 'verified'
        })
        .where(eq(vendorProfiles.id, vendorId));

      // Send activation email
      try {
        await sendVendorActivationEmail(vendor.companyEmail!, vendor.companyName);
        console.log('Activation email sent to:', vendor.companyEmail);
      } catch (emailError) {
        console.error('Failed to send activation email:', emailError);
        // Don't fail the activation if email fails
      }

      return NextResponse.json({
        message: 'Vendor activated successfully',
        userId: vendor.userId,
      });
    }

    // Check if a user with this email already exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, vendor.companyEmail!),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user account (no password needed - using OTP login)
    const userId = uuidv4();
    await db.insert(user).values({
      id: userId,
      name: vendor.companyName,
      email: vendor.companyEmail!,
      phone: vendor.companyPhone || null,
      userType: 'vendor',
      status: 'approved', // Set to approved/active
      address: vendor.businessAddress || null,
      city: vendor.businessCity || null,
      state: vendor.businessState || null,
      postalCode: vendor.businessPostalCode || null,
      country: vendor.businessCountry || null,
    } as any);

    // Update vendor profile with the new userId and set to active
    await db
      .update(vendorProfiles)
      .set({
        userId: userId,
        isActive: true,
        verificationStatus: 'verified',
      })
      .where(eq(vendorProfiles.id, vendorId));

    // Send activation email to vendor
    try {
      await sendVendorActivationEmail(vendor.companyEmail!, vendor.companyName);
      console.log('Activation email sent successfully to:', vendor.companyEmail);
    } catch (emailError) {
      console.error('Failed to send activation email:', emailError);
      // Don't fail the activation if email fails - vendor is still activated
    }

    return NextResponse.json({
      message: 'Vendor activated successfully! User account created and activation email sent.',
      userId,
      email: vendor.companyEmail,
      companyName: vendor.companyName,
    });
  } catch (error: any) {
    console.error('Error activating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to activate vendor' },
      { status: 500 }
    );
  }
}

