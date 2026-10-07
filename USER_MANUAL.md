# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG INSURMATCH (USER MANUAL)
### DỰ ÁN KHỞI NGHIỆP: NỀN TẢNG B2B SaaS CRM DÀNH CHO ĐẠI LÝ BẢO HIỂM HOA KỲ
**Môn học:** EXE201 — Khởi sự doanh nghiệp (Fall 2026)  
**Giảng viên phụ trách:** ThS. Nguyễn Thị Trà Minh  
**Mục tiêu bàn giao:** Outcome 1 (MVP Submission & Presentation)  
**Mô hình kinh doanh:** B2B Vertical SaaS (Cung cấp phần mềm CRM chuyên dụng cho Đại lý Bảo hiểm)  
**Phiên bản tài liệu:** v1.1 (Cập nhật chuẩn hóa B2B SaaS)  

---

## MỤC LỤC
1. [Tuyên ngôn Giá trị & Mô hình Kinh doanh B2B](#1-tuyên-ngôn-giá-trị--mô-hình-kinh-doanh-b2b)
2. [Thông tin tài khoản kiểm thử (Demo Credentials)](#2-thông-tin-tài-khoản-kiểm-thử-demo-credentials)
3. [Phần 1: Cẩm nang dành cho Khách hàng của chúng tôi — ĐẠI LÝ BẢO HIỂM (Agent Portal)](#3-phần-1-cẩm-nang-dành-cho-khách-hàng-của-chúng-tôi--đại-lý-bảo-hiểm-agent-portal)
4. [Phần 2: Cẩm nang dành cho Đội ngũ Điều phối Nền tảng (Platform Staff Hub)](#4-phần-2-cẩm-nang-dành-cho-đội-ngũ-điều-phối-nền-tảng-platform-staff-hub)
5. [Phần 3: Cẩm nang Quản trị Hệ thống & Quản lý Thuê bao (Admin Governance)](#5-phần-3-cẩm-nang-quản-trị-hệ-thống--quản-lý-thuê-bao-admin-governance)
6. [Phần 4: Kênh Tiếp nhận Lead Tự động (End-User Lead Intake Portal)](#6-phần-4-kênh-tiếp-nhận-lead-tự-động-end-user-lead-intake-portal)
7. [Kịch bản Demo chuẩn luồng B2B cho Hội đồng Thẩm định Outcome 1](#7-kịch-bản-demo-chuẩn-luồng-b2b-cho-hội-đồng-thẩm-định-outcome-1)
8. [Xử lý Sự cố & Câu hỏi Thường gặp (Troubleshooting)](#8-xử-lý-sự-cố--câu-hỏi-thường-gặp-troubleshooting)

---

## 1. TUYÊN NGÔN GIÁ TRỊ & MÔ HÌNH KINH DOANH B2B

### 1.1. Khách hàng mục tiêu của InsurMatch là ai?
Khách hàng mục tiêu trả tiền (Target Paying Customers) của InsurMatch **chính là các Đại lý Bảo hiểm Độc lập (Licensed Independent Agents) và các Văn phòng Môi giới Bảo hiểm (Agencies)** chuyên phục vụ cộng đồng người Việt tại Hoa Kỳ.

### 1.2. Vấn đề của Đại lý Bảo hiểm (Customer Pain Points)
* **Khó khăn quản trị sau bán:** Ngành bảo hiểm Mỹ (ACA/Obamacare, Medicare) yêu cầu quy trình hậu mãi rất phức tạp: nộp chứng minh thu nhập/thẻ xanh lên Marketplace, chọn bác sĩ gia đình (PCP), theo dõi nợ phí ngày 15 hàng tháng. Các CRM thông thường (HubSpot, Salesforce) không có tính năng nghiệp vụ đặc thù này.
* **Sai sót tính toán hoa hồng (Commission Clawback):** Các hãng bảo hiểm (BCBS, Ambetter, Molina, Humana) áp dụng mức PMPM ($/member/tháng) và quy tắc khấu trừ hỗ trợ bán hàng (SSS Retention) phức tạp, đại lý thường xuyên bị nhầm lẫn khi đối soát.
* **Chi phí marketing tìm lead cao:** Đại lý thiếu công cụ tiếp cận tập trung kiều bào người Việt tại các bang trọng điểm.

### 1.3. Giải pháp InsurMatch mang lại cho Đại lý
InsurMatch là giải pháp **Vertical SaaS CRM chuyên biệt cho ngành bảo hiểm**, cung cấp gói công cụ toàn diện:
1. **CRM Quản lý Hồ sơ & Pipeline:** Tự động hóa tiếp nhận khách hàng và theo dõi hợp đồng theo thời gian thực.
2. **Post-sale Automation (5 Pipelines):** Tự động tạo và nhắc việc cho các quy trình: *Payment, Collect Document, Choose Doctor, Client Support, Agent Support*.
3. **Bộ tính toán hoa hồng tự động (SSS Commission Rules Engine):** Tự động tính Gross/Net Payout theo từng carrier, loại bỏ 100% rủi ro tính sai hoa hồng.
4. **Tích hợp Kênh hút Lead (Lead Matchmaking Funnel):** Tích hợp sẵn trang tra cứu và form tính trợ cấp thuế để đưa lead trực tiếp về cho đại lý thuê CRM.

---

## 2. THÔNG TIN TÀI KHOẢN KIỂM THỬ (DEMO CREDENTIALS)

Hệ thống đã thiết lập sẵn 3 tài khoản mẫu phục vụ hội đồng chấm thi kiểm tra luồng phân quyền:

| Phân hệ / Vai trò | Email đăng nhập | Mật khẩu mặc định | Đại diện kiểm thử | Mô tả quyền hạn |
|---|---|---|---|---|
| **Đại lý (Khách hàng CRM)** | `agent@insurmatch.us` | `Agent123!` | Khánh Nguyễn (Senior Agent) | Khách hàng thuê CRM: Quản lý data khách, hợp đồng, bảng hoa hồng cá nhân |
| **Vận hành (Platform Staff)** | `staff@insurmatch.us` | `Staff123!` | Anya Nguyen (Operations) | Đội ngũ hỗ trợ của InsurMatch: Điều phối lead, hỗ trợ nộp giấy tờ cho Agent |
| **Quản trị (Platform Admin)** | `admin@insurmatch.us` | `Admin123!` | Super Admin | Chủ sở hữu InsurMatch: Phê duyệt Agent mua gói, cấp quyền NPN, quản lý hệ thống |
| **Người mua bảo hiểm** | *(Không cần đăng nhập)* | *(Công khai)* | Lead vãng lai | Gửi thông tin báo giá từ Landing Page về cho Agent |

---

## 3. PHẦN 1: CẨM NANG DÀNH CHO KHÁCH HÀNG CỦA CHÚNG TÔI — ĐẠI LÝ BẢO HIỂM (AGENT PORTAL)

*(Đây là giao diện chính mà Đại lý tương tác hàng ngày khi mua giải pháp CRM của InsurMatch)*

### 3.1. Đăng nhập Cổng Đại lý
1. Truy cập trang `/login`.
2. Đăng nhập: `agent@insurmatch.us` | Mật khẩu: `Agent123!`.
3. Hệ thống mở **Agent Workspace** được tối ưu hóa riêng cho công việc tư vấn.

### 3.2. Không gian Dữ liệu Bảo mật Độc lập (Data Scoping & Privacy)
* **Bảo mật tuyệt đối giữa các Agent:** InsurMatch đảm bảo mỗi đại lý chỉ truy cập khách hàng (Contacts) và hợp đồng (Deals) được phân quyền cho chính mình (`Khanh Nguyen`).
* **Agent Banner:** Đầu trang hiển thị rõ thông báo phạm vi: *"Chế độ Agent: Chỉ hiển thị các Contact được phân công cho Khanh Nguyen"*.
* Đại lý không sợ bị trùng lặp hay lộ danh sách khách hàng sang đại lý khác trong cùng nền tảng.

### 3.3. Quản lý Danh bạ Khách hàng & Hồ sơ Bảo hiểm
1. **Xem hồ sơ khách hàng:** Tra cứu nhanh họ tên, số điện thoại, tiểu bang cư trú, mã hồ sơ Marketplace.
2. **Cập nhật thông tin y tế & định danh:**
   * Thông tin chính (Primary Info): Ngày sinh (DOB), SSN, Tình trạng định cư (Thẻ xanh / Quốc tịch).
   * Tài khoản Marketplace: Tên đăng nhập và mật khẩu ACA Account bảo mật để nộp hồ sơ.

### 3.4. Bảng Quản lý & Đối soát Hoa hồng Tự động (Commission Ledger)
Điểm "ăn tiền" lớn nhất của CRM InsurMatch dành cho đại lý:
1. **Commission Summary:**
   * **Settled This Month:** Tổng hoa hồng thực nhận trong tháng hiện tại.
   * **Pending Audit:** Số lượng hợp đồng đang chờ hãng bảo hiểm duyệt chi.
   * **YTD Paid:** Lũy kế hoa hồng đã nhận từ đầu năm tài chính.
2. **Bộ tính hoa hồng chuẩn Carrier Mỹ (Carrier Payout Map):**
   * *Blue Cross Blue Shield (BCBS):* $30.00 / thành viên / tháng
   * *Ambetter Health:* $32.00 / thành viên / tháng
   * *Humana:* $51.00 / thành viên / tháng
   * *UnitedHealthcare / Oscar:* $30.00 / thành viên / tháng
   * *Molina Healthcare:* $29.00 / thành viên / tháng
3. **Commission Simulator (Máy tính mô phỏng):** Cho phép đại lý nhập số lượng người trong hộ (Household Members) và chọn hãng để tính ngay số tiền hoa hồng thực nhận (Net Payout).

---

## 4. PHẦN 2: CẨM NANG DÀNH CHO ĐỘI NGŨ ĐIỀU PHỐI NỀN TẢNG (PLATFORM STAFF HUB)

Đội ngũ Staff của InsurMatch đóng vai trò là "Back-office as a Service", hỗ trợ các đại lý thuê CRM vận hành trơn tru.

### 4.1. Đăng nhập Staff Hub
* Đăng nhập: `staff@insurmatch.us` | Mật khẩu: `Staff123!`.

### 4.2. Tiếp nhận Lead & Điều phối cho Đại lý (Lead Routing)
1. Khi có khách hàng gửi yêu cầu tư vấn từ trang chủ, Staff kiểm tra danh sách tại mục **Contacts**.
2. **Gán Contact Owner:** Chọn mở hồ sơ -> Tại mục `Contact Owner`, chọn bàn giao khách hàng cho đại lý phù hợp (ví dụ: gán cho **Khanh Nguyen**).
3. Ngay lập tức, đại lý Khánh Nguyễn đăng nhập sẽ thấy hồ sơ xuất hiện trong tài khoản của mình.

### 4.3. Quản lý Pipeline Hợp đồng (Deals Kanban)
* Theo dõi tiến độ hợp đồng qua 5 chặng: `New Inquiry` ➔ `Appointment Scheduled` ➔ `Ready to Enroll` ➔ `Policy Issued` ➔ `Active`.
* Staff có thể tạo nhanh hợp đồng mới (+ Add Deal) liên kết trực tiếp với mã khách hàng (`contactId`) và đại lý phụ trách (`dealOwnerName`).

### 4.4. Xử lý 5 Quy trình Hậu mãi (Post-sale Tickets Automation)
CRM InsurMatch cung cấp sẵn 5 quy trình chuẩn hóa:
1. **Ticket Payment:** Đôn đốc khách đóng phí duy trì trước ngày 15 hàng tháng để tránh bị hủy chính sách.
2. **Ticket Collect Document:** Nhắc nhở và nhận file thẻ xanh, giấy thuế nộp bổ sung lên Healthcare.gov.
3. **Ticket Choose Doctor:** Đăng ký bác sĩ gia đình (PCP) đúng mạng lưới cho khách.
4. **Ticket Client Support:** Xử lý khiếu nại viện phí và hóa đơn bất ngờ (Surprise Billing).
5. **Ticket Agent Support:** Hỗ trợ đại lý giải quyết vướng mắc với hãng bảo hiểm.

* **Ràng buộc chất lượng dịch vụ (SLA):**
  * Muốn đổi hạn xử lý -> Bắt buộc nhập `Change Due Date Reason`.
  * Muốn đóng Ticket (`Closed`) -> Bắt buộc điền `Ticket Result`.

---

## 5. PHẦN 3: CẨM NANG QUẢN TRỊ HỆ THỐNG & QUẢN LÝ THUÊ BAO (ADMIN GOVERNANCE)

Dành cho Ban điều hành nền tảng InsurMatch để quản lý các khách hàng Agent mua phần mềm.

### 5.1. Đăng nhập Super Admin
* Đăng nhập: `admin@insurmatch.us` | Mật khẩu: `Admin123!`.

### 5.2. Quản lý Thuê bao & Cấp phép Đại lý (Agent Licensing & Onboarding)
1. Truy cập tab **Accounts**: Xem danh sách toàn bộ các Agent đang sử dụng phần mềm.
2. **Thẩm định cấp phép (NPN Verification):**
   * Đại lý đăng ký gói CRM mới sẽ ở trạng thái `Pending`.
   * Admin đối soát số giấy phép hành nghề quốc gia NPN (7 - 8 số).
   * Bấm kích hoạt sang `Active` để mở quyền truy cập hệ thống cho Agent.
   * Hỗ trợ đình chỉ (`Suspend`) nếu đại lý hết hạn hợp đồng thuê CRM hoặc vi phạm chính sách.

### 5.3. Báo cáo Tăng trưởng Toàn sàn (Platform Performance)
* Doanh số hợp đồng được phát hành thông qua hệ thống CRM.
* Tỷ lệ cơ cấu các hãng bảo hiểm đối tác.
* Thống kê số lượng hồ sơ xử lý theo từng tiểu bang.

---

## 6. PHẦN 4: KÊNH TIẾP NHẬN LEAD TỰ ĐỘNG (END-USER LEAD INTAKE PORTAL)

Đây là giá trị gia tăng (Add-on Value) mà InsurMatch cung cấp kèm theo phần mềm CRM để hỗ trợ Đại lý có thêm nguồn khách hàng tiềm năng.

1. **Giao diện Trang chủ:** Khách hàng tiếp cận thông tin về các gói ACA, Medicare, Life Insurance.
2. **Modal Báo giá Đa bước (+ Free Quote):**
   * Khách hàng nhập độ tuổi, bang cư trú và ước tính thu nhập gia đình.
   * Hệ thống tự động tính mức trợ cấp thuế (Subsidy Calculator).
   * Khách bấm gửi yêu cầu -> Tạo Contact mới đẩy thẳng vào hệ thống CRM để Staff phân bổ về cho Agent.

---

## 7. KỊCH BẢN DEMO CHUẨN LUỒNG B2B CHO HỘI ĐỒNG THẨM ĐỊNH OUTCOME 1

*(Thời lượng đề xuất: 5 - 7 phút)*

```
[BƯỚC 1: GIỚI THIỆU MÔ HÌNH B2B]
Khẳng định với Hội đồng: "InsurMatch là giải pháp B2B SaaS CRM chuyên biệt bán cho các Đại lý bảo hiểm. Khách hàng trả tiền của chúng em là các Agent."
       ↓
[BƯỚC 2: KHÁCH HÀNG GỬI LEAD]
Tại trang chủ, đóng vai người mua bảo hiểm bấm "Get a Free Quote", nhập nhu cầu tại bang Texas -> Tạo thành công hồ sơ khách hàng.
       ↓
[BƯỚC 3: STAFF ĐIỀU PHỐI VÀO CRM]
Đăng nhập staff@insurmatch.us -> Vào Contacts thấy lead mới -> Bàn giao hồ sơ cho khách hàng Agent "Khanh Nguyen".
       ↓
[BƯỚC 4: AGENT SỬ DỤNG CRM CỦA INSURMATCH]
Đăng nhập agent@insurmatch.us:
- Chứng minh tính năng Scoped Privacy: Agent chỉ thấy data của mình.
- Mở Commission Ledger: Trình diễn tính năng tự động tính hoa hồng theo hãng BCBS/Ambetter.
- Tạo Ticket hậu mãi "Collect Document" có deadline cụ thể.
       ↓
[BƯỚC 5: ADMIN QUẢN TRỊ THUÊ BAO]
Đăng nhập admin@insurmatch.us -> Xem báo cáo quản lý các tài khoản Agent đang hoạt động trên hệ thống.
```

---

## 8. XỬ LÝ SỰ CỐ & CÂU HỎI THƯỜNG GẶP (TROUBLESHOOTING)

**Q1: Khách hàng của InsurMatch là ai?**  
*Trả lời:* Khách hàng của InsurMatch là các Đại lý bảo hiểm độc lập (Agents) và văn phòng môi giới (Agencies). Người mua bảo hiểm là khách hàng của Agent, tương tác qua kênh phễu Lead.

**Q2: InsurMatch kiếm tiền từ nguồn nào trong mô hình B2B?**  
*Trả lời:* 
1. Phí thuê bao phần mềm CRM theo tháng/năm (SaaS Subscription).
2. Phí phân phối lead chất lượng cao cho Agent (Pay-per-lead).
3. Phí dịch vụ hỗ trợ nghiệp vụ hậu mãi (Sale Support Retention Fee).

**Q3: Dữ liệu khách hàng của Agent có được lưu trữ an toàn không?**  
*Trả lời:* Toàn bộ dữ liệu được lưu trữ trên cơ sở dữ liệu PostgreSQL thực tế với kết nối Prisma ORM, có mã hóa mật khẩu Scrypt và JWT Token bảo vệ. Không bao giờ xảy ra tình trạng mất dữ liệu khi đăng xuất/đăng nhập lại.
