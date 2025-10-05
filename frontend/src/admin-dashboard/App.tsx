import React, { useState } from 'react';
import { AdminLayout } from './components/AdminLayout';
import { FrontendView } from './components/FrontendView';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';

export default function App() {
  const [isAdminMode, setIsAdminMode] = useState(true);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mode Toggle */}
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-2 bg-gray-800/90 backdrop-blur-sm border border-yellow-500/30 rounded-lg px-3 py-2">
        <Label htmlFor="mode-toggle" className="text-white text-sm">
          {isAdminMode ? 'Admin Panel' : 'Frontend View'}
        </Label>
        <Switch
          id="mode-toggle"
          checked={isAdminMode}
          onCheckedChange={setIsAdminMode}
          className="data-[state=checked]:bg-yellow-500"
        />
      </div>

      {/* Main Content */}
      {isAdminMode ? <AdminLayout /> : <FrontendView />}
    </div>
  );
}