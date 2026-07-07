import React from 'react';
import SymptomForm from '../components/SymptomForm';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { useTheme } from '../contexts/ThemeContext';

export default function Home() {
  const { theme } = useTheme();
  const bgClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const textMutedClass = theme === 'dark' ? 'text-gray-500' : 'text-gray-500';

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${textClass}`}>
          SUMO
        </h1>
        <p className={`text-lg mb-3 ${textSecondaryClass} font-medium`}>
          Symptom Urgency & Medical Outreach
        </p>
        <p className={`text-xl mb-2 ${textSecondaryClass}`}>
          Symptom-Based Healthcare Guidance & Hospital Recommendation
        </p>
        <p className={`text-sm ${textMutedClass}`}>
          Describe your symptoms to get preliminary guidance and hospital recommendations
        </p>
      </div>

      {/* How It Works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className={`${bgClass} border rounded-lg p-4 text-center`}>
          <div className="text-3xl mb-2">1️⃣</div>
          <h3 className={`font-semibold mb-1 ${textClass}`}>Describe</h3>
          <p className={`text-sm ${textSecondaryClass}`}>Tell us what you're experiencing</p>
        </div>
        <div className={`${bgClass} border rounded-lg p-4 text-center`}>
          <div className="text-3xl mb-2">2️⃣</div>
          <h3 className={`font-semibold mb-1 ${textClass}`}>Analyze</h3>
          <p className={`text-sm ${textSecondaryClass}`}>Our AI provides guidance & urgency level</p>
        </div>
        <div className={`${bgClass} border rounded-lg p-4 text-center`}>
          <div className="text-3xl mb-2">3️⃣</div>
          <h3 className={`font-semibold mb-1 ${textClass}`}>Recommend</h3>
          <p className={`text-sm ${textSecondaryClass}`}>Get hospital suggestions & next steps</p>
        </div>
      </div>

      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Form */}
      <SymptomForm />

      {/* FAQ Section */}
      <div className={`mt-12 ${bgClass} border rounded-lg p-6`}>
        <h2 className={`text-2xl font-bold mb-4 ${textClass}`}>Important Information</h2>
        <div className={`space-y-3 text-sm ${textSecondaryClass}`}>
          <div>
            <p className={`font-semibold mb-1 ${textClass}`}>🔒 Privacy</p>
            <p>Your symptom description is sent securely to our AI service (Google Gemini) for analysis and is not permanently stored by us. Your check history is saved only on this device.</p>
          </div>
          <div>
            <p className={`font-semibold mb-1 ${textClass}`}>⚕️ Not a Diagnosis</p>
            <p>This tool provides general guidance only. Always consult a qualified doctor for diagnosis and treatment.</p>
          </div>
          <div>
            <p className={`font-semibold mb-1 ${textClass}`}>🚨 In an Emergency</p>
            <p>If you experience severe symptoms, call emergency services or visit the nearest emergency department immediately.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
