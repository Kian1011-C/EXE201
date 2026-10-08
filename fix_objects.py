import os
import glob
import re

dir_path = r'd:\KI 8\EXE201\src\pages\dashboard\staff'
files = glob.glob(os.path.join(dir_path, '*.jsx'))

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    # Replace {task.assignee} with {typeof task.assignee === 'object' ? task.assignee?.name || '' : task.assignee}
    new_content = re.sub(
        r'\{([a-zA-Z0-9_]+)\.assignee\}',
        r"{typeof \1.assignee === 'object' ? \1.assignee?.name || '' : \1.assignee}",
        new_content
    )
    
    # Also for ticketOwner
    new_content = re.sub(
        r'\{([a-zA-Z0-9_]+)\.ticketOwner\}',
        r"{typeof \1.ticketOwner === 'object' ? \1.ticketOwner?.name || '' : \1.ticketOwner}",
        new_content
    )

    if content != new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {os.path.basename(file_path)}')

print('Done.')
