import os
import re

file_path = r'd:\KI 8\EXE201\src\services\api.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'streetAddress: c\.address \|\| c\.streetAddress \|\| \'\',',
    r'streetAddress: c.streetAddress || c.address || \'\',',
    content
)

content = re.sub(
    r'mailingAddress: c\.address \|\| \'\',',
    r'mailingAddress: c.mailingAddress || c.address || \'\',',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated api.js')
