import React from 'react';
import SymptomForm from '../components/SymptomForm';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          MediForecast
        </h1>
        <p className="text-xl text-gray-400 mb-2">
          Symptom-Based Healthcare Guidance & Hospital Recommendation
        </p>
        <p className="text-sm text-gray-500">
          Describe your symptoms to get preliminary guidance and hospital recommendations
        </p>
      </div>

      {/* How It Works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">1️⃣</div>
          <h3 className="font-semibold text-white mb-1">Describe</h3>
          <p className="text-sm text-gray-400">Tell us what you're experiencing</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">2️⃣</div>
          <h3 className="font-semibold text-white mb-1">Analyze</h3>
          <p className="text-sm text-gray-400">Our AI provides guidance & urgency level</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">3️⃣</div>
          <h3 className="font-semibold text-white mb-1">Recommend</h3>
          <p className="text-sm text-gray-400">Get hospital suggestions & next steps</p>
        </div>
      </div>

      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Form */}
      <SymptomForm />

      {/* FAQ Section */}
      <div className="mt-12 bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Important Information</h2>
        <div className="space-y-3 text-sm text-gray-400">
          <div>
            <p className="font-semibold text-white mb-1">🔒 Privacy</p>
            <p>Your data is processed locally and not stored on our servers.</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">⚕️ Not a Diagnosis</p>
            <p>This tool provides general guidance only. Always consult a qualified doctor for diagnosis and treatment.</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">🚨 In an Emergency</p>
            <p>If you experience severe symptoms, call emergency services or visit the nearest emergency department immediately.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
