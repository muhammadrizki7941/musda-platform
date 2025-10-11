import React, { useState } from 'react';
import { ThemeProvider } from './ThemeProvider';
import ThemeToggle from './ThemeToggle';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { DashboardOverview } from './DashboardOverview';
import { ParticipantManagement } from './ParticipantManagement';
import { SponsorManagement } from './SponsorManagement';
import GalleryManagement from './GalleryManagement';
import { ContentManagement } from './ContentManagement';
import { SimpleContentManagement } from './SimpleContentManagement';
import AdminManagement from './AdminManagement';
import { AdminProfile } from './AdminProfile';
import { SystemSettings } from './SystemSettings';
import { ReportsAnalytics } from './ReportsAnalytics';
import { AdminQrScanner } from './AdminQrScanner';
import { AdminLogin } from './AdminLogin';
import { SPHManagement } from './SPHManagement';
import { SPHSettings } from './SPHSettings';
import { SPHParticipantsManagement } from './SPHParticipantsManagement';
import SPHPaymentSettings from './SPHPaymentSettings';
import SPHContentManagement from './SPHContentManagement';
import { DatabaseSetup } from './DatabaseSetup';
import { AgendaManagement } from './AgendaManagementOld';
import PosterManagement from './PosterManagement';
import AdminNewsManagement from './AdminNewsManagement';
import AdminNewsEditor from './AdminNewsEditor';

export function AdminLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Proteksi login admin
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    return <AdminLogin />;
  }

  // Provide global helpers for child buttons to switch to editor with data
  (window as any).editArticle = (article: any) => {
    setEditing(article);
    setActiveTab('news-editor');
  };
  (window as any).setActiveTab = (tab: string) => setActiveTab(tab);

  const [editing, setEditing] = useState<any>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'participants':
        return <ParticipantManagement />;
      case 'agenda':
        return <AgendaManagement />;
      case 'sponsors':
        return <SponsorManagement />;
      case 'gallery':
        return <GalleryManagement />;
      case 'poster':
        return <PosterManagement />;
      case 'scanqr':
        return <AdminQrScanner />;
      case 'content':
        return <SimpleContentManagement />;
      case 'sph':
        return <SPHManagement />;
      case 'sph-settings':
        return <SPHSettings />;
      case 'sph-participants':
        return <SPHParticipantsManagement />;
      case 'sph-payment-settings':
        return <SPHPaymentSettings />;
      case 'sph-content':
        return <SimpleContentManagement />;
      case 'database-setup':
        return <DatabaseSetup />;
      case 'admins':
        return <AdminManagement />;
      case 'profile':
        return <AdminProfile />;
      case 'settings':
        return <SystemSettings />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'news':
        return <AdminNewsManagement />;
      case 'news-editor':
        return <AdminNewsEditor editing={editing} onBack={() => { setActiveTab('news'); setEditing(null); }} onSaved={() => { setActiveTab('news'); setEditing(null); }} />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-[#232A36]">
        {/* Sidebar slideable */}
        <aside
          className={`h-screen fixed top-0 left-0 z-40 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}
        >
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </aside>
        {/* Toggle button */}
        <button
          className="fixed top-4 left-4 z-50 bg-yellow-500 text-black rounded-full shadow-lg p-2 transition hover:bg-yellow-400"
          style={{ left: sidebarOpen ? '272px' : '16px' }}
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}
        >
          {sidebarOpen ? <span>&#10094;</span> : <span>&#9776;</span>}
        </button>
        {/* Main Content & Header, margin-left agar tidak menimpa sidebar */}
        <div className="flex-1 flex flex-col" style={{ marginLeft: sidebarOpen ? '16rem' : '0' }}>
          <AdminHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#232A36]">
            <div className="container mx-auto px-6 py-8">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}