import React from 'react';
import SymptomForm from '../components/SymptomForm';
import DisclaimerBanner from '../components/DisclaimerBanner';

import AnimatedPage from "../components/AnimatedPage";
import { motion } from 'framer-motion';

export default function Home() {
  const bgClass = 'bg-th-card border-th-border';
  const textClass = 'text-th-text';
  const textSecondaryClass = 'text-th-text-secondary';
  const textMutedClass = 'text-th-text-muted';

  return (
    <AnimatedPage className="relative">
      {/* Floating Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 left-10 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -40, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-40 right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px]"
        />
      </div>

      <div className="space-y-12 py-8 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 text-gradient-primary tracking-tight pb-2 drop-shadow-sm">
            SUMO
          </h1>
          <p className="text-2xl md:text-3xl mb-4 text-th-text font-display font-medium">
            Symptom Urgency & Medical Outreach
          </p>
          <p className={`text-lg mb-4 ${textSecondaryClass}`}>
            Intelligent symptom-based healthcare guidance & hospital recommendations tailored for you.
          </p>
        </motion.div>

      {/* How It Works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="text-4xl mb-4 bg-th-info-bg w-16 h-16 mx-auto rounded-full flex items-center justify-center">✍️</div>
          <h3 className={`font-display text-xl font-bold mb-2 ${textClass}`}>Describe</h3>
          <p className={`text-sm ${textSecondaryClass} leading-relaxed`}>Tell us what you're experiencing in your own words.</p>
        </div>
        <div className="glass-panel rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="text-4xl mb-4 bg-th-info-bg w-16 h-16 mx-auto rounded-full flex items-center justify-center">🧠</div>
          <h3 className={`font-display text-xl font-bold mb-2 ${textClass}`}>Analyze</h3>
          <p className={`text-sm ${textSecondaryClass} leading-relaxed`}>
            Our AI assesses your symptoms and determines the urgency level.
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="text-4xl mb-4 bg-th-info-bg w-16 h-16 mx-auto rounded-full flex items-center justify-center">🏥</div>
          <h3 className={`font-display text-xl font-bold mb-2 ${textClass}`}>Recommend</h3>
          <p className={`text-sm ${textSecondaryClass} leading-relaxed`}>Get tailored hospital suggestions and immediate next steps.</p>
        </div>
      </div>

      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Form */}
      <SymptomForm />

      {/* FAQ Section */}
      <div className={`mt-12 ${bgClass} border rounded-lg p-6 shadow-sm`}>
        <h2 className={`text-2xl font-bold mb-4 ${textClass}`}>Important Information</h2>
        <div className={`space-y-3 text-sm ${textSecondaryClass}`}>
          <div>
            <p className={`font-semibold mb-1 ${textClass}`}>🔒 Privacy</p>
            <p>Your data is processed locally and not stored on our servers.</p>
          </div>
          <div>
            <p className={`font-semibold mb-1 ${textClass}`}>⚕️ Not a Diagnosis</p>
            <p>
              This tool provides general guidance only. Always consult a qualified doctor for
              diagnosis and treatment.
            </p>
          </div>
          <div>
            <p className={`font-semibold mb-1 ${textClass}`}>🚨 In an Emergency</p>
            <p>
              If you experience severe symptoms, call emergency services or visit the nearest
              emergency department immediately.
            </p>
          </div>
      </div>
    </div>
    </div>
    </AnimatedPage>
  );
}
