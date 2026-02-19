export function formatToVND(amount: number): string {
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}

export const formatVietnameseDate = (dateString: string): string => {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

// Helper function to get slug prefix (remove last 5 chars: -XXXX)
export const getSlugPrefix = (slug: string): string => {
  // Remove last 5 characters (hyphen + 4 random chars)
  return slug.slice(0, -5);
};
