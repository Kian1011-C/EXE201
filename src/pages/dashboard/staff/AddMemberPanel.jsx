import React, { useState } from 'react';

export default function AddMemberPanel({ isOpen, onClose, onSave, hasSpouse }) {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    isSpouse: false,
    gender: '',
    dob: '',
    phone: '',
    familyRelationshipId: '',
    ssn: '',
    alienNumber: '',
    certificateNumber: '',
    currentInsuranceId: '',
    applyObamacare: false,
    immigrationStatus: '',
    dateExpired: '',
    note: ''
  });

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    // Reset form
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      isSpouse: false,
      gender: '',
      dob: '',
      phone: '',
      familyRelationshipId: '',
      ssn: '',
      alienNumber: '',
      certificateNumber: '',
      currentInsuranceId: '',
      applyObamacare: false,
      immigrationStatus: '',
      dateExpired: '',
      note: ''
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/20">
      <div className="w-[400px] h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0 animate-in slide-in-from-right">
        {/* Header */}
        <div className="bg-[#173A75] px-4 py-3 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Create Member</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          
          <div>
            <label className="block text-slate-800 font-bold mb-1">First name</label>
            <div className="relative">
              <input type="text" placeholder="Input first name..." value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[14px]">edit</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">Middle name</label>
            <div className="relative">
              <input type="text" placeholder="Input middle name..." value={formData.middleName} onChange={e => handleChange('middleName', e.target.value)} className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[14px]">edit</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">Last name</label>
            <div className="relative">
              <input type="text" placeholder="Input last name..." value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[14px]">edit</span>
              </div>
            </div>
          </div>

          {!hasSpouse && (
            <div className="flex items-center gap-2 pt-1">
              <label className="text-slate-800 font-bold select-none cursor-pointer flex items-center gap-2">
                Is spouse
                <input type="checkbox" checked={formData.isSpouse} onChange={e => handleChange('isSpouse', e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
              </label>
            </div>
          )}

          <div>
            <label className="block text-slate-800 font-bold mb-1">Gender</label>
            <div className="relative">
              <select value={formData.gender} onChange={e => handleChange('gender', e.target.value)} className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 appearance-none bg-white text-slate-800">
                <option value="" className="text-slate-400">Select gender...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">Date of birth</label>
            <div className="relative">
              <input type="date" value={formData.dob} onChange={e => handleChange('dob', e.target.value)} className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
              
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">Phone</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-600 z-10 font-medium">+1</span>
              <input type="text" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[14px]">call</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">Family relationship id</label>
            <div className="relative">
              <select value={formData.familyRelationshipId} onChange={e => handleChange('familyRelationshipId', e.target.value)} className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 appearance-none bg-white text-slate-800">
                <option value="" className="text-slate-400">Select family relationship id...</option>
                <option value="Husband">Husband</option>
                <option value="Wife">Wife</option>
                <option value="Child">Child</option>
                <option value="Parent">Parent</option>
                <option value="Other">Other</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">SSN</label>
            <div className="relative">
              <input type="text" placeholder="Input ssn..." value={formData.ssn} onChange={e => handleChange('ssn', e.target.value)} className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[14px]">credit_card</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">Alien number</label>
            <div className="relative">
              <input type="text" placeholder="Input alien number..." value={formData.alienNumber} onChange={e => handleChange('alienNumber', e.target.value)} className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[14px]">edit</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">Certificate number</label>
            <div className="relative">
              <input type="text" placeholder="Input certificate number..." value={formData.certificateNumber} onChange={e => handleChange('certificateNumber', e.target.value)} className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[14px]">edit</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">Current insurance id</label>
            <div className="relative">
              <select value={formData.currentInsuranceId} onChange={e => handleChange('currentInsuranceId', e.target.value)} className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 appearance-none bg-white text-slate-800">
                <option value="" className="text-slate-400">Select current insurance id...</option>
                <option value="Unknown">Unknown</option>
                <option value="Aetna">Aetna</option>
                <option value="BlueCross">BlueCross</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <label className="text-slate-800 font-bold select-none cursor-pointer flex items-center gap-2">
              Apply obamacare
              <input type="checkbox" checked={formData.applyObamacare} onChange={e => handleChange('applyObamacare', e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
            </label>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">Immigration status</label>
            <div className="relative">
              <select value={formData.immigrationStatus} onChange={e => handleChange('immigrationStatus', e.target.value)} className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 appearance-none bg-white text-slate-800">
                <option value="" className="text-slate-400">Select immigration status...</option>
                <option value="U.S Citizen">U.S Citizen</option>
                <option value="Permanent Resident">Permanent Resident</option>
                <option value="Other">Other</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">Date expired</label>
            <div className="relative">
              <input type="date" value={formData.dateExpired} onChange={e => handleChange('dateExpired', e.target.value)} className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
              
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">Note</label>
            <textarea placeholder="Input note..." value={formData.note} onChange={e => handleChange('note', e.target.value)} className="w-full pl-3 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 min-h-[80px]" />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 flex items-center justify-center gap-3 shrink-0">
          <button onClick={handleSave} className="flex items-center gap-1.5 px-6 py-2 bg-[#173A75] hover:bg-blue-900 text-white font-semibold rounded-lg transition cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">save</span>
            Save
          </button>
          <button onClick={onClose} className="flex items-center gap-1.5 px-6 py-2 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg transition cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">close</span>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
