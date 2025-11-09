'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import ImageUploader from '../../components/ImageUploader';

export default function AddVendor() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Login Credentials
    email: '',
    password: '',
    phone: '',
    status: 'pending',
    
    // Company Information
    companyName: '',
    companyLegalName: '',
    companyRegistrationNumber: '',
    taxId: '',
    
    // Business Details
    businessType: '',
    industryCategory: '',
    yearEstablished: '',
    numberOfEmployees: '',
    
    // Contact Information
    companyWebsite: '',
    
    // Address
    businessAddress: '',
    businessCity: '',
    businessState: '',
    businessPostalCode: '',
    businessCountry: 'Pakistan',
    
    // Bank Details
    bankName: '',
    bankAccountTitle: '',
    bankAccountNumber: '',
    bankIBAN: '',
    bankBranchCode: '',
    
    // Documents & Media
    logo: '',
    businessLicense: '',
    taxCertificate: '',
    
    // Description & Social
    description: '',
    shortBio: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    
    // Settings
    commissionRate: '0',
    paymentTerms: '',
    verificationStatus: 'pending',
    isActive: true,
    isFeatured: false,
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleImageUpload = (field: string) => (imageUrl: string) => {
    setFormData({ ...formData, [field]: imageUrl });
  };

  const handleImageRemove = (field: string) => () => {
    setFormData({ ...formData, [field]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create vendor');
      }

      router.push('/vendors');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Vendor</h1>
          <p className="text-muted-foreground">
            Create a new vendor account with company profile
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Login Credentials */}
        <Card>
          <CardHeader>
            <CardTitle>Login Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                  placeholder="vendor@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="phone">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="+92-300-1234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="status">
                  Account Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  placeholder="ABC Corporation"
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
                  value={formData.companyLegalName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="ABC Corporation (Pvt) Ltd"
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
                  value={formData.companyRegistrationNumber}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="123456"
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
                  value={formData.taxId}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="1234567-8"
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
                  value={formData.businessType}
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
                  value={formData.industryCategory}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Electronics, Fashion, Food, etc."
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
                  value={formData.yearEstablished}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="2020"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="numberOfEmployees">
                  Number of Employees
                </label>
                <select
                  id="numberOfEmployees"
                  name="numberOfEmployees"
                  value={formData.numberOfEmployees}
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

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="companyWebsite">
                Company Website
              </label>
              <input
                type="url"
                id="companyWebsite"
                name="companyWebsite"
                value={formData.companyWebsite}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="https://www.company.com"
              />
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
                value={formData.businessAddress}
                onChange={handleChange}
                rows={2}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="123 Business Street, Area Name"
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
                  value={formData.businessCity}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Karachi"
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
                  value={formData.businessState}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Sindh"
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
                  value={formData.businessPostalCode}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="75600"
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
                  value={formData.businessCountry}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Pakistan"
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
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Meezan Bank"
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
                  value={formData.bankAccountTitle}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="ABC Corporation"
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
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="1234567890"
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
                  value={formData.bankIBAN}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="PK36MEZN0003370103447217"
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
                  value={formData.bankBranchCode}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="0337"
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
                currentImage={formData.logo}
                onImageUpload={handleImageUpload('logo')}
                onImageRemove={handleImageRemove('logo')}
                label="Company Logo"
                disabled={submitting}
                directory="vendors"
              />
            </div>

            <div>
              <ImageUploader
                currentImage={formData.businessLicense}
                onImageUpload={handleImageUpload('businessLicense')}
                onImageRemove={handleImageRemove('businessLicense')}
                label="Business License"
                disabled={submitting}
                directory="vendors"
              />
            </div>

            <div>
              <ImageUploader
                currentImage={formData.taxCertificate}
                onImageUpload={handleImageUpload('taxCertificate')}
                onImageRemove={handleImageRemove('taxCertificate')}
                label="Tax Certificate"
                disabled={submitting}
                directory="vendors"
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Banners - Note */}
        <Card>
          <CardHeader>
            <CardTitle>Company Banners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                📝 <strong>Note:</strong> Company banners can be added after creating the vendor profile. 
                You'll be able to upload and manage multiple banners with sorting on the edit page.
              </p>
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
                Short Bio <span className="text-sm text-gray-500">(max 500 characters)</span>
              </label>
              <input
                type="text"
                id="shortBio"
                name="shortBio"
                value={formData.shortBio}
                onChange={handleChange}
                maxLength={500}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="A brief description of the company"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="description">
                Full Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Detailed description of the company, products, and services..."
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
                  value={formData.facebookUrl}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="https://facebook.com/company"
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
                  value={formData.instagramUrl}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="https://instagram.com/company"
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
                  value={formData.twitterUrl}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="https://twitter.com/company"
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
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="https://linkedin.com/company/company"
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
                  value={formData.commissionRate}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="10.00"
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
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Net 30, Net 60, etc."
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
                  value={formData.verificationStatus}
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
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
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
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Internal notes about this vendor..."
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
            {submitting ? 'Creating...' : 'Create Vendor'}
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

