import os
import glob

dir_path = r'd:\KI 8\EXE201\src\pages\dashboard\staff'
files = glob.glob(os.path.join(dir_path, '*.jsx'))

replacements = {
    'Chưa có customer document nào': 'No customer documents yet',
    'Bấm để xem và mở tệp trực tiếp': 'Click to view and open file directly',
    '-- Chọn Agent phụ trách --': '-- Select assigned Agent --',
    'Hệ thống tự động lưu mọi thông tin khi bạn điền. Bấm vào đây để lưu thủ công ngay.': 'The system automatically saves all information as you type. Click here to save manually now.',
    'Tự động lưu: Bật': 'Auto-save: ON',
    '-- Chưa chọn NPN --': '-- No NPN selected --',
    'Xóa Enrolled NPN': 'Remove Enrolled NPN',
    'Xóa ngày active': 'Remove active date',
    'Xóa ngày term': 'Remove term date',
    '-- Chưa chọn Deal Owner --': '-- No Deal Owner selected --',
    'Xóa Selling State': 'Remove Selling State',
    '-- Chưa chọn Carrier --': '-- No Carrier selected --',
    'Xóa Carrier': 'Remove Carrier',
    '-- Chưa chọn State --': '-- No State selected --',
    'Đã xuất Ticket Upload': 'Generated Upload Ticket',
    'Không xuất ticket upload': 'Do not generate upload ticket',
    'Tự động xuất ticket Upload document': 'Auto-generate Upload document ticket',
    '⚡ Khi chọn Yes, hệ thống tự động xuất 1 Ticket Upload document trong danh sách Tickets.': '⚡ If Yes is selected, the system auto-generates 1 Upload document Ticket.',
    '✓ Không xuất ticket upload tài liệu.': '✓ No document upload ticket will be generated.',
    '-- Chưa chọn --': '-- Not selected --',
    'Đã hoàn thành - Bấm để mở lại': 'Completed - Click to reopen',
    'Chưa xong - Bấm để đánh dấu hoàn thành': 'Incomplete - Click to mark complete',
    'Bấm vào để chỉnh sửa note': 'Click to edit note',
    'Chỉnh sửa Task Note': 'Edit Task Note',
    'Bấm "Lưu note" để hoàn tất': 'Click "Save note" to finish',
    'Nhập nội dung note cho task...': 'Enter note content for task...',
    'Hủy': 'Cancel',
    'Lưu note': 'Save note',
    'Bấm vào để sửa note': 'Click to edit note',
    'trong ứng dụng': 'in app',
    'có chỗ để note trong task': 'has space for notes in task',
    'Ghi chú và trao đổi trực tiếp trong task': 'Notes and direct discussion in task',
    'Nhập ghi chú hoặc comment vào task này...': 'Enter notes or comments for this task...',
    'Khách hàng': 'Customer',
    'Để tạo Ticket Upload: Chọn Need Upload = Yes': 'To create Upload Ticket: Select Need Upload = Yes',
    'Thêm ticket': 'Add ticket',
    'Đang làm mới danh sách Ticket...': 'Refreshing Ticket list...',
    'Chưa có ticket nào': 'No tickets yet',
    '⚡ Chọn mục <strong>Need Upload = Yes</strong> ở cột trái để tự động xuất Ticket Upload document.': '⚡ Select <strong>Need Upload = Yes</strong> on the left to auto-generate Upload document Ticket.',
    'Showing các cột Kanban:': 'Showing Kanban columns:',
    'Tất cả hãng bảo hiểm hiện tại': 'All current insurance carriers',
    'Xóa': 'Delete',
    'Tải lại': 'Reload',
    'Tìm hãng bảo hiểm...': 'Search insurance carriers...',
    'Không tìm thấy': 'Not found',
    'Tất cả Deal Owner': 'All Deal Owners',
    'Tất cả Carrier': 'All Carriers',
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
