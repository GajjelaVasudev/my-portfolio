import React from 'react';
import { ReadingProgressBar } from './components/ReadingProgressBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutPhilosophy } from './components/AboutPhilosophy';
import { SelectedWork } from './components/SelectedWork';
import { Experience } from './components/Experience';
import { CoreTechnicalStack } from './components/CoreTechnicalStack';
import { VerifiedCredentials } from './components/VerifiedCredentials';
import { NotesBanner } from './components/NotesBanner';
import { ContactFooter } from './components/ContactFooter';
import { CustomCursor } from './components/CustomCursor';
import { FloatingAssistant } from './components/FloatingAssistant';
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
        {/* 1. Landing Hero Section */}
        <Hero />

        {/* 2. About Me Section */}
        <AboutPhilosophy />

        {/* 3. Selected Work Section */}
        <SelectedWork />

        {/* 4. Experience Section (with Hackathons / Experience tabs) */}
        <Experience />

        {/* 5. Core Technical Stack Section */}
        <CoreTechnicalStack />

        {/* 6. Verified Credentials Section */}
        <VerifiedCredentials />

        {/* 7. Notes & Ideas Banner */}
        <NotesBanner />
      </main>

      {/* 8. Contact Footer */}
      <ContactFooter />

      {/* RAG-Grounded Floating Personal Assistant */}
      <FloatingAssistant />
    </div>
  );
};

export default App;
