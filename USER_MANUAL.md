# SÁCH HƯỚNG DẪN SỬ DỤNG HỆ THỐNG INSURMATCH (USER MANUAL)
### DỰ ÁN KHỞI NGHIỆP: NỀN TẢNG B2B SaaS CRM DÀNH CHO ĐẠI LÝ BẢO HIỂM HOA KỲ
* **Môn học:** EXE201 — Khởi sự doanh nghiệp (Fall 2026)  
* **Giảng viên hướng dẫn:** ThS. Nguyễn Thị Trà Minh  
* **Mục tiêu bàn giao:** Outcome 1 (MVP Submission & User Manual - 5 Điểm)  
* **Mô hình kinh doanh:** B2B Vertical SaaS (Bán giải pháp CRM chuyên biệt cho Đại lý Bảo hiểm)  
* **Phiên bản:** v2.0 (Chuẩn hóa ma trận phân quyền RBAC & Giao diện người dùng)  

---

## MỤC LỤC
1. [Giới thiệu mô hình kinh doanh & Khách hàng mục tiêu](#1-giới-thiệu-mô-hình-kinh-doanh--khách-hàng-mục-tiêu)
2. [Ma trận phân quyền hệ thống (Role-Based Access Control - RBAC)](#2-ma-trận-phân-quyền-hệ-thống-role-based-access-control---rbac)
3. [Bảng thông tin tài khoản kiểm thử (Demo Credentials)](#3-bảng-thông-tin-tài-khoản-kiểm-thử-demo-credentials)
4. [Phần 1: Cẩm nang dành cho QUẢN TRỊ VIÊN — ADMIN (Toàn quyền hệ thống)](#4-phần-1-cẩm-nang-dành-cho-quản-trị-viên--admin-toàn-quyền-hệ-thống)
5. [Phần 2: Cẩm nang dành cho ĐIỀU PHỐI VIÊN — STAFF (Hỗ trợ đại lý)](#5-phần-2-cẩm-nang-dành-cho-điều-phối-viên--staff-hỗ-trợ-đại-lý)
6. [Phần 3: Cẩm nang dành cho ĐẠI LÝ BẢO HIỂM — AGENT (Khách hàng mua CRM)](#6-phần-3-cẩm-nang-dành-cho-đại-lý-bảo-hiểm--agent-khách-hàng-mua-crm)
7. [Kịch bản Demo chuẩn luồng nộp Outcome 1 (5 bước trong 5-7 phút)](#7-kịch-bản-demo-chuẩn-luồng-nộp-outcome-1-5-bước-trong-5-7-phút)
8. [Hướng dẫn chèn ảnh & Xuất file PDF nộp bài đạt điểm tối đa](#8-hướng-dẫn-chèn-ảnh--xuất-file-pdf-nộp-bài-đạt-điểm-tối-đa)

---

## 1. GIỚI THIỆU MÔ HÌNH KINH DOANH & KHÁCH HÀNG MỤC TIÊU

### 1.1. Khách hàng của InsurMatch là ai?
InsurMatch hoạt động theo mô hình **B2B Vertical SaaS (Phần mềm dịch vụ B2B chuyên ngành)**.  
* **Khách hàng trả tiền (Paying Customers) của chúng tôi chính là:** Các **Đại lý Bảo hiểm Độc lập (Licensed Independent Agents)** và các **Văn phòng Môi giới Bảo hiểm (Agencies)** người Việt đang hoạt động tại Hoa Kỳ.
* **Người mua bảo hiểm (End-Consumers):** Là khách hàng của Agent, tương tác qua trang phễu báo giá (Lead Funnel) được tích hợp sẵn trong giải pháp CRM để đẩy lead tự động về cho Agent.

### 1.2. Giá trị phần mềm CRM InsurMatch bán cho Đại lý
1. **Quản trị khách hàng & hợp đồng tập trung:** Quản lý Leads, Contacts, Deals theo luồng bảo hiểm chuẩn ACA/Medicare.
2. **Tự động hóa 5 quy trình hậu mãi sau bán:** Xử lý nộp thẻ xanh lên Marketplace, đăng ký bác sĩ gia đình (PCP), theo dõi nợ phí định kỳ ngày 15 hàng tháng, giải quyết khiếu nại viện phí.
3. **Bộ tính toán hoa hồng tự động (SSS Commission Engine):** Tự động đối soát hoa hồng PMPM theo từng hãng bảo hiểm Mỹ (BCBS $30, Ambetter $32, Humana $51...), loại bỏ 100% rủi ro tính sai hoặc thất thoát tiền hoa hồng.

---

## 2. MA TRẬN PHÂN QUYỀN HỆ THỐNG (ROLE-BASED ACCESS CONTROL - RBAC)

Hệ thống InsurMatch áp dụng cơ chế phân quyền bảo mật chặt chẽ theo đúng yêu cầu nghiệp vụ:

| Chức năng / Module | SUPER ADMIN (Quản trị viên) | PLATFORM STAFF (Điều phối viên) | LICENSED AGENT (Đại lý bảo hiểm) |
|---|:---:|:---:|:---:|
| **Quyền hạn tổng quát** | **TOÀN QUYỀN LÀM TẤT CẢ** | **THẤY HẾT ĐỂ HỖ TRỢ (Trừ Coms & Accounts)** | **CHỈ THẤY CỦA MÌNH & COMS CỦA MÌNH** |
| **Quản lý Tài khoản (Accounts)** | ✅ Toàn quyền (Thêm, duyệt NPN, Khóa) | ❌ **KHÔNG ĐƯỢC THẤY** | ❌ **KHÔNG ĐƯỢC THẤY** |
| **Bảng Hoa hồng (Commission)** | ✅ Thấy toàn sàn & Tài chính chung | ❌ **KHÔNG ĐƯỢC THẤY** | ✅ **CHỈ THẤY HOA HỒNG CỦA MÌNH** |
| **Danh bạ Khách hàng (Contacts)** | ✅ Thấy toàn bộ | ✅ Thấy toàn bộ (để hỗ trợ gán Agent) | 🔒 **Chỉ thấy khách được gán cho mình** |
| **Quy trình Hợp đồng (Deals)** | ✅ Thấy toàn bộ | ✅ Thấy toàn bộ (để hỗ trợ nộp đơn) | 🔒 **Chỉ thấy Deal của chính mình** |
| **Hậu mãi & SLA (Tickets)** | ✅ Thấy toàn bộ | ✅ Thấy toàn bộ (để xử lý thay Agent) | 🔒 **Chỉ thấy Ticket của khách mình** |
| **Nhắc việc (Tasks)** | ✅ Thấy toàn bộ | ✅ Thấy toàn bộ | 🔒 **Chỉ thấy Task được giao cho mình** |
| **Hồ sơ tài liệu (Documents)** | ✅ Toàn quyền | ✅ Thấy toàn bộ (để hỗ trợ upload file) | 🔒 **Chỉ thấy hồ sơ của khách mình** |
| **Cấu hình & Audit Logs** | ✅ Xem logs hệ thống | ❌ Không có quyền | ❌ Không có quyền |

---

## 3. BẢNG THÔNG TIN TÀI KHOẢN KIỂM THỬ (DEMO CREDENTIALS)

Phục vụ Hội đồng giám khảo kiểm tra trực tiếp 3 cấp độ phân quyền:

| Vai trò (Role) | Email đăng nhập | Mật khẩu mặc định | Đại diện tài khoản | Mục đích kiểm tra phân quyền |
|---|---|---|---|---|
| **Super Admin** | `admin@insurmatch.us` | `Admin123!` | Super Admin | Kiểm tra quyền tối cao: Quản lý Accounts và Hoa hồng toàn sàn |
| **Platform Staff** | `staff@insurmatch.us` | `Staff123!` | Anya Nguyen | Xác nhận: Menu **ẩn hoàn toàn Commission & Accounts**, thấy Contacts/Deals để hỗ trợ |
| **Licensed Agent** | `agent@insurmatch.us` | `Agent123!` | Khanh Nguyen | Xác nhận: **Chỉ thấy data của Khánh Nguyễn** và **Bảng hoa hồng cá nhân** |

---

## 4. PHẦN 1: CẨM NANG DÀNH CHO QUẢN TRỊ VIÊN — ADMIN (TOÀN QUYỀN HỆ THỐNG)

> **Tôn chỉ của Admin:** Là chủ sở hữu nền tảng, Admin có toàn quyền tối cao để quản trị kinh doanh, phê duyệt khách hàng Agent mua CRM và theo dõi doanh thu toàn hệ thống.

### 4.1. Đăng nhập & Tổng quan Admin Hub
1. Truy cập trang đăng nhập `/login`.
2. Đăng nhập với tài khoản: `admin@insurmatch.us` | Mật khẩu: `Admin123!`.
3. Giao diện Sidebar hiển thị đầy đủ tất cả các phân hệ quản trị:
   * **Overview:** Báo cáo tổng thể doanh thu, số lượng đại lý, hợp đồng phát hành.
   * **Accounts:** Quản lý và phê duyệt tài khoản Agent mua phần mềm.
   * **Commission:** Giám sát dòng tiền hoa hồng và doanh thu gói cước SaaS.
   * **Deals / Contacts / Tickets / Documents:** Xem và can thiệp toàn bộ dữ liệu trên sàn.
   * **System & Audit:** Nhật ký hoạt động bảo mật.

### 4.2. Quản lý Tài khoản & Phê duyệt Đại lý (Accounts & NPN Verification)
1. Bấm vào tab **Accounts** trên Sidebar.
2. Danh sách hiển thị toàn bộ nhân sự và các đại lý đăng ký thuê phần mềm CRM:
   * Đại lý mới mua gói cước sẽ ở trạng thái `Pending` (Chờ thẩm định).
   * Admin kiểm tra số giấy phép quốc gia NPN (7 - 8 số) do Bộ Bảo hiểm Hoa Kỳ cấp.
   * Bấm kích hoạt sang `Active` để mở quyền sử dụng CRM cho Agent.
   * Hỗ trợ tạm khóa (`Suspend`) nếu đại lý hết hạn hợp đồng thuê phần mềm.

### 4.3. Giám sát Doanh thu & Hoa hồng Toàn sàn (Admin Commission Hub)
1. Bấm vào tab **Commission** trên Sidebar.
2. Admin theo dõi:
   * Tổng hoa hồng Gross từ các hãng bảo hiểm đổ về sàn.
   * Tổng số tiền Net chi trả cho các Agent đối tác.
   * Doanh thu giữ lại của văn phòng (Office Retention / Platform Fee).
   * Thống kê sản lượng bán theo từng hãng bảo hiểm (BCBS, Ambetter, Humana, UnitedHealthcare...).

---

## 5. PHẦN 2: CẨM NANG DÀNH CHO ĐIỀU PHỐI VIÊN — STAFF (HỖ TRỢ ĐẠI LÝ)

> **Tôn chỉ của Staff:** Staff là bộ phận hỗ trợ kỹ thuật và điều phối hồ sơ cho Agent.  
> **NGHIÊM NGẶT:** Staff **TUYỆT ĐỐI KHÔNG THẤY** mục `Commission` (doanh thu hoa hồng nhạy cảm) và mục `Accounts` (quản trị tài khoản của Admin). **CÒN LẠI THẤY HẾT** để đắc lực hỗ trợ Agent xử lý hồ sơ.

### 5.1. Đăng nhập & Kiểm tra giao diện Staff
1. Đăng nhập: `staff@insurmatch.us` | Mật khẩu: `Staff123!`.
2. Quan sát thanh Menu bên trái (Sidebar):
   * Menu **CHỈ CÓ:** *Dashboard, Contacts, Deals, Tickets, Tasks, Documents, Match Queue*.
   * Menu **HOÀN TOÀN KHÔNG CÓ:** Tab *Commission* và Tab *Accounts*.

### 5.2. Tiếp nhận Lead & Điều phối cho Agent (Lead Routing)
1. Khi khách hàng gửi yêu cầu báo giá từ Website, Staff mở tab **Contacts**.
2. Tìm khách hàng mới -> Bấm xem chi tiết.
3. Tại ô **Contact Owner**: Chọn bàn giao khách hàng cho đại lý phụ trách theo bang (chọn **Khanh Nguyen**).
4. Ngay khi bấm lưu, khách hàng sẽ xuất hiện tức thì trong tài khoản của Agent Khánh Nguyễn.

### 5.3. Hỗ trợ Agent quản lý Pipeline Hợp đồng (Deals Kanban)
1. Truy cập tab **Deals**: Xem bảng Kanban với 5 giai đoạn hợp đồng.
2. Staff có thể hỗ trợ Agent kéo thả chuyển trạng thái hợp đồng:
   * `New Inquiry` (Chờ tư vấn) ➔ `Ready to Enroll` (Sẵn sàng nộp đơn) ➔ `Policy Issued` (Đã cấp số hợp đồng) ➔ `Active` (Đang hiệu lực).
3. Bấm **"+ Add Deal"** để tạo hồ sơ hợp đồng mới gắn trực tiếp với Contact và Agent phụ trách.

### 5.4. Xử lý 5 Quy trình Hậu mãi (Post-sale Tickets Management)
Staff hỗ trợ đại lý giải quyết 5 quy trình nghiệp vụ phức tạp:
1. **Payment Ticket:** Rà soát danh sách khách hàng nợ phí trước ngày 15 hàng tháng.
2. **Collect Document Ticket:** Đôn đốc khách nộp thẻ xanh, giấy thuế bổ sung lên Healthcare.gov.
3. **Choose Doctor Ticket:** Chọn và đăng ký bác sĩ gia đình (PCP) đúng mạng lưới cho khách.
4. **Client Support Ticket:** Hỗ trợ đòi bồi thường, xử lý claim bill viện phí.
5. **Agent Support Ticket:** Hỗ trợ giải quyết vướng mắc kỹ thuật cho đại lý.

* **Quy tắc SLA:**
  * Muốn đổi hạn giải quyết -> Bắt buộc nhập `Change Due Date Reason`.
  * Muốn đóng Ticket (`Closed`) -> Bắt buộc điền `Ticket Result`.

---

## 6. PHẦN 3: CẨM NANG DÀNH CHO ĐẠI LÝ BẢO HIỂM — AGENT (KHÁCH HÀNG MUA CRM)

> **Tôn chỉ của Agent:** Agent là khách hàng sử dụng phần mềm. Agent **CHỈ THẤY DỮ LIỆU CỦA CHÍNH MÌNH** (bảo mật dữ liệu tuyệt đối giữa các Agent) và **THẤY BẢNG HOA HỒNG (COMS) CỦA RIÊNG MÌNH**.

### 6.1. Đăng nhập & Xác thực Phân quyền Bảo mật (Data Scoping)
1. Đăng nhập: `agent@insurmatch.us` | Mật khẩu: `Agent123!`.
2. Hệ thống hiển thị Banner bảo mật:
   > *"Chế độ Agent: Chỉ hiển thị các Contact được phân công cho Khanh Nguyen"*
3. Agent Khánh Nguyễn **chỉ nhìn thấy danh sách khách hàng và hợp đồng được giao cho mình**, không thể nhìn thấy dữ liệu khách hàng của các đại lý khác trên sàn.

### 6.2. Quản lý Khách hàng & Hồ sơ Bảo hiểm Cá nhân
1. **Contacts:** Xem danh bạ khách hàng tiềm năng được nền tảng phân bổ hoặc tự tạo mới.
2. **Deals:** Quản lý doanh số và tiến độ nộp đơn bảo hiểm cá nhân.
3. **Hồ sơ định danh (Primary Info):** Lưu trữ an toàn ngày sinh (DOB), số An sinh xã hội (SSN), tình trạng định cư và tài khoản Marketplace của khách hàng.

### 6.3. Bảng Quản lý Hoa hồng Cá nhân (Agent Commission Ledger & Calculator)
Tính năng độc quyền đắt giá nhất dành cho khách hàng Agent:
1. **Commission Summary:**
   * **Settled This Month:** Tổng hoa hồng đã thanh toán vào tài khoản trong tháng.
   * **Pending Audit:** Số hợp đồng đang chờ hãng bảo hiểm duyệt chi.
   * **YTD Paid:** Lũy kế hoa hồng thực nhận từ đầu năm.
2. **Đơn giá Payout chuẩn Carrier Hoa Kỳ:**
   * *Blue Cross Blue Shield (BCBS):* $30.00 / người / tháng
   * *Ambetter Health:* $32.00 / người / tháng
   * *Humana:* $51.00 / người / tháng
   * *UnitedHealthcare / Oscar:* $30.00 / người / tháng
   * *Molina:* $29.00 / người / tháng
3. **Commission Simulator:** Agent tự mô phỏng số thành viên gia đình và hãng bảo hiểm để tính chính xác 100% số tiền hoa hồng thực nhận hàng tháng.

---

## 7. KỊCH BẢN DEMO CHUẨN LUỒNG NỘP OUTCOME 1 (5 BƯỚC TRONG 5-7 PHÚT)

Khi thuyết trình trước Hội đồng cô Minh, nhóm thực hiện demo theo đúng 5 bước sau:

```
[BƯỚC 1: GIỚI THIỆU SẢN PHẨM B2B]
Khẳng định: "InsurMatch bán phần mềm CRM cho Agent. Sau đây là luồng phối hợp giữa 3 Role: Admin - Staff - Agent."
       ↓
[BƯỚC 2: KHÁCH HÀNG GỬI YÊU CẦU TỪ WEB]
Tại trang chủ -> Khách bấm "Get a Free Quote" gửi yêu cầu tư vấn bảo hiểm ACA tại Texas.
       ↓
[BƯỚC 3: STAFF TIẾP NHẬN & ĐIỀU PHỐI (KHÔNG CÓ COMS/ACCOUNTS)]
Đăng nhập staff@insurmatch.us:
- Chứng minh: Menu Staff không có tab Commission và không có tab Accounts.
- Thao tác: Vào Contacts thấy khách mới -> Bàn giao hồ sơ cho Agent Khánh Nguyễn.
       ↓
[BƯỚC 4: AGENT SỬ DỤNG CRM CỦA MÌNH (CÓ COMS CỦA AGENT)]
Đăng nhập agent@insurmatch.us:
- Chứng minh: Agent chỉ thấy hồ sơ của Khánh Nguyễn (Data Isolation).
- Mở Commission Ledger: Xem bảng tính hoa hồng tự động theo hãng BCBS/Ambetter.
- Tạo Ticket hậu mãi "Collect Document" có deadline nhắc việc.
       ↓
[BƯỚC 5: ADMIN QUẢN TRỊ TOÀN QUYỀN (LÀM TẤT CẢ)]
Đăng nhập admin@insurmatch.us:
- Chứng minh: Admin có toàn quyền xem Accounts (duyệt NPN đại lý) và Coms toàn sàn.
```

---

## 8. HƯỚNG DẪN CHÈN ẢNH & XUẤT FILE PDF NỘP BÀI ĐẠT ĐIỂM TỐI ĐA

### Có cần hình ảnh khi làm file PDF không?
👉 **CÂU TRẢ LỜI LÀ: RẤT NÊN CÓ HÌNH ẢNH (CHỤP SCREENSHOT THẬT)!**

* **Lý do:**
  1. Thang điểm Rubric mục số 7 chiếm **5 điểm**. Một tài liệu User Manual có hình ảnh chụp giao diện thực tế sẽ được đánh giá là tài liệu chuyên nghiệp cấp doanh nghiệp, chứng minh hệ thống đã chạy thật chứ không phải bản vẽ trên giấy.
  2. Hình ảnh giúp hội đồng nhìn thấy ngay bằng chứng phân quyền: Ảnh chụp menu Staff (không có Coms, không có Accounts), Menu Admin (đầy đủ phân hệ), Menu Agent (có banner bảo mật và bảng Coms riêng).

### 4 Ảnh chụp màn hình cần chèn vào tài liệu:
1. **Hình 1:** Giao diện Trang chủ & Modal tính phí bảo hiểm (*Get a Free Quote*).
2. **Hình 2:** Màn hình **Admin Hub** (Hiển thị đầy đủ menu Accounts và Commission).
3. **Hình 3:** Màn hình **Staff Hub** (Hiển thị rõ menu **chỉ có Contacts, Deals, Tickets, Tasks - KHÔNG CÓ Coms và Accounts**).
4. **Hình 4:** Màn hình **Agent Hub** (Hiển thị rõ banner *"Chế độ Agent: Chỉ hiển thị các Contact được phân công cho Khanh Nguyen"* và Bảng hoa hồng Commission Ledger).

### Cách xuất ra file PDF nộp bài trong 3 bước:
1. Mở file `USER_MANUAL.md` trên GitHub hoặc VS Code / Trình duyệt Chrome.
2. Nhấn tổ hợp phím **Ctrl + P** (hoặc `Cmd + P` trên Mac).
3. Chọn máy in: **Save as PDF** -> Tích chọn **Background graphics** -> Bấm **Save**.
