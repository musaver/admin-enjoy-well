import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user, vendorProfiles } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const vendorId = params.id;

    // Get vendor profile with user information
    const vendors = await db
      .select()
      .from(vendorProfiles)
      .leftJoin(user, eq(vendorProfiles.userId, user.id))
      .where(eq(vendorProfiles.id, vendorId));

    if (vendors.length === 0) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const vendorData = vendors[0];
    
    // Structure the response
    const response = {
      ...vendorData.vendor_profiles,
      user: vendorData.user || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json({ error: 'Failed to fetch vendor' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const vendorId = params.id;
    const data = await req.json();

    // Check if vendor exists
    const existingVendor = await db.query.vendorProfiles.findFirst({
      where: eq(vendorProfiles.id, vendorId),
    });

    if (!existingVendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      companyName: data.companyName,
      companyLegalName: data.companyLegalName || null,
      companyRegistrationNumber: data.companyRegistrationNumber || null,
      taxId: data.taxId || null,
      businessType: data.businessType || null,
      industryCategory: data.industryCategory || null,
      yearEstablished: data.yearEstablished ? parseInt(data.yearEstablished) : null,
      numberOfEmployees: data.numberOfEmployees || null,
      companyEmail: data.companyEmail || null,
      companyPhone: data.companyPhone || null,
      companyWebsite: data.companyWebsite || null,
      businessAddress: data.businessAddress || null,
      businessCity: data.businessCity || null,
      businessState: data.businessState || null,
      businessPostalCode: data.businessPostalCode || null,
      businessCountry: data.businessCountry || null,
      bankName: data.bankName || null,
      bankAccountTitle: data.bankAccountTitle || null,
      bankAccountNumber: data.bankAccountNumber || null,
      bankIBAN: data.bankIBAN || null,
      bankBranchCode: data.bankBranchCode || null,
      logo: data.logo || null,
      businessLicense: data.businessLicense || null,
      taxCertificate: data.taxCertificate || null,
      description: data.description || null,
      shortBio: data.shortBio || null,
      facebookUrl: data.facebookUrl || null,
      instagramUrl: data.instagramUrl || null,
      twitterUrl: data.twitterUrl || null,
      linkedinUrl: data.linkedinUrl || null,
      commissionRate: data.commissionRate ? parseFloat(data.commissionRate).toFixed(2) : '0.00',
      paymentTerms: data.paymentTerms || null,
      verificationStatus: data.verificationStatus || 'pending',
      isActive: data.isActive !== undefined ? data.isActive : true,
      isFeatured: data.isFeatured || false,
      notes: data.notes || null,
      updatedAt: new Date(),
    };

    // Update vendor profile
    await db
      .update(vendorProfiles)
      .set(updateData)
      .where(eq(vendorProfiles.id, vendorId));

    // If vendor has a linked user, optionally update user info
    if (existingVendor.userId && data.user) {
      const userUpdateData: any = {};
      if (data.user.name) userUpdateData.name = data.user.name;
      if (data.user.email) userUpdateData.email = data.user.email;
      if (data.user.phone) userUpdateData.phone = data.user.phone;
      
      if (Object.keys(userUpdateData).length > 0) {
        await db
          .update(user)
          .set(userUpdateData)
          .where(eq(user.id, existingVendor.userId));
      }
    }

    return NextResponse.json({ 
      message: 'Vendor updated successfully',
      vendorId 
    });
  } catch (error: any) {
    console.error('Error updating vendor:', error);
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const vendorId = params.id;

    // Check if vendor exists
    const existingVendor = await db.query.vendorProfiles.findFirst({
      where: eq(vendorProfiles.id, vendorId),
    });

    if (!existingVendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Store userId before deleting vendor profile
    const userId = existingVendor.userId;

    // Delete vendor profile first
    await db
      .delete(vendorProfiles)
      .where(eq(vendorProfiles.id, vendorId));

    // If vendor has an associated user account, delete it as well
    if (userId) {
      try {
        await db
          .delete(user)
          .where(eq(user.id, userId));
        console.log('Associated user account deleted:', userId);
      } catch (userDeleteError) {
        console.error('Error deleting associated user account:', userDeleteError);
        // Continue even if user deletion fails - vendor is already deleted
      }
    }

    return NextResponse.json({ 
      message: 'Vendor and associated user account deleted successfully',
      vendorId,
      userId: userId || null
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 });
  }
}
