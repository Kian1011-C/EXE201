import os
import glob
import re

dir_path = r'd:\KI 8\EXE201\src\pages\dashboard\staff'
files = glob.glob(os.path.join(dir_path, '*.jsx'))

replacements = {
    'Proof of Income (Thu nhập)': 'Proof of Income',
    'Other (Tài liệu khác)': 'Other (Other documents)',
    'Tải lên file': 'Upload file',
    'cho danh mục': 'for category',
    'Đang tải xuống: ': 'Downloading: ',
    'Xem trước': 'Preview',
    'Tải xuống': 'Download',
    'Xóa tài liệu': 'Delete document',
    'Tải lên bản thay thế (Replace file)': 'Upload replacement (Replace file)',
    'Đang tải lên...': 'Uploading...',
    'Tải xuống file': 'Download file',
    'Tài liệu đã được tải lên máy chủ. Bạn có thể tải file về để xem chi tiết.': 'Document uploaded to server. Download to view details.',
    'Vui lòng nhập tên view!': 'Please enter a view name!',
    'Bắt đầu trống như ảnh 3!': 'Starts empty like image 3!',
    'Tất cả hãng bảo hiểm hiện tại trong hệ thống': 'All current insurance carriers in the system',
    'Chế độ Agent: Chỉ hiển thị các Deals được phân công cho': 'Agent Mode: Only showing Deals assigned to',
    'deals phụ trách': 'assigned deals',
    'Tất cả Deal Owner': 'All Deal Owners',
    'Không tìm thấy agent phù hợp': 'No matching agent found',
    'Tìm hãng bảo hiểm...': 'Search carriers...',
    'Tất cả Carrier': 'All Carriers',
    'Không tìm thấy hãng phù hợp': 'No matching carrier found',
    'Tải lại dữ liệu': 'Reload data',
    'Thu gọn tất cả các cột': 'Collapse all columns',
    'Mở rộng tất cả các cột': 'Expand all columns',
    'Hiển thị ': 'Showing ',
    'Tải lại từ Database': 'Reload from Database',
    'Mở trong tab mới': 'Open in new tab',
    'Nhập tên view (vd: Quyen Le, Tri Tran - Deal)': 'Enter view name (e.g., Quyen Le, Tri Tran - Deal)',
    'View mới tạo sẽ bắt đầu trống. Bạn có thể chọn Deal Owner ở thanh công cụ để lọc danh sách deal cho agent đó.': 'Newly created view will be empty. You can select a Deal Owner in the toolbar to filter deals for that agent.',
    'Đã chọn Deal Owner: ': 'Selected Deal Owner: ',
    'Hiển thị các cột Kanban:': 'Show Kanban columns:',
    'Tất cả các Stage': 'All Stages',
    'Chỉ các Stage có Deal': 'Only Stages with Deals',
    'Nhấn vào thẻ deal để xem thông tin (tự mở tab mới)': 'Click deal card to view details (opens in new tab)',
    'Nhấn để mở rộng cột': 'Click to expand column',
    'Thu gọn cột': 'Collapse column',
    'Không có deal nào (Kéo thả vào đây)': 'No deals (Drag and drop here)',
    'Quay lại danh sách Task': 'Back to Task list',
    '-- Chọn Agent phụ trách --': '-- Select assigned Agent --',
    'Nhập nội dung công việc...': 'Enter task content...',
    'Chưa có nội dung chi tiết cho công việc này.': 'No detailed content for this task.',
    'Gửi bình luận': 'Post comment',
    'Tải lại': 'Reload',
    'Mã: ': 'Code: ',
    'ĐT: ': 'Tel: ',
    'Gán agent mới': 'Assign new agent',
    'Liên kết Deal mới': 'Link new Deal',
    'Nhấn để mở chi tiết Deal này': 'Click to view Deal details',
    'Giai đoạn: ': 'Stage: ',
    'Liên kết Ticket mới': 'Link new Ticket',
    'Chưa có customer document nào': 'No customer documents yet',
    'Bấm để xem và mở tệp trực tiếp': 'Click to view and open file directly',
    'Chế độ Agent: Chỉ hiển thị các Tasks công việc được giao cho': 'Agent Mode: Only showing Tasks assigned to',
    'tasks phụ trách': 'assigned tasks',
    'Thêm Company mới': 'Add new Company',
    'Liên kết': 'Linked',
    'Chỉnh sửa tiêu đề': 'Edit title',
    'Xóa tệp': 'Delete file',
    'Thêm liên hệ liên kết': 'Add linked contact',
    'Tất cả hãng hiện tại': 'All current carriers',
    'Tất cả agent hiện tại': 'All current agents',
    'Chế độ Agent: Chỉ hiển thị các Tickets được phân công cho': 'Agent Mode: Only showing Tickets assigned to',
    'tickets phụ trách': 'assigned tickets'
}

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if content != new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {os.path.basename(file_path)}')

print('Done.')
