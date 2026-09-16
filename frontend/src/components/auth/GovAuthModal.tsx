import React, { useState } from 'react';
import { useAuth, PRESET_USERS, type UserRole } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, KeyRound, Check, X, Lock } from 'lucide-react';

export const GovAuthModal: React.FC = () => {
  const { role, user, login, isAuthModalOpen, setIsAuthModalOpen } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(role);

  if (!isAuthModalOpen) return null;

  const handleApplyRole = (targetRole: UserRole) => {
    login(targetRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#072540]/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-xl shadow-2xl border-2 border-[#B8D9F2] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar - Government Institutional Deep Navy */}
        <div className="bg-[#0A365C] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#1BA0E2]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1BA0E2]/20 border border-[#1BA0E2] flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-[#1BA0E2]" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#90C3E8]">
                Jan Parichay / NIC National SSO Gateway
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Role-Based Access Control (RBAC) &amp; Identity Switcher
              </h2>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 bg-[#F0F6FB] space-y-5">
          {/* Active Session Notice */}
          <div className="bg-[#FFFFFF] border-2 border-[#B8D9F2] rounded-lg p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#4B647D]">Current Identity:</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold ${
                role === 'ADMIN'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : role === 'NODAL_OFFICER'
                  ? 'bg-blue-100 text-[#0A365C] border border-[#1BA0E2]'
                  : 'bg-slate-100 text-slate-700 border border-slate-300'
              }`}>
                {role === 'ADMIN' && <Lock className="w-3 h-3 text-red-600" />}
                {role === 'NODAL_OFFICER' && <ShieldCheck className="w-3 h-3 text-[#1BA0E2]" />}
                {role === 'PUBLIC' && <UserCheck className="w-3 h-3 text-slate-600" />}
                {user.name} ({user.avatarBadge})
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#4B647D] hidden sm:inline">
              Session ID: <span className="font-mono text-[#0A365C] font-bold">GOV-IN-{user.id.toUpperCase()}</span>
            </span>
          </div>

          {/* Role Cards Grid */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0A365C]">
              Select Authorized Portal Persona:
            </div>

            {/* 1. Public Citizen */}
            <div 
              onClick={() => setSelectedRole('PUBLIC')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedRole === 'PUBLIC'
                  ? 'bg-[#FFFFFF] border-[#1BA0E2] shadow-sm'
                  : 'bg-[#F4F9FD] border-[#D8EBF8] hover:border-[#90C3E8]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg mt-0.5 ${selectedRole === 'PUBLIC' ? 'bg-[#1BA0E2] text-white' : 'bg-[#E1EFF9] text-[#0A365C]'}`}>
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#0A365C]">{PRESET_USERS.PUBLIC.name}</span>
                      <span className="text-[10px] bg-slate-200 text-slate-800 font-semibold px-2 py-0.5 rounded">Level 1: Read-Only</span>
                    </div>
                    <p className="text-xs text-[#4B647D] mt-0.5">
                      Open access to national aggregates, state &amp; sector dashboards, and central projects register.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center text-[10px] text-[#4B647D] bg-[#FFFFFF] border border-[#B8D9F2] px-2 py-0.5 rounded font-medium">
                        <Check className="w-2.5 h-2.5 text-emerald-600 mr-1" /> Public Portals
                      </span>
                      <span className="inline-flex items-center text-[10px] text-[#4B647D] bg-[#FFFFFF] border border-[#B8D9F2] px-2 py-0.5 rounded font-medium">
                        <Check className="w-2.5 h-2.5 text-emerald-600 mr-1" /> Project Deep Dives
                      </span>
                      <span className="inline-flex items-center text-[10px] text-[#C53030] bg-red-50 border border-red-200 px-2 py-0.5 rounded font-medium">
                        <X className="w-2.5 h-2.5 mr-1" /> Interventions Restricted
                      </span>
                    </div>
                  </div>
                </div>
                {role === 'PUBLIC' && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                )}
              </div>
            </div>

            {/* 2. Ministry Nodal Officer */}
            <div 
              onClick={() => setSelectedRole('NODAL_OFFICER')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedRole === 'NODAL_OFFICER'
                  ? 'bg-[#FFFFFF] border-[#1BA0E2] shadow-sm'
                  : 'bg-[#F4F9FD] border-[#D8EBF8] hover:border-[#90C3E8]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg mt-0.5 ${selectedRole === 'NODAL_OFFICER' ? 'bg-[#1BA0E2] text-white' : 'bg-[#E1EFF9] text-[#0A365C]'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#0A365C]">{PRESET_USERS.NODAL_OFFICER.name}</span>
                      <span className="text-[10px] bg-blue-100 text-[#0A365C] font-semibold px-2 py-0.5 rounded border border-[#1BA0E2]/40">
                        Level 2: IPMD Operational
                      </span>
                    </div>
                    <p className="text-xs text-[#4B647D] mt-0.5">
                      {PRESET_USERS.NODAL_OFFICER.designation} — {PRESET_USERS.NODAL_OFFICER.department}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center text-[10px] text-[#0A365C] bg-[#E1EFF9] border border-[#B8D9F2] px-2 py-0.5 rounded font-medium">
                        <Check className="w-2.5 h-2.5 text-[#1BA0E2] mr-1" /> Log Milestone Interventions
                      </span>
                      <span className="inline-flex items-center text-[10px] text-[#0A365C] bg-[#E1EFF9] border border-[#B8D9F2] px-2 py-0.5 rounded font-medium">
                        <Check className="w-2.5 h-2.5 text-[#1BA0E2] mr-1" /> Export Official IPMD Memos
                      </span>
                      <span className="inline-flex items-center text-[10px] text-[#C53030] bg-red-50 border border-red-200 px-2 py-0.5 rounded font-medium">
                        <X className="w-2.5 h-2.5 mr-1" /> Pipeline Retraining Restricted
                      </span>
                    </div>
                  </div>
                </div>
                {role === 'NODAL_OFFICER' && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                )}
              </div>
            </div>

            {/* 3. System Administrator / DG */}
            <div 
              onClick={() => setSelectedRole('ADMIN')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedRole === 'ADMIN'
                  ? 'bg-[#FFFFFF] border-[#1BA0E2] shadow-sm'
                  : 'bg-[#F4F9FD] border-[#D8EBF8] hover:border-[#90C3E8]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg mt-0.5 ${selectedRole === 'ADMIN' ? 'bg-[#C53030] text-white' : 'bg-[#FEE2E2] text-[#C53030]'}`}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#0A365C]">{PRESET_USERS.ADMIN.name}</span>
                      <span className="text-[10px] bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded border border-red-300">
                        Level 3: Full Governance &amp; ML
                      </span>
                    </div>
                    <p className="text-xs text-[#4B647D] mt-0.5">
                      {PRESET_USERS.ADMIN.designation} — {PRESET_USERS.ADMIN.department}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center text-[10px] text-red-900 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-medium">
                        <Check className="w-2.5 h-2.5 text-red-600 mr-1" /> Trigger CatBoost ML Retraining
                      </span>
                      <span className="inline-flex items-center text-[10px] text-[#0A365C] bg-[#E1EFF9] border border-[#B8D9F2] px-2 py-0.5 rounded font-medium">
                        <Check className="w-2.5 h-2.5 text-[#1BA0E2] mr-1" /> Full Operational Interventions
                      </span>
                      <span className="inline-flex items-center text-[10px] text-[#0A365C] bg-[#E1EFF9] border border-[#B8D9F2] px-2 py-0.5 rounded font-medium">
                        <Check className="w-2.5 h-2.5 text-[#1BA0E2] mr-1" /> Telemetry &amp; System Controls
                      </span>
                    </div>
                  </div>
                </div>
                {role === 'ADMIN' && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-[#FFFFFF] px-6 py-4 border-t border-[#B8D9F2] flex items-center justify-between">
          <div className="text-[11px] text-[#4B647D]">
            Official Government of India Digital Portal Security Framework
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#4B647D] hover:text-[#0A365C] hover:bg-[#F0F6FB] rounded-lg border border-[#B8D9F2] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleApplyRole(selectedRole)}
              className="px-5 py-2 text-xs font-bold text-white bg-[#1BA0E2] hover:bg-[#148AC4] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Switch to {PRESET_USERS[selectedRole].avatarBadge} Persona
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
