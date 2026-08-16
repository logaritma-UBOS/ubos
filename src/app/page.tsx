'use client';

import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import BentoGrid from '@/components/landing/BentoGrid';
import ProgramCatalog from '@/components/landing/ProgramCatalog';
import CurriculumModal from '@/components/landing/CurriculumModal';
import CareerCalculator from '@/components/landing/CareerCalculator';
import StudentSuccess from '@/components/landing/StudentSuccess';
import FAQSection from '@/components/landing/FAQSection';
import EnrollmentModal from '@/components/landing/EnrollmentModal';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';
import { MessageCircle, X, Sparkles } from 'lucide-react';

import { motion } from 'framer-motion';

const FadeIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

import ChatWidget from '@/components/landing/ChatWidget';
import VisitorTracker from '@/components/VisitorTracker';

export default function Home() {
  const [selectedProgramForCurriculum, setSelectedProgramForCurriculum] = useState<any>(null);
  const [enrollmentTrack, setEnrollmentTrack] = useState<string | null>(null);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);

  const handleOpenCurriculum = (program: any) => {
    setSelectedProgramForCurriculum(program);
  };

  const handleCloseCurriculum = () => {
    setSelectedProgramForCurriculum(null);
  };

  const handleOpenEnrollment = (trackName: string) => {
    window.location.href = '/auth/daftar';
  };

  const handleCloseEnrollment = () => {
    setIsEnrollmentOpen(false);
    setEnrollmentTrack(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      <VisitorTracker />
      
      {/* Navbar */}
      <Navbar onOpenEnrollment={handleOpenEnrollment} />

      {/* Main Sections */}
      <main>
        <FadeIn delay={0.1}>
          <Hero 
            onOpenEnrollment={handleOpenEnrollment} 
            onOpenCurriculum={handleOpenCurriculum} 
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <BentoGrid 
            onOpenEnrollment={handleOpenEnrollment} 
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <ProgramCatalog 
            onOpenCurriculum={handleOpenCurriculum} 
            onOpenEnrollment={handleOpenEnrollment} 
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <CareerCalculator 
            onOpenEnrollment={handleOpenEnrollment} 
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <StudentSuccess 
            onOpenEnrollment={handleOpenEnrollment} 
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <FAQSection 
            onOpenEnrollment={handleOpenEnrollment} 
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <FinalCTA 
            onOpenEnrollment={handleOpenEnrollment} 
          />
        </FadeIn>
      </main>

      {/* Footer */}
      <Footer onOpenEnrollment={handleOpenEnrollment} />

      {/* Interactive Modals */}
      {selectedProgramForCurriculum && (
        <CurriculumModal 
          program={selectedProgramForCurriculum} 
          onClose={handleCloseCurriculum} 
          onEnroll={handleOpenEnrollment}
        />
      )}

      {isEnrollmentOpen && (
        <EnrollmentModal 
          initialTrack={enrollmentTrack} 
          onClose={handleCloseEnrollment} 
        />
      )}

      {/* AI Chatbot Widget */}
      <ChatWidget />

    </div>
  );
}
