import sys

# Replace the months map with Upload Document Grid if isUploadDoc

with open('src/pages/dashboard/staff/StaffTicketDetail.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to find:
#             {months.length === 0 ? (
#               <div className="flex flex-col items-center justify-center text-center py-20 text-slate-400">
# ...
#             )}

# Let's write the grid component first
grid_jsx = """
            {isUploadDoc ? (
              <div className="grid grid-cols-2 gap-4 mt-2">
                {[
                  { id: 'income', title: 'Proof of Income (Thu nhập)', desc: 'W-2, Pay stubs, Tax return...', req: true },
                  { id: 'citizenship', title: 'Proof of Citizenship / Immigration', desc: 'Passport, Green card, Certificate...', req: true },
                  { id: 'ssn', title: 'Social Security Card (SSN)', desc: 'SSN Card copy', req: true },
                  { id: 'id', title: 'Driver License / ID', desc: 'State ID, Driver License', req: true },
                  { id: 'address', title: 'Proof of Address', desc: 'Utility bill, Lease agreement...', req: false },
                  { id: 'other', title: 'Other (Tài liệu khác)', desc: 'Any other required documents', req: false },
                ].map((doc) => (
                  <div key={doc.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-slate-800 flex items-center gap-1">
                          {doc.title}
                          {doc.req && <span className="text-rose-500">*</span>}
                        </span>
                        <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">
                          Missing
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-4">{doc.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('Chức năng upload tài liệu đang được phát triển')}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-semibold text-xs transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">upload_file</span>
                      <span>Upload File</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : months.length === 0 ? (
"""

content = content.replace('{months.length === 0 ? (', grid_jsx)

with open('src/pages/dashboard/staff/StaffTicketDetail.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
