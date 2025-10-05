import React from 'react';
import { Hexagon, Calendar, Users, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export function FrontendView() {
  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"></div>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-500/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gray-900/90 backdrop-blur-sm border-b border-yellow-500/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Hexagon className="w-10 h-10 text-yellow-500 fill-yellow-500/20" />
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-lg animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">HIMPERRA</h1>
                <p className="text-yellow-500 text-sm">PROVINSI LAMPUNG</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-300 hover:text-yellow-500 transition-colors">Beranda</a>
              <a href="#" className="text-gray-300 hover:text-yellow-500 transition-colors">Tentang</a>
              <a href="#" className="text-gray-300 hover:text-yellow-500 transition-colors">Agenda</a>
              <a href="#" className="text-gray-300 hover:text-yellow-500 transition-colors">Daftar</a>
              <a href="#" className="text-gray-300 hover:text-yellow-500 transition-colors">Sponsor</a>
              <a href="#" className="text-gray-300 hover:text-yellow-500 transition-colors">Kontak</a>
            </nav>
            <Button className="bg-yellow-500 text-black hover:bg-yellow-600 font-medium">
              Frontend View
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-32">
        <div className="container mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30 mb-8">
            <span className="text-yellow-500 font-medium">HIMPERRA PROVINSI LAMPUNG</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            SELAMAT DATANG
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-yellow-500 mb-12">
            PESERTA
          </h2>

          {/* Hexagonal Badge */}
          <div className="flex justify-center mb-16">
            <div className="relative">
              <div 
                className="w-64 h-64 bg-gradient-to-br from-yellow-400 to-yellow-600 flex flex-col items-center justify-center text-black"
                style={{
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
                }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-black/20 rounded-full flex items-center justify-center">
                    <Hexagon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">MUSDA II</h3>
                  <p className="text-sm font-medium">HIMPERRA</p>
                  <p className="text-sm font-medium">LAMPUNG</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-yellow-500/20 blur-2xl animate-pulse"></div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-gray-800/50 border-yellow-500/30 hover:bg-gray-800/70 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div 
                  className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 flex items-center justify-center"
                  style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}
                >
                  <Calendar className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-3xl font-bold text-yellow-500 mb-2">2024</h3>
                <p className="text-gray-300">Tahun</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-yellow-500/30 hover:bg-gray-800/70 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div 
                  className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 flex items-center justify-center"
                  style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}
                >
                  <Users className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-3xl font-bold text-yellow-500 mb-2">500+</h3>
                <p className="text-gray-300">Peserta</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-yellow-500/30 hover:bg-gray-800/70 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div 
                  className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 flex items-center justify-center"
                  style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}
                >
                  <MapPin className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-3xl font-bold text-yellow-500 mb-2">Lampung</h3>
                <p className="text-gray-300">Lokasi</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              className="bg-yellow-500 text-black hover:bg-yellow-600 font-medium px-8 py-3 text-lg"
              style={{ clipPath: 'polygon(15px 0%, 100% 0%, calc(100% - 15px) 100%, 0% 100%)' }}
            >
              Daftar Sekarang
            </Button>
            <Button 
              variant="outline" 
              className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 font-medium px-8 py-3 text-lg"
            >
              Selanjutnya Lebih Lanjut
            </Button>
          </div>

          {/* Bottom Indicator */}
          <div className="mt-16 flex justify-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center animate-bounce">
              <div className="w-2 h-8 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}