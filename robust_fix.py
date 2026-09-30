import sys

with open('src/pages/dashboard/staff/StaffTicketDetail.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add isUploadDoc
content = content.replace("const isACA = pipeline === 'ACA account';", "const isACA = pipeline === 'ACA account';\n  const isUploadDoc = pipeline === 'Upload document';")

# 2. Hide Carrier
carrier_start = content.find('{/* 7. Carrier */}')
carrier_end_str = '</div>\n\n                {/* 8. Ticket Owner */}'
carrier_end = content.find(carrier_end_str, carrier_start)
carrier_block = content[carrier_start:carrier_end + 6]
new_carrier_block = '{!isUploadDoc && (<>\n' + '\n'.join(['                  ' + line if line.strip() else line for line in carrier_block.split('\n')]) + '\n                </>)}\n'
content = content.replace(carrier_block, new_carrier_block)

# 3. Hide Paid Through Date
ptd_start = content.find('{/* 11. Paid Through Date */}')
ptd_end_str = '</div>\n\n                {/* 12. Proof (if available) */}'
ptd_end = content.find(ptd_end_str, ptd_start)
ptd_block = content[ptd_start:ptd_end + 6]
new_ptd_block = '{!isUploadDoc && (<>\n' + '\n'.join(['                  ' + line if line.strip() else line for line in ptd_block.split('\n')]) + '\n                </>)}\n'
content = content.replace(ptd_block, new_ptd_block)

# 4. Inject grid
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
