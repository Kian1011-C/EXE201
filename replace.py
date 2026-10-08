import os
import glob
import re

dir_path = r'd:\KI 8\EXE201\src\pages\dashboard\staff'
files = glob.glob(os.path.join(dir_path, '*.jsx'))

replacements = {
    'Tính năng đang được phát triển!': 'Feature coming soon!',
    'Đã sao chép liên kết deal!': 'Deal link copied!',
    'Đã chọn Deal Owner: ': 'Selected Deal Owner: ',
    'Đã thêm view ': 'Added view ',
    ' Chọn Deal Owner để xem danh sách deals.': ' Select Deal Owner to view deals list.',
    'Đã xóa view tùy chỉnh': 'Custom view deleted',
    'Đã chọn Hãng: ': 'Selected Carrier: ',
    'Đã chuyển trạng thái deal sang: ': 'Deal status changed to: ',
    'Xóa view này': 'Delete this view',
    'Xóa bộ lọc Deal Owner': 'Clear Deal Owner filter',
    'Xóa bộ lọc Carrier': 'Clear Carrier filter',
    'Đã tạo Deal ': 'Deal created ',
    ' và tự động xuất Ticket Upload document!': ' and auto-generated Upload Document ticket!',
    ' thành công!': ' successfully!',
    'Đã đánh dấu hoàn thành công việc!': 'Task marked as completed!',
    'Đã mở lại công việc (OPEN)': 'Task reopened (OPEN)',
    'Đã cập nhật tiêu đề!': 'Title updated!',
    'Đã lưu nội dung công việc!': 'Task content saved!',
    'Đã cập nhật ': 'Updated ',
    'Đã thêm bình luận mới!': 'New comment added!',
    'Đã đính kèm tệp: ': 'File attached: ',
    'Đã xóa tệp đính kèm': 'Attachment deleted',
    'Đã làm mới dữ liệu task!': 'Task data refreshed!',
    'Chỉnh sửa tiêu đề': 'Edit title',
    'Xóa tệp': 'Delete file',
    'Thêm Company mới': 'Add new Company',
    'title=\"Thêm\"': 'title=\"Add\"',
    'Đã tải lại': 'Reloaded',
    'Thêm liên hệ liên kết': 'Add linked contact',
    'Đã tải lên đủ 4/4 tài liệu bắt buộc! Trạng thái ticket đã chuyển sang': 'Uploaded 4/4 required documents! Ticket status changed to',
    'Đã tải lên: ': 'Uploaded: ',
    ' tài liệu bắt buộc': ' required documents',
    'Lỗi khi tải file: ': 'Error uploading file: ',
    'Bạn có chắc muốn xóa file': 'Are you sure you want to delete file',
    'Đã xóa tài liệu của danh mục': 'Deleted document in category',
    'Đã xóa file: ': 'File deleted: ',
    'Xóa tài liệu': 'Delete document',
    'Tài liệu đã được tải lên máy chủ. Bạn có thể tải file về để xem chi tiết.': 'Document uploaded to server. You can download the file to view details.'
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
