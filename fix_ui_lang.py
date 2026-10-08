import os
import re

file_path = r'd:\KI 8\EXE201\src\pages\dashboard\staff\StaffContactDetail.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("contact?.language || 'Vietnamese'", "contact?.language || ''")
content = content.replace("contact.language || 'Vietnamese'", "contact.language || ''")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed Language default in StaffContactDetail.jsx')
