"use client";

import { useState } from "react";
import Image from "next/image";
import type { PaymentInfo } from "@/types";
import { useToast } from "./Toast";

// Danh sách app ngân hàng phổ biến để người trả tiền tự chọn đúng app của họ
// (khớp appId với https://api.vietqr.io/v2/android-app-deeplinks). Link luôn
// trỏ tới tài khoản NGƯỜI NHẬN (payment.bankTransferParams), chỉ khác app nào
// được mở trên máy người trả tiền.
// autofill: true = VietQR xác nhận app này tự điền sẵn STK/số tiền/nội dung
// khi mở deeplink (theo changelog vietqr.io); false = chỉ mở app, khách có
// thể cần tự nhập lại thông tin bên trong app.
const BANK_APPS: { appId: string; label: string; autofill?: boolean }[] = [
  { appId: "acb", label: "ACB", autofill: true },
  { appId: "ocb", label: "OCB", autofill: true },
  { appId: "bidv", label: "BIDV", autofill: true },
  { appId: "icb", label: "VietinBank", autofill: true },
  { appId: "vcb", label: "Vietcombank" },
  { appId: "tcb", label: "Techcombank" },
  { appId: "mb", label: "MB Bank" },
  { appId: "vpb", label: "VPBank" },
  { appId: "tpb", label: "TPBank" },
  { appId: "stb", label: "Sacombank" },
  { appId: "msb", label: "MSB" },
  { appId: "shb", label: "SHB" },
];

export default function PaymentQrModal({
  open,
  onClose,
  courseTitle,
  payment,
  confirming,
  onConfirmPaid,
}: {
  open: boolean;
  onClose: () => void;
  courseTitle: string;
  payment: PaymentInfo;
  confirming: boolean;
  onConfirmPaid: () => void;
}) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(payment.addInfo);
      setCopied(true);
      showToast("Đã sao chép nội dung chuyển khoản", "success");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast("Không sao chép được, vui lòng nhập tay", "error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-sm flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header cố định, bo góc theo khung ngoài */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-mist px-6 pb-4 pt-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Thanh toán khoá học
            </h2>
            <p className="mt-0.5 text-sm text-ink/60 line-clamp-1">{courseTitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="shrink-0 rounded-full p-1.5 text-ink/50 transition hover:bg-mist hover:text-ink"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 5L15 15M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Nội dung cuộn được, phần bo góc chỉ nằm ở khung ngoài nên luôn mượt */}
        <div className="overflow-y-auto px-6 py-5">
          <p className="mb-4 text-center font-display text-2xl font-semibold text-bordeaux">
            {payment.amount.toLocaleString("vi-VN")} đ
          </p>

          {payment.qrUrl ? (
            <div className="mx-auto mb-4 w-full max-w-[260px] overflow-hidden rounded-2xl border border-mist bg-white p-3 shadow-sm">
              <Image
                src={payment.qrUrl}
                alt="Mã QR thanh toán VietQR"
                width={520}
                height={520}
                unoptimized
                className="h-auto w-full rounded-lg"
              />
            </div>
          ) : (
            <p className="mb-4 rounded-2xl border border-dashed border-mist p-4 text-center text-sm text-ink/60">
              Vui lòng chuyển khoản theo thông tin bên dưới.
            </p>
          )}

          {/* Chỉ hiện trên điện thoại: chọn đúng app ngân hàng của mình để
              chuyển khoản, thông tin người nhận/số tiền/nội dung đã điền sẵn */}
          {payment.bankTransferParams && (
            <div className="mb-4 rounded-2xl border border-mist bg-mist/20 p-3.5 sm:hidden">
              <p className="mb-2.5 text-xs font-semibold text-ink/70">
                Chuyển khoản nhanh — chọn app ngân hàng của bạn
              </p>
              <div className="grid grid-cols-3 gap-2">
                {BANK_APPS.map((bank) => (
                  <a
                    key={bank.appId}
                    href={`https://dl.vietqr.io/pay?app=${bank.appId}&${payment.bankTransferParams}`}
                    className="relative rounded-xl bg-white px-2 py-2.5 text-center text-xs font-medium text-ink shadow-sm ring-1 ring-mist transition active:scale-95 active:bg-mist/60"
                  >
                    {bank.autofill && (
                      <span className="absolute -right-1 -top-1 rounded-full bg-green-600 px-1.5 py-[1px] text-[9px] font-semibold leading-tight text-white">
                        Auto
                      </span>
                    )}
                    {bank.label}
                  </a>
                ))}
              </div>
              <p className="mt-2.5 text-center text-[11px] text-ink/50">
                <span className="mr-1 inline-block rounded-full bg-green-600 px-1.5 py-[1px] text-[9px] font-semibold leading-tight text-white">
                  Auto
                </span>
                = tự điền sẵn thông tin. Ngân hàng khác vẫn mở app, có thể cần nhập lại.
              </p>
              <p className="mt-1.5 text-center text-[11px] text-ink/50">
                Không thấy ngân hàng của bạn? Quét mã QR ở trên thay thế.
              </p>
            </div>
          )}

          <div className="mb-5 flex flex-col gap-2 rounded-2xl bg-mist/40 p-4 text-sm">
            {payment.bankName && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink/60">Ngân hàng</span>
                <span className="font-medium text-ink">{payment.bankName}</span>
              </div>
            )}
            {payment.accountNo && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink/60">Số tài khoản</span>
                <span className="font-medium text-ink">{payment.accountNo}</span>
              </div>
            )}
            {payment.accountName && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-ink/60">Chủ tài khoản</span>
                <span className="truncate font-medium text-ink">{payment.accountName}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-3 border-t border-mist pt-2">
              <span className="text-ink/60">Nội dung CK</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-semibold text-bordeaux shadow-sm transition hover:bg-bordeaux/5"
              >
                {payment.addInfo}
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none">
                  {copied ? (
                    <path
                      d="M4 10.5L8 14.5L16 6"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <>
                      <rect x="7" y="7" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M4 13V5a1 1 0 0 1 1-1h8" stroke="currentColor" strokeWidth="1.4" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <p className="mb-1 text-center text-xs text-ink/50">
            Vui lòng chuyển khoản đúng số tiền và nội dung ở trên để được xác nhận nhanh chóng.
          </p>
        </div>

        {/* Vùng nút cố định phía dưới */}
        <div className="shrink-0 border-t border-mist px-6 pb-6 pt-4">
          <button
            onClick={onConfirmPaid}
            disabled={confirming}
            className="w-full rounded-full bg-bordeaux px-6 py-3 text-sm font-semibold text-parchment transition hover:bg-bordeaux/90 disabled:opacity-60"
          >
            {confirming ? "Đang xử lý..." : "Tôi đã thanh toán"}
          </button>
          <button
            onClick={onClose}
            className="mt-2 w-full rounded-full px-6 py-2.5 text-sm font-medium text-ink/60 transition hover:bg-mist"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
}
