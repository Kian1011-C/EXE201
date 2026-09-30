import sys

with open('src/pages/dashboard/staff/StaffDealDetail.jsx', 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')

with open('replace_fields.txt', 'r', encoding='utf-8') as f:
    replacement = f.read()

start_line = -1
for i, line in enumerate(lines):
    if '{feeBonusPaymentOpen && (' in line:
        start_line = i
        break

end_line = -1
for i in range(start_line, len(lines)):
    if ')}' in lines[i] and '</div>' in lines[i-1]:
        end_line = i
        break

if start_line != -1 and end_line != -1:
    new_content = '\n'.join(lines[:start_line]) + '\n              {feeBonusPaymentOpen && (\n' + replacement + '\n              )}\n' + '\n'.join(lines[end_line+1:])
    with open('src/pages/dashboard/staff/StaffDealDetail.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Successfully replaced from {start_line} to {end_line}")
else:
    print(f"Error: start={start_line}, end={end_line}")
