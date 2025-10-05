import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminLayout } from './admin-dashboard/components/AdminLayout';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { AgendaSection } from './components/AgendaSection';
import { RegistrationForm } from './components/RegistrationForm';
import { Footer } from './components/Footer';
import { HeroCountdown } from './components/HeroCountdown';
import { SponsoredBySection } from './components/SponsoredBySection';
import SekolahPropertiPage from './components/SekolahPropertiPage';
import NewsList from './components/NewsList';
import NewsDetail from './components/NewsDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gradient-to-b from-black to-darkgray text-gold overflow-x-hidden">
              <Header />
              <main>
                <div className="relative">
                  <HeroSection />
                </div>
                <SponsoredBySection />
                <AboutSection />
                <AgendaSection />
                <RegistrationForm />
              </main>
              <Footer />
            </div>
          }
        />
        <Route path="/sekolah-properti" element={<SekolahPropertiPage />} />
  <Route path="/news" element={<NewsList />} />
  <Route path="/news/:slug" element={<NewsDetail />} />
        <Route path="/admin/*" element={<AdminLayout />} />
      </Routes>
    </BrowserRouter>
  );
}