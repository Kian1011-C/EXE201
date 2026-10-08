import React, { useState } from 'react';

export default function MemberSection({ member, onDelete, onUpdate, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const handleChange = (field, value) => {
    onUpdate({ ...member, [field]: value });
  };

  const title = member.relation === 'Spouse' ? 'Spouse 1' : member.relation;

  return (
    <div className="border-t border-slate-200 mt-2">
      <div 
        className="flex items-center justify-between py-2 cursor-pointer hover:bg-slate-50 transition px-2 -mx-2 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
          <span className={`material-symbols-outlined text-[16px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
          {title}
        </div>
        <div className="flex items-center gap-1">
          <button 
            type="button" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-slate-200 rounded text-slate-500"
          >
            <span className="material-symbols-outlined text-[16px]">more_vert</span>
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div className="space-y-3 pb-3 px-1 text-xs animate-in slide-in-from-top-2">
          {/* First name */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1 text-[11px]">First name</label>
            <div className="relative">
              <input
                type="text"
                value={member.firstName || ''}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {member.firstName && (
                  <button onClick={() => handleChange('firstName', '')} className="text-slate-400 hover:text-slate-600 text-[10px]">✕</button>
                )}
                <span className="material-symbols-outlined text-[14px] text-slate-400">edit</span>
              </div>
            </div>
          </div>
          
          {/* Middle name */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Middle name</label>
            <div className="relative">
              <input
                type="text"
                value={member.middleName || ''}
                onChange={(e) => handleChange('middleName', e.target.value)}
                placeholder="Input middle name..."
                className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {member.middleName && (
                  <button onClick={() => handleChange('middleName', '')} className="text-slate-400 hover:text-slate-600 text-[10px]">✕</button>
                )}
                <span className="material-symbols-outlined text-[14px] text-slate-400">edit</span>
              </div>
            </div>
          </div>
          
          {/* Last name */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Last name</label>
            <div className="relative">
              <input
                type="text"
                value={member.lastName || ''}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {member.lastName && (
                  <button onClick={() => handleChange('lastName', '')} className="text-slate-400 hover:text-slate-600 text-[10px]">✕</button>
                )}
                <span className="material-symbols-outlined text-[14px] text-slate-400">edit</span>
              </div>
            </div>
          </div>
          
          {/* Gender */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Gender</label>
            <div className="relative">
              <select
                value={member.gender || ''}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 appearance-none bg-white"
              >
                <option value="">Select gender...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-slate-400">
                {member.gender && <button onClick={(e) => { e.preventDefault(); handleChange('gender', ''); }} className="pointer-events-auto hover:text-slate-600 text-[10px]">✕</button>}
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </div>
            </div>
          </div>
          
          {/* Date of birth */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Date of birth</label>
            <div className="relative">
              <input
                type="date"
                value={member.dob || ''}
                onChange={(e) => handleChange('dob', e.target.value)}
                className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                {member.dob && (
                  <button onClick={(e) => {e.preventDefault(); handleChange('dob', '');}} className="pointer-events-auto text-slate-400 hover:text-slate-600 text-[10px]">✕</button>
                )}
                <span className="material-symbols-outlined text-[14px] text-slate-400">calendar_today</span>
              </div>
            </div>
          </div>
          
          {/* Phone */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Phone</label>
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-slate-600 z-10">+1</span>
              <input
                type="text"
                value={member.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                <span className="material-symbols-outlined text-[14px]">call</span>
              </div>
            </div>
          </div>

          {/* Family relationship */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Family Relationship</label>
            <div className="relative">
              <select
                value={member.familyRelationshipId || ''}
                onChange={(e) => handleChange('familyRelationshipId', e.target.value)}
                className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 appearance-none bg-white text-xs text-slate-800"
              >
                <option value="">Select relationship...</option>
                <option value="Spouse">Spouse</option>
                <option value="Husband">Husband</option>
                <option value="Wife">Wife</option>
                <option value="Child">Child / Dependent</option>
                <option value="Parent">Parent</option>
                <option value="Brother/Sister">Brother / Sister</option>
                <option value="Other">Other</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-slate-400">
                {member.familyRelationshipId && <button onClick={(e) => { e.preventDefault(); handleChange('familyRelationshipId', ''); }} className="pointer-events-auto hover:text-slate-600 text-[10px]">✕</button>}
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </div>
            </div>
          </div>

          {/* SSN */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1 text-[11px]">SSN</label>
            <div className="relative">
              <input
                type="text"
                value={member.ssn || ''}
                onChange={(e) => handleChange('ssn', e.target.value)}
                className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {member.ssn && (
                  <button onClick={() => handleChange('ssn', '')} className="text-slate-400 hover:text-slate-600 text-[10px]">✕</button>
                )}
                <span className="material-symbols-outlined text-[14px] text-slate-400">credit_card</span>
              </div>
            </div>
          </div>

          {/* Alien number */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Alien number</label>
            <div className="relative">
              <input
                type="text"
                value={member.alienNumber || ''}
                onChange={(e) => handleChange('alienNumber', e.target.value)}
                className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {member.alienNumber && (
                  <button onClick={() => handleChange('alienNumber', '')} className="text-slate-400 hover:text-slate-600 text-[10px]">✕</button>
                )}
                <span className="material-symbols-outlined text-[14px] text-slate-400">edit</span>
              </div>
            </div>
          </div>

          {/* Certificate number */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Certificate number</label>
            <div className="relative">
              <input
                type="text"
                value={member.certificateNumber || ''}
                onChange={(e) => handleChange('certificateNumber', e.target.value)}
                className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {member.certificateNumber && (
                  <button onClick={() => handleChange('certificateNumber', '')} className="text-slate-400 hover:text-slate-600 text-[10px]">✕</button>
                )}
                <span className="material-symbols-outlined text-[14px] text-slate-400">edit</span>
              </div>
            </div>
          </div>

          {/* Current insurance */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Current Insurance</label>
            <div className="relative">
              <select
                value={member.currentInsuranceId || ''}
                onChange={(e) => handleChange('currentInsuranceId', e.target.value)}
                className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 appearance-none bg-white text-xs text-slate-800"
              >
                <option value="">None / Unspecified...</option>
                <option value="Ambetter">Ambetter</option>
                <option value="BCBS">Blue Cross Blue Shield (BCBS)</option>
                <option value="UnitedHealthcare">UnitedHealthcare (UHC)</option>
                <option value="Oscar">Oscar Health</option>
                <option value="Aetna">Aetna</option>
                <option value="Cigna">Cigna</option>
                <option value="Kaiser">Kaiser</option>
                <option value="Molina">Molina</option>
                <option value="Other">Other</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-slate-400">
                {member.currentInsuranceId && <button onClick={(e) => { e.preventDefault(); handleChange('currentInsuranceId', ''); }} className="pointer-events-auto hover:text-slate-600 text-[10px]">✕</button>}
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </div>
            </div>
          </div>

          {/* Apply obamacare */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`applyObamacare_${member.id}`}
              checked={member.applyObamacare || false}
              onChange={(e) => handleChange('applyObamacare', e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor={`applyObamacare_${member.id}`} className="block text-slate-800 font-semibold text-[11px] cursor-pointer">
              Apply obamacare
            </label>
          </div>

          {/* Immigration status */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Immigration status</label>
            <div className="relative">
              <select
                value={member.immigrationStatus || ''}
                onChange={(e) => handleChange('immigrationStatus', e.target.value)}
                className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 appearance-none bg-white"
              >
                <option value="">Select...</option>
                <option value="U.S Citizen">U.S Citizen</option>
                <option value="Permanent Resident">Permanent Resident</option>
                <option value="Other">Other</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-slate-400">
                {member.immigrationStatus && <button onClick={(e) => { e.preventDefault(); handleChange('immigrationStatus', ''); }} className="pointer-events-auto hover:text-slate-600 text-[10px]">✕</button>}
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </div>
            </div>
          </div>

          {/* Date expired */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Date expired</label>
            <div className="relative">
              <input
                type="date"
                value={member.dateExpired || ''}
                onChange={(e) => handleChange('dateExpired', e.target.value)}
                className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                {member.dateExpired && (
                  <button onClick={(e) => {e.preventDefault(); handleChange('dateExpired', '');}} className="pointer-events-auto text-slate-400 hover:text-slate-600 text-[10px]">✕</button>
                )}
                <span className="material-symbols-outlined text-[14px] text-slate-400">calendar_today</span>
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1 text-[11px]">Note</label>
            <textarea
              value={member.note || ''}
              onChange={(e) => handleChange('note', e.target.value)}
              placeholder="Input note..."
              className="w-full px-2.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 min-h-[60px]"
            />
          </div>
          
        </div>
      )}
    </div>
  );
}
