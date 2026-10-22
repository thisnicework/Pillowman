import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import GetTicket from './components/GetTicket';
import AboutPillowman from './components/AboutPillowman';
import Team from './components/Team';
import AboutTheatre from './components/AboutTheatre';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import LookupModal from './components/LookupModal';
import PosterModal from './components/PosterModal';
import AdminPage from './components/AdminPage';
import Toast from './components/Toast';
import { getBookingStats, isBookingOpen } from './services/bookingService.js';
import { initVisitorPresence } from './services/trafficService.js';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
  });

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [lookupModalOpen, setLookupModalOpen] = useState(false);
  const [posterModalOpen, setPosterModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Real-time booking statistics (Capacity & Remaining Seats)
  const [bookingStats, setBookingStats] = useState({
    totalCapacity: 100,
    confirmedCount: 0,
    remainingSeats: 100,
    isSoldOut: false,
  });

  const refreshStats = async () => {
    try {
      const stats = await getBookingStats();
      setBookingStats(stats);
    } catch (e) {
      console.warn('Failed to load stats:', e);
    }
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 4000); // Poll every 4s for live real-time sync
    window.addEventListener('pillowman-capacity-updated', refreshStats);

    // Initialize Realtime Visitor Presence & Session Traffic Logging
    const cleanupPresence = initVisitorPresence();

    return () => {
      clearInterval(interval);
      window.removeEventListener('pillowman-capacity-updated', refreshStats);
      if (cleanupPresence) cleanupPresence();
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(
        window.location.pathname.startsWith('/admin') || window.location.hash === '#admin'
      );
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateToHome = () => {
    window.history.pushState(null, '', '/');
    setIsAdminRoute(false);
  };

  const navigateToAdmin = () => {
    window.history.pushState(null, '', '/admin');
    setIsAdminRoute(true);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3200);
  };

  const handleOpenBooking = () => {
    if (bookingStats?.isSoldOut) {
      showToast('준비된 전 좌석이 모두 매진되어 예매가 마감되었습니다.');
      const ticketSection = document.getElementById('ticket');
      if (ticketSection) {
        ticketSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (!isBookingOpen()) {
      showToast('티켓 예매는 오늘(10/22) 20:00에 오픈됩니다.');
      const ticketSection = document.getElementById('ticket');
      if (ticketSection) {
        ticketSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    setBookingModalOpen(true);
  };

  // If URL is /admin, render Admin Console
  if (isAdminRoute) {
    return <AdminPage onGoHome={navigateToHome} />;
  }

  // Normal Public Site
  return (
    <div className="pillowman-app">
      <Header 
        onOpenBooking={handleOpenBooking} 
        bookingStats={bookingStats}
      />

      <main>
        <Hero onNotify={showToast} onOpenPoster={() => setPosterModalOpen(true)} />
        
        <GetTicket 
          onOpenBooking={handleOpenBooking}
          onOpenLookup={() => setLookupModalOpen(true)}
          onOpenPoster={() => setPosterModalOpen(true)}
          bookingStats={bookingStats}
        />
        
        <AboutPillowman />
        
        <Team />
        
        <AboutTheatre onNotify={showToast} />
      </main>

      <Footer 
        onOpenBooking={handleOpenBooking} 
        onOpenAdmin={navigateToAdmin}
        bookingStats={bookingStats}
      />

      {/* Modals */}
      <BookingModal 
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onNotify={showToast}
        bookingStats={bookingStats}
        onReservationSuccess={refreshStats}
      />

      <LookupModal 
        isOpen={lookupModalOpen}
        onClose={() => setLookupModalOpen(false)}
        onNotify={showToast}
      />

      <PosterModal 
        isOpen={posterModalOpen}
        onClose={() => setPosterModalOpen(false)}
      />

      {/* Global Toast */}
      <Toast message={toastMessage} visible={toastVisible} />

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
