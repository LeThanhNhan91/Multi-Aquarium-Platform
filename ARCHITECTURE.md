System Architecture - Multi-Store Aquarium E-Commerce
1. Overview
Dự án này là một nền tảng thương mại điện tử đa cửa hàng chuyên biệt cho hàng sống (cá cảnh) và phụ kiện thủy sinh. Hệ thống được thiết kế để đảm bảo tính mở rộng cao, cô lập dữ liệu tuyệt đối giữa các cửa hàng và xử lý giao dịch thời gian thực.


2. Backend Architecture (Clean Architecture)
Backend được xây dựng bằng .NET 10 tuân thủ nguyên tắc tách biệt các mối quan tâm (Separation of Concerns):

Aquarium.Domain: Lớp lõi chứa các thực thể nghiệp vụ (Entities) như User, Store, Product, Order và các quy tắc nghiệp vụ cơ bản. Lớp này không phụ thuộc vào bất kỳ thư viện bên ngoài nào.

Aquarium.Application: Chứa logic nghiệp vụ chi tiết (Use Cases), Interfaces cho Repositories, DTOs và các lệnh Command/Query. Đây là nơi thực thi các luồng công việc như "Phê duyệt cửa hàng" hay "Đặt hàng".

Aquarium.Infrastructure: Triển khai chi tiết kỹ thuật như cấu hình EF Core, kết nối SQL Server, lưu trữ Media (Cloudinary/S3) và hệ thống gửi tin nhắn SignalR.

Aquarium.Api: Lớp trình diễn (Presentation) xử lý các HTTP Request, quản lý JWT Authentication và phân quyền dựa trên Policy.


3. Multi-Store Data Isolation
Đây là cơ chế quan trọng nhất để đảm bảo an toàn dữ liệu trên nền tảng:

Tenant Identification: StoreId được giải quyết từ JWT Claims (đối với Staff/Owner) hoặc qua StoreSlug trên URL (đối với khách hàng).

Query Filtering: Tất cả các truy vấn dữ liệu liên quan đến sản phẩm, đơn hàng, tồn kho đều bắt buộc phải lọc theo StoreId.

Security Rule: Hệ thống không bao giờ tin tưởng StoreId gửi trực tiếp từ Client.

4. Frontend Architecture (Next.js)
Frontend sử dụng Next.js 14+ App Router với các chiến lược rendering tối ưu:

SSR (Server Side Rendering): Dùng cho trang danh sách sản phẩm và chi tiết cửa hàng để tối ưu SEO.

ISR (Incremental Static Regeneration): Dùng cho các trang thông tin tĩnh của cửa hàng để đạt hiệu năng cao nhất.

TanStack Query: Quản lý trạng thái dữ liệu từ Server, hỗ trợ caching và đồng bộ hóa thời gian thực.

5. Key Business Features

Inventory Management: Tách biệt QuantityAvailable (Sẵn sàng bán) và QuantityReserved (Đã giữ chỗ) để xử lý đặc thù của hàng sống.

Real-time Interaction: Hệ thống Chat SignalR giúp kết nối trực tiếp khách hàng và cửa hàng để tư vấn kỹ thuật nuôi cá.

Social Feed: Cho phép các cửa hàng đăng bài giới thiệu sản phẩm dưới dạng mạng xã hội để tăng tương tác.

6. Tech Stack
Backend: .NET 10, Entity Framework Core, SQL Server, SignalR.
Frontend: Next.js (App Router), Tailwind CSS, TanStack Query.
DevOps: GitHub Actions (CI/CD), Docker Compose.