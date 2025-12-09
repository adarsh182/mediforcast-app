import React from 'react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-red-900 border-l-4 border-red-600 p-4 mb-6 rounded-lg">
      <p className="text-sm text-red-100 font-semibold mb-2">⚠️ Medical Disclaimer</p>
      <p className="text-sm text-red-100">
        This is NOT a medical diagnosis or treatment. It is only general guidance. 
        Always consult a qualified doctor. In an emergency, go to the nearest hospital 
        or call local emergency services.
      </p>
    </div>
  );
}
