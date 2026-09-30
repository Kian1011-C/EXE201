import re

with open('src/pages/dashboard/staff/StaffDealDetail.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

with open('replace_fields.txt', 'r', encoding='utf-8') as f:
    replacement = f.read()

# The target block to replace is inside {feeBonusPaymentOpen && ( ... )}
# Let's find it.
start_str = '{feeBonusPaymentOpen && ('
end_str = ')}'

start_idx = content.find(start_str) + len(start_str)
end_idx = content.find(')}', start_idx)

# Wait, there are many )}. Let's find the closing tag for feeBonusPaymentOpen.
# We can just replace the whole section starting from <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-3 text-xs">
# to the end of that div.
start_div_str = '<div className="p-3.5 bg-slate-50/60 border-t border-slate-100 space-y-3 text-xs">'
start_idx_2 = content.find(start_div_str)
# It's better to just replace from start_div_str to just before )} for that block.
# Since it's a huge block, I'll use regex or manual string manipulation.

import sys
lines = content.split('\n')
start_line = -1
end_line = -1

for i, line in enumerate(lines):
    if '{feeBonusPaymentOpen && (' in line:
        start_line = i + 1
        break

for i in range(start_line, len(lines)):
    if ')}' in lines[i] and '</div>' in lines[i-1]:
        # found the end of the block
        if '        {/* Collapsed Sidebar Restore Button */}' in lines[i+4]:
             end_line = i
             break

if start_line != -1 and end_line != -1:
    new_content = '\n'.join(lines[:start_line]) + '\n' + replacement + '\n              ' + '\n'.join(lines[end_line:])
    with open('src/pages/dashboard/staff/StaffDealDetail.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Replaced lines {start_line} to {end_line}")
else:
    print("Could not find block boundaries")
