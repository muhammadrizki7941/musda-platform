import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Users, Calendar, Building2, TrendingUp, Clock, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export function DashboardOverview() {
  const stats = [
    {
      title: 'Total Peserta',
      value: '347',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      title: 'Agenda Terjadwal',
      value: '8',
      change: '100%',
      icon: Calendar,
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      title: 'Sponsor Aktif',
      value: '15',
      change: '+25%',
      icon: Building2,
      color: 'bg-yellow-500',
      trend: 'up'
    },
    {
      title: 'Total Revenue',
      value: 'Rp 850M',
      change: '+18%',
      icon: DollarSign,
      color: 'bg-purple-500',
      trend: 'up'
    }
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'mendaftar sebagai peserta', time: '2 menit lalu' },
    { id: 2, user: 'Admin', action: 'menambahkan agenda baru', time: '5 menit lalu' },
    { id: 3, user: 'Jane Smith', action: 'mengupdate profil', time: '10 menit lalu' },
    { id: 4, user: 'Sponsor ABC', action: 'mengkonfirmasi sponsorship', time: '15 menit lalu' },
    { id: 5, user: 'Admin', action: 'menyetujui pendaftaran peserta', time: '20 menit lalu' }
  ];

  const upcomingEvents = [
    { id: 1, title: 'Pembukaan MUSDA II', time: '09:00 - 09:30', date: 'Hari ini', status: 'ready' },
    { id: 2, title: 'Sambutan Ketua Umum', time: '09:30 - 10:00', date: 'Hari ini', status: 'ready' },
    { id: 3, title: 'Presentasi Laporan Keuangan', time: '10:00 - 11:00', date: 'Hari ini', status: 'pending' },
    { id: 4, title: 'Coffee Break', time: '11:00 - 11:30', date: 'Hari ini', status: 'ready' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white mb-2">Dashboard Admin</h1>
        <p className="text-slate-400">Selamat datang di panel admin MUSDA II HIMPERRA Lampung</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-slate-800 border border-slate-700 rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{stat.title}</p>
                    <h3 className="text-xl font-bold text-white">{stat.value}</h3>
                    <p className="text-green-400 text-xs">{stat.change} dari bulan lalu</p>
                  </div>
                  <Icon className="text-yellow-400 w-7 h-7" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity & Agenda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aktivitas Terbaru */}
        <Card className="bg-slate-800 border border-slate-700 rounded-xl">
          <CardContent className="p-4">
            <h4 className="text-lg font-semibold mb-4 text-white">Aktivitas Terbaru</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex justify-between items-center">
                  <span>{activity.user} {activity.action}</span>
                  <span className="text-slate-400">{activity.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Agenda Hari Ini */}
        <Card className="bg-slate-800 border border-slate-700 rounded-xl">
          <CardContent className="p-4">
            <h4 className="text-lg font-semibold mb-4 text-white">Agenda Hari Ini</h4>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{event.title}</p>
                    <p className="text-xs text-slate-400">{event.time}</p>
                  </div>
                  <span className={
                    event.status === 'ready'
                      ? 'text-green-400 text-xs font-semibold'
                      : 'text-yellow-400 text-xs font-semibold'
                  }>
                    {event.status === 'ready' ? 'Siap' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}