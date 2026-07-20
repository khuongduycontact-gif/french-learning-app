// Tạo link ảnh QR thanh toán VietQR (https://vietqr.io) từ thông tin tài khoản
// nhận tiền được cấu hình trong biến môi trường.

export interface PaymentInfo {
  qrUrl: string | null;
  deeplinkUrl: string | null;
  bankTransferParams: string | null;
  amount: number;
  addInfo: string;
  bankName: string;
  accountNo: string;
  accountName: string;
}

// Ánh xạ mã BIN ngân hàng -> { appId, shortCode } dùng cho deeplink mở app
// ngân hàng (https://dl.vietqr.io/pay?app=...&ba=SO_TK@shortCode...).
// Chỉ liệt kê các ngân hàng phổ biến; nếu ngân hàng của bạn không có trong
// danh sách, hãy set VIETQR_APP_ID và VIETQR_BANK_CODE trong .env để ghi đè
// (tra cứu tại https://api.vietqr.io/v2/banks và
// https://api.vietqr.io/v2/android-app-deeplinks).
const BANK_DEEPLINK_MAP: Record<string, { appId: string; shortCode: string }> = {
  "970436": { appId: "vcb", shortCode: "vcb" }, // Vietcombank
  "970415": { appId: "icb", shortCode: "icb" }, // VietinBank
  "970418": { appId: "bidv", shortCode: "bidv" }, // BIDV
  "970407": { appId: "tcb", shortCode: "tcb" }, // Techcombank
  "970422": { appId: "mb", shortCode: "mb" }, // MB Bank
  "970416": { appId: "acb", shortCode: "acb" }, // ACB
  "970432": { appId: "vpb", shortCode: "vpb" }, // VPBank
  "970403": { appId: "stb", shortCode: "stb" }, // Sacombank
  "970437": { appId: "hdb", shortCode: "hdb" }, // HDBank
  "970443": { appId: "shb", shortCode: "shb" }, // SHB
  "970441": { appId: "vib", shortCode: "vib" }, // VIB
  "970423": { appId: "tpb", shortCode: "tpb" }, // TPBank
  "970426": { appId: "msb", shortCode: "msb" }, // MSB
  "970448": { appId: "ocb", shortCode: "ocb" }, // OCB
  "970429": { appId: "scb", shortCode: "scb" }, // SCB
  "970431": { appId: "eib", shortCode: "eib" }, // Eximbank
};

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

  // Deeplink mở thẳng app ngân hàng trên điện thoại, điền sẵn số tiền/nội dung
  // (một số app hỗ trợ tự điền, số còn lại chỉ mở app). Ưu tiên override từ env,
  // nếu không có thì tra trong bảng ánh xạ theo mã BIN.
  let deeplinkUrl: string | null = null;
  let bankTransferParams: string | null = null;
  const appIdOverride = process.env.VIETQR_APP_ID;
  const bankCodeOverride = process.env.VIETQR_BANK_CODE;
  const mapped = BANK_DEEPLINK_MAP[bankId];
  const appId = appIdOverride || mapped?.appId;
  const shortCode = bankCodeOverride || mapped?.shortCode;
  if (accountNo && shortCode) {
    // ba/am/tn/bn: số tài khoản người NHẬN tiền (cố định), không đổi theo app
    // ngân hàng mà người trả tiền chọn mở -> dùng được để build link cho
    // BẤT KỲ app ngân hàng nào (xem BANK_APPS ở PaymentQrModal), không chỉ
    // riêng app của ngân hàng nhận tiền.
    const params = new URLSearchParams({
      ba: `${accountNo}@${shortCode}`,
      am: String(Math.max(0, Math.round(amount))),
      tn: addInfo,
    });
    if (accountName) params.set("bn", accountName);
    bankTransferParams = params.toString();

    if (appId) {
      deeplinkUrl = `https://dl.vietqr.io/pay?app=${appId}&${bankTransferParams}`;
    }
  }

  return {
    qrUrl,
    deeplinkUrl,
    bankTransferParams,
    amount,
    addInfo,
    bankName,
    accountNo,
    accountName,
  };
}
