import React from 'react';

/**
 * SVG Logo component for SUMO app.
 * A sleek medical cross + pulse line rendered as an inline SVG.
 */
export default function Logo({ className = 'w-10 h-10' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="pulseGrad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Rounded square background */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#logoGrad)" opacity="0.9" />

      {/* Medical cross */}
      <rect x="26" y="14" width="12" height="36" rx="4" fill="white" opacity="0.9" />
      <rect x="14" y="26" width="36" height="12" rx="4" fill="white" opacity="0.9" />

      {/* Heartbeat / pulse line overlay */}
      <polyline
        points="10,36 20,36 24,28 28,44 32,20 36,40 40,32 44,36 54,36"
        stroke="url(#pulseGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter="url(#glow)"
      />
    </svg>
  );
}
