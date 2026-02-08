export function formatToVND(amount: number): string {
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}
