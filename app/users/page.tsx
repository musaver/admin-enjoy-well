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
  UsersIcon,
  DownloadIcon,
  MessageCircleIcon
} from 'lucide-react';

interface User {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  status?: string;
  createdAt: string;
  loyaltyPoints?: {
    availablePoints: number;
    pendingPoints: number;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    pointsExpiringSoon: number;
  };
}

interface Subscription {
  id: string;
  name: string;
  slug: string;
  price: string;
  currency: string;
  billingCycle: string;
  description?: string;
  isActive: boolean;
}

interface UserSubscription {
  id: string;
  userId: string;
  subscriptionId: string;
  subscriptionName: string;
  price: string;
  currency: string;
  status: string;
  startDate: string;
  expiryDate?: string;
  billingCycle?: string;
  autoRenew: boolean;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<{
    total: number;
    success: number;
    errors: string[];
  } | null>(null);
  
  // Subscription modal states
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<Record<string, UserSubscription[]>>({});
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [assigningSubscription, setAssigningSubscription] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState('');
  const [subscriptionStartDate, setSubscriptionStartDate] = useState('');
  const [subscriptionNotes, setSubscriptionNotes] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      // Sort users by created date (most recent first)
      const sortedUsers = (data || []).sort((a: User, b: User) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Most recent first
      });
      setUsers(sortedUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAllSubscriptions();
    fetchAllUserSubscriptions();
  }, []);
  
  const fetchAllSubscriptions = async () => {
    try {
      const res = await fetch('/api/subscriptions?isActive=true');
      const data = await res.json();
      setSubscriptions(data || []);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    }
  };
  
  const fetchAllUserSubscriptions = async () => {
    try {
      const res = await fetch('/api/user-subscriptions');
      const data = await res.json();
      
      // Group by userId
      const grouped: Record<string, UserSubscription[]> = {};
      (data || []).forEach((sub: UserSubscription) => {
        if (!grouped[sub.userId]) {
          grouped[sub.userId] = [];
        }
        grouped[sub.userId].push(sub);
      });
      
      setUserSubscriptions(grouped);
    } catch (err) {
      console.error('Error fetching user subscriptions:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`/api/users/${id}`, { method: 'DELETE' });
        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'approved' : 'pending';
    const user = users.find(u => u.id === id);
    const userName = user?.name || user?.email || 'this user';
    
    const action = newStatus === 'approved' ? 'approve' : 'set as pending';
    const emailNote = user?.email ? ' An email notification will be sent.' : ' (No email on file)';
    const confirmMessage = `Are you sure you want to ${action} ${userName}?${emailNote}`;
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === id ? { ...user, status: newStatus } : user
        ));
        
        // Show success message with email info
        if (user?.email && newStatus === 'approved') {
          alert(`User ${action}d successfully! Approval email sent to ${user.email}`);
        } else if (user?.email) {
          alert(`User status updated successfully! Notification email sent to ${user.email}`);
        } else {
          alert(`User status updated successfully!`);
        }
      } else {
        console.error('Failed to update user status');
        alert('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status');
    }
  };

  const exportUsers = async () => {
    setExporting(true);
    try {
      // Convert users data to CSV format
      const csvHeaders = [
        'ID', 'Name', 'Email', 'Phone', 'Country', 'City', 'Address', 'Status', 'Created At',
        'Available Points', 'Pending Points', 'Total Earned', 'Total Redeemed', 'Expiring Soon'
      ];
      const csvData = users.map((user) => [
        user.id || '',
        user.name || '',
        user.email || '',
        user.phone || '',
        user.country || '',
        user.city || '',
        user.address || '',
        user.status || 'pending',
        user.createdAt ? new Date(user.createdAt).toLocaleString() : '',
        user.loyaltyPoints?.availablePoints || 0,
        user.loyaltyPoints?.pendingPoints || 0,
        user.loyaltyPoints?.totalPointsEarned || 0,
        user.loyaltyPoints?.totalPointsRedeemed || 0,
        user.loyaltyPoints?.pointsExpiringSoon || 0
      ]);

      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('Failed to export users');
    } finally {
      setExporting(false);
    }
  };

  const downloadTemplate = () => {
    const templateHeaders = ['Name', 'Phone', 'Email', 'Notes', 'Date Created'];
    const sampleData = [
      ['John Doe', '+1234567890', 'john.doe@example.com', 'Sample user notes', '2024-01-15'],
      ['Jane Smith', '+1987654321', '', 'User with phone only', '2024-01-16'],
      ['Bob Johnson', '', 'bob.johnson@example.com', 'User with email only', '2024-01-17']
    ];

    const csvContent = [
      templateHeaders.join(','),
      ...sampleData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'users_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setImportFile(file);
        setImportResults(null);
      } else {
        alert('Please select a valid CSV or Excel file.');
        event.target.value = '';
      }
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch('/api/users/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setImportResults(result);
        fetchUsers(); // Refresh the users list
        setImportFile(null);
      } else {
        alert(result.error || 'Failed to import users');
      }
    } catch (error) {
      console.error('Error importing users:', error);
      alert('Failed to import users');
    } finally {
      setImporting(false);
    }
  };
  
  const openSubscriptionModal = (user: User) => {
    setSelectedUser(user);
    setShowSubscriptionModal(true);
    setSelectedSubscriptionId('');
    setSubscriptionStartDate(new Date().toISOString().split('T')[0]);
    setSubscriptionNotes('');
  };
  
  const handleAssignSubscription = async () => {
    if (!selectedUser || !selectedSubscriptionId) {
      alert('Please select a subscription');
      return;
    }
    
    setAssigningSubscription(true);
    try {
      const response = await fetch('/api/user-subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          subscriptionId: selectedSubscriptionId,
          startDate: subscriptionStartDate,
          notes: subscriptionNotes || null,
        }),
      });
      
      if (response.ok) {
        alert('Subscription assigned successfully!');
        setShowSubscriptionModal(false);
        fetchAllUserSubscriptions();
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to assign subscription');
      }
    } catch (error) {
      console.error('Error assigning subscription:', error);
      alert('Failed to assign subscription');
    } finally {
      setAssigningSubscription(false);
    }
  };
  
  const handleRemoveSubscription = async (userSubId: string) => {
    if (!confirm('Are you sure you want to remove this subscription?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/user-subscriptions/${userSubId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('Subscription removed successfully!');
        fetchAllUserSubscriptions();
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to remove subscription');
      }
    } catch (error) {
      console.error('Error removing subscription:', error);
      alert('Failed to remove subscription');
    }
  };

  const getStats = () => {
    const totalUsers = users.length;
    const usersWithPhone = users.filter(user => user.phone).length;
    const usersWithAddress = users.filter(user => user.address).length;
    
    // Status stats
    const approvedUsers = users.filter(user => user.status === 'approved').length;
    const pendingUsers = users.filter(user => user.status === 'pending' || !user.status).length;
    
    // Loyalty points stats
    const usersWithPoints = users.filter(user => user.loyaltyPoints && user.loyaltyPoints.availablePoints > 0).length;
    const totalAvailablePoints = users.reduce((sum, user) => sum + (user.loyaltyPoints?.availablePoints || 0), 0);
    const totalPointsEarned = users.reduce((sum, user) => sum + (user.loyaltyPoints?.totalPointsEarned || 0), 0);
    const totalPointsRedeemed = users.reduce((sum, user) => sum + (user.loyaltyPoints?.totalPointsRedeemed || 0), 0);
    const usersWithExpiring = users.filter(user => user.loyaltyPoints && user.loyaltyPoints.pointsExpiringSoon > 0).length;
    
    return { 
      totalUsers, 
      usersWithPhone, 
      usersWithAddress,
      approvedUsers,
      pendingUsers,
      usersWithPoints,
      totalAvailablePoints,
      totalPointsEarned,
      totalPointsRedeemed,
      usersWithExpiring
    };
  };

  const stats = getStats();

  const columns = [
    {
      key: 'name',
      title: 'User',
      render: (_: any, user: User) => (
        <div>
          <div className="font-medium">{user.name || 'No Name'}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      )
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (_: any, user: User) => (
        <div className="text-sm">
          {user.phone || 'No phone'}
        </div>
      ),
      mobileHidden: true
    },
    {
      key: 'location',
      title: 'Location',
      render: (_: any, user: User) => (
        <div className="text-sm">
          {user.city && user.country 
            ? `${user.city}, ${user.country}`
            : user.country || user.city || 'No location'
          }
        </div>
      ),
      mobileHidden: true
    },
    {
      key: 'status',
      title: 'Status',
      render: (_: any, user: User) => (
        <div className="flex items-center space-x-2">
          <Badge 
            variant={user.status === 'approved' ? 'default' : 'secondary'}
            className={`text-xs ${
              user.status === 'approved' 
                ? 'bg-green-100 text-green-800 border-green-200'
                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
            }`}
          >
            {user.status === 'approved' ? 'Approved' : 'Pending'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusToggle(user.id, user.status || 'pending')}
            className="h-6 px-2 text-xs"
          >
            {user.status === 'approved' ? 'Set Pending' : 'Approve'}
          </Button>
        </div>
      ),
    },
    {
      key: 'loyaltyPoints',
      title: 'Loyalty Points',
      render: (_: any, user: User) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <Badge 
              variant="secondary" 
              className={`text-xs ${
                (user.loyaltyPoints?.availablePoints || 0) > 0 
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {user.loyaltyPoints?.availablePoints || 0} available
            </Badge>
            {user.loyaltyPoints && user.loyaltyPoints.pendingPoints > 0 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                {user.loyaltyPoints.pendingPoints} pending
              </Badge>
            )}
            {user.loyaltyPoints && user.loyaltyPoints.pointsExpiringSoon > 0 && (
              <Badge variant="destructive" className="text-xs">
                {user.loyaltyPoints.pointsExpiringSoon} expiring
              </Badge>
            )}
          </div>
          {user.loyaltyPoints && (user.loyaltyPoints.totalPointsEarned > 0 || user.loyaltyPoints.totalPointsRedeemed > 0) && (
            <div className="text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Earned: {user.loyaltyPoints.totalPointsEarned}</span>
                <span>Redeemed: {user.loyaltyPoints.totalPointsRedeemed}</span>
              </div>
            </div>
          )}
        </div>
      ),
      mobileHidden: true
    },
    {
      key: 'address',
      title: 'Address',
      render: (_: any, user: User) => (
        <div className="text-sm max-w-xs truncate">
          {user.address || 'No address'}
        </div>
      ),
      mobileHidden: true
    },
    {
      key: 'subscription',
      title: 'Subscription',
      render: (_: any, user: User) => {
        const userSubs = userSubscriptions[user.id] || [];
        const activeSub = userSubs.find(sub => sub.status === 'active');
        
        return (
          <div className="text-sm">
            {activeSub ? (
              <div className="space-y-1">
                <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
                  {activeSub.subscriptionName}
                </Badge>
                {activeSub.expiryDate && (
                  <div className="text-xs text-gray-500">
                    Expires: {new Date(activeSub.expiryDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openSubscriptionModal(user)}
                className="h-7 px-2 text-xs"
              >
                Assign
              </Button>
            )}
          </div>
        );
      },
      mobileHidden: true
    },
    {
      key: 'createdAt',
      title: 'Joined',
      render: (_: any, user: User) => (
        <div className="text-sm">
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      )
    }
  ];

  const renderActions = (user: User) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVerticalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/users/edit/${user.id}`} className="flex items-center">
            <EditIcon className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => openSubscriptionModal(user)}
          className="flex items-center cursor-pointer"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Manage Subscription
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/users/${user.id}/points-history`} className="flex items-center">
            <Badge className="h-4 w-4 mr-2 bg-purple-600" />
            Points History
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/chat?customerId=${user.id}`} className="flex items-center">
            <MessageCircleIcon className="h-4 w-4 mr-2" />
            Start Support Chat
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDelete(user.id)}
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
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage customer accounts and information
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setShowImportModal(true)} 
            variant="outline" 
            size="sm"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Import Users
          </Button>
          <Button 
            onClick={exportUsers} 
            disabled={exporting || users.length === 0} 
            variant="outline" 
            size="sm"
          >
            <DownloadIcon className={`h-4 w-4 mr-2 ${exporting ? 'animate-spin' : ''}`} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button onClick={fetchUsers} disabled={loading} variant="outline" size="sm">
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/users/add">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add User
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Phone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.usersWithPhone}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.usersWithAddress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.usersWithPoints}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalAvailablePoints.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.usersWithExpiring}</div>
            <p className="text-xs text-muted-foreground">users affected</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <ResponsiveTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found"
        actions={renderActions}
      />

      {/* Subscription Modal */}
      {showSubscriptionModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Manage Subscription - {selectedUser.name || selectedUser.email}
              </h3>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Current Subscriptions */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Current Subscriptions</h4>
              <div className="space-y-2">
                {userSubscriptions[selectedUser.id] && userSubscriptions[selectedUser.id].length > 0 ? (
                  userSubscriptions[selectedUser.id].map((sub) => (
                    <div 
                      key={sub.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{sub.subscriptionName}</span>
                          <Badge 
                            variant={sub.status === 'active' ? 'default' : 'secondary'}
                            className={`text-xs ${
                              sub.status === 'active' 
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : sub.status === 'expired'
                                ? 'bg-red-100 text-red-800 border-red-200'
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}
                          >
                            {sub.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <div>Price: Rs {parseFloat(sub.price).toLocaleString('en-PK')}</div>
                          <div>Started: {new Date(sub.startDate).toLocaleDateString()}</div>
                          {sub.expiryDate && (
                            <div>Expires: {new Date(sub.expiryDate).toLocaleDateString()}</div>
                          )}
                          {sub.billingCycle && (
                            <div>Billing: {sub.billingCycle}</div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveSubscription(sub.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No subscriptions assigned</p>
                )}
              </div>
            </div>

            {/* Assign New Subscription */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Assign New Subscription</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Subscription <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSubscriptionId}
                    onChange={(e) => setSelectedSubscriptionId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a subscription...</option>
                    {subscriptions.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} - Rs {parseFloat(sub.price).toLocaleString('en-PK')} / {sub.billingCycle}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={subscriptionStartDate}
                    onChange={(e) => setSubscriptionStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={subscriptionNotes}
                    onChange={(e) => setSubscriptionNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any notes about this subscription assignment..."
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <Button
                    onClick={() => setShowSubscriptionModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignSubscription}
                    disabled={!selectedSubscriptionId || assigningSubscription}
                    className="flex-1"
                  >
                    {assigningSubscription ? 'Assigning...' : 'Assign Subscription'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Import Users</h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportResults(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!importResults ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload a CSV or Excel file with user data. Required columns: Name, and either Phone or Email (or both). Optional columns: Notes, Date Created.
                  </p>
                  
                  <div className="mb-4">
                    <Button
                      onClick={downloadTemplate}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Download Sample Template
                    </Button>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="import-file"
                    />
                    <label htmlFor="import-file" className="cursor-pointer">
                      <div className="text-gray-400 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600">
                        Click to select a file or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        CSV, XLS, XLSX files supported
                      </p>
                    </label>
                  </div>

                  {importFile && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Selected: {importFile.name}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={!importFile || importing}
                    className="flex-1"
                  >
                    {importing ? 'Importing...' : 'Import Users'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-green-600 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold">Import Complete</h4>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Records:</span>
                    <span className="text-sm font-medium">{importResults.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Successfully Imported:</span>
                    <span className="text-sm font-medium text-green-600">{importResults.success}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Errors:</span>
                    <span className="text-sm font-medium text-red-600">{importResults.errors.length}</span>
                  </div>
                </div>

                {importResults.errors.length > 0 && (
                  <div className="max-h-40 overflow-y-auto">
                    <h5 className="text-sm font-medium text-red-600 mb-2">Errors:</h5>
                    <ul className="text-xs text-red-600 space-y-1">
                      {importResults.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportResults(null);
                  }}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 