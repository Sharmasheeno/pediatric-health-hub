import React from 'react';

export const ModuleComingSoon = ({ title, icon }) => (
  <div className="flex flex-col items-center justify-center min-h-[500px] bg-[--surface] rounded shadow-sm border border-slate-50 animate-fade-in mx-auto w-full">
    <div className="w-20 h-20 bg-[#f8f5ff] text-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
      <span className="text-4xl">{icon || '🚀'}</span>
    </div>
    <h2 className="text-2xl font-black text-[--text-primary] tracking-tight mb-3">{title}</h2>
    <p className="text-[--text-muted] font-medium max-w-sm text-center tracking-wide leading-relaxed">
        This module operates flawlessly in the Node.js backend API, but its specific React visualizations are scheduled for the next deployment phase.
    </p>
  </div>
);

export const HealthEducationPlaceholder = () => <ModuleComingSoon title="Health Education Library" icon="📚" />;
export const EmergencyGuidancePlaceholder = () => <ModuleComingSoon title="Emergency Triage Protocols" icon="🚨" />;
export const PatientListPlaceholder = () => <ModuleComingSoon title="Assigned Patients Matrix" icon="👥" />;
export const GenericTeleconsultPlaceholder = () => <ModuleComingSoon title="Tele-Consultation Proxy Hub" icon="💻" />;
export const MyChildrenPlaceholder = () => <ModuleComingSoon title="My Registered Children" icon="👶" />;
