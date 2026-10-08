import os
import re

file_path = r'd:\KI 8\EXE201\src\pages\dashboard\staff\StaffCustomerDocumentDetail.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix contactOwner rendering
content = re.sub(
    r'\{contactOwner \|\| \'—\'\}',
    r"{typeof contactOwner === 'object' ? (contactOwner?.name || '—') : (contactOwner || '—')}",
    content
)

content = re.sub(
    r'\{associatedContact\.leadOwner \|\| contactOwner \|\| \'—\'\}',
    r"{typeof associatedContact?.leadOwner === 'object' ? associatedContact.leadOwner?.name : (associatedContact?.leadOwner || (typeof contactOwner === 'object' ? contactOwner?.name : contactOwner) || '—')}",
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated StaffCustomerDocumentDetail.jsx')
