import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getHospitals } from '../api/client';
import SeverityBadge from '../components/SeverityBadge';
import AdviceSection from '../components/AdviceSection';
import HospitalList from '../components/HospitalList';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { useTheme } from '../contexts/ThemeContext';

const careSettingMap = {
  'self-care': { label: 'Self-Care at Home', icon: '🏠' },
  'outpatient-clinic': { label: 'Outpatient Clinic Visit', icon: '🏥' },
  'urgent-care-same-day': { label: 'Urgent Care (Same Day)', icon: '⚡' },
  'emergency-department': { label: 'Emergency Department (Immediate)', icon: '🚨' },
};

import AnimatedPage from "../components/AnimatedPage";

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.result;
  const city = location.state?.city;
  const nearbyClinics = location.state?.nearbyClinics || [];

  const bgClass = 'bg-th-card border-th-border';
  const textClass = 'text-th-text';
  const textSecondaryClass = 'text-th-text-secondary';
  const textMutedClass = 'text-th-text-muted';
  const borderClass = 'border-th-border';

  // Redirect if no result data
  useEffect(() => {
    if (!result) {
      navigate('/');
    }
  }, [result, navigate]);

  if (!result) {
    return null;
  }

  const careSetting =
    careSettingMap[result.recommended_care_setting] || careSettingMap['outpatient-clinic'];

  return (
    <AnimatedPage className="space-y-10 py-6">
      {/* Header */}
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-gradient-to-r from-blue-600 to-th-primary bg-clip-text text-transparent">AI Triage Results</h1>
        <p className={`${textMutedClass} text-sm md:text-base`}>
          Based on your description, here's preliminary guidance. <strong className="text-th-error">This is NOT a medical diagnosis.</strong>
        </p>
      </div>

      {/* Severity Badge */}
      <div className="flex justify-center mb-8 transform hover:scale-105 transition-transform">
        <SeverityBadge level={result.severity_level} />
      </div>

      {/* Main Content Card */}
      <div className="glass-thick rounded-[32px] p-8 space-y-8">
        {/* Symptom Summary */}
        <div>
          <h2 className="font-display text-2xl font-bold text-th-primary mb-3 flex items-center gap-2">
            <span className="text-2xl">📋</span> Symptom Summary
          </h2>
          <p className={`${textSecondaryClass} leading-relaxed text-lg`}>{result.symptom_summary}</p>
        </div>

        {/* Care Setting */}
        <div className={`border-t ${borderClass} pt-6`}>
          <h2 className="font-display text-2xl font-bold text-th-primary mb-3 flex items-center gap-2">
            <span className="text-2xl">{careSetting.icon}</span> Recommended Care Setting
          </h2>
          <p className={`text-xl ${textClass} font-semibold mb-2`}>{careSetting.label}</p>
          <p className={`${textSecondaryClass} text-base leading-relaxed bg-th-info-bg/50 p-4 rounded-xl border border-th-info-border/30`}>{result.urgency_advice}</p>
        </div>

        {/* Recommended Specialties */}
        {result.recommended_specialties && result.recommended_specialties.length > 0 && (
          <div className={`border-t ${borderClass} pt-6`}>
            <h2 className="font-display text-2xl font-bold text-th-primary mb-4 flex items-center gap-2">
              <span className="text-2xl">🏨</span> Relevant Specialists
            </h2>
            <div className="flex flex-wrap gap-3">
              {result.recommended_specialties.map((spec) => (
                <span
                  key={spec}
                  className="bg-gradient-to-r from-blue-600 to-th-primary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Additional Information Sections */}
      <div className="glass-thick rounded-[32px] p-8 space-y-8">
        {result.possible_conditions_to_discuss && result.possible_conditions_to_discuss.length > 0 && (
          <AdviceSection
            title="Conditions to Discuss with Doctor"
            content={result.possible_conditions_to_discuss}
            icon="🩺"
          />
        )}

        <div className={`border-t ${borderClass} pt-8`}>
          <AdviceSection
            title="Suggested Next Steps"
            content={result.suggested_next_steps}
            icon="✅"
          />
        </div>

        <div className={`border-t ${borderClass} pt-8`}>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-6 rounded-2xl">
            <AdviceSection
              title="Red Flag Symptoms (Seek Immediate Help If:)"
              content={result.red_flag_symptoms_to_watch}
              icon="🚨"
            />
          </div>
        </div>

        {result.what_to_tell_your_doctor && result.what_to_tell_your_doctor.length > 0 && (
          <div className={`border-t ${borderClass} pt-8`}>
            <AdviceSection
              title="What to Tell Your Doctor"
              content={result.what_to_tell_your_doctor}
              icon="🗣️"
            />
          </div>
        )}

        <div className={`border-t ${borderClass} pt-6`}>
          <AdviceSection title="Self-Care Tips" content={result.self_care_tips} icon="💡" />
        </div>

        {result.lifestyle_recommendations && result.lifestyle_recommendations.length > 0 && (
          <div className={`border-t ${borderClass} pt-6`}>
            <AdviceSection
              title="Lifestyle Recommendations"
              content={result.lifestyle_recommendations}
              icon="🌱"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Summary & Advice */}
        <div className="space-y-8">
          <div className="glass-thick rounded-[32px] p-8">
            <h2 className="text-2xl font-display font-bold mb-4 text-th-primary flex items-center gap-2">
              <span className="text-3xl">📋</span> Summary
            </h2>
            <p className={`text-lg leading-relaxed ${textClass} font-medium`}>{result.symptom_summary}</p>
          </div>

          <div className="glass-thick rounded-[32px] p-8">
            <h2 className="text-2xl font-display font-bold mb-4 text-th-primary flex items-center gap-2">
              <span className="text-3xl">⚕️</span> Action Plan
            </h2>
            <AdviceSection content={result.urgency_advice} type="advice" />
          </div>
        </div>

        {/* Right Column: Key Details */}
        <div className="space-y-8">
          <div className="glass-thick rounded-[32px] p-8">
            <h2 className="text-2xl font-display font-bold mb-6 text-th-primary">Key Recommendations</h2>
            
            <div className="space-y-6">
              <div className="bg-th-card/50 border border-th-border/10 rounded-2xl p-5">
                <h3 className={`text-sm font-semibold tracking-widest ${textMutedClass} uppercase mb-3 flex items-center gap-2`}>
                  <span className="material-symbols-outlined text-lg">home_health</span> 
                  Care Setting
                </h3>
                <div className="flex items-center gap-4 bg-white/40 dark:bg-black/20 p-4 rounded-xl">
                  <span className="text-4xl bg-white dark:bg-black/40 p-3 rounded-2xl shadow-sm">{careSetting.icon}</span>
                  <span className="font-display font-bold text-xl text-th-text">{careSetting.label}</span>
                </div>
              </div>

              {result.recommended_specialist && (
                <div className="bg-th-card/50 border border-th-border/10 rounded-2xl p-5">
                  <h3 className={`text-sm font-semibold tracking-widest ${textMutedClass} uppercase mb-3 flex items-center gap-2`}>
                    <span className="material-symbols-outlined text-lg">medical_services</span> 
                    Specialist
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gradient-to-r from-blue-600 to-th-primary text-white px-5 py-2 rounded-full font-semibold shadow-md capitalize">
                      {result.recommended_specialist}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="glass-thin rounded-[24px] p-6 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-black/40 border border-th-border/30 hover:border-th-primary text-th-primary rounded-xl font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">print</span>
              Print Results
            </button>
            <button
              onClick={() => navigate('/history')}
              className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-black/40 border border-th-border/30 hover:border-th-primary text-th-primary rounded-xl font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">history</span>
              Save & View History
            </button>
          </div>
        </div>
      </div>

      {/* Hospital Recommendations */}
      {(nearbyClinics.length > 0 || city) && (
        <div className="glass-thick rounded-[32px] p-8 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-th-primary flex items-center gap-2">
              <span className="text-3xl">🏥</span> 
              Nearby Clinics & Hospitals {city ? `in ${city}` : ''}
            </h2>
            {result.recommended_specialist && (
              <span className="bg-th-info-bg/50 border border-th-info-border/30 text-th-info-text px-4 py-1.5 rounded-full text-sm font-semibold capitalize shadow-sm">
                Filtered by: {result.recommended_specialist}
              </span>
            )}
          </div>
          {nearbyClinics.length === 0 && (
            <div className="bg-th-card/30 border border-th-border/10 rounded-2xl p-6 mb-4 text-center">
              <p className="mb-2 text-lg font-medium text-th-text">No specialized clinics were found within a 5km radius.</p>
              <p className={`text-sm ${textMutedClass}`}>
                Try selecting a different city or check back later. In an emergency, call emergency services immediately.
              </p>
            </div>
          )}
          <HospitalList
            hospitals={nearbyClinics}
            loading={false}
            recommendedDept={result.recommended_specialist}
          />
        </div>
      )}

      {/* Disclaimer Footer */}
      <div className="glass-thin rounded-[32px] p-8 text-sm text-th-text-secondary leading-relaxed mt-10">
        <div className="flex items-center gap-3 mb-3 text-red-500">
          <span className="material-symbols-outlined text-2xl">warning</span>
          <h3 className="font-bold text-lg m-0">Full Disclaimer</h3>
        </div>
        <p className="mb-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-red-700 dark:text-red-400 font-medium">
          {result.disclaimer}
        </p>
        <p className="opacity-80">
          <strong className="text-th-text">This tool is designed for informational purposes only.</strong> It does not
          replace professional medical advice, diagnosis, or treatment. Always seek the advice of a
          qualified healthcare provider with any questions you may have about a medical condition.
          Never disregard professional medical advice or delay in seeking it because of something
          you have read in this application.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center pt-6 pb-12">
        <button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-blue-600 to-th-primary hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 px-10 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer border-none text-lg"
        >
          Start New Check
        </button>
      </div>
    </AnimatedPage>
  );
}
