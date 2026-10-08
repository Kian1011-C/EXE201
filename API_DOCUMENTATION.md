# InsurMatch Express API Documentation

Hệ thống API Backend là một dự án Java Spring Boot (sử dụng Maven, Hibernate/JPA).
Base URL: `http://localhost:8080` (hoặc URL khi deploy)

> **Lưu ý:** Các endpoint có *(Requires Auth)* yêu cầu truyền Token xác thực (thường là JWT hoặc thông qua middleware `requireAuth`).

## 1. Authentication & Health
- `GET /api/health` - Kiểm tra trạng thái server (Health Check).
- `POST /api/auth/register` - Đăng ký tài khoản.
- `POST /api/auth/login` - Đăng nhập tài khoản.
- `POST /api/auth/verify-otp` - Xác thực mã OTP.
- `POST /api/auth/resend-otp` - Gửi lại mã OTP.
- `POST /api/auth/logout` *(Requires Auth)* - Đăng xuất tài khoản.
- `GET /api/auth/me` *(Requires Auth)* - Lấy thông tin tài khoản hiện tại.
- `POST /api/auth/forgot-password` - Quên mật khẩu.
- `POST /api/auth/reset-password` - Đặt lại mật khẩu.
- `POST /api/auth/refresh-token` - Làm mới Token.
- `POST /api/auth/change-password` *(Requires Auth)* - Thay đổi mật khẩu người dùng hiện tại.

## 2. Contacts (Quản Lý Khách Hàng)
*(Requires Auth)*
- `GET /api/contacts` - Lấy danh sách khách hàng. Hỗ trợ query params: `search`, `owner`.
- `GET /api/contacts/:id` - Lấy chi tiết thông tin của 1 khách hàng (bằng `id` hoặc `code`), bao gồm deals, documents, tickets, activities, notes, tasks.
- `POST /api/contacts` - Tạo mới 1 khách hàng.
- `PUT /api/contacts/:id` - Cập nhật thông tin khách hàng.
- `DELETE /api/contacts/:id` - Xóa 1 khách hàng.
- `POST /api/contacts/:id/notes` - Thêm ghi chú (note) cho khách hàng.
- `POST /api/contacts/:id/tasks` - Thêm công việc (task) gắn với khách hàng.
- `GET /api/contacts/:id/activities` - Lấy danh sách hoạt động của khách hàng.
- `POST /api/contacts/:id/activities` - Thêm hoạt động cho khách hàng.
- `GET /api/contacts/:id/deals` - Lấy danh sách hợp đồng của khách hàng.
- `GET /api/contacts/:id/tickets` - Lấy danh sách sự vụ của khách hàng.
- `GET /api/contacts/:id/documents` - Lấy danh sách tài liệu của khách hàng.

## 3. Deals (Quản Lý Hợp Đồng/Cơ Hội)
*(Requires Auth)*
- `GET /api/deals` - Lấy danh sách deal. Hỗ trợ query params: `search`, `pipeline`, `stage`, `owner`.
- `GET /api/deals/:id` - Lấy chi tiết deal bao gồm contact, documents, tickets, notes, tasks.
- `POST /api/deals` - Tạo mới 1 deal.
- `PUT /api/deals/:id` - Cập nhật deal.
- `PUT /api/deals/{id}/stage` - Thay đổi trạng thái deal.

## 4. Tickets (Quản Lý Sự Vụ/Hỗ Trợ)
*(Requires Auth)*
- `GET /api/tickets` - Lấy danh sách ticket.
- `GET /api/tickets/:id` - Lấy chi tiết 1 ticket.
- `POST /api/tickets` - Tạo mới 1 ticket.
- `PUT /api/tickets/:id` - Cập nhật ticket.
- `POST /api/tickets/:id/comments` - Thêm bình luận vào ticket.
- `DELETE /api/tickets/:id` - Xóa 1 ticket.

## 5. Tasks (Quản Lý Công Việc)
*(Requires Auth)*
- `GET /api/tasks` - Lấy danh sách công việc.
- `GET /api/tasks/:id` - Lấy chi tiết 1 công việc.
- `POST /api/tasks` - Tạo công việc mới.
- `PUT /api/tasks/:id` - Cập nhật công việc.
- `DELETE /api/tasks/:id` - Xóa công việc.

## 6. Documents (Hồ Sơ & Tài Liệu)
- `GET /api/documents` - Lấy danh sách tài liệu.
- `GET /api/documents/:id` - Lấy thông tin document và danh sách file (theo ID document hoặc Contact ID).
- `POST /api/documents` - Tạo document mới.
- `PUT /api/documents/:id` - Sửa document.
- `POST /api/documents/:id/files` - Upload/lưu thông tin 1 file đính kèm vào document.
- `DELETE /api/documents/:docId/files/:fileId` - Xóa file trong document.

## 7. Commissions (Quản Lý Hoa Hồng)
*(Requires Auth)*
- `GET /api/commissions` - Lấy danh sách hoa hồng.
- `GET /api/commissions/summary` - Lấy báo cáo tổng hợp hoa hồng.
- `POST /api/commissions` - Tạo record hoa hồng mới.
- `POST /api/commissions/calculate` - Tính toán lại hoa hồng.
- `PUT /api/commissions/:id` - Cập nhật thông tin hoa hồng.

## 8. Quotes (Yêu Cầu Báo Giá)
- `POST /api/quotes` - Khách vãng lai submit form yêu cầu báo giá.

## 9. Dashboard
*(Requires Auth)*
- `GET /api/dashboard/stats` - Lấy thống kê cho màn hình Dashboard.

## 10. Admin Routes (Quản Trị Viên)
- `GET /api/admin/stats` - Lấy thống kê tổng quan (Admin).
- `GET /api/users` - Lấy danh sách người dùng.
- `GET /api/users/:id` - Lấy chi tiết 1 user.
- `GET /api/admin/accounts` *(Requires Admin)* - Lấy toàn bộ tài khoản nhân sự/đại lý.
- `POST /api/admin/accounts` *(Requires Admin)* - Tạo tài khoản mới.
- `PUT /api/admin/accounts/:id` *(Requires Admin)* - Cập nhật tài khoản.
- `GET /api/admin/quotes` - Lấy danh sách các yêu cầu báo giá.
- `PUT /api/admin/quotes/:id/assign` - Giao yêu cầu báo giá cho đại lý.
- `GET /api/admin/audit-logs` *(Requires Admin)* - Lấy lịch sử hoạt động hệ thống.

## 11. Upload (Quản Lý File)
- `POST /api/upload/image` - Upload hình ảnh.
- `POST /api/upload/avatar` - Upload ảnh đại diện.
- `POST /api/upload/document` - Upload tài liệu.
