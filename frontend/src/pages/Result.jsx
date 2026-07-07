import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SeverityBadge from '../components/SeverityBadge';
import AdviceSection from '../components/AdviceSection';
import NearbyHospitals from '../components/NearbyHospitals';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { useTheme } from '../contexts/ThemeContext';

const careSettingMap = {
  'self-care': { label: 'Self-Care at Home', icon: '🏠' },
  'outpatient-clinic': { label: 'Outpatient Clinic Visit', icon: '🏥' },
  'urgent-care-same-day': { label: 'Urgent Care (Same Day)', icon: '⚡' },
  'emergency-department': { label: 'Emergency Department (Immediate)', icon: '🚨' },
};

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const result = location.state?.result;
  const city = location.state?.city;

  const bgClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const textMutedClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  // Redirect if no result data
  useEffect(() => {
    if (!result) {
      navigate('/');
    }
  }, [result, navigate]);

  if (!result) {
    return null;
  }

  const careSetting = careSettingMap[result.recommended_care_setting] || careSettingMap['outpatient-clinic'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold mb-4 ${textClass}`}>Your Guidance Results</h1>
        <p className={`${textMutedClass} text-sm`}>
          Based on your description, here's what we recommend. Remember: This is NOT a diagnosis.
        </p>
      </div>

      {/* Severity Badge */}
      <div className="flex justify-center">
        <SeverityBadge level={result.severity_level} />
      </div>

      {/* Main Content Card */}
      <div className={`${bgClass} border rounded-lg p-6 space-y-6`}>
        {/* Symptom Summary */}
        <div>
          <h2 className="text-xl font-bold text-blue-400 mb-2">📋 Symptom Summary</h2>
          <p className={`${textSecondaryClass} leading-relaxed`}>{result.symptom_summary}</p>
        </div>

        {/* Care Setting */}
        <div className={`border-t ${borderClass} pt-6`}>
          <h2 className="text-lg font-bold text-blue-400 mb-2">{careSetting.icon} Recommended Care Setting</h2>
          <p className={`text-lg ${textClass} font-semibold mb-2`}>{careSetting.label}</p>
          <p className={`${textSecondaryClass} text-sm leading-relaxed`}>{result.urgency_advice}</p>
        </div>

        {/* Recommended Specialties */}
        {result.recommended_specialties && result.recommended_specialties.length > 0 && (
          <div className={`border-t ${borderClass} pt-6`}>
            <h2 className="text-lg font-bold text-blue-400 mb-3">🏨 Recommended Departments/Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {result.recommended_specialties.map((spec) => (
                <span key={spec} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
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
      <div className={`${bgClass} border rounded-lg p-6 space-y-6`}>
        <AdviceSection
          title="Suggested Next Steps"
          content={result.suggested_next_steps}
          icon="✅"
        />

        <div className={`border-t ${borderClass} pt-6`}>
          <AdviceSection
            title="Red Flag Symptoms (Seek Immediate Help If:)"
            content={result.red_flag_symptoms_to_watch}
            icon="🚨"
          />
        </div>

        <div className={`border-t ${borderClass} pt-6`}>
          <AdviceSection
            title="Self-Care Tips"
            content={result.self_care_tips}
            icon="💡"
          />
        </div>

        {result.clarifying_questions && result.clarifying_questions.length > 0 && (
          <div className={`border-t ${borderClass} pt-6`}>
            <AdviceSection
              title="Questions to Ask Your Doctor"
              content={result.clarifying_questions}
              icon="❓"
            />
          </div>
        )}
      </div>

      {/* Hospital Recommendations: geolocation -> pincode -> explanation */}
      <NearbyHospitals city={city} recommendedDept={result.recommended_specialties?.[0]} />

      {/* Disclaimer Footer */}
      <div className={`${bgClass} border rounded-lg p-6 text-sm ${textSecondaryClass} leading-relaxed`}>
        <h3 className="font-bold text-red-400 mb-2">⚠️ Full Disclaimer</h3>
        <p className="mb-3">{result.disclaimer}</p>
        <p>
          <strong>This tool is designed for informational purposes only.</strong> It does not replace professional medical advice, 
          diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have about 
          a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read 
          in this application.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
          Start Over
        </button>
        <button
          onClick={() => navigate('/history')}
          className={`${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'} font-bold py-3 px-8 rounded-lg transition-colors`}
        >
          View History
        </button>
        <button
          onClick={() => window.print()}
          className={`${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'} font-bold py-3 px-8 rounded-lg transition-colors`}
        >
          Print Results
        </button>
      </div>
    </div>
  );
}
