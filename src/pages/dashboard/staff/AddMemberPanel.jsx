import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function AddMemberPanel({ isOpen, onClose, onSave, hasSpouse }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  const [errors, setErrors] = useState({});

  // Lock body scroll when modal is open to completely prevent background scrolling ("lướt bị trắng")
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-sync spouse status with family relationship
      if (field === 'familyRelationshipId') {
        if (['Spouse', 'Husband', 'Wife'].includes(value) && !hasSpouse) {
          updated.isSpouse = true;
        } else if (!['Spouse', 'Husband', 'Wife'].includes(value)) {
          updated.isSpouse = false;
        }
      }
      if (field === 'isSpouse') {
        if (value && !['Spouse', 'Husband', 'Wife'].includes(prev.familyRelationshipId)) {
          updated.familyRelationshipId = 'Spouse';
        }
      }
      return updated;
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const resetForm = () => {
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
    setErrors({});
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();

    // Basic validation
    const newErrors = {};
    if (!formData.firstName?.trim()) newErrors.firstName = 'Vui lòng nhập tên (First name)';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Vui lòng nhập họ (Last name)';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-3 sm:p-5 animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col transition-all duration-200 my-auto ${
          isFullscreen 
            ? 'w-full h-full max-w-none rounded-none' 
            : 'w-full max-w-3xl max-h-[92vh]'
        }`}
      >
        {/* ── 1. Header Banner ────────────────────────────────────────────── */}
        <div className="bg-[#104882] px-6 py-4 flex items-center justify-between text-white shrink-0 shadow-xs select-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-wide text-white uppercase">
                  Create Member
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white">
                  Gia đình / Household
                </span>
              </div>
              <p className="text-[11px] text-blue-100/90 font-normal">
                Thêm thông tin thành viên (Spouse hoặc Dependent) vào hồ sơ liên hệ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-white/80">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
              className="hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isFullscreen ? 'close_fullscreen' : 'open_in_full'}
              </span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              title="Đóng"
              className="hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* ── 2. Modal Body (Clean 2-Column Responsive Form) ──────────────── */}
        <form onSubmit={handleSave} className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs bg-[#F8FAFC] overscroll-contain">
          
          {/* Section 1: Thông tin cá nhân */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wide">
              <span className="material-symbols-outlined text-[16px] text-blue-600">badge</span>
              <span>1. Thông tin cá nhân (Personal Information)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                  First Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên..."
                  value={formData.firstName}
                  onChange={e => handleChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border bg-white text-xs text-slate-800 focus:outline-none transition shadow-2xs ${
                    errors.firstName ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {errors.firstName && <span className="text-rose-500 text-[10px] mt-0.5 block">{errors.firstName}</span>}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Middle Name</label>
                <input
                  type="text"
                  placeholder="Tên đệm (nếu có)..."
                  value={formData.middleName}
                  onChange={e => handleChange('middleName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                  Last Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ..."
                  value={formData.lastName}
                  onChange={e => handleChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border bg-white text-xs text-slate-800 focus:outline-none transition shadow-2xs ${
                    errors.lastName ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {errors.lastName && <span className="text-rose-500 text-[10px] mt-0.5 block">{errors.lastName}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Gender (Giới tính)</label>
                <div className="relative">
                  <select
                    value={formData.gender}
                    onChange={e => handleChange('gender', e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition shadow-2xs cursor-pointer"
                  >
                    <option value="">Chọn giới tính...</option>
                    <option value="Male">Male (Nam)</option>
                    <option value="Female">Female (Nữ)</option>
                    <option value="Other">Other (Khác)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Date of Birth (Ngày sinh)</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={e => handleChange('dob', e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition shadow-2xs"
                  />
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[15px] text-slate-400 pointer-events-none">
                    calendar_today
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">SSN (Số An Sinh Xã Hội)</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="XXX-XX-XXXX"
                    value={formData.ssn}
                    onChange={e => handleChange('ssn', e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition shadow-2xs"
                  />
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[15px] text-slate-400 pointer-events-none">
                    credit_card
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Mối quan hệ & Cư trú */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wide">
              <span className="material-symbols-outlined text-[16px] text-blue-600">diversity_3</span>
              <span>2. Mối quan hệ & Tình trạng cư trú (Relationship & Household)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                  Family Relationship (Mối quan hệ gia đình)
                </label>
                <div className="relative">
                  <select
                    value={formData.familyRelationshipId}
                    onChange={e => handleChange('familyRelationshipId', e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition shadow-2xs cursor-pointer"
                  >
                    <option value="">Chọn mối quan hệ...</option>
                    <option value="Spouse">Spouse (Vợ / Chồng)</option>
                    <option value="Husband">Husband (Chồng)</option>
                    <option value="Wife">Wife (Vợ)</option>
                    <option value="Child">Child (Con cái)</option>
                    <option value="Parent">Parent (Bố / Mẹ)</option>
                    <option value="Brother/Sister">Brother / Sister (Anh chị em)</option>
                    <option value="Other">Other (Khác)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="flex items-center">
                <label className={`flex items-center gap-2.5 p-2.5 rounded-lg border w-full cursor-pointer transition select-none ${
                  formData.isSpouse 
                    ? 'border-blue-400 bg-blue-50/70 text-blue-900 font-semibold' 
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                } ${hasSpouse ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  <input
                    type="checkbox"
                    disabled={hasSpouse}
                    checked={formData.isSpouse}
                    onChange={e => handleChange('isSpouse', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div>
                    <div className="text-xs font-bold">Là vợ/chồng (Is Spouse)</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {hasSpouse ? 'Hồ sơ này đã có Spouse 1' : 'Đánh dấu nếu đây là vợ/chồng của chủ hồ sơ'}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                  Immigration Status (Tình trạng cư trú)
                </label>
                <div className="relative">
                  <select
                    value={formData.immigrationStatus}
                    onChange={e => handleChange('immigrationStatus', e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition shadow-2xs cursor-pointer"
                  >
                    <option value="">Chọn tình trạng cư trú...</option>
                    <option value="U.S Citizen">U.S Citizen (Công dân Mỹ)</option>
                    <option value="Permanent Resident">Permanent Resident (Thẻ xanh)</option>
                    <option value="Work Authorization">Work Authorization (EAD)</option>
                    <option value="Other">Other (Khác)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Alien Number (A-Number)</label>
                <input
                  type="text"
                  placeholder="A-XXXXXXXXX"
                  value={formData.alienNumber}
                  onChange={e => handleChange('alienNumber', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Certificate Number</label>
                <input
                  type="text"
                  placeholder="Số chứng chỉ / tự nhiên hóa..."
                  value={formData.certificateNumber}
                  onChange={e => handleChange('certificateNumber', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                  Date Expired (Ngày hết hạn giấy tờ)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dateExpired}
                    onChange={e => handleChange('dateExpired', e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition shadow-2xs"
                  />
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[15px] text-slate-400 pointer-events-none">
                    calendar_today
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Phone (Số điện thoại)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-500 text-xs font-semibold select-none">+1</span>
                  <input
                    type="tel"
                    placeholder="(XXX) XXX-XXXX"
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    className="w-full pl-8 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition shadow-2xs"
                  />
                  <span className="material-symbols-outlined absolute right-2.5 text-[15px] text-slate-400 pointer-events-none">
                    call
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Bảo hiểm & Ghi chú */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wide">
              <span className="material-symbols-outlined text-[16px] text-blue-600">health_and_safety</span>
              <span>3. Bảo hiểm & Ghi chú (Insurance & Coverage)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                  Current Insurance (Bảo hiểm hiện tại)
                </label>
                <div className="relative">
                  <select
                    value={formData.currentInsuranceId}
                    onChange={e => handleChange('currentInsuranceId', e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition shadow-2xs cursor-pointer"
                  >
                    <option value="">Chưa có / Chưa xác định...</option>
                    <option value="Ambetter">Ambetter</option>
                    <option value="BCBS">Blue Cross Blue Shield (BCBS)</option>
                    <option value="UnitedHealthcare">UnitedHealthcare (UHC)</option>
                    <option value="Oscar">Oscar Health</option>
                    <option value="Aetna">Aetna</option>
                    <option value="Cigna">Cigna</option>
                    <option value="Kaiser">Kaiser Permanente</option>
                    <option value="Molina">Molina Healthcare</option>
                    <option value="Humana">Humana</option>
                    <option value="Other">Hãng khác / Other</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="flex items-center">
                <label className={`flex items-center gap-2.5 p-2.5 rounded-lg border w-full cursor-pointer transition select-none ${
                  formData.applyObamacare 
                    ? 'border-emerald-400 bg-emerald-50/70 text-emerald-900 font-semibold' 
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.applyObamacare}
                    onChange={e => handleChange('applyObamacare', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold">Apply Obamacare</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Thành viên này đăng ký tham gia bảo hiểm y tế Obamacare
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Note (Ghi chú)</label>
              <textarea
                placeholder="Nhập ghi chú chi tiết về thành viên..."
                rows={2}
                value={formData.note}
                onChange={e => handleChange('note', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition shadow-2xs"
              />
            </div>
          </div>

        </form>

        {/* ── 3. Footer Bar (Pinned at bottom, never scrolls off) ─────────── */}
        <div className="border-t border-slate-200 px-6 py-3.5 bg-white flex items-center justify-end gap-3 shrink-0 shadow-xs">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">close</span>
            <span>Cancel / Cancel</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-[#104882] hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm hover:shadow"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Lưu thành viên / Save Member</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
