import sys

with open('src/pages/dashboard/staff/StaffTicketDetail.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add isUploadDoc
content = content.replace("const isACA = pipeline === 'ACA account';", "const isACA = pipeline === 'ACA account';\n  const isUploadDoc = pipeline === 'Upload document';")

# 2. Hide Carrier
carrier_start = content.find('{/* 7. Carrier */}')
carrier_end_str = '</div>\n\n                {/* 8. Ticket Owner */}'
carrier_end = content.find(carrier_end_str, carrier_start)
carrier_block = content[carrier_start:carrier_end + 6] # including </div>
new_carrier_block = '{!isUploadDoc && (\n' + '\n'.join(['                  ' + line if line.strip() else line for line in carrier_block.split('\n')]) + '\n                )}\n'
content = content.replace(carrier_block, new_carrier_block)

# 3. Hide Paid Through Date
ptd_start = content.find('{/* 11. Paid Through Date */}')
ptd_end_str = '</div>\n\n                {/* 12. Proof (if available) */}'
ptd_end = content.find(ptd_end_str, ptd_start)
ptd_block = content[ptd_start:ptd_end + 6]
new_ptd_block = '{!isUploadDoc && (\n' + '\n'.join(['                  ' + line if line.strip() else line for line in ptd_block.split('\n')]) + '\n                )}\n'
content = content.replace(ptd_block, new_ptd_block)

with open('src/pages/dashboard/staff/StaffTicketDetail.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
