/** Định dạng số tiền theo kiểu Việt Nam, hậu tố "vnđ" thống nhất trên toàn app. */
export function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} vnđ`;
}
