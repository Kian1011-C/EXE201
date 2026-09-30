import sys

with open('src/pages/dashboard/staff/StaffTicketDetail.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('{!isUploadDoc && (\n                    {/* 7. Carrier */}', '{!isUploadDoc && (<>\n                    {/* 7. Carrier */}')
content = content.replace('{!isUploadDoc && (\n                    {/* 11. Paid Through Date */}', '{!isUploadDoc && (<>\n                    {/* 11. Paid Through Date */}')

# Now close them with </>)}
# Let's just use string replace for the closing tags.
# Wait, I don't know exactly what line the closing tag is on.
# Better to write a python script that fixes it robustly.
