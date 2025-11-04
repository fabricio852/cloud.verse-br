import React from 'react';

interface SocialProofProps {
  approvals?: string;
  countries?: string;
  recommend?: string;
  quotes?: string[];
  linkedinUrl?: string;
}

export const SocialProof: React.FC<SocialProofProps> = ({
  approvals = '5.000+',
  countries = '+12',
  recommend = '98%',
  quotes = [],
  linkedinUrl = ''
}) => {
  return (
    <section className="px-4 pb-10 -mt-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_18px_70px_-45px_rgba(15,23,42,0.95)]">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">{approvals}</div>
              <div className="text-[11px] md:text-xs tracking-wide text-gray-400 mt-1">Aprovações</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">{countries}</div>
              <div className="text-[11px] md:text-xs tracking-wide text-gray-400 mt-1">Países</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">{recommend}</div>
              <div className="text-[11px] md:text-xs tracking-wide text-gray-400 mt-1">Recomendam</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
