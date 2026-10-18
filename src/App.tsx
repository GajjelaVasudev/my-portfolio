import React from 'react';
import { ReadingProgressBar } from './components/ReadingProgressBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SelectedWork } from './components/SelectedWork';
import { AboutPhilosophy } from './components/AboutPhilosophy';
import { NotesBanner } from './components/NotesBanner';
import { ContactFooter } from './components/ContactFooter';
import { CustomCursor } from './components/CustomCursor';
import { useScrollReveal } from './hooks/useScrollReveal';

export const App: React.FC = () => {
  // Activate scroll-triggered tasteful reveal animations
  useScrollReveal();

  return (
    <div className="portfolio-app">
      {/* Subtle Terracotta Reading Progress Bar */}
      <ReadingProgressBar />

      {/* Contextual Smooth Custom Cursor */}
      <CustomCursor />

      {/* Navigation with Active Section Feedback */}
      <Navbar />

      <main id="main-content">
        {/* [00] Landing Hero Section */}
        <Hero />

        {/* About & Philosophy Section */}
        <AboutPhilosophy />

        {/* Selected Work Section */}
        <SelectedWork />

        {/* Notes / Writing Preview Banner */}
        <NotesBanner />
      </main>

      {/* [06] Initiate Conversation & Footer */}
      <ContactFooter />
    </div>
  );
};

export default App;
