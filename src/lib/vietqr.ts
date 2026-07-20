// Tạo link ảnh QR thanh toán VietQR (https://vietqr.io) từ thông tin tài khoản
// nhận tiền được cấu hình trong biến môi trường.

export interface PaymentInfo {
  qrUrl: string | null;
  amount: number;
  addInfo: string;
  bankName: string;
  accountNo: string;
  accountName: string;
}

// Sinh nội dung chuyển khoản ngắn gọn, duy nhất cho từng lượt đăng ký
// để đối chiếu khi admin xác nhận thanh toán.
export function buildPaymentNote(enrollmentId: string) {
  return `TT ${enrollmentId.slice(-8).toUpperCase()}`;
}

export function buildPaymentInfo({
  enrollmentId,
  amount,
}: {
  enrollmentId: string;
  amount: number;
}): PaymentInfo {
  const bankId = process.env.VIETQR_BANK_ID || "";
  const accountNo = process.env.VIETQR_ACCOUNT_NO || "";
  const accountName = process.env.VIETQR_ACCOUNT_NAME || "";
  const bankName = process.env.VIETQR_BANK_NAME || "";
  const template = process.env.VIETQR_TEMPLATE || "compact2";
  const addInfo = buildPaymentNote(enrollmentId);

  let qrUrl: string | null = null;
  if (bankId && accountNo) {
    const params = new URLSearchParams({
      amount: String(Math.max(0, Math.round(amount))),
      addInfo,
      accountName,
    });
    qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?${params.toString()}`;
  }

  return { qrUrl, amount, addInfo, bankName, accountNo, accountName };
}
