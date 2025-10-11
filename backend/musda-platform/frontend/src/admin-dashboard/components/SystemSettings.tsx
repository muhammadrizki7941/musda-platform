import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

import { 
  Settings, 
  Shield, 
  Mail, 
  Bell, 
  Palette, 
  Database, 
  Save, 
  Upload,
  Download,
  Server,
  Lock,
  Globe,
  Smartphone,
  Calendar
} from 'lucide-react';
import { CountdownSettings } from './CountdownSettings';

export function SystemSettings() {
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Pengaturan Sistem</h1>
        <p className="text-gray-400">Konfigurasi sistem dan aplikasi MUSDA II</p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Server className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">System Status</p>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Online</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Database</p>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Connected</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Mail className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email Service</p>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Security</p>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Secure</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
  <Tabs defaultValue="general" className="space-y-6">
  <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="countdown" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
            <Calendar className="w-4 h-4 mr-2" />
            Countdown
          </TabsTrigger>
        <TabsContent value="countdown">
          <CountdownSettings />
        </TabsContent>
          <TabsTrigger value="general" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="theme" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
            <Palette className="w-4 h-4 mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="backup" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
            <Database className="w-4 h-4 mr-2" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">General Settings</CardTitle>
              <CardDescription className="text-gray-400">
                Pengaturan dasar aplikasi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="site-name">Nama Website</Label>
                <Input
                  id="site-name"
                  defaultValue="MUSDA II HIMPERRA Lampung"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="site-url">URL Website</Label>
                <Input
                  id="site-url"
                  defaultValue="https://musda.himperra-lampung.org"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="contact-email">Email Kontak</Label>
                <Input
                  id="contact-email"
                  type="email"
                  defaultValue="info@himperra-lampung.org"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="asia/jakarta">
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="asia/jakarta">Asia/Jakarta (WIB)</SelectItem>
                    <SelectItem value="asia/makassar">Asia/Makassar (WITA)</SelectItem>
                    <SelectItem value="asia/jayapura">Asia/Jayapura (WIT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-gray-400">Aktifkan mode maintenance untuk website</p>
                </div>
                <Switch id="maintenance-mode" />
              </div>
              <div className="flex justify-end">
                <Button className="bg-yellow-500 text-black hover:bg-yellow-600">
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Pengaturan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Security Settings</CardTitle>
              <CardDescription className="text-gray-400">
                Konfigurasi keamanan sistem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="force-2fa">Wajib 2FA untuk Admin</Label>
                  <p className="text-sm text-gray-400">Semua admin harus menggunakan 2FA</p>
                </div>
                <Switch id="force-2fa" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="password-policy">Strong Password Policy</Label>
                  <p className="text-sm text-gray-400">Minimum 8 karakter, huruf besar, angka, simbol</p>
                </div>
                <Switch id="password-policy" defaultChecked />
              </div>
              <div>
                <Label htmlFor="session-timeout">Session Timeout (menit)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  defaultValue="60"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                <Input
                  id="max-login-attempts"
                  type="number"
                  defaultValue="5"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ip-whitelist">IP Whitelist</Label>
                  <p className="text-sm text-gray-400">Batasi akses admin berdasarkan IP</p>
                </div>
                <Switch id="ip-whitelist" />
              </div>
              <div className="flex justify-end">
                <Button className="bg-yellow-500 text-black hover:bg-yellow-600">
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Email Configuration</CardTitle>
              <CardDescription className="text-gray-400">
                Pengaturan SMTP dan email templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  defaultValue="smtp.gmail.com"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    defaultValue="587"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp-security">Security</Label>
                  <Select defaultValue="tls">
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="smtp-username">SMTP Username</Label>
                <Input
                  id="smtp-username"
                  defaultValue="admin@himperra-lampung.org"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="smtp-password">SMTP Password</Label>
                <Input
                  id="smtp-password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="from-email">From Email</Label>
                <Input
                  id="from-email"
                  defaultValue="noreply@himperra-lampung.org"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="from-name">From Name</Label>
                <Input
                  id="from-name"
                  defaultValue="MUSDA II HIMPERRA Lampung"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  Test Email
                </Button>
                <Button className="bg-yellow-500 text-black hover:bg-yellow-600">
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Email Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Notification Settings</CardTitle>
              <CardDescription className="text-gray-400">
                Pengaturan notifikasi sistem dan email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-white font-medium">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Pendaftaran Peserta Baru</Label>
                      <p className="text-sm text-gray-400">Notifikasi ketika ada peserta baru mendaftar</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sponsor Baru</Label>
                      <p className="text-sm text-gray-400">Notifikasi ketika ada sponsor baru</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>System Errors</Label>
                      <p className="text-sm text-gray-400">Notifikasi error sistem</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-white font-medium">Push Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Browser Notifications</Label>
                      <p className="text-sm text-gray-400">Notifikasi browser untuk admin</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mobile App Notifications</Label>
                      <p className="text-sm text-gray-400">Push notifikasi ke mobile app</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notification-email">Notification Recipients</Label>
                <Textarea
                  id="notification-email"
                  placeholder="admin1@email.com, admin2@email.com"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="flex justify-end">
                <Button className="bg-yellow-500 text-black hover:bg-yellow-600">
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Theme Customization</CardTitle>
              <CardDescription className="text-gray-400">
                Kustomisasi tampilan dan branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg border border-gray-600"></div>
                  <Input
                    id="primary-color"
                    defaultValue="#F59E0B"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg border border-gray-600"></div>
                  <Input
                    id="secondary-color"
                    defaultValue="#1F2937"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="logo-upload">Logo Upload</Label>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    Upload Logo
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="custom-css">Custom CSS</Label>
                <Textarea
                  id="custom-css"
                  placeholder="/* Custom CSS here */"
                  className="bg-gray-700 border-gray-600 text-white font-mono text-sm"
                  rows={6}
                />
              </div>
              <div className="flex justify-end">
                <Button className="bg-yellow-500 text-black hover:bg-yellow-600">
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Theme Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Backup & Restore</CardTitle>
              <CardDescription className="text-gray-400">
                Backup data dan restore sistem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-white font-medium">Automatic Backup</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Auto Backup</Label>
                    <p className="text-sm text-gray-400">Backup otomatis setiap hari</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label htmlFor="backup-time">Backup Time</Label>
                  <Input
                    id="backup-time"
                    type="time"
                    defaultValue="02:00"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="retention-days">Retention Period (days)</Label>
                  <Input
                    id="retention-days"
                    type="number"
                    defaultValue="30"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-white font-medium">Manual Backup</h3>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={handleBackup}
                    disabled={isBackingUp}
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    {isBackingUp ? 'Creating Backup...' : 'Create Backup Now'}
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download Latest Backup
                  </Button>
                </div>
                {isBackingUp && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Backup Progress</span>
                      <span className="text-white">{backupProgress}%</span>
                    </div>
                    <Progress value={backupProgress} className="h-2" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-white font-medium">Recent Backups</h3>
                <div className="space-y-3">
                  {[
                    { date: '2024-01-20 02:00', size: '45.2 MB', status: 'Success' },
                    { date: '2024-01-19 02:00', size: '44.8 MB', status: 'Success' },
                    { date: '2024-01-18 02:00', size: '44.1 MB', status: 'Success' },
                  ].map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{backup.date}</p>
                        <p className="text-gray-400 text-sm">{backup.size}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          {backup.status}
                        </Badge>
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}