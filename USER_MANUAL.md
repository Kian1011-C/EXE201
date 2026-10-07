# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG INSURMATCH (USER MANUAL)
### DỰ ÁN KHỞI NGHIỆP: NỀN TẢNG KẾT NỐI & VẬN HÀNH BẢO HIỂM INSURMATCH
**Môn học:** EXE201 — Khởi sự doanh nghiệp (Fall 2026)  
**Giảng viên phụ trách:** ThS. Nguyễn Thị Trà Minh  
**Mục tiêu bàn giao:** Outcome 1 (MVP Submission & Presentation)  
**Phiên bản tài liệu:** v1.0 (Tháng 10/2026)  

---

## MỤC LỤC
1. [Giới thiệu tổng quan hệ thống](#1-giới-thiệu-tổng-quan-hệ-thống)
2. [Thông tin tài khoản kiểm thử (Demo Credentials)](#2-thông-tin-tài-khoản-kiểm-thử-demo-credentials)
3. [Phần 1: Hướng dẫn dành cho Khách hàng (Customer Portal)](#3-phần-1-hướng-dẫn-dành-cho-khách-hàng-customer-portal)
4. [Phần 2: Hướng dẫn dành cho Điều phối viên (Staff CRM Hub)](#4-phần-2-hướng-dẫn-dành-cho-điều-phối-viên-staff-crm-hub)
5. [Phần 3: Hướng dẫn dành cho Đại lý bảo hiểm (Licensed Agent Portal)](#5-phần-3-hướng-dẫn-dành-cho-đại-lý-bảo-hiểm-licensed-agent-portal)
6. [Phần 4: Hướng dẫn dành cho Quản trị viên (Admin Governance)](#6-phần-4-hướng-dành-cho-quản-trị-viên-admin-governance)
7. [Kịch bản Demo chuẩn luồng cho Outcome 1](#7-kịch-bản-demo-chuẩn-luồng-cho-outcome-1)
8. [Câu hỏi thường gặp & Xử lý sự cố (Troubleshooting)](#8-câu-hỏi-thường-gặp--xử-lý-sự-cố-troubleshooting)

---

## 1. GIỚI THIỆU TỔNG QUAN HỆ THỐNG

**InsurMatch** là nền tảng số kết nối cộng đồng người Việt tại Hoa Kỳ với các đại lý bảo hiểm độc lập được cấp phép (Licensed Independent Agents). Hệ thống giải quyết rào cản ngôn ngữ và sự phức tạp của thị trường bảo hiểm y tế Hoa Kỳ (Obamacare/ACA, Medicare, Life Insurance), đồng thời cung cấp giải pháp CRM chuyên sâu hỗ trợ đại lý tự động hóa khâu thẩm định hồ sơ, quản lý thanh toán nợ phí và tính toán hoa hồng.

Hệ thống được thiết kế theo kiến trúc **Role-Based Access Control (RBAC)** với 4 vai trò độc lập:
* **Khách hàng (Customer / Lead):** Tiếp cận thông tin minh bạch, tính toán trợ cấp thuế liên bang và gửi yêu cầu tư vấn ẩn danh.
* **Điều phối viên (Staff / Operations):** Thẩm định thông tin, tạo hồ sơ liên hệ (Contact), gán Agent phụ trách, điều phối quy trình Deal và xử lý Ticket hậu mãi.
* **Đại lý độc lập (Agent - Khanh Nguyen):** Tiếp nhận khách hàng theo phân quyền riêng biệt (Data Scoping), theo dõi tiến độ hợp đồng và tự động đối soát hoa hồng (Commission Ledger).
* **Quản trị viên (Super Admin):** Giám sát bảo mật, xác thực giấy phép NPN của đại lý và theo dõi chỉ số tăng trưởng toàn sàn.

---

## 2. THÔNG TIN TÀI KHOẢN KIỂM THỬ (DEMO CREDENTIALS)

Để phục vụ công tác chấm thi và đánh giá Outcome 1, hệ thống đã được cấu hình sẵn 3 tài khoản mẫu ứng với các vai trò nội bộ:

| Vai trò (Role) | Email đăng nhập | Mật khẩu mặc định | Tên hiển thị | Quyền hạn chính |
|---|---|---|---|---|
| **Customer** | *(Không cần đăng nhập)* | *(Công khai)* | Khách vãng lai | Lấy báo giá, gửi yêu cầu kết nối đại lý |
| **Staff** | `staff@insurmatch.us` | `Staff123!` | Anya Nguyen | Quản lý toàn bộ Contacts, Deals, Tickets, Tasks, Documents |
| **Agent** | `agent@insurmatch.us` | `Agent123!` | Khanh Nguyen | Chỉ xem Contact/Deal được phân công, Bảng tính hoa hồng cá nhân |
| **Admin** | `admin@insurmatch.us` | `Admin123!` | Super Admin | Phê duyệt Agent, Quản lý tài khoản, Xem Analytics toàn hệ thống |

> **Lưu ý bảo mật:** Hệ thống sử dụng cơ chế JWT Token xác thực tự động kèm hạn sử dụng 8 giờ. Mọi thao tác ghi dữ liệu đều được kiểm tra phân quyền thời gian thực.

---

## 3. PHẦN 1: HƯỚNG DẪN DÀNH CHO KHÁCH HÀNG (CUSTOMER PORTAL)

### 3.1. Truy cập Trang chủ & Tra cứu gói bảo hiểm
1. Khách hàng truy cập vào trang chủ **InsurMatch**.
2. Menu điều hướng gồm các hạng mục:
   * **Programs:** Thông tin chi tiết về *ACA Health Insurance*, *Medicare Advantage (Part C & D)*, *Life & Annuity*.
   * **Carriers:** Danh sách các hãng bảo hiểm liên kết uy tín tại Mỹ (BCBS, Ambetter, Molina, Kaiser, UnitedHealthcare, Humana...).
   * **Agent Directory:** Tra cứu danh bạ các đại lý người Việt được cấp phép theo từng bang (California, Texas, North Carolina, Florida...).

### 3.2. Quy trình Lấy báo giá miễn phí (Get a Free Quote Flow)
1. Tại Trang chủ hoặc thanh Header, bấm nút **"Get a Free Quote"** hoặc **"Bắt đầu ngay"**.
2. Modal tính toán báo giá đa bước sẽ hiển thị:
   * **Bước 1 (Thông tin cơ bản):** Chọn loại bảo hiểm mong muốn (ACA Obamacare / Medicare / Bảo hiểm nhân thọ) và chọn Tiểu bang cư trú (ví dụ: Texas, California...).
   * **Bước 2 (Thông tin hộ gia đình):** Nhập số lượng thành viên, độ tuổi và mức thu nhập ước tính hàng năm (Annual Household Income).
   * **Bước 3 (Liên hệ):** Nhập Họ tên, Số điện thoại và Email.
3. Bấm **"Gửi yêu cầu kết nối" (Submit Request)**:
   * Hệ thống tự động tính mức trợ cấp thuế liên bang (Federal Tax Subsidy).
   * Tạo một mã yêu cầu tư vấn mới (Mã định dạng `INQ2600xxxx`) và lưu trực tiếp vào cơ sở dữ liệu để Staff xử lý.

---

## 4. PHẦN 2: HƯỚNG DẪN DÀNH CHO ĐIỀU PHỐI VIÊN (STAFF CRM HUB)

Điều phối viên là trung tâm vận hành hồ sơ của InsurMatch.

### 4.1. Đăng nhập cổng Staff
1. Truy cập trang `/login`.
2. Nhập Email: `staff@insurmatch.us` và Mật khẩu: `Staff123!`.
3. Bấm **"Đăng nhập"** -> Hệ thống chuyển hướng vào **Staff Dashboard**.

### 4.2. Quản lý Danh bạ Khách hàng (Contacts Hub)
1. **Xem danh sách liên hệ:**
   * Truy cập mục **Contacts** trên thanh menu bên trái.
   * Giao diện hiển thị bảng danh sách liên hệ với đầy đủ thông tin: Mã khách hàng (`code`), Họ tên, Số điện thoại, Bang, Ngôn ngữ và Người phụ trách (`Contact Owner`).
2. **Tìm kiếm & Lọc dữ liệu:**
   * Ô tìm kiếm hỗ trợ tìm theo Họ tên, Số điện thoại hoặc Mã Contact.
   * Dropdown lọc theo `Contact Owner`: Hỗ trợ lọc xem tất cả hoặc xem riêng hồ sơ thuộc đại lý **Khanh Nguyen**.
3. **Tạo mới Liên hệ (+ Create Contact):**
   * Bấm nút **"+ Create"** ở góc phải trên.
   * Điền thông tin bắt buộc: Họ, Tên, Số điện thoại, Email, Bang cư trú.
   * Mục **Contact Owner**: Chọn đại lý phụ trách (chọn `Khanh Nguyen`).
   * Bấm **"Save Contact"**: Dữ liệu được lưu vĩnh viễn vào PostgreSQL và hiển thị ngay trên bảng.
4. **Chi tiết hồ sơ khách hàng (Contact Detail):**
   * Bấm vào bất kỳ dòng Contact nào để mở trang chi tiết 3 cột:
     * *Cột trái:* Thông tin định danh cá nhân (Primary Info: Ngày sinh, SSN, Tình trạng định cư).
     * *Cột giữa:* Lịch sử tương tác, Hoạt động gọi điện/ghi chú (Activities & Notes).
     * *Cột phải:* Các Deal liên kết, Ticket khiếu nại và Hồ sơ giấy tờ (Attached Documents).

### 4.3. Quản lý Quy trình Hợp đồng (Deals Pipeline)
1. Truy cập mục **Deals**.
2. Hỗ trợ 2 chế độ hiển thị:
   * **Chế độ Kanban:** Kéo thả Deal trực quan qua các giai đoạn:
     * *New Inquiry* (Yêu cầu mới) -> *Appointment Scheduled* (Đã hẹn tư vấn) -> *Ready to Enroll* (Sẵn sàng nộp đơn) -> *Policy Issued* (Hợp đồng được cấp) -> *Active* (Đang hiệu lực).
   * **Chế độ List (Bảng):** Xem chi tiết giá trị hợp đồng, hãng bảo hiểm (`Carrier`), Bang bán và Mã NPN của đại lý.
3. **Tạo mới Deal (+ Add Deal):**
   * Bấm **"+ Add Deal"**, chọn liên hệ khách hàng, chọn Pipeline (`Obamacare 2026` hoặc `Medicare 2026`), hãng bảo hiểm và người phụ trách (`Deal Owner`).

### 4.4. Quản lý 5 Quy trình Hậu mãi (Post-sale Tickets)
InsurMatch tích hợp sẵn 5 quy trình nghiệp vụ hậu mãi bắt buộc của thị trường bảo hiểm Hoa Kỳ:
1. **Client Support:** Tiếp nhận khiếu nại, giải quyết claim bill bồi thường.
2. **Payment:** Theo dõi thanh toán tiền phí bảo hiểm định kỳ ngày 15 hàng tháng.
3. **Collect Document:** Yêu cầu khách bổ sung thẻ xanh, bằng lái, chứng minh thu nhập nộp Marketplace.
4. **Choose Doctor:** Hỗ trợ đăng ký hoặc đổi bác sĩ gia đình (Primary Care Physician - PCP).
5. **Agent Support:** Tiếp nhận yêu cầu hỗ trợ đặc biệt từ đại lý.

* **Quy tắc vận hành nghiêm ngặt:**
  * **Đổi hạn xử lý (Change Due Date):** Khi dời ngày hẹn, hệ thống bắt buộc nhập *Lý do thay đổi hạn (Change Due Date Reason)* để đảm bảo tính minh bạch.
  * **Đóng Ticket (Close Ticket):** Bắt buộc phải nhập *Kết quả xử lý (Ticket Result)* trước khi chuyển trạng thái sang `Closed`.

### 4.5. Quản lý Công việc (Tasks) & Tài liệu (Customer Documents)
* **Tasks Hub:** Tự động tính hạn chót 3 ngày làm việc (3 business days), cảnh báo màu đỏ khi quá hạn (`Overdue`).
* **Customer Documents:** Nơi lưu trữ an toàn các file PDF, ảnh chụp ID, Consent Form và bảo hiểm của khách hàng.

---

## 5. PHẦN 3: HƯỚNG DẪN DÀNH CHO ĐẠI LÝ BẢO HIỂM (LICENSED AGENT PORTAL)

Dành cho đại lý bảo hiểm độc lập (tài khoản mẫu: **Khánh Nguyễn**).

### 5.1. Đăng nhập & Phạm vi Dữ liệu Bảo mật (Data Scoping)
1. Đăng nhập với tài khoản: `agent@insurmatch.us` / `Agent123!`.
2. **Cơ chế cô lập dữ liệu:**
   * Agent **chỉ nhìn thấy các Contacts và Deals được gán cho chính mình (Khánh Nguyễn)**.
   * Banner thông báo màu xanh dương: *"Chế độ Agent: Chỉ hiển thị các Contact được phân công cho Khanh Nguyen"*.
   * Không thể can thiệp hay xem trộm khách hàng của các đại lý khác.

### 5.2. Quản lý Hoa hồng Đại lý (Commission Ledger & Calculator)
1. **Bảng tổng kết hoa hồng (Commission Summary):**
   * Hiển thị tổng số tiền đã quyết toán trong tháng (*Settled This Month*).
   * Số hợp đồng đang chờ kiểm toán đối soát (*Pending Audit*).
   * Lũy kế hoa hồng từ đầu năm (*YTD Paid*).
2. **Quy tắc hoa hồng SSS Rules Engine:**
   * Hoa hồng được tính toán tự động dựa trên đơn giá chuẩn theo hãng bảo hiểm ($/thành viên/tháng):
     * **BCBS:** $30.00 / member / mo
     * **Ambetter:** $32.00 / member / mo
     * **Humana:** $51.00 / member / mo
     * **UnitedHealthcare / Oscar:** $30.00 / member / mo
     * **Molina:** $29.00 / member / mo
3. **Mô phỏng hoa hồng (Commission Simulator):**
   * Cho phép đại lý tự nhập số thành viên gia đình, hãng bảo hiểm và mức phí để tính ngay số tiền thực nhận (Net Agent Payout).

---

## 6. PHẦN 4: HƯỚNG DẪN DÀNH CHO QUẢN TRỊ VIÊN (ADMIN GOVERNANCE)

Dành cho ban quản trị vận hành sàn InsurMatch.

### 6.1. Đăng nhập Admin Hub
* Đăng nhập với tài khoản: `admin@insurmatch.us` / `Admin123!`.

### 6.2. Phê duyệt & Cấp phép Đại lý (Agent Verification)
1. Truy cập tab **Accounts**:
   * Xem danh sách toàn bộ nhân sự và đại lý trong hệ thống.
2. Đại lý mới đăng ký sẽ ở trạng thái `Pending` (Chờ thẩm định).
3. Admin kiểm tra số giấy phép quốc gia NPN (7 - 8 chữ số):
   * Bấm duyệt trạng thái sang `Active` để cấp quyền cho đại lý đăng nhập và nhận lead.
   * Hỗ trợ tạm ngừng tài khoản (`Suspend`) nếu phát hiện vi phạm quy tắc đạo đức bảo hiểm.

### 6.3. Báo cáo & Thống kê Tăng trưởng (System Analytics)
* Biểu đồ tỷ lệ cơ cấu hãng bảo hiểm (Carrier Volume Distribution).
* Thống kê số lượng hợp đồng phát hành theo từng tiểu bang (Texas, California, North Carolina...).
* Báo cáo doanh số và tỷ lệ giữ lại của văn phòng (Office Retention Rate).

---

## 7. KỊCH BẢN DEMO CHUẨN LUỒNG CHO OUTCOME 1 (5 BƯỚC)

Khi trình bày trước hội đồng thẩm định Outcome 1, nhóm thực hiện theo kịch bản mẫu sau trong 5 - 7 phút:

```
[BƯỚC 1: KHÁCH HÀNG] 
Trang chủ -> Bấm "Get a Free Quote" -> Nhập tên "Trần Văn An", chọn bang "Texas", bảo hiểm "ACA" -> Gửi thành công.
       ↓
[BƯỚC 2: ĐIỀU PHỐI VIÊN STAFF]
Đăng nhập staff@insurmatch.us -> Vào mục Contacts -> Thấy khách hàng "Trần Văn An" vừa gửi -> Gán Contact Owner cho "Khanh Nguyen" -> Tạo Deal mới "ACA 2026 - Trần Văn An".
       ↓
[BƯỚC 3: ĐẠI LÝ KHÁNH NGUYỄN]
Đăng xuất Staff -> Đăng nhập agent@insurmatch.us -> Kiểm tra danh sách chỉ hiển thị đúng các khách phụ trách -> Mở Commission Ledger xem hoa hồng ước tính theo hãng BCBS.
       ↓
[BƯỚC 4: HẬU MÃI & QUY TRÌNH TICKET]
Staff tạo Ticket "Collect Document" yêu cầu bổ sung thẻ xanh -> Đặt Task nhắc việc với hạn chót 3 ngày làm việc.
       ↓
[BƯỚC 5: ADMIN GOVERNANCE]
Đăng nhập admin@insurmatch.us -> Xem bảng điều khiển tăng trưởng toàn sàn -> Kiểm tra danh sách cấp phép Agent.
```

---

## 8. CÂU HỎI THƯỜNG GẶP & XỬ LÝ SỰ CỐ (TROUBLESHOOTING)

**Q1: Tạo Contact xong nhưng F5 lại có bị mất không?**  
*Trả lời:* Không. Hệ thống đã kết nối trực tiếp với PostgreSQL qua Prisma ORM. Mọi Contact khi tạo đều được gán mã duy nhất (`CT2600xxxx`) và lưu vĩnh viễn trên Database.

**Q2: Tại sao Agent đăng nhập không thấy toàn bộ khách hàng của công ty?**  
*Trả lời:* Đây là tính năng bảo mật phân quyền (Data Isolation). Agent chỉ được phép truy cập khách hàng được gán cho tên mình hoặc mã ID của mình để bảo vệ quyền riêng tư dữ liệu theo chuẩn HIPAA/Hoa Kỳ.

**Q3: Muốn xuất tài liệu này thành file PDF để nộp Outcome 1 thì làm thế nào?**  
*Trả lời:* 
1. Mở file `USER_MANUAL.md` trên trình duyệt hoặc công cụ đọc Markdown (như VS Code, Typora, GitHub).
2. Nhấn tổ hợp phím **Ctrl + P** (Windows) hoặc **Cmd + P** (Mac).
3. Chọn máy in: **Save as PDF** (Lưu dưới dạng PDF).
4. Khổ giấy chọn: **A4**, bật tùy chọn **Background graphics** (Đồ họa nền) để giữ định dạng bảng đẹp mắt -> Bấm **Save**.
