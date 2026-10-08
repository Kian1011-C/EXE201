import os
import re

file_path = r'd:\KI 8\EXE201\src\pages\dashboard\staff\StaffCustomerDocumentDetail.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'\{contactOwner \? contactOwner\.slice\(0, 2\)\.toUpperCase\(\) : \'--\'\}',
    r"{contactOwner ? (typeof contactOwner === 'object' ? (contactOwner?.name || '--').slice(0, 2) : contactOwner.slice(0, 2)).toUpperCase() : '--'}",
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated StaffCustomerDocumentDetail.jsx')
