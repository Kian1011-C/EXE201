import sys

with open('src/pages/dashboard/staff/StaffTicketDetail.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I will find {!isUploadDoc && (
# and replace it with {!isUploadDoc && (<>
content = content.replace('{!isUploadDoc && (\n                    {/* 7. Carrier */}', '{!isUploadDoc && (<>\n                    {/* 7. Carrier */}')
content = content.replace('{!isUploadDoc && (\n                    {/* 11. Paid Through Date */}', '{!isUploadDoc && (<>\n                    {/* 11. Paid Through Date */}')

# Now for the corresponding )}
# The easiest way is to find the strings and add </> before )}
# But how to find the exact )} ?
# I'll replace Carrier's closing:
#           </div>
#                 )}
# with
#           </div>
#                 </>)}

content = content.replace('                    </div>\n                )}\n\n                {/* 8. Ticket Owner */}', '                    </div>\n                </>)}\n\n                {/* 8. Ticket Owner */}')
content = content.replace('                    </div>\n                  </div>\n                )}\n\n                {/* 12. Proof (if available) */}', '                    </div>\n                  </div>\n                </>)}\n\n                {/* 12. Proof (if available) */}')

with open('src/pages/dashboard/staff/StaffTicketDetail.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
