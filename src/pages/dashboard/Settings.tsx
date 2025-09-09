import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User, Bell, Shield, Palette, Database, Smartphone, Globe, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Settings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    trading: true,
    news: true,
    alerts: true
  });

  const [preferences, setPreferences] = useState({
    theme: 'dark',
    currency: 'USD',
    timezone: 'EST',
    dateFormat: 'MM/DD/YYYY',
    language: 'en'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and application settings</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-lg">
                    {user?.user_metadata?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline">Change Avatar</Button>
                  <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input 
                    id="displayName" 
                    defaultValue={user?.user_metadata?.display_name || ''} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={user?.email || ''} 
                    disabled 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="EST">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                      <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                      <SelectItem value="CST">Central Time (CST)</SelectItem>
                      <SelectItem value="MST">Mountain Time (MST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="Tell us about yourself..." />
              </div>

              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">Receive updates via email</div>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-muted-foreground">Browser notifications</div>
                  </div>
                  <Switch 
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">SMS Notifications</div>
                    <div className="text-sm text-muted-foreground">Text message alerts</div>
                  </div>
                  <Switch 
                    checked={notifications.sms}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Trading Alerts</div>
                    <div className="text-sm text-muted-foreground">Price movements and trading signals</div>
                  </div>
                  <Switch 
                    checked={notifications.trading}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, trading: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Market News</div>
                    <div className="text-sm text-muted-foreground">Breaking news and market updates</div>
                  </div>
                  <Switch 
                    checked={notifications.news}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, news: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">AI Insights</div>
                    <div className="text-sm text-muted-foreground">AI-generated trading insights</div>
                  </div>
                  <Switch 
                    checked={notifications.alerts}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, alerts: checked }))}
                  />
                </div>
              </div>

              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>

              <Button>Update Password</Button>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">SMS Authentication</div>
                    <div className="text-sm text-muted-foreground">Secure your account with SMS codes</div>
                  </div>
                  <Badge variant="outline">Not Enabled</Badge>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Login Sessions</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Current Session</div>
                        <div className="text-sm text-muted-foreground">Chrome on macOS • New York, US</div>
                      </div>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </div>
                <Button variant="outline">Sign Out All Other Sessions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Application Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={preferences.theme} onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={preferences.currency} onValueChange={(value) => setPreferences(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select value={preferences.dateFormat} onValueChange={(value) => setPreferences(prev => ({ ...prev, dateFormat: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing & Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Pro Plan</h4>
                    <p className="text-sm text-muted-foreground">Advanced trading features and AI analytics</p>
                  </div>
                  <Badge>Active</Badge>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Next billing date: January 15, 2024 • $29.99/month
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Payment Method</h4>
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <div className="font-medium">•••• •••• •••• 4242</div>
                      <div className="text-sm text-muted-foreground">Expires 12/26</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">Change Plan</Button>
                <Button variant="outline">Cancel Subscription</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Export Data</h4>
                  <p className="text-sm text-muted-foreground mb-4">Download your trading data and preferences</p>
                  <Button variant="outline">Download Data Archive</Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Data Usage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Portfolio Data</span>
                      <span>2.1 MB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Trading History</span>
                      <span>5.8 MB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>AI Analytics</span>
                      <span>1.2 MB</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2 text-red-600">Danger Zone</h4>
                  <div className="space-y-4 p-4 border border-red-200 rounded-lg">
                    <div>
                      <div className="font-medium">Clear All Data</div>
                      <div className="text-sm text-muted-foreground">Permanently delete all your trading data</div>
                    </div>
                    <Button variant="destructive" size="sm">Clear Data</Button>
                  </div>

                  <div className="space-y-4 p-4 border border-red-200 rounded-lg mt-4">
                    <div>
                      <div className="font-medium">Delete Account</div>
                      <div className="text-sm text-muted-foreground">Permanently delete your account and all associated data</div>
                    </div>
                    <Button variant="destructive" size="sm">Delete Account</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}