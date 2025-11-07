import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user, vendorProfiles } from '@/lib/schema';
import { v4 as uuidv4 } from 'uuid';
import { desc, asc, eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const verificationStatus = searchParams.get('verificationStatus');
    
    // Get all vendor profiles with user information
    const vendors = await db
      .select({
        id: vendorProfiles.id,
        userId: vendorProfiles.userId,
        companyName: vendorProfiles.companyName,
        companyEmail: vendorProfiles.companyEmail,
        companyPhone: vendorProfiles.companyPhone,
        businessType: vendorProfiles.businessType,
        businessCity: vendorProfiles.businessCity,
        businessCountry: vendorProfiles.businessCountry,
        logo: vendorProfiles.logo,
        verificationStatus: vendorProfiles.verificationStatus,
        isActive: vendorProfiles.isActive,
        isFeatured: vendorProfiles.isFeatured,
        rating: vendorProfiles.rating,
        totalProducts: vendorProfiles.totalProducts,
        totalSales: vendorProfiles.totalSales,
        createdAt: vendorProfiles.createdAt,
        // User fields
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        userStatus: user.status,
      })
      .from(vendorProfiles)
      .leftJoin(user, eq(vendorProfiles.userId, user.id))
      .orderBy(sortOrder === 'desc' ? desc(vendorProfiles.createdAt) : asc(vendorProfiles.createdAt));
    
    // Filter by verification status if provided
    let filteredVendors = vendors;
    if (verificationStatus) {
      filteredVendors = vendors.filter(v => v.verificationStatus === verificationStatus);
    }
    
    return NextResponse.json(filteredVendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.companyName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    
    if (!data.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    if (!data.password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    
    // Check if email already exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, data.email),
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Create user first
    const userId = uuidv4();
    await db.insert(user).values({
      id: userId,
      name: data.companyName,
      email: data.email,
      phone: data.phone || null,
      userType: 'vendor',
      status: data.status || 'pending',
      password: hashedPassword, // Note: Make sure your user table has a password field
    } as any);
    
    // Create vendor profile
    const newVendorProfile = {
      id: uuidv4(),
      userId: userId,
      companyName: data.companyName,
      companyLegalName: data.companyLegalName || null,
      companyRegistrationNumber: data.companyRegistrationNumber || null,
      taxId: data.taxId || null,
      businessType: data.businessType || null,
      industryCategory: data.industryCategory || null,
      yearEstablished: data.yearEstablished ? parseInt(data.yearEstablished) : null,
      numberOfEmployees: data.numberOfEmployees || null,
      companyEmail: data.email,
      companyPhone: data.phone || null,
      companyWebsite: data.companyWebsite || null,
      businessAddress: data.businessAddress || null,
      businessCity: data.businessCity || null,
      businessState: data.businessState || null,
      businessPostalCode: data.businessPostalCode || null,
      businessCountry: data.businessCountry || 'Pakistan',
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
      rating: data.rating ? parseFloat(data.rating).toFixed(2) : null,
      totalProducts: 0,
      totalSales: '0.00',
    };
    
    await db.insert(vendorProfiles).values(newVendorProfile);
    
    return NextResponse.json({ ...newVendorProfile, userId }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vendor:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Vendor profile already exists for this user' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}

