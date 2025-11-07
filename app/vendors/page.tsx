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
  StoreIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TrendingUpIcon,
  UserCheckIcon,
  EyeIcon
} from 'lucide-react';

interface Vendor {
  id: string;
  userId: string;
  companyName: string;
  companyEmail: string;
  companyPhone?: string;
  businessType?: string;
  businessCity?: string;
  businessCountry?: string;
  logo?: string;
  verificationStatus: string;
  isActive: boolean;
  isFeatured: boolean;
  rating?: number;
  totalProducts: number;
  totalSales: number;
  createdAt: string;
  userName?: string;
  userEmail?: string;
  userStatus?: string;
}

export default function VendorsList() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vendors');
      const data = await res.json();
      setVendors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vendor? This will also delete their user account.')) {
      try {
        await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
        setVendors(vendors.filter((vendor) => vendor.id !== id));
      } catch (error) {
        console.error('Error deleting vendor:', error);
      }
    }
  };

  const handleActivateVendor = async (id: string, companyName: string) => {
    if (confirm(`Are you sure you want to activate ${companyName}? This will create a user account and activate their vendor profile.`)) {
      setActivating(id);
      try {
        const res = await fetch(`/api/vendors/activate/${id}`, { 
          method: 'POST' 
        });
        
        const data = await res.json();
        
        if (res.ok) {
          alert(`✅ Vendor activated successfully!\n\nCompany: ${data.companyName}\nEmail: ${data.email}\n\nThe vendor can now login using their email and OTP.`);
          // Refresh the vendors list
          fetchVendors();
        } else {
          alert(`❌ Error: ${data.error}`);
        }
      } catch (error) {
        console.error('Error activating vendor:', error);
        alert('❌ Failed to activate vendor. Please try again.');
      } finally {
        setActivating(null);
      }
    }
  };

  const formatPrice = (price: number) => {
    return `Rs ${new Intl.NumberFormat('en-PK').format(price)}`;
  };

  const getStats = () => {
    const totalVendors = vendors.length;
    const activeVendors = vendors.filter(v => v.isActive).length;
    const verifiedVendors = vendors.filter(v => v.verificationStatus === 'verified').length;
    const pendingVendors = vendors.filter(v => v.verificationStatus === 'pending').length;
    const totalSales = vendors.reduce((sum, v) => sum + (parseFloat(v.totalSales?.toString() || '0')), 0);
    
    return { totalVendors, activeVendors, verifiedVendors, pendingVendors, totalSales };
  };

  const stats = getStats();

  const getVerificationBadge = (status: string) => {
    const statusConfig: any = {
      verified: { label: 'Verified', variant: 'default', icon: <CheckCircleIcon className="h-3 w-3 mr-1" /> },
      pending: { label: 'Pending', variant: 'secondary', icon: <ClockIcon className="h-3 w-3 mr-1" /> },
      rejected: { label: 'Rejected', variant: 'destructive', icon: <XCircleIcon className="h-3 w-3 mr-1" /> },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Badge variant={config.variant as any} className="flex items-center w-fit">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const VendorLogo = ({ logo, name }: { logo?: string; name: string }) => {
    if (!logo) {
      return (
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <StoreIcon className="h-5 w-5 text-gray-400" />
        </div>
      );
    }

    return (
      <img 
        src={logo} 
        alt={name}
        className="w-10 h-10 object-cover rounded-full border border-gray-200"
      />
    );
  };

  const columns = [
    {
      key: 'logo',
      title: 'Logo',
      render: (_: any, vendor: Vendor) => (
        <VendorLogo logo={vendor.logo} name={vendor.companyName} />
      ),
      mobileHidden: true
    },
    {
      key: 'company',
      title: 'Company',
      render: (_: any, vendor: Vendor) => (
        <div>
          <div className="font-medium">{vendor.companyName}</div>
          <div className="text-sm text-muted-foreground">{vendor.companyEmail}</div>
        </div>
      )
    },
    {
      key: 'businessType',
      title: 'Type',
      render: (_: any, vendor: Vendor) => (
        <div className="text-sm capitalize">
          {vendor.businessType || 'N/A'}
        </div>
      ),
      mobileHidden: true
    },
    {
      key: 'location',
      title: 'Location',
      render: (_: any, vendor: Vendor) => (
        <div className="text-sm">
          {vendor.businessCity || 'N/A'}, {vendor.businessCountry || 'N/A'}
        </div>
      ),
      mobileHidden: true
    },
    {
      key: 'verification',
      title: 'Verification',
      render: (_: any, vendor: Vendor) => getVerificationBadge(vendor.verificationStatus)
    },
    {
      key: 'products',
      title: 'Products',
      render: (_: any, vendor: Vendor) => (
        <div className="text-sm font-medium">
          {vendor.totalProducts || 0}
        </div>
      ),
      mobileHidden: true
    },
    {
      key: 'sales',
      title: 'Total Sales',
      render: (_: any, vendor: Vendor) => (
        <div className="text-sm font-medium">
          {formatPrice(vendor.totalSales || 0)}
        </div>
      ),
      mobileHidden: true
    },
    {
      key: 'status',
      title: 'Status',
      render: (_: any, vendor: Vendor) => (
        <div className="flex flex-col gap-1">
          <Badge variant={vendor.isActive ? 'default' : 'secondary'}>
            {vendor.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {vendor.isFeatured && (
            <Badge variant="outline" className="w-fit">
              Featured
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      title: 'Registered',
      render: (_: any, vendor: Vendor) => (
        <div className="text-sm">
          {new Date(vendor.createdAt).toLocaleDateString()}
        </div>
      ),
      mobileHidden: true
    }
  ];

  const renderActions = (vendor: Vendor) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVerticalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Show Activate button only if vendor doesn't have a user account or is inactive */}
        {(!vendor.userId || !vendor.isActive) && (
          <DropdownMenuItem 
            onClick={() => handleActivateVendor(vendor.id, vendor.companyName)}
            disabled={activating === vendor.id}
            className="text-green-600 focus:text-green-600"
          >
            <UserCheckIcon className="h-4 w-4 mr-2" />
            {activating === vendor.id ? 'Activating...' : 'Activate Vendor'}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={`/vendors/${vendor.id}`} className="flex items-center">
            <EyeIcon className="h-4 w-4 mr-2" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/vendors/edit/${vendor.id}`} className="flex items-center">
            <EditIcon className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDelete(vendor.id)}
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
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">
            Manage vendor companies and brands
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchVendors} disabled={loading} variant="outline" size="sm">
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/vendors/add">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Vendor
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <StoreIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVendors}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeVendors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.verifiedVendors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ClockIcon className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingVendors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatPrice(stats.totalSales)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Table */}
      <ResponsiveTable
        columns={columns}
        data={vendors}
        loading={loading}
        emptyMessage="No vendors found"
        actions={renderActions}
      />
    </div>
  );
}

