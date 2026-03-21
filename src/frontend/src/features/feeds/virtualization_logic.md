# Documentation: Production-Grade Social Feed Virtualization

Tài liệu này chi tiết hóa kiến trúc Senior-Level của tính năng cuộn ảo (virtualization) cho Social Feed, được thiết kế để xử lý hàng chục nghìn bài viết với độ mượt mà tối đa.

---

## 1. Cơ chế Auto-Measure (Tự động đo lường)

Thay vì ước tính chiều cao (estimation) dễ dẫn đến sai lệch và giật màn hình (flickering), chúng tôi sử dụng **ResizeObserver** thông qua hook `useDynamicRowHeight` của `react-window` v2.x.

### Cách thức hoạt động:
1. **Viewport Observation**: Chỉ những phần tử đang hiển thị mới được gán `ResizeObserver`.
2. **Attr Mapping**: Mỗi row element phải có `data-react-window-index={index}`.
3. **Auto-Update**: Khi nội dung thay đổi (ví dụ: người dùng nhấn "Xem thêm", hoặc ảnh load xong), `ResizeObserver` bắt được sự thay đổi kích thước và thông báo cho `react-window` tính toán lại `offset` của các phần tử phía sau một cách chính xác tuyệt đối.

---

## 2. Giải pháp chống Flickering (Layout Stability)

Flickering thường xảy ra do sự bất đồng bộ giữa state của React và cache của Virtualizer.
- **V2 Stability**: Bản v2.x xử lý cache tập trung trong `useDynamicRowHeight`. Khi state `expandedIndices` thay đổi, React re-render article, `ResizeObserver` ngay lập tức cập nhật cache trước khi khung hình tiếp theo được vẽ (frame consistency).
- **Aspect Ratio Boxes**: Các thành phần media (`PostMediaViewer`) sử dụng các class Tailwind như `aspect-4/3` hoặc `aspect-square`. Điều này giữ chỗ trước cho ảnh/video, ngăn chặn việc toàn bộ danh sách "nhảy" vị trí khi media được tải xong.

---

## 3. Tối ưu hóa hiệu suất (10,000+ Items)

Để xử lý danh sách cực lớn mà không làm lag Main Thread:

### A. Memoization Chiến lược
- **`PostCard`**: Được bọc trong `React.memo`. Chỉ bài viết có thay đổi (like, comment, expand) mới render lại. Các bài viết khác khi cuộn qua sẽ được lấy từ bộ nhớ đệm của React.
- **`VirtualizedFeedList Rows`**: Sử dụng `RowInner` memoized để tránh re-render hàng loạt khi cha (`FeedsPage`) update page hoặc list data.

### B. Event Handling
- **`useCallback`**: Các hàm `handleToggleExpand` và `onRowsRendered` được bọc trong `useCallback` để giữ ổn định reference, ngăn chặn Virtual List bị reset vô lý.

### C. Overscan
- **`overscanCount={5}`**: Hệ thống render trước 5 bài viết phía trên và phía dưới viewport. Điều này giúp người dùng "không bao giờ" thấy khoảng trắng khi cuộn nhanh, đồng thời giữ DOM size ở mức cực thấp (~10-15 nodes thay vì 10,000 nodes).

---

## 4. Tại sao chọn `react-window` v2 thay vì `react-virtual`?

- **react-window v2.x**: Có sự tích hợp sâu với React lifecycle hơn, code gọn gàng (`less boilerplate`) và có cơ chế auto-measure tích hợp sẵn cực kỳ mạnh mẽ. Với một feed dọc tiêu chuẩn, `react-window` v2 mang lại sự an toàn và hiệu năng tốt nhất.
- **react-virtual (TanStack)**: Headless và linh hoạt hơn cho các layout phức tạp (như masonry), nhưng yêu cầu setup thủ công nhiều hơn (ref management cho từng item). Với yêu cầu "Production-grade" cho feed, `react-window` v2 là lựa chọn cân bằng nhất.

---

## 5. Hướng dẫn bảo trì
- **Thêm tính năng**: Nếu thêm component mới vào `PostCard`, hãy đảm bảo nó không gây layout shift đột ngột.
- **Thay đổi Layout**: Nếu thay đổi độ rộng của bài viết, cache của `useDynamicRowHeight` sẽ tự động xử lý, bạn không cần gọi `resetAfterIndex` thủ công nữa.
