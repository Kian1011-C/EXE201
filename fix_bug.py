import os
import re

file_path = r'd:\KI 8\EXE201\src\pages\dashboard\staff\StaffCustomerDocumentDetail.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace {doc.lastModifiedBy || 'Staff'} with a safe extraction
new_content = re.sub(
    r'\{doc\.lastModifiedBy\s*\|\|\s*(.*?)\}',
    r"{typeof doc.lastModifiedBy === 'object' ? (doc.lastModifiedBy?.name || \1) : (doc.lastModifiedBy || \1)}",
    content
)

if content != new_content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Updated StaffCustomerDocumentDetail.jsx')
else:
    print('No changes made.')

