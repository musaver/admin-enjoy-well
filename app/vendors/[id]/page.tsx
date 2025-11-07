'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, EditIcon, LoaderIcon, ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface VendorData {
  id: string;
  userId?: string | null;
  
  // Company Information
  companyName: string;
  companyLegalName?: string;
  companyRegistrationNumber?: string;
  taxId?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyWebsite?: string;
  
  // Business Details
  businessType?: string;
  industryCategory?: string;
  yearEstablished?: number | null;
  numberOfEmployees?: string;
  
  // Address
  businessAddress?: string;
  businessCity?: string;
  businessState?: string;
  businessPostalCode?: string;
  businessCountry?: string;
  
  // Bank Details
  bankName?: string;
  bankAccountTitle?: string;
  bankAccountNumber?: string;
  bankIBAN?: string;
  bankBranchCode?: string;
  
  // Documents & Media
  logo?: string;
  businessLicense?: string;
  taxCertificate?: string;
  
  // Description & Social
  description?: string;
  shortBio?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  
  // Settings
  commissionRate?: string;
  paymentTerms?: string;
  verificationStatus?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // User data
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    status?: string;
    userType?: string;
    createdAt?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export default function ViewVendor() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params.id as string;
  
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendor();
  }, [vendorId]);

  const fetchVendor = async () => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}`);
      if (!response.ok) throw new Error('Failed to fetch vendor');
      const data = await response.json();
      setVendor(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderIcon className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/vendors">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vendor Not Found</h1>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  const InfoItem = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="space-y-1">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-medium">{value || 'N/A'}</div>
    </div>
  );

  const getStatusBadge = (status?: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      verified: 'default',
      pending: 'secondary',
      rejected: 'destructive',
      approved: 'default',
      suspended: 'destructive',
    };
    return (
      <Badge variant={variants[status || 'pending'] || 'secondary'}>
        {status || 'N/A'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/vendors">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {vendor.logo && (
              <Image
                src={vendor.logo}
                alt={vendor.companyName}
                width={64}
                height={64}
                className="rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{vendor.companyName}</h1>
              <p className="text-muted-foreground">
                {vendor.companyLegalName || 'Vendor Profile'}
              </p>
            </div>
          </div>
        </div>
        <Button asChild>
          <Link href={`/vendors/edit/${vendorId}`}>
            <EditIcon className="h-4 w-4 mr-2" />
            Edit Vendor
          </Link>
        </Button>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Verification</div>
              <div>{getStatusBadge(vendor.verificationStatus)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Active Status</div>
              <div>
                <Badge variant={vendor.isActive ? 'default' : 'secondary'}>
                  {vendor.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Featured</div>
              <div>
                <Badge variant={vendor.isFeatured ? 'default' : 'outline'}>
                  {vendor.isFeatured ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Commission Rate</div>
              <div className="font-medium">{vendor.commissionRate || '0'}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Linked User Account */}
      {vendor.user && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Linked User Account
              {getStatusBadge(vendor.user.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoItem label="User ID" value={vendor.user.id} />
              <InfoItem label="Name" value={vendor.user.name} />
              <InfoItem label="Email" value={vendor.user.email} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoItem label="Phone" value={vendor.user.phone} />
              <InfoItem label="User Type" value={vendor.user.userType} />
              <InfoItem 
                label="Account Created" 
                value={vendor.user.createdAt ? new Date(vendor.user.createdAt).toLocaleDateString() : 'N/A'} 
              />
            </div>
            {vendor.user.address && (
              <div>
                <div className="text-sm text-gray-500 mb-1">User Address</div>
                <div className="font-medium">
                  {vendor.user.address}
                  {vendor.user.city && `, ${vendor.user.city}`}
                  {vendor.user.state && `, ${vendor.user.state}`}
                  {vendor.user.postalCode && ` ${vendor.user.postalCode}`}
                  {vendor.user.country && `, ${vendor.user.country}`}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Company Name" value={vendor.companyName} />
            <InfoItem label="Legal Name" value={vendor.companyLegalName} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Registration Number" value={vendor.companyRegistrationNumber} />
            <InfoItem label="Tax ID / NTN" value={vendor.taxId} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoItem label="Company Email" value={vendor.companyEmail} />
            <InfoItem label="Company Phone" value={vendor.companyPhone} />
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Company Website</div>
              {vendor.companyWebsite ? (
                <a 
                  href={vendor.companyWebsite} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                >
                  {vendor.companyWebsite}
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              ) : (
                <div className="font-medium">N/A</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Business Type" value={vendor.businessType} />
            <InfoItem label="Industry Category" value={vendor.industryCategory} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Year Established" value={vendor.yearEstablished} />
            <InfoItem label="Number of Employees" value={vendor.numberOfEmployees} />
          </div>
        </CardContent>
      </Card>

      {/* Business Address */}
      <Card>
        <CardHeader>
          <CardTitle>Business Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoItem label="Street Address" value={vendor.businessAddress} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="City" value={vendor.businessCity} />
            <InfoItem label="State/Province" value={vendor.businessState} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Postal Code" value={vendor.businessPostalCode} />
            <InfoItem label="Country" value={vendor.businessCountry} />
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Bank Name" value={vendor.bankName} />
            <InfoItem label="Account Title" value={vendor.bankAccountTitle} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoItem label="Account Number" value={vendor.bankAccountNumber} />
            <InfoItem label="IBAN" value={vendor.bankIBAN} />
            <InfoItem label="Branch Code" value={vendor.bankBranchCode} />
          </div>
        </CardContent>
      </Card>

      {/* Documents & Media */}
      <Card>
        <CardHeader>
          <CardTitle>Documents & Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vendor.logo && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Company Logo</div>
                <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={vendor.logo}
                    alt="Company Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
            {vendor.businessLicense && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Business License</div>
                <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={vendor.businessLicense}
                    alt="Business License"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
            {vendor.taxCertificate && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Tax Certificate</div>
                <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={vendor.taxCertificate}
                    alt="Tax Certificate"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </div>
          {!vendor.logo && !vendor.businessLicense && !vendor.taxCertificate && (
            <div className="text-gray-500 text-center py-8">No documents uploaded</div>
          )}
        </CardContent>
      </Card>

      {/* Description & Bio */}
      {(vendor.shortBio || vendor.description) && (
        <Card>
          <CardHeader>
            <CardTitle>About the Company</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendor.shortBio && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Short Bio</div>
                <div className="font-medium">{vendor.shortBio}</div>
              </div>
            )}
            {vendor.description && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Full Description</div>
                <div className="text-gray-700 whitespace-pre-wrap">{vendor.description}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Social Media */}
      {(vendor.facebookUrl || vendor.instagramUrl || vendor.twitterUrl || vendor.linkedinUrl) && (
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendor.facebookUrl && (
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Facebook</div>
                  <a 
                    href={vendor.facebookUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {vendor.facebookUrl}
                    <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                </div>
              )}
              {vendor.instagramUrl && (
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Instagram</div>
                  <a 
                    href={vendor.instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {vendor.instagramUrl}
                    <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                </div>
              )}
              {vendor.twitterUrl && (
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Twitter</div>
                  <a 
                    href={vendor.twitterUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {vendor.twitterUrl}
                    <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                </div>
              )}
              {vendor.linkedinUrl && (
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">LinkedIn</div>
                  <a 
                    href={vendor.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {vendor.linkedinUrl}
                    <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment & Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Payment & Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Commission Rate" value={vendor.commissionRate ? `${vendor.commissionRate}%` : undefined} />
            <InfoItem label="Payment Terms" value={vendor.paymentTerms} />
          </div>
        </CardContent>
      </Card>

      {/* Admin Notes */}
      {vendor.notes && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle>Admin Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-700 whitespace-pre-wrap">{vendor.notes}</div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <InfoItem label="Vendor ID" value={vendor.id} />
            <InfoItem 
              label="Created At" 
              value={vendor.createdAt ? new Date(vendor.createdAt).toLocaleString() : undefined} 
            />
            <InfoItem 
              label="Updated At" 
              value={vendor.updatedAt ? new Date(vendor.updatedAt).toLocaleString() : undefined} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

