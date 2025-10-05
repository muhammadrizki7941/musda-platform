import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Building2, 
  Eye, 
  Download,
  FileText,
  PieChart,
  Activity,
  MapPin,
  GraduationCap
} from 'lucide-react';

export function ReportsAnalytics() {
  const [dateRange, setDateRange] = useState('7days');

  const participantStats = {
    total: 347,
    confirmed: 298,
    pending: 49,
    byCategory: {
      mahasiswa: 267,
      dosen: 45,
      umum: 35
    },
    byInstitution: [
      { name: 'Universitas Lampung', count: 156 },
      { name: 'Institut Teknologi Sumatera', count: 89 },
      { name: 'Politeknik Negeri Lampung', count: 67 },
      { name: 'Universitas Bandar Lampung', count: 35 }
    ],
    registrationTrend: [
      { date: '2024-01-14', count: 23 },
      { date: '2024-01-15', count: 45 },
      { date: '2024-01-16', count: 67 },
      { date: '2024-01-17', count: 89 },
      { date: '2024-01-18', count: 112 },
      { date: '2024-01-19', count: 134 },
      { date: '2024-01-20', count: 156 }
    ]
  };

  const sponsorStats = {
    totalRevenue: 1125000000,
    totalSponsors: 15,
    byTier: {
      platinum: { count: 1, revenue: 500000000 },
      gold: { count: 3, revenue: 450000000 },
      silver: { count: 5, revenue: 175000000 },
      supporting: { count: 6, revenue: 0 }
    },
    topSponsors: [
      { name: 'PT Sinar Mas Agro', amount: 500000000, tier: 'platinum' },
      { name: 'Bank Mandiri', amount: 250000000, tier: 'gold' },
      { name: 'Pupuk Indonesia', amount: 200000000, tier: 'gold' },
      { name: 'Telkomsel', amount: 100000000, tier: 'silver' }
    ]
  };

  const websiteStats = {
    totalVisitors: 12450,
    pageViews: 35670,
    avgSessionDuration: '3:45',
    bounceRate: 35.2,
    topPages: [
      { page: '/home', views: 8920, percentage: 25 },
      { page: '/agenda', views: 6780, percentage: 19 },
      { page: '/daftar', views: 5670, percentage: 16 },
      { page: '/sponsor', views: 4320, percentage: 12 },
      { page: '/tentang', views: 3980, percentage: 11 }
    ],
    trafficSources: {
      direct: 45,
      social: 28,
      search: 19,
      referral: 8
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Laporan & Analytics</h1>
          <p className="text-gray-400">Analisis data dan laporan MUSDA II</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 bg-gray-700/50 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="7days">7 Hari Terakhir</SelectItem>
              <SelectItem value="30days">30 Hari Terakhir</SelectItem>
              <SelectItem value="90days">90 Hari Terakhir</SelectItem>
              <SelectItem value="1year">1 Tahun Terakhir</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-yellow-500 text-black hover:bg-yellow-600">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Peserta</p>
                <p className="text-white text-xl font-bold">{participantStats.total}</p>
                <p className="text-green-400 text-xs">↗ +15% dari target</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Building2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Revenue</p>
                <p className="text-white text-lg font-bold">Rp 1.1B</p>
                <p className="text-green-400 text-xs">↗ +8% dari target</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Eye className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Website Views</p>
                <p className="text-white text-xl font-bold">{formatNumber(websiteStats.pageViews)}</p>
                <p className="text-green-400 text-xs">↗ +23% minggu ini</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Conversion Rate</p>
                <p className="text-white text-xl font-bold">12.8%</p>
                <p className="text-green-400 text-xs">↗ +2.1% dari rata-rata</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="participants" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="participants" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
            <Users className="w-4 h-4 mr-2" />
            Peserta
          </TabsTrigger>
          <TabsTrigger value="sponsors" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
            <Building2 className="w-4 h-4 mr-2" />
            Sponsor
          </TabsTrigger>
          <TabsTrigger value="website" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
            <BarChart3 className="w-4 h-4 mr-2" />
            Website
          </TabsTrigger>
          <TabsTrigger value="engagement" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
            <Activity className="w-4 h-4 mr-2" />
            Engagement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participants">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Participant Categories */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-yellow-500" />
                  Kategori Peserta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(participantStats.byCategory).map(([category, count]) => {
                    const percentage = (count / participantStats.total) * 100;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="w-4 h-4 text-yellow-500" />
                            <span className="text-white capitalize">{category}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">{count}</div>
                            <div className="text-gray-400 text-sm">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Institutions */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-yellow-500" />
                  Top Institusi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {participantStats.byInstitution.map((institution, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div>
                        <h3 className="text-white font-medium text-sm">{institution.name}</h3>
                        <p className="text-gray-400 text-xs">#{index + 1} institusi</p>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-500 font-bold">{institution.count}</div>
                        <div className="text-gray-400 text-xs">peserta</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Registration Trend */}
            <Card className="lg:col-span-2 bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-yellow-500" />
                  Tren Pendaftaran
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Grafik pendaftaran peserta per hari
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {participantStats.registrationTrend.map((day, index) => {
                    const maxCount = Math.max(...participantStats.registrationTrend.map(d => d.count));
                    const height = (day.count / maxCount) * 100;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="text-white text-sm font-medium mb-2">{day.count}</div>
                        <div
                          className="w-full bg-yellow-500 rounded-t-md transition-all duration-500 hover:bg-yellow-400"
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="text-gray-400 text-xs mt-2 transform -rotate-45 origin-left">
                          {new Date(day.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sponsors">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Tier */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-yellow-500" />
                  Revenue by Tier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(sponsorStats.byTier).map(([tier, data]) => {
                    const percentage = (data.revenue / sponsorStats.totalRevenue) * 100;
                    const colors = {
                      platinum: 'bg-purple-500',
                      gold: 'bg-yellow-500',
                      silver: 'bg-gray-400',
                      supporting: 'bg-blue-500'
                    };
                    
                    return (
                      <div key={tier} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${colors[tier as keyof typeof colors]}`}></div>
                            <span className="text-white capitalize">{tier}</span>
                            <Badge variant="outline" className="text-xs">{data.count}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">{formatCurrency(data.revenue)}</div>
                            <div className="text-gray-400 text-sm">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Sponsors */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-yellow-500" />
                  Top Sponsors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sponsorStats.topSponsors.map((sponsor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div>
                        <h3 className="text-white font-medium text-sm">{sponsor.name}</h3>
                        <Badge
                          className={`text-xs ${
                            sponsor.tier === 'platinum' ? 'bg-purple-500/20 text-purple-400' :
                            sponsor.tier === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {sponsor.tier}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-500 font-bold text-sm">{formatCurrency(sponsor.amount)}</div>
                        <div className="text-gray-400 text-xs">#{index + 1} sponsor</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="website">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-yellow-500" />
                  Halaman Terpopuler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {websiteStats.topPages.map((page, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white">{page.page}</span>
                        <div className="text-right">
                          <div className="text-white font-medium">{formatNumber(page.views)}</div>
                          <div className="text-gray-400 text-sm">{page.percentage}%</div>
                        </div>
                      </div>
                      <Progress value={page.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-yellow-500" />
                  Sumber Traffic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(websiteStats.trafficSources).map(([source, percentage]) => (
                    <div key={source} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white capitalize">{source}</span>
                        <span className="text-gray-400">{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Website Metrics */}
            <Card className="lg:col-span-2 bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-yellow-500" />
                  Website Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-white">{formatNumber(websiteStats.totalVisitors)}</div>
                    <div className="text-gray-400 text-sm">Total Visitors</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-white">{formatNumber(websiteStats.pageViews)}</div>
                    <div className="text-gray-400 text-sm">Page Views</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-white">{websiteStats.avgSessionDuration}</div>
                    <div className="text-gray-400 text-sm">Avg. Session</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <div className="text-2xl font-bold text-white">{websiteStats.bounceRate}%</div>
                    <div className="text-gray-400 text-sm">Bounce Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-yellow-500" />
                  User Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Email Open Rate</span>
                    <span className="text-white font-bold">68.5%</span>
                  </div>
                  <Progress value={68.5} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Click Through Rate</span>
                    <span className="text-white font-bold">24.3%</span>
                  </div>
                  <Progress value={24.3} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Registration Completion</span>
                    <span className="text-white font-bold">87.2%</span>
                  </div>
                  <Progress value={87.2} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Social Media Engagement</span>
                    <span className="text-white font-bold">45.8%</span>
                  </div>
                  <Progress value={45.8} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Target Peserta</span>
                      <span className="text-yellow-500 font-bold">69.4%</span>
                    </div>
                    <Progress value={69.4} className="h-2" />
                    <div className="text-xs text-gray-400 mt-1">347 dari 500 target</div>
                  </div>
                  
                  <div className="p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Target Revenue</span>
                      <span className="text-yellow-500 font-bold">112.5%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                    <div className="text-xs text-gray-400 mt-1">Rp 1.1B dari Rp 1B target</div>
                  </div>
                  
                  <div className="p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Sponsor Target</span>
                      <span className="text-yellow-500 font-bold">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="text-xs text-gray-400 mt-1">15 dari 20 target sponsor</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}