# 📚 Tài Liệu API Backend — InsurMatch CRM

Hệ thống API RESTful Backend cho nền tảng **InsurMatch B2B SaaS CRM** (Spring Boot 3 + PostgreSQL).

---

## 📌 Mục Lục
1. [Thông Tin Chung & Cấu Hình Kết Nối](#1-thông-tin-chung--cấu-hình-kết-nối)
2. [Quy Chuẩn Phản Hồi (Response Format)](#2-quy-chuẩn-phản-hồi-response-format)
3. [Tài Khoản Mẫu (Demo Accounts)](#3-tài-khoản-mẫu-demo-accounts)
4. [Danh Sách Chi Tiết Các Phân Hệ API](#4-danh-sách-chi-tiết-các-phân-hệ-api)
   - [🔐 1. Xác Thực & Người Dùng (Auth & Profile)](#-1-xác-thực--người-dùng-auth--profile)
   - [👥 2. Quản Lý Khách Hàng (Contacts CRM)](#-2-quản-lý-khách-hàng-contacts-crm)
   - [💼 3. Hợp Đồng / Cơ Hội (Deals & Pipeline)](#-3-hợp-đồng--cơ-hội-deals--pipeline)
   - [🎫 4. Chăm Sóc Khách Hàng (Tickets & Helpdesk)](#-4-chăm-sóc-khách-hàng-tickets--helpdesk)
   - [⏱️ 5. Quản Lý Công Việc (Tasks)](#️-5-quản-lý-công-việc-tasks)
   - [💰 6. Hoa Hồng Đại Lý (Commissions)](#-6-hoa-hồng-đại-lý-commissions)
   - [📁 7. Hồ Sơ & Tài Liệu (Customer Documents)](#-7-hồ-sơ--tài-liệu-customer-documents)
   - [☁️ 8. Tải Lên Tệp & Ảnh (Upload Cloudinary)](#️-8-tải-lên-tệp--ảnh-upload-cloudinary)
   - [📋 9. Yêu Cầu Báo Giá (Quote Request / Leads)](#-9-yêu-cầu-báo-giá-quote-request--leads)
   - [📊 10. Báo Cáo Thống Kê (Dashboard)](#-10-báo-cáo-thống-kê-dashboard)
   - [⚙️ 11. Quản Trị Hệ Thống (Admin Management)](#️-11-quản-trị-hệ-thống-admin-management)
   - [👤 12. Quản Lý Danh Sách Thành Viên (Users)](#-12-quản-lý-danh-sách-thành-viên-users)
   - [🩺 13. Kiểm Tra Hệ Thống & Nạp Dữ Liệu (Health & Seed)](#-13-kiểm-tra-hệ-thống--nạp-dữ-liệu-health--seed)

---

## 1. Thông Tin Chung & Cấu Hình Kết Nối

* **Production URL (Render):** `https://insurmatch-api.onrender.com/api`
* **Localhost URL:** `http://localhost:8080/api`
* **Cơ chế xác thực:** JSON Web Token (JWT Bearer Token).
* **Header xác thực (đối với các API yêu cầu đăng nhập):**
  ```http
  Authorization: Bearer <access_token>
  ```
* **CORS:** Đã kích hoạt cho tất cả các origins (`allowedOriginPatterns: *`), hỗ trợ các header và HTTP methods thông dụng (`GET, POST, PUT, DELETE, OPTIONS, PATCH`).

---

## 2. Quy Chuẩn Phản Hồi (Response Format)

Hầu hết các API đều trả về dạng JSON bọc trong đối tượng chuẩn `ApiResponse<T>`:

```json
{
  "success": true,
  "message": "Thông điệp thành công hoặc thông báo lỗi",
  "data": { ... } // hoặc mảng [...]
}
```

---

## 3. Tài Khoản Mẫu (Demo Accounts)

Sau khi gọi API nạp dữ liệu mẫu `POST /api/seed`, hệ thống có sẵn các tài khoản sau:

| Vai trò (Role) | Email | Mật khẩu | Quyền hạn |
|:---|:---|:---|:---|
| **ADMIN** | `admin@insurmatch.us` | `Admin@123` | Quản trị toàn hệ thống, tạo tài khoản, xem audit logs, phân bổ lead |
| **STAFF** | `staff@insurmatch.us` | `Staff@123` | Nhân viên CSKH, xử lý tickets, kiểm tra hồ sơ chứng từ |
| **AGENT** | `agent@insurmatch.us` | `Agent@123` | Đại lý bảo hiểm, quản lý contacts cá nhân, deals, hoa hồng |
| **MANAGER** | `manager@insurmatch.us` | `Manager@123` | Quản lý nhóm đại lý, theo dõi báo cáo doanh thu |

---

## 4. Danh Sách Chi Tiết Các Phân Hệ API

### 🔐 1. Xác Thực & Người Dùng (Auth & Profile)
*Prefix:* `/api/auth` — *Controller:* `AuthController.java`

| Method | Endpoint | Quyền hạn | Mô tả |
|:---|:---|:---|:---|
| `POST` | `/api/auth/register` | Public | Đăng ký tài khoản mới qua Email, tự động tạo mã OTP 6 số (hạn 5 phút). Trả về `devOtp` để test nhanh. |
| `POST` | `/api/auth/verify-otp` | Public | Xác thực mã OTP để kích hoạt tài khoản & cấp JWT Token đăng nhập ngay. |
| `POST` | `/api/auth/resend-otp` | Public | Gửi lại mã OTP mới khi mã cũ hết hạn. |
| `POST` | `/api/auth/login` | Public | Đăng nhập bằng Email & Mật khẩu -> Trả về Access Token, Refresh Token và thông tin User. |
| `POST` | `/api/auth/logout` | Đã đăng nhập | Đăng xuất, xóa Security Context. |
| `GET` | `/api/auth/me` | Bearer Token | Lấy thông tin tài khoản hiện tại từ JWT Token. |
| `POST` | `/api/auth/forgot-password`| Public | Yêu cầu quên mật khẩu, hệ thống gửi OTP về email. |
| `POST` | `/api/auth/reset-password` | Public | Đặt lại mật khẩu mới bằng mã OTP. |
| `POST` | `/api/auth/change-password`| Bearer Token | Đổi mật khẩu (dành cho user đang đăng nhập). |
| `POST` | `/api/auth/refresh-token` | Public | Cấp lại Access Token mới khi dùng Refresh Token. |

#### Ví dụ Body:
* **Đăng ký (`POST /api/auth/register`):**
  ```json
  {
    "email": "agent.nguyen@example.com",
    "password": "Password@123",
    "firstName": "Văn A",
    "lastName": "Nguyễn",
    "phone": "0901234567",
    "npn": "NPN987654",
    "role": "AGENT"
  }
  ```
* **Kích hoạt OTP (`POST /api/auth/verify-otp`):**
  ```json
  {
    "email": "agent.nguyen@example.com",
    "otp": "123456"
  }
  ```
* **Đăng nhập (`POST /api/auth/login`):**
  ```json
  {
    "email": "agent@insurmatch.us",
    "password": "Agent@123"
  }
  ```

---

### 👥 2. Quản Lý Khách Hàng (Contacts CRM)
*Prefix:* `/api/contacts` — *Controller:* `ContactController.java`

| Method | Endpoint | Quyền hạn | Mô tả |
|:---|:---|:---|:---|
| `GET` | `/api/contacts` | Bearer Token | Lấy danh sách khách hàng. Hỗ trợ Query Params: `search`, `owner`. |
| `GET` | `/api/contacts/{id}` | Bearer Token | Lấy chi tiết thông tin cơ bản của một khách hàng. |
| `GET` | `/api/contacts/{id}/detail` | Bearer Token | **Góc nhìn 360°:** Trả về contact kèm toàn bộ Notes, Tasks, Activities, Deals, Tickets, Documents. |
| `POST` | `/api/contacts` | Bearer Token | Tạo mới khách hàng CRM. |
| `PUT` | `/api/contacts/{id}` | Bearer Token | Cập nhật thông tin khách hàng. |
| `DELETE` | `/api/contacts/{id}` | Bearer Token | Xóa khách hàng. |
| `GET` | `/api/contacts/{id}/notes` | Bearer Token | Xem danh sách ghi chú của khách hàng. |
| `POST` | `/api/contacts/{id}/notes` | Bearer Token | Thêm ghi chú mới cho khách hàng. |
| `GET` | `/api/contacts/{id}/tasks` | Bearer Token | Xem danh sách công việc liên quan tới khách hàng. |
| `POST` | `/api/contacts/{id}/tasks` | Bearer Token | Thêm công việc mới cho khách hàng. |
| `GET` | `/api/contacts/{id}/activities` | Bearer Token | Lấy lịch sử hoạt động (cuộc gọi, họp, email) của khách hàng. |
| `POST` | `/api/contacts/{id}/activities` | Bearer Token | Ghi nhận một tương tác/hoạt động mới. |
| `GET` | `/api/contacts/{id}/deals` | Bearer Token | Xem các hợp đồng bảo hiểm thuộc về khách hàng này. |
| `GET` | `/api/contacts/{id}/tickets` | Bearer Token | Xem các ticket hỗ trợ liên quan đến khách hàng. |
| `GET` | `/api/contacts/{id}/documents` | Bearer Token | Xem danh sách hồ sơ đính kèm của khách hàng. |

---

### 💼 3. Hợp Đồng / Cơ Hội (Deals & Pipeline)
*Prefix:* `/api/deals` — *Controller:* `DealController.java`

| Method | Endpoint | Quyền hạn | Mô tả |
|:---|:---|:---|:---|
| `GET` | `/api/deals` | Bearer Token | Lấy danh sách hợp đồng (hỗ trợ lọc: `search`, `stage`, `pipeline`, `carrier`, `owner`). |
| `GET` | `/api/deals/{id}` | Bearer Token | Xem chi tiết một hợp đồng bảo hiểm. |
| `POST` | `/api/deals` | Bearer Token | Tạo mới một hợp đồng/cơ hội bảo hiểm. |
| `PUT` | `/api/deals/{id}` | Bearer Token | Cập nhật thông tin hợp đồng. |
| `PUT` | `/api/deals/{id}/stage` | Bearer Token | Kéo thả Kanban cập nhật giai đoạn (New, Contacted, Quoted, Enrolled, Bound, Closed). |
| `POST` | `/api/deals/{id}/notes` | Bearer Token | Thêm ghi chú vào Deal. |
| `POST` | `/api/deals/{id}/tasks` | Bearer Token | Thêm nhắc việc vào Deal. |
| `GET` | `/api/deals/{id}/activities` | Bearer Token | Lấy dòng thời gian hoạt động của Deal. |

---

### 🎫 4. Chăm Sóc Khách Hàng (Tickets & Helpdesk)
*Prefix:* `/api/tickets` — *Controller:* `TicketController.java`

| Method | Endpoint | Quyền hạn | Mô tả |
|:---|:---|:---|:---|
| `GET` | `/api/tickets` | Bearer Token | Lấy danh sách Ticket (hỗ trợ lọc: `pipeline`, `status`, `priority`, `contactId`, `dealId`). |
| `GET` | `/api/tickets/{id}` | Bearer Token | Xem chi tiết sự vụ chăm sóc khách hàng. |
| `POST` | `/api/tickets` | Bearer Token | Tạo Ticket hỗ trợ mới (Claim bill, Chọn bác sĩ, Thanh toán...). |
| `PUT` | `/api/tickets/{id}` | Bearer Token | Cập nhật trạng thái (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`). |
| `POST` | `/api/tickets/{id}/comments` | Bearer Token | Bình luận / trao đổi nội bộ về Ticket. |
| `GET` | `/api/tickets/{id}/comments` | Bearer Token | Lấy lịch sử thảo luận của Ticket. |
| `DELETE` | `/api/tickets/{id}` | Bearer Token | Xóa Ticket. |

---

### ⏱️ 5. Quản Lý Công Việc (Tasks)
*Prefix:* `/api/tasks` — *Controller:* `TaskController.java`

| Method | Endpoint | Quyền hạn | Mô tả |
|:---|:---|:---|:---|
| `GET` | `/api/tasks` | Bearer Token | Lấy danh sách công việc (hỗ trợ lọc: `status`, `priority`, `assignedTo`, `contactId`, `dealId`, `ticketId`). |
| `GET` | `/api/tasks/{id}` | Bearer Token | Chi tiết công việc. |
| `POST` | `/api/tasks` | Bearer Token | Tạo công việc mới kèm ngày hết hạn (due date). |
| `PUT` | `/api/tasks/{id}` | Bearer Token | Cập nhật nội dung / đánh dấu hoàn thành (`DONE`). |
| `DELETE` | `/api/tasks/{id}` | Bearer Token | Xóa công việc. |

---

### 💰 6. Hoa Hồng Đại Lý (Commissions)
*Prefix:* `/api/commissions` — *Controller:* `CommissionController.java`

| Method | Endpoint | Quyền hạn | Mô tả |
|:---|:---|:---|:---|
| `GET` | `/api/commissions` | Bearer Token | Danh sách chi trả hoa hồng (lọc: `agentName`, `period`, `status`, `carrier`). |
| `GET` | `/api/commissions/summary` | Bearer Token | Thống kê tổng hợp Gross Amount, Net Amount theo Đại lý. |
| `POST` | `/api/commissions` | Bearer Token | Nhập khoản hoa hồng nhận từ Hãng bảo hiểm đối soát. |
| `PUT` | `/api/commissions/{id}` | Bearer Token | Cập nhật trạng thái duyệt chi (`PENDING`, `APPROVED`, `PAID`). |
| `POST` | `/api/commissions/calculate` | Bearer Token | Tự động tính toán hoa hồng theo hợp đồng và chính sách. |

---

### 📁 7. Hồ Sơ & Tài Liệu (Customer Documents)
*Prefix:* `/api/documents` — *Controller:* `DocumentController.java`

| Method | Endpoint | Quyền hạn | Mô tả |
|:---|:---|:---|:---|
| `GET` | `/api/documents` | Bearer Token | Lấy danh mục hồ sơ tài liệu (lọc theo `contactId`, `owner`). |
| `GET` | `/api/documents/{id}` | Bearer Token | Xem chi tiết một hồ sơ tài liệu. |
| `POST` | `/api/documents` | Bearer Token | Tạo một mục hồ sơ mới (gắn với `contactId`). |
| `PUT` | `/api/documents/{id}` | Bearer Token | Cập nhật thông tin mục hồ sơ. |
| `POST` | `/api/documents/{docId}/files` | Bearer Token | Thêm file đính kèm vào hồ sơ. |
| `DELETE` | `/api/documents/{docId}/files/{fileId}` | Bearer Token | Xóa một tệp đính kèm. |

---

### ☁️ 8. Tải Lên Tệp & Ảnh (Upload Cloudinary)
*Prefix:* `/api/upload` — *Controller:* `UploadController.java`

| Method | Endpoint | Headers | Mô tả |
|:---|:---|:---|:---|
| `POST` | `/api/upload/image` | `multipart/form-data` | Tải ảnh tổng quát lên Cloudinary (tuỳ chọn `folder`, mặc định `insurmatch`). |
| `POST` | `/api/upload/avatar` | `multipart/form-data` | Tải ảnh đại diện (lưu tại thư mục `insurmatch/avatars`). |
| `POST` | `/api/upload/document` | `multipart/form-data` | Tải ảnh chứng từ/CCCD (lưu tại thư mục `insurmatch/documents`). |
| `DELETE` | `/api/upload?publicId=...` | Bearer Token | Xóa ảnh/tệp khỏi Cloudinary bằng `publicId`. |

---

### 📋 9. Yêu Cầu Báo Giá (Quote Request / Leads)
*Prefix:* `/api/quotes` — *Controller:* `QuoteController.java`

| Method | Endpoint | Quyền hạn | Mô tả |
|:---|:---|:---|:---|
| `POST` | `/api/quotes` | Public | Khách vãng lai gửi yêu cầu báo giá bảo hiểm từ trang Web Intake Form (Zip code, Loại bảo hiểm ACA/Medicare/Life, Thu nhập, Thành viên...). |

---

### 📊 10. Báo Cáo Thống Kê (Dashboard)
*Prefix:* `/api/dashboard` — *Controller:* `DashboardController.java`

| Method | Endpoint | Quyền hạn | Mô tả |
|:---|:---|:---|:---|
| `GET` | `/api/dashboard/stats` | Bearer Token | Lấy chỉ số tổng quan: Tổng số lượng Contacts, Deals, Tickets, Quotes, New Quotes. |

---

### ⚙️ 11. Quản Trị Hệ Thống (Admin Management)
*Prefix:* `/api/admin` — *Controller:* `AdminController.java`
*(Yêu cầu người dùng đăng nhập tài khoản có Role = `ADMIN`)*

| Method | Endpoint | Quyền hạn | Mô tả |
|:---|:---|:---|:---|
| `GET` | `/api/admin/stats` | Role `ADMIN` | Thống kê chỉ số cấp cao toàn sàn (Tổng User, Contacts, Deals, Tickets, Quotes). |
| `GET` | `/api/admin/accounts` | Role `ADMIN` | Danh sách toàn bộ tài khoản nhân viên & đại lý trong hệ thống. |
| `POST` | `/api/admin/accounts` | Role `ADMIN` | Khởi tạo tài khoản Agent/Staff mới, tự tạo mật khẩu an toàn và tự động gửi email chào mừng. |
| `PUT` | `/api/admin/accounts/{id}` | Role `ADMIN` | Cập nhật trạng thái duyệt NPN, đình chỉ (Suspend) hoặc kích hoạt tài khoản. |
| `GET` | `/api/admin/quotes` | Role `ADMIN` | Xem danh sách các Lead yêu cầu báo giá gửi về từ website. |
| `PUT` | `/api/admin/quotes/{id}/assign`| Role `ADMIN` | Phân bổ/chỉ định Lead cho một Agent chăm sóc (Body: `{ "agentId": 1 }`). |
| `GET` | `/api/admin/audit-logs` | Role `ADMIN` | Xem nhật ký kiểm toán hệ thống (Audit Logs) các hành động quan trọng. |

---

### 👤 12. Quản Lý Danh Sách Thành Viên (Users)
*Prefix:* `/api/users` — *Controller:* `UserController.java`

| Method | Endpoint | Quyền hạn | Mô tả |
|:---|:---|:---|:---|
| `GET` | `/api/users` | Bearer Token | Lấy danh sách toàn bộ người dùng trong hệ thống. |
| `GET` | `/api/users/{id}` | Bearer Token | Lấy thông tin người dùng theo ID. |

---

### 🩺 13. Kiểm Tra Hệ Thống & Nạp Dữ Liệu (Health & Seed)
*Prefix:* `/api` — *Controllers:* `HealthController.java`, `SeedController.java`

| Method | Endpoint | Quyền hạn | Mô tả |
|:---|:---|:---|:---|
| `GET` | `/api/health` | Public | Kiểm tra trạng thái máy chủ Backend và kết nối cơ sở dữ liệu PostgreSQL. |
| `POST` | `/api/seed` | Public | Reset và nạp toàn bộ dữ liệu mẫu (Tài khoản, Contacts, Deals, Tickets, Tasks...) phục vụ test/demo. |
