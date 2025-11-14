import React, { useEffect } from 'react';
import { useCertificationStore } from '../../store/certificationStore';

export const CertificationSidebar: React.FC = () => {
  const {
    certifications,
    fetchCertifications,
    selectCertification,
    selectedCertId,
    getTheme,
  } = useCertificationStore();

  useEffect(() => {
    if (certifications.length === 0) {
      fetchCertifications();
    }
  }, [certifications.length, fetchCertifications]);

  const handleSelect = (certId: string) => {
    selectCertification(certId);
  };

  return (
    <div className="space-y-2">
      {/* Highlighted CTA Buttons */}
      <div className="space-y-2 mb-4 px-3">
        {/* LinkedIn Button */}
        <a
          href="https://www.linkedin.com/in/fabriciocosta85/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-4 py-3 border-2 border-[#00FFFF] bg-transparent text-[#00FFFF] text-center font-bold uppercase transition-all duration-200 hover:bg-[#00FFFF] hover:text-black hover:scale-105 rounded-lg"
          style={{ fontFamily: 'Press Start 2P, cursive', fontSize: '10px', letterSpacing: '0.05em' }}
        >
          LINKEDIN
        </a>

        {/* Ko-fi Button */}
        <a
          href="https://ko-fi.com/fabriciocosta"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-4 py-3 border-2 border-[#FF9900] bg-transparent text-[#FF9900] text-center font-bold uppercase transition-all duration-200 hover:bg-[#FF9900] hover:text-black hover:scale-105 rounded-lg"
          style={{ fontFamily: 'Press Start 2P, cursive', fontSize: '10px', letterSpacing: '0.05em' }}
        >
          ☕ SUPPORT
        </a>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-3">
        Selecione
      </h3>

      {certifications.map((cert) => {
        const isSelected = selectedCertId === cert.id;
        const theme = isSelected ? getTheme() : null;
        const selectedStyles = theme
          ? {
              background: `linear-gradient(135deg, ${theme.primary}26 0%, ${theme.secondary}26 100%)`,
              borderColor: theme.primary,
              boxShadow: `0 8px 20px ${theme.primary}33`,
            } as React.CSSProperties
          : undefined;

        return (
          <button
            key={cert.id}
            onClick={() => handleSelect(cert.id)}
            className={`
              w-full text-left px-4 py-3 rounded-lg transition-all duration-200
              border relative overflow-hidden
              ${isSelected
                ? 'bg-white/60 dark:bg-slate-800/80'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
            `}
            style={selectedStyles}
          >
            {/* Left accent when selected */}
            {isSelected && theme && (
              <span
                aria-hidden
                style={{ background: theme.primary }}
                className="absolute left-0 top-0 h-full w-1 rounded-l-lg"
              />
            )}

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-semibold text-sm text-gray-900 dark:text-white mb-0.5">
                  {cert.short_name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {cert.name.includes('Solutions Architect') ? 'Solutions Architect' :
                   cert.name.includes('Cloud Practitioner') ? 'Cloud Practitioner' :
                   cert.name.includes('AI Practitioner') ? 'AI Practitioner' :
                   'AWS Certified'}
                </div>
              </div>

              {isSelected && (
                <div className="ml-2" style={{ color: theme?.primary }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        );
      })}

      {/* Empty State */}
      {certifications.length === 0 && (
        <div className="text-center py-4 text-gray-400 dark:text-gray-600 text-xs">
          Carregando...
        </div>
      )}
    </div>
  );
};
