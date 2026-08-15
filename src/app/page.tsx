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

export default function Home() {
  const [selectedProgramForCurriculum, setSelectedProgramForCurriculum] = useState<any>(null);
  const [enrollmentTrack, setEnrollmentTrack] = useState<string | null>(null);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [showFloatingWidget, setShowFloatingWidget] = useState(true);

  const handleOpenCurriculum = (program: any) => {
    setSelectedProgramForCurriculum(program);
  };

  const handleCloseCurriculum = () => {
    setSelectedProgramForCurriculum(null);
  };

  const handleOpenEnrollment = (trackName: string) => {
    // If it's the live consultation, use the WhatsApp link
    if (trackName === 'Konsultasi Live Specialist Logaritma') {
      window.open('https://wa.me/6281211638354?text=Halo%20min,%20saya%20tertarik%20dengan%20sistem%20UBOS%20Logaritma', '_blank');
      return;
    }
    setEnrollmentTrack(trackName);
    setIsEnrollmentOpen(true);
  };

  const handleCloseEnrollment = () => {
    setIsEnrollmentOpen(false);
    setEnrollmentTrack(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      
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

      {/* Floating Live Advisor Widget (Bottom Right) */}
      {showFloatingWidget && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 animate-in slide-in-from-bottom-5 duration-300">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Konsultan HPP Logaritma.id Online</span>
            <button 
              onClick={() => setShowFloatingWidget(false)}
              className="ml-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => handleOpenEnrollment('Konsultasi Live Specialist Logaritma')}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 group border-2 border-white"
            title="Chat Konsultasi HPP via WhatsApp"
          >
            <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      )}

    </div>
  );
}
