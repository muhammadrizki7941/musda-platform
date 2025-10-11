import React from 'react';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';

export function AdminHeader() {
  // Fungsi logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  // Ambil data user dari localStorage (atau context jika ada)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const avatar = user.avatar || '/placeholder-avatar.jpg';
  const username = user.nama || user.username || 'Admin MUSDA';
  const email = user.email || 'admin@himperra.org';

  return (
    <header className="bg-gray-800/90 backdrop-blur-sm border-b border-yellow-500/30 px-6 py-4">
      <div className="flex flex-col items-center justify-center w-full">
        {/* Search Centered */}
        <div className="w-full flex justify-center mb-2">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari peserta, agenda, sponsor..."
              className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-500 rounded-lg h-10 w-full"
              style={{ minWidth: '260px', maxWidth: '100%' }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4 justify-center">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gray-300 hover:text-white hover:bg-gray-700/50"
          >
            <Bell className="w-5 h-5" />
            <Badge 
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-yellow-500 text-black text-xs"
            >
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 border border-yellow-500/30">
                  <AvatarImage src={avatar} alt={username} />
                  <AvatarFallback className="bg-yellow-500/20 text-yellow-500">
                    {username.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 bg-gray-800 border-gray-700" 
              align="end" 
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">{username}</p>
                  <p className="text-xs leading-none text-gray-400">
                    {email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-700">
                <a href="/admin-dashboard/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}