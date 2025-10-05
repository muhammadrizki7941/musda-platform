import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Building2, 
  FileText, 
  Shield, 
  Settings, 
  BarChart3,
  Hexagon,
  User,
  GraduationCap,
  CreditCard,
  Layout,
  Database,
  Images,
  ImageIcon
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'participants', label: 'Peserta', icon: Users },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'sponsors', label: 'Sponsor', icon: Building2 },
    { id: 'gallery', label: 'Gallery', icon: Images },
    { id: 'poster', label: 'Poster/Flyer', icon: ImageIcon },
    { id: 'news', label: 'Berita', icon: FileText },
    { id: 'scanqr', label: 'Scan QR', icon: Hexagon },
    { id: 'content', label: 'Konten', icon: FileText },
    { id: 'sph', label: 'SPH Management', icon: GraduationCap },
    { id: 'sph-content', label: 'SPH Konten', icon: Layout },
    { id: 'database-setup', label: 'Database Setup', icon: Database },
    { id: 'sph-settings', label: 'SPH Settings', icon: Settings },
    { id: 'sph-participants', label: 'SPH Peserta', icon: Users },
    { id: 'sph-payment-settings', label: 'SPH Payment', icon: CreditCard },
    { id: 'admins', label: 'Admin', icon: Shield },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-gray-800/90 backdrop-blur-sm border-r border-yellow-500/30 flex flex-col relative">
      {/* Logo */}
      <div className="p-6 pb-2 border-b border-yellow-500/30 mb-2">
        <div className="flex items-center space-x-3 mb-2">
          <div className="relative">
            <Hexagon className="w-8 h-8 text-yellow-500 fill-yellow-500/20" />
            <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-md"></div>
            {/* Sparkle effect */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          </div>
          <div>
            <h2 className="text-white font-semibold">HIMPERRA</h2>
            <p className="text-yellow-500 text-sm">Admin Panel</p>
          </div>
        </div>
      </div>

    {/* Navigation */}
    <div className="pointer-events-none absolute top-[92px] left-0 right-0 h-6 bg-gradient-to-b from-gray-800/90 to-transparent" />
    <div className="pointer-events-none absolute bottom-[68px] left-0 right-0 h-8 bg-gradient-to-t from-gray-800/95 to-transparent" />
    <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar scroll-smooth pr-3" style={{ scrollbarWidth: 'thin' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shadow-lg shadow-yellow-500/10'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
              style={{
                clipPath: isActive ? 'polygon(15px 0%, 100% 0%, calc(100% - 15px) 100%, 0% 100%)' : undefined
              }}
            >
              <div 
                className={`p-2 rounded-md ${isActive ? 'bg-yellow-500/10' : ''}`}
                style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              )}
            </button>
          );
        })}
  </nav>

      {/* Footer */}
      <div className="p-4 pt-6 border-t border-yellow-500/30 mt-auto">
        <div className="text-center text-gray-400 text-sm">
          <p>MUSDA II</p>
          <p className="text-yellow-500">HIMPERRA Lampung</p>
        </div>
      </div>
    </div>
  );
}