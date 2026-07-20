"use client";

import { useState } from "react";
import Image from "next/image";
import type { PaymentInfo } from "@/types";
import { useToast } from "./Toast";

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

          {/* Chỉ hiện trên điện thoại: mở thẳng app ngân hàng, điền sẵn STK/số tiền/nội dung */}
          {payment.deeplinkUrl && (
            <a
              href={payment.deeplinkUrl}
              className="mb-4 flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3.5 text-sm font-semibold text-parchment shadow-sm transition hover:bg-ink/90 sm:hidden"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none">
                <rect x="5" y="2" width="10" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 15h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Mở app ngân hàng để thanh toán
            </a>
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
