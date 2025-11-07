'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from 'lucide-react';
import Link from 'next/link';

export default function EditSubscription() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    currency: 'PKR',
    billingCycle: 'monthly',
    billingIntervalCount: '1',
    durationDays: '',
    expiresAfterDays: '',
    trialDays: '0',
    maxUsers: '',
    maxOrders: '',
    maxProducts: '',
    discountPercentage: '0',
    comparePrice: '',
    isActive: true,
    isFeatured: false,
    isPopular: false,
    sortOrder: '0',
    color: '#3B82F6',
    icon: '',
    badge: '',
  });
  const [features, setFeatures] = useState<string[]>(['']);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(true); // Set to true for edit mode

  useEffect(() => {
    fetchSubscription();
  }, [id]);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch subscription');
      }
      const data = await res.json();
      
      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        price: data.price?.toString() || '',
        currency: data.currency || 'PKR',
        billingCycle: data.billingCycle || 'monthly',
        billingIntervalCount: data.billingIntervalCount?.toString() || '1',
        durationDays: data.durationDays?.toString() || '',
        expiresAfterDays: data.expiresAfterDays?.toString() || '',
        trialDays: data.trialDays?.toString() || '0',
        maxUsers: data.maxUsers?.toString() || '',
        maxOrders: data.maxOrders?.toString() || '',
        maxProducts: data.maxProducts?.toString() || '',
        discountPercentage: data.discountPercentage?.toString() || '0',
        comparePrice: data.comparePrice?.toString() || '',
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        isPopular: data.isPopular ?? false,
        sortOrder: data.sortOrder?.toString() || '0',
        color: data.color || '#3B82F6',
        icon: data.icon || '',
        badge: data.badge || '',
      });

      // Handle features - ensure it's always an array
      if (data.features && Array.isArray(data.features)) {
        setFeatures(data.features.length > 0 ? data.features : ['']);
      } else {
        setFeatures(['']);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle slug field separately to track manual edits
    if (name === 'slug') {
      setIsSlugManuallyEdited(true);
      setFormData({
        ...formData,
        [name]: generateSlug(value)
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures.length > 0 ? newFeatures : ['']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Filter out empty features
      const validFeatures = features.filter(f => f.trim() !== '');

      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        billingIntervalCount: parseInt(formData.billingIntervalCount),
        durationDays: formData.durationDays ? parseInt(formData.durationDays) : null,
        expiresAfterDays: formData.expiresAfterDays ? parseInt(formData.expiresAfterDays) : null,
        trialDays: parseInt(formData.trialDays),
        maxUsers: formData.maxUsers ? parseInt(formData.maxUsers) : null,
        maxOrders: formData.maxOrders ? parseInt(formData.maxOrders) : null,
        maxProducts: formData.maxProducts ? parseInt(formData.maxProducts) : null,
        discountPercentage: parseFloat(formData.discountPercentage),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        sortOrder: parseInt(formData.sortOrder),
        features: validFeatures,
        badge: formData.badge || null,
        icon: formData.icon || null,
      };

      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update subscription');
      }

      router.push('/subscriptions');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/subscriptions">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Subscription</h1>
          <p className="text-muted-foreground">
            Update subscription plan details
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="name">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                  placeholder="e.g., Basic Plan, Pro Plan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="slug">
                  Slug <span className="text-sm text-gray-500">(SEO-friendly URL)</span>
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="auto-generated-from-plan-name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Describe this subscription plan..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="price">
                  Price (PKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                  placeholder="999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="comparePrice">
                  Compare Price (PKR) <span className="text-sm text-gray-500">(optional)</span>
                </label>
                <input
                  type="number"
                  id="comparePrice"
                  name="comparePrice"
                  value={formData.comparePrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="1999"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="billingCycle">
                  Billing Cycle
                </label>
                <select
                  id="billingCycle"
                  name="billingCycle"
                  value={formData.billingCycle}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="discountPercentage">
                  Discount Percentage
                </label>
                <input
                  type="number"
                  id="discountPercentage"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Duration & Trial */}
        <Card>
          <CardHeader>
            <CardTitle>Duration & Trial Period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="trialDays">
                  Trial Days
                </label>
                <input
                  type="number"
                  id="trialDays"
                  name="trialDays"
                  value={formData.trialDays}
                  onChange={handleChange}
                  min="0"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Free trial period in days (0 for no trial)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="durationDays">
                  Duration Days
                </label>
                <input
                  type="number"
                  id="durationDays"
                  name="durationDays"
                  value={formData.durationDays}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Leave empty for unlimited"
                />
                <p className="text-xs text-gray-500 mt-1">Total subscription duration (blank for unlimited)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="expiresAfterDays">
                  Expires After Days
                </label>
                <input
                  type="number"
                  id="expiresAfterDays"
                  name="expiresAfterDays"
                  value={formData.expiresAfterDays}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Leave empty for no expiry"
                />
                <p className="text-xs text-gray-500 mt-1">Auto-expire after X days from purchase</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Features</CardTitle>
            <Button type="button" onClick={addFeature} variant="outline" size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Feature
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder={`Feature ${index + 1}`}
                />
                {features.length > 1 && (
                  <Button 
                    type="button" 
                    onClick={() => removeFeature(index)}
                    variant="outline"
                    size="sm"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Limits */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="maxUsers">
                  Max Users
                </label>
                <input
                  type="number"
                  id="maxUsers"
                  name="maxUsers"
                  value={formData.maxUsers}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="maxOrders">
                  Max Orders
                </label>
                <input
                  type="number"
                  id="maxOrders"
                  name="maxOrders"
                  value={formData.maxOrders}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="maxProducts">
                  Max Products
                </label>
                <input
                  type="number"
                  id="maxProducts"
                  name="maxProducts"
                  value={formData.maxProducts}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="color">
                  Theme Color
                </label>
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full h-10 p-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="icon">
                  Icon Name
                </label>
                <input
                  type="text"
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., star, crown, rocket"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="badge">
                  Badge Text
                </label>
                <input
                  type="text"
                  id="badge"
                  name="badge"
                  value={formData.badge}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., Popular, Best Value"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="sortOrder">
                Sort Order
              </label>
              <input
                type="number"
                id="sortOrder"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleChange}
                min="0"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Active Subscription</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Featured Subscription</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPopular"
                  checked={formData.isPopular}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Mark as Popular</span>
              </label>
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
            {submitting ? 'Updating...' : 'Update Subscription'}
          </Button>
          <Button
            type="button"
            onClick={() => router.push('/subscriptions')}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

