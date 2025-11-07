'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ResponsiveTable from '../components/ResponsiveTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  PlusIcon, 
  MoreVerticalIcon, 
  EditIcon, 
  TrashIcon,
  RefreshCwIcon,
  CreditCardIcon,
  TrendingUpIcon,
  StarIcon
} from 'lucide-react';

interface Subscription {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: string;
  trialDays: number;
  features?: string[];
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  badge?: string;
  sortOrder: number;
  createdAt: string;
}

export default function SubscriptionsList() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subscriptions');
      const data = await res.json();
      setSubscriptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      try {
        await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' });
        setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
      } catch (error) {
        console.error('Error deleting subscription:', error);
      }
    }
  };

  const formatPrice = (price: number, currency: string) => {
    // Always show PKR with proper formatting
    return `Rs ${new Intl.NumberFormat('en-PK').format(price)}`;
  };

  const getStats = () => {
    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter(sub => sub.isActive).length;
    const featuredSubscriptions = subscriptions.filter(sub => sub.isFeatured).length;
    const averagePrice = subscriptions.length > 0 
      ? subscriptions.reduce((sum, sub) => sum + parseFloat(sub.price.toString()), 0) / subscriptions.length 
      : 0;
    
    return { totalSubscriptions, activeSubscriptions, featuredSubscriptions, averagePrice };
  };

  const stats = getStats();

  const columns = [
    {
      key: 'name',
      title: 'Subscription Plan',
      render: (_: any, subscription: Subscription) => (
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium flex items-center gap-2">
              {subscription.name}
              {subscription.isPopular && (
                <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              )}
            </div>
            <div className="text-sm text-muted-foreground">{subscription.slug}</div>
          </div>
        </div>
      )
    },
    {
      key: 'price',
      title: 'Price',
      render: (_: any, subscription: Subscription) => (
        <div>
          <div className="font-medium">
            {formatPrice(subscription.price, subscription.currency)}
          </div>
          <div className="text-xs text-muted-foreground">
            per {subscription.billingCycle}
          </div>
        </div>
      )
    },
    {
      key: 'trial',
      title: 'Trial Period',
      render: (_: any, subscription: Subscription) => (
        <div className="text-sm">
          {subscription.trialDays > 0 ? `${subscription.trialDays} days` : 'No trial'}
        </div>
      ),
      mobileHidden: true
    },
    {
      key: 'features',
      title: 'Features',
      render: (_: any, subscription: Subscription) => {
        const featureCount = subscription.features?.length || 0;
        return (
          <div className="text-sm">
            {featureCount > 0 ? `${featureCount} features` : 'No features'}
          </div>
        );
      },
      mobileHidden: true
    },
    {
      key: 'status',
      title: 'Status',
      render: (_: any, subscription: Subscription) => (
        <div className="flex flex-col gap-1">
          <Badge variant={subscription.isActive ? 'default' : 'secondary'}>
            {subscription.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {subscription.isFeatured && (
            <Badge variant="outline" className="w-fit">
              Featured
            </Badge>
          )}
          {subscription.badge && (
            <Badge variant="outline" className="w-fit bg-yellow-50 text-yellow-700 border-yellow-200">
              {subscription.badge}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'sortOrder',
      title: 'Order',
      render: (_: any, subscription: Subscription) => (
        <div className="text-sm">
          {subscription.sortOrder}
        </div>
      ),
      mobileHidden: true
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (_: any, subscription: Subscription) => (
        <div className="text-sm">
          {new Date(subscription.createdAt).toLocaleDateString()}
        </div>
      ),
      mobileHidden: true
    }
  ];

  const renderActions = (subscription: Subscription) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVerticalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/subscriptions/edit/${subscription.id}`} className="flex items-center">
            <EditIcon className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDelete(subscription.id)}
          className="text-red-600 focus:text-red-600"
        >
          <TrashIcon className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Manage your subscription plans and pricing tiers
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchSubscriptions} disabled={loading} variant="outline" size="sm">
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/subscriptions/add">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Subscription
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Plans</CardTitle>
            <StarIcon className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.featuredSubscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatPrice(stats.averagePrice, 'PKR')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <ResponsiveTable
        columns={columns}
        data={subscriptions}
        loading={loading}
        emptyMessage="No subscription plans found"
        actions={renderActions}
      />
    </div>
  );
}

