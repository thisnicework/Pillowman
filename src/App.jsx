import React, { useState } from 'react';
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
import Toast from './components/Toast';

export default function App() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [lookupModalOpen, setLookupModalOpen] = useState(false);
  const [posterModalOpen, setPosterModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3200);
  };

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

      <Footer onOpenBooking={() => setBookingModalOpen(true)} />

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
