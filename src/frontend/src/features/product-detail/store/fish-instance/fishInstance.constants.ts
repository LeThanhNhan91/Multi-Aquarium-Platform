export const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  Available: {
    label: "Còn hàng",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  Sold: {
    label: "Đã bán",
    className: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  },
  Reserved: {
    label: "Đã đặt",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  OnHold: {
    label: "Tạm giữ",
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
};

export const GENDER_OPTIONS = [
  { value: "Male", label: "Đực" },
  { value: "Female", label: "Cái" },
  { value: "Unknown", label: "Chưa xác định" },
];
