'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, LoaderIcon, GripVertical, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ImageUploader from '../../../components/ImageUploader';

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
  
  // User data
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    status?: string;
    userType?: string;
    createdAt?: string;
  };
}

export default function EditVendor() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params.id as string;
  
  const [formData, setFormData] = useState<VendorData | null>(null);
  const [banners, setBanners] = useState<{ id: string; imageUrl: string; sortOrder: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendor();
  }, [vendorId]);

  const fetchVendor = async () => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}`);
      if (!response.ok) throw new Error('Failed to fetch vendor');
      const data = await response.json();
      setFormData(data);
      
      // Fetch banners
      if (data.id) {
        fetchBanners(data.id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async (profileId: string) => {
    try {
      const response = await fetch(`/api/vendor-banners?vendorProfileId=${profileId}`);
      const result = await response.json();
      if (result.success && result.data) {
        setBanners(result.data);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleImageUpload = (field: string) => (imageUrl: string) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: imageUrl });
  };

  const handleImageRemove = (field: string) => () => {
    if (!formData) return;
    setFormData({ ...formData, [field]: '' });
  };

  const handleAddBanner = async (imageUrl: string) => {
    if (!formData?.id) {
      alert('Vendor profile ID is required');
      return;
    }

    try {
      const response = await fetch('/api/vendor-banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorProfileId: formData.id,
          imageUrl,
          sortOrder: banners.length,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setBanners([...banners, result.data]);
        alert('Banner added successfully');
      }
    } catch (error) {
      console.error('Error adding banner:', error);
      alert('Failed to add banner');
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await fetch(`/api/vendor-banners/${bannerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBanners(banners.filter(b => b.id !== bannerId));
        alert('Banner deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Failed to delete banner');
    }
  };

  const handleMoveBanner = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;

    const newBanners = [...banners];
    [newBanners[index], newBanners[newIndex]] = [newBanners[newIndex], newBanners[index]];
    
    // Update sort orders
    const updatedBanners = newBanners.map((banner, idx) => ({
      ...banner,
      sortOrder: idx,
    }));

    setBanners(updatedBanners);

    // Update on server
    try {
      await fetch('/api/vendor-banners/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banners: updatedBanners.map(b => ({ id: b.id, sortOrder: b.sortOrder })),
        }),
      });
    } catch (error) {
      console.error('Error reordering banners:', error);
      alert('Failed to reorder banners');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update vendor');
      }

      router.push('/vendors');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderIcon className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!formData) {
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
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Vendor</h1>
          <p className="text-muted-foreground">
            Update vendor profile and company information
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/vendors/${vendorId}`}>
            View Profile
          </Link>
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Linked User Account */}
        {formData.user && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Linked User Account
                <Badge variant="default">{formData.user.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <div className="font-medium">{formData.user.name}</div>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <div className="font-medium">{formData.user.email}</div>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <div className="font-medium">{formData.user.phone || 'N/A'}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                User ID: {formData.user.id} • Created: {formData.user.createdAt ? new Date(formData.user.createdAt).toLocaleDateString() : 'N/A'}
              </div>
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
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="companyName">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="companyLegalName">
                  Legal Name
                </label>
                <input
                  type="text"
                  id="companyLegalName"
                  name="companyLegalName"
                  value={formData.companyLegalName || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="companyRegistrationNumber">
                  Registration Number
                </label>
                <input
                  type="text"
                  id="companyRegistrationNumber"
                  name="companyRegistrationNumber"
                  value={formData.companyRegistrationNumber || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="taxId">
                  Tax ID / NTN
                </label>
                <input
                  type="text"
                  id="taxId"
                  name="taxId"
                  value={formData.taxId || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="companyEmail">
                  Company Email
                </label>
                <input
                  type="email"
                  id="companyEmail"
                  name="companyEmail"
                  value={formData.companyEmail || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="companyPhone">
                  Company Phone
                </label>
                <input
                  type="tel"
                  id="companyPhone"
                  name="companyPhone"
                  value={formData.companyPhone || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="companyWebsite">
                  Company Website
                </label>
                <input
                  type="url"
                  id="companyWebsite"
                  name="companyWebsite"
                  value={formData.companyWebsite || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
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
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="businessType">
                  Business Type
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Type</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="distributor">Distributor</option>
                  <option value="retailer">Retailer</option>
                  <option value="wholesaler">Wholesaler</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="industryCategory">
                  Industry Category
                </label>
                <input
                  type="text"
                  id="industryCategory"
                  name="industryCategory"
                  value={formData.industryCategory || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="yearEstablished">
                  Year Established
                </label>
                <input
                  type="number"
                  id="yearEstablished"
                  name="yearEstablished"
                  value={formData.yearEstablished || ''}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="numberOfEmployees">
                  Number of Employees
                </label>
                <select
                  id="numberOfEmployees"
                  name="numberOfEmployees"
                  value={formData.numberOfEmployees || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Range</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500+">500+</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Address */}
        <Card>
          <CardHeader>
            <CardTitle>Business Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="businessAddress">
                Street Address
              </label>
              <textarea
                id="businessAddress"
                name="businessAddress"
                value={formData.businessAddress || ''}
                onChange={handleChange}
                rows={2}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="businessCity">
                  City
                </label>
                <input
                  type="text"
                  id="businessCity"
                  name="businessCity"
                  value={formData.businessCity || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="businessState">
                  State/Province
                </label>
                <input
                  type="text"
                  id="businessState"
                  name="businessState"
                  value={formData.businessState || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="businessPostalCode">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="businessPostalCode"
                  name="businessPostalCode"
                  value={formData.businessPostalCode || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="businessCountry">
                  Country
                </label>
                <input
                  type="text"
                  id="businessCountry"
                  name="businessCountry"
                  value={formData.businessCountry || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
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
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="bankName">
                  Bank Name
                </label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={formData.bankName || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="bankAccountTitle">
                  Account Title
                </label>
                <input
                  type="text"
                  id="bankAccountTitle"
                  name="bankAccountTitle"
                  value={formData.bankAccountTitle || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="bankAccountNumber">
                  Account Number
                </label>
                <input
                  type="text"
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="bankIBAN">
                  IBAN
                </label>
                <input
                  type="text"
                  id="bankIBAN"
                  name="bankIBAN"
                  value={formData.bankIBAN || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="bankBranchCode">
                  Branch Code
                </label>
                <input
                  type="text"
                  id="bankBranchCode"
                  name="bankBranchCode"
                  value={formData.bankBranchCode || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents & Media */}
        <Card>
          <CardHeader>
            <CardTitle>Documents & Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <ImageUploader
                currentImage={formData.logo || ''}
                onImageUpload={handleImageUpload('logo')}
                onImageRemove={handleImageRemove('logo')}
                label="Company Logo"
                disabled={submitting}
                directory="vendors"
              />
            </div>

            <div>
              <ImageUploader
                currentImage={formData.businessLicense || ''}
                onImageUpload={handleImageUpload('businessLicense')}
                onImageRemove={handleImageRemove('businessLicense')}
                label="Business License"
                disabled={submitting}
                directory="vendors"
              />
            </div>

            <div>
              <ImageUploader
                currentImage={formData.taxCertificate || ''}
                onImageUpload={handleImageUpload('taxCertificate')}
                onImageRemove={handleImageRemove('taxCertificate')}
                label="Tax Certificate"
                disabled={submitting}
                directory="vendors"
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Banners */}
        <Card>
          <CardHeader>
            <CardTitle>Company Banners</CardTitle>
            <p className="text-sm text-gray-500 mt-2">
              Upload multiple banner images for the vendor profile. You can reorder them using the arrow buttons.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Banners */}
            {banners.length > 0 && (
              <div className="space-y-3">
                {banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                  >
                    <img
                      src={banner.imageUrl}
                      alt={`Banner ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Banner {index + 1}
                      </p>
                      <p className="text-xs text-gray-500">
                        Sort Order: {banner.sortOrder}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMoveBanner(index, 'up')}
                        disabled={index === 0 || submitting}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Move up"
                      >
                        <GripVertical className="w-4 h-4 rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveBanner(index, 'down')}
                        disabled={index === banners.length - 1 || submitting}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Move down"
                      >
                        <GripVertical className="w-4 h-4 -rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBanner(banner.id)}
                        disabled={submitting}
                        className="p-2 text-red-600 hover:bg-red-100 rounded disabled:opacity-50 transition-colors"
                        title="Delete banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Banner */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <ImageUploader
                currentImage=""
                onImageUpload={handleAddBanner}
                onImageRemove={() => {}}
                label="Add New Banner"
                disabled={submitting || !formData?.id}
                directory="banners"
              />
              {!formData?.id && (
                <p className="text-sm text-amber-600 mt-2">
                  Please save the vendor profile first before adding banners
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Description & Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Description & Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="shortBio">
                Short Bio
              </label>
              <input
                type="text"
                id="shortBio"
                name="shortBio"
                value={formData.shortBio || ''}
                onChange={handleChange}
                maxLength={500}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="description">
                Full Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="facebookUrl">
                  Facebook URL
                </label>
                <input
                  type="url"
                  id="facebookUrl"
                  name="facebookUrl"
                  value={formData.facebookUrl || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="instagramUrl">
                  Instagram URL
                </label>
                <input
                  type="url"
                  id="instagramUrl"
                  name="instagramUrl"
                  value={formData.instagramUrl || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="twitterUrl">
                  Twitter URL
                </label>
                <input
                  type="url"
                  id="twitterUrl"
                  name="twitterUrl"
                  value={formData.twitterUrl || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="linkedinUrl">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  id="linkedinUrl"
                  name="linkedinUrl"
                  value={formData.linkedinUrl || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission & Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Commission & Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="commissionRate">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  id="commissionRate"
                  name="commissionRate"
                  value={formData.commissionRate || ''}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="paymentTerms">
                  Payment Terms
                </label>
                <input
                  type="text"
                  id="paymentTerms"
                  name="paymentTerms"
                  value={formData.paymentTerms || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="verificationStatus">
                  Verification Status
                </label>
                <select
                  id="verificationStatus"
                  name="verificationStatus"
                  value={formData.verificationStatus || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive || false}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured || false}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Featured</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="notes">
                Admin Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={submitting}
            className="min-w-[150px]"
          >
            {submitting ? 'Updating...' : 'Update Vendor'}
          </Button>
          <Button
            type="button"
            onClick={() => router.push('/vendors')}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

