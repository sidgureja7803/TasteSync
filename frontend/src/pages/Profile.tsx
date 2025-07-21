import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  HelpCircle, 
  LogOut, 
  Edit, 
  Camera, 
  Twitter, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Youtube, 
  BarChart2, 
  FileText, 
  Clock, 
  TrendingUp, 
  Link as LinkIcon,
  Plus,
  Check,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuthContext } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { userId, firstName, lastName, profileImageUrl, signOut } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'platforms' | 'subscription'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock user data
  const userData = {
    email: 'user@example.com',
    phone: '+1 (555) 123-4567',
    joinDate: 'January 15, 2025',
    plan: 'Professional',
    planStatus: 'Active',
    nextBilling: 'August 15, 2025',
    usageStats: {
      contentGenerated: 124,
      contentPublished: 87,
      totalEngagement: 4328,
      tokensUsed: '1.2M',
      tokensRemaining: '3.8M'
    }
  };
  
  // Mock connected platforms
  const connectedPlatforms = [
    { id: 'twitter', name: 'Twitter', icon: <Twitter size={20} />, connected: true, username: '@yourusername' },
    { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin size={20} />, connected: true, username: 'Your Name' },
    { id: 'facebook', name: 'Facebook', icon: <Facebook size={20} />, connected: false, username: '' },
    { id: 'instagram', name: 'Instagram', icon: <Instagram size={20} />, connected: true, username: '@yourusername' },
    { id: 'youtube', name: 'YouTube', icon: <Youtube size={20} />, connected: false, username: '' }
  ];
  
  // Mock recent activity
  const recentActivity = [
    { id: 1, type: 'content', title: 'Generated new content', time: '2 hours ago' },
    { id: 2, type: 'publish', title: 'Published to Twitter and LinkedIn', time: 'Yesterday' },
    { id: 3, type: 'settings', title: 'Updated account settings', time: '3 days ago' },
    { id: 4, type: 'platform', title: 'Connected Instagram account', time: '1 week ago' }
  ];
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Profile</h1>
      
      {/* Profile header with user info and tabs */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {/* User info header */}
        <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 p-6 pb-24">
          <div className="absolute top-4 right-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-background/80 backdrop-blur-sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : <><Edit size={14} className="mr-1" /> Edit Profile</>}
            </Button>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-4xl overflow-hidden">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{firstName?.charAt(0) || 'U'}</span>
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md">
                  <Camera size={16} />
                </button>
              )}
            </div>
            <h2 className="text-xl font-semibold mt-3">
              {firstName && lastName ? `${firstName} ${lastName}` : 'User'}
            </h2>
            <p className="text-muted-foreground">{userData.email}</p>
            <p className="text-sm text-muted-foreground mt-1">Member since {userData.joinDate}</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-card px-4 flex border-b border-border relative" style={{ marginTop: '-20px' }}>
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'profile' 
                ? 'border-primary text-foreground' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'account' 
                ? 'border-primary text-foreground' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('account')}
          >
            Account Settings
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'platforms' 
                ? 'border-primary text-foreground' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('platforms')}
          >
            Connected Platforms
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'subscription' 
                ? 'border-primary text-foreground' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('subscription')}
          >
            Subscription
          </button>
        </div>
        
        {/* Tab content */}
        <div className="p-6">
          {/* Profile tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <User size={18} className="mr-2 text-muted-foreground" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      First Name
                    </label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-border bg-background rounded-md"
                        defaultValue={firstName || ''}
                      />
                    ) : (
                      <p className="text-foreground">{firstName || 'Not set'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-border bg-background rounded-md"
                        defaultValue={lastName || ''}
                      />
                    ) : (
                      <p className="text-foreground">{lastName || 'Not set'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input 
                        type="email" 
                        className="w-full px-3 py-2 border border-border bg-background rounded-md"
                        defaultValue={userData.email}
                      />
                    ) : (
                      <p className="text-foreground">{userData.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input 
                        type="tel" 
                        className="w-full px-3 py-2 border border-border bg-background rounded-md"
                        defaultValue={userData.phone}
                      />
                    ) : (
                      <p className="text-foreground">{userData.phone}</p>
                    )}
                  </div>
                </div>
                
                {isEditing && (
                  <div className="mt-4">
                    <Button className="mr-2">Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                )}
              </div>
              
              {/* Usage Statistics */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <BarChart2 size={18} className="mr-2 text-muted-foreground" />
                  Usage Statistics
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <p className="text-muted-foreground text-sm">Content Generated</p>
                    <h4 className="text-2xl font-bold mt-1">{userData.usageStats.contentGenerated}</h4>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <p className="text-muted-foreground text-sm">Content Published</p>
                    <h4 className="text-2xl font-bold mt-1">{userData.usageStats.contentPublished}</h4>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <p className="text-muted-foreground text-sm">Total Engagement</p>
                    <h4 className="text-2xl font-bold mt-1">{userData.usageStats.totalEngagement}</h4>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <p className="text-muted-foreground text-sm">Tokens Used</p>
                    <h4 className="text-2xl font-bold mt-1">{userData.usageStats.tokensUsed}</h4>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <p className="text-muted-foreground text-sm">Tokens Remaining</p>
                    <h4 className="text-2xl font-bold mt-1">{userData.usageStats.tokensRemaining}</h4>
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Clock size={18} className="mr-2 text-muted-foreground" />
                  Recent Activity
                </h3>
                
                <div className="space-y-4">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-start pb-4 border-b border-border last:border-0 last:pb-0">
                      <div className="mr-3 mt-0.5">
                        {activity.type === 'content' && <FileText size={16} className="text-blue-500" />}
                        {activity.type === 'publish' && <ExternalLink size={16} className="text-green-500" />}
                        {activity.type === 'settings' && <Settings size={16} className="text-orange-500" />}
                        {activity.type === 'platform' && <LinkIcon size={16} className="text-purple-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Account Settings tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Notification Settings */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Bell size={18} className="mr-2 text-muted-foreground" />
                  Notification Settings
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-border rounded-md">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates and alerts via email</p>
                    </div>
                    <div className="h-6 w-11 bg-muted relative rounded-full cursor-pointer">
                      <div className="absolute h-5 w-5 bg-primary rounded-full top-0.5 left-0.5"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-border rounded-md">
                    <div>
                      <p className="font-medium">Content Generation Notifications</p>
                      <p className="text-sm text-muted-foreground">Get notified when content generation is complete</p>
                    </div>
                    <div className="h-6 w-11 bg-primary relative rounded-full cursor-pointer">
                      <div className="absolute h-5 w-5 bg-background rounded-full top-0.5 right-0.5"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-border rounded-md">
                    <div>
                      <p className="font-medium">Platform Updates</p>
                      <p className="text-sm text-muted-foreground">Receive notifications about new features and updates</p>
                    </div>
                    <div className="h-6 w-11 bg-primary relative rounded-full cursor-pointer">
                      <div className="absolute h-5 w-5 bg-background rounded-full top-0.5 right-0.5"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Security Settings */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Shield size={18} className="mr-2 text-muted-foreground" />
                  Security Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Change Password
                    </label>
                    <div className="flex gap-2">
                      <Button variant="outline">Change Password</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-border rounded-md">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-border rounded-md">
                    <div>
                      <p className="font-medium">Session Management</p>
                      <p className="text-sm text-muted-foreground">Manage your active sessions and devices</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                </div>
              </div>
              
              {/* Danger Zone */}
              <div>
                <h3 className="text-lg font-medium mb-4 text-destructive flex items-center">
                  Danger Zone
                </h3>
                
                <div className="border border-destructive/20 rounded-md p-4 bg-destructive/5">
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive" size="sm">Delete Account</Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Connected Platforms tab */}
          {activeTab === 'platforms' && (
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Connect your social media accounts to publish content directly from TasteSync.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connectedPlatforms.map(platform => (
                  <div key={platform.id} className="border border-border rounded-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          platform.connected ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'
                        }`}>
                          {platform.icon}
                        </div>
                        <div>
                          <p className="font-medium">{platform.name}</p>
                          {platform.connected && (
                            <p className="text-xs text-muted-foreground">{platform.username}</p>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        variant={platform.connected ? "outline" : "default"} 
                        size="sm"
                        className={platform.connected ? "text-destructive hover:text-destructive" : ""}
                      >
                        {platform.connected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                    
                    {platform.connected && (
                      <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                        <Check size={14} className="mr-1" />
                        Connected
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="border border-dashed border-border rounded-md p-4 flex items-center justify-center">
                  <Button variant="outline" className="flex items-center">
                    <Plus size={16} className="mr-1" />
                    Add Custom Platform
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-md border border-border">
                <h4 className="font-medium mb-2">Platform Permissions</h4>
                <p className="text-sm text-muted-foreground">
                  TasteSync requests read and write permissions to post content on your behalf. 
                  You can revoke these permissions at any time by disconnecting your accounts.
                </p>
              </div>
            </div>
          )}
          
          {/* Subscription tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-1">Current Plan: {userData.plan}</h3>
                    <p className="text-muted-foreground">
                      Status: <span className="text-green-600 dark:text-green-400">{userData.planStatus}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Next billing date: {userData.nextBilling}
                    </p>
                  </div>
                  <Button>Upgrade Plan</Button>
                </div>
              </div>
              
              {/* Plan Features */}
              <div>
                <h3 className="text-lg font-medium mb-4">Plan Features</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center p-3 border border-border rounded-md">
                    <Check size={18} className="text-green-600 dark:text-green-400 mr-3" />
                    <p>5M tokens per month</p>
                  </div>
                  <div className="flex items-center p-3 border border-border rounded-md">
                    <Check size={18} className="text-green-600 dark:text-green-400 mr-3" />
                    <p>Unlimited content generation</p>
                  </div>
                  <div className="flex items-center p-3 border border-border rounded-md">
                    <Check size={18} className="text-green-600 dark:text-green-400 mr-3" />
                    <p>All social media platforms</p>
                  </div>
                  <div className="flex items-center p-3 border border-border rounded-md">
                    <Check size={18} className="text-green-600 dark:text-green-400 mr-3" />
                    <p>Advanced analytics</p>
                  </div>
                  <div className="flex items-center p-3 border border-border rounded-md">
                    <Check size={18} className="text-green-600 dark:text-green-400 mr-3" />
                    <p>Priority support</p>
                  </div>
                </div>
              </div>
              
              {/* Payment Methods */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <CreditCard size={18} className="mr-2 text-muted-foreground" />
                  Payment Methods
                </h3>
                
                <div className="border border-border rounded-md p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-6 bg-blue-600 rounded mr-3"></div>
                      <div>
                        <p className="font-medium">Visa ending in 4242</p>
                        <p className="text-xs text-muted-foreground">Expires 12/2028</p>
                      </div>
                    </div>
                    <div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="flex items-center">
                  <Plus size={16} className="mr-1" />
                  Add Payment Method
                </Button>
              </div>
              
              {/* Billing History */}
              <div>
                <h3 className="text-lg font-medium mb-4">Billing History</h3>
                
                <div className="border border-border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Date</th>
                        <th className="text-left p-3 text-sm font-medium">Description</th>
                        <th className="text-left p-3 text-sm font-medium">Amount</th>
                        <th className="text-left p-3 text-sm font-medium">Status</th>
                        <th className="text-left p-3 text-sm font-medium">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="p-3 text-sm">Jul 15, 2025</td>
                        <td className="p-3 text-sm">Professional Plan - Monthly</td>
                        <td className="p-3 text-sm">$49.00</td>
                        <td className="p-3 text-sm">
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded dark:bg-green-900/30 dark:text-green-300">
                            Paid
                          </span>
                        </td>
                        <td className="p-3 text-sm">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <ExternalLink size={14} />
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 text-sm">Jun 15, 2025</td>
                        <td className="p-3 text-sm">Professional Plan - Monthly</td>
                        <td className="p-3 text-sm">$49.00</td>
                        <td className="p-3 text-sm">
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded dark:bg-green-900/30 dark:text-green-300">
                            Paid
                          </span>
                        </td>
                        <td className="p-3 text-sm">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <ExternalLink size={14} />
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 text-sm">May 15, 2025</td>
                        <td className="p-3 text-sm">Professional Plan - Monthly</td>
                        <td className="p-3 text-sm">$49.00</td>
                        <td className="p-3 text-sm">
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded dark:bg-green-900/30 dark:text-green-300">
                            Paid
                          </span>
                        </td>
                        <td className="p-3 text-sm">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <ExternalLink size={14} />
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Help and Support */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium mb-1 flex items-center">
              <HelpCircle size={18} className="mr-2 text-muted-foreground" />
              Help and Support
            </h3>
            <p className="text-muted-foreground">
              Need help with your account or have questions about TasteSync?
            </p>
          </div>
          <Button variant="outline">Contact Support</Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;