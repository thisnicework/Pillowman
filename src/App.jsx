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

  // If URL is /admin, render Admin Console
  if (isAdminRoute) {
    return <AdminPage onGoHome={navigateToHome} />;
  }

  // Normal Public Site
  return (
    <div className="pillowman-app">
      <Header onOpenBooking={() => setBookingModalOpen(true)} />

      <main>
        <Hero onNotify={showToast} onOpenPoster={() => setPosterModalOpen(true)} />
        
        <GetTicket 
          onOpenBooking={() => setBookingModalOpen(true)}
          onOpenLookup={() => setLookupModalOpen(true)}
          onOpenPoster={() => setPosterModalOpen(true)}
        />
        
        <AboutPillowman />
        
        <Team />
        
        <AboutTheatre onNotify={showToast} />
      </main>

      <Footer 
        onOpenBooking={() => setBookingModalOpen(true)} 
        onOpenAdmin={navigateToAdmin}
      />

      {/* Modals */}
      <BookingModal 
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onNotify={showToast}
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
    </div>
  );
}
