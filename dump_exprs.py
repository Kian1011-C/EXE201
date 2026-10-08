import os
import re

file_path = r'd:\KI 8\EXE201\src\pages\dashboard\staff\StaffCustomerDocumentDetail.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

exprs = re.findall(r'>\s*\{([^}<>]+)\}\s*<', content)
for e in set(exprs):
    try:
        print(e.strip().encode('ascii', 'ignore').decode())
    except:
        pass

