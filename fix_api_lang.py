import os
import re

file_path = r'd:\KI 8\EXE201\src\services\api.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("language: c.language || 'Vietnamese',", "language: c.language || '',")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed Language default in api.js')
