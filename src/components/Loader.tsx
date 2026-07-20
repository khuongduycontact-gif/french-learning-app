export default function Loader({ label = "Đang tải..." }: { label?: string }) {
  return (
    // Phủ kín toàn bộ màn hình (kể cả navbar/footer) - lúc loading người dùng
    // chỉ nhìn thấy duy nhất loading này, không thấy gì khác của trang.
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-6 bg-parchment px-6">
      <div className="relative h-16 w-full max-w-xs overflow-hidden">
        <div className="loader-rocket absolute left-1/2 top-1/2 -ml-5 -mt-5">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="rotate(45 20 20)">
              <ellipse
                className="loader-exhaust"
                cx="20"
                cy="32"
                rx="4.5"
                ry="6"
                fill="url(#loaderFlame)"
              />
              <path
                d="M20 4c5 4 6.5 9.5 6.5 16 0 4-1.2 8-2 10h-9c-.8-2-2-6-2-10 0-6.5 1.5-12 6.5-16z"
                fill="#1B2A4A"
              />
              <path d="M20 4c3 2.5 4.6 6 5.4 9.5H14.6C15.4 10 17 6.5 20 4z" fill="#C9A227" />
              <circle cx="20" cy="16.5" r="2.6" fill="#F7F3EC" stroke="#1B2A4A" strokeWidth="1" />
              <path d="M14.5 22 9 27.5l3-.4 2.2-3.6z" fill="#8C2F35" />
              <path d="M25.5 22 31 27.5l-3-.4-2.2-3.6z" fill="#8C2F35" />
            </g>
            <defs>
              <radialGradient id="loaderFlame" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 32) scale(4.5 6)">
                <stop stopColor="#F7F3EC" />
                <stop offset="0.5" stopColor="#C9A227" />
                <stop offset="1" stopColor="#8C2F35" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>

      <p className="text-sm font-semibold tracking-wide text-ink">{label}</p>

      <div className="h-3 w-full max-w-xs overflow-hidden rounded-full bg-ink/10">
        <div
          className="loader-bar h-full w-2/5 rounded-full"
          style={{
            // 3 màu cờ Pháp: xanh dương - trắng - đỏ
            background: "linear-gradient(90deg, #0055A4 0%, #FFFFFF 50%, #EF4135 100%)",
          }}
        />
      </div>

      <style>{`
        @keyframes loader-fly {
          0% { transform: translate(-70px, 14px); }
          50% { transform: translate(0px, -16px); }
          100% { transform: translate(70px, 14px); }
        }
        @keyframes loader-bar-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        @keyframes loader-exhaust-fade {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.75; }
        }
        .loader-rocket {
          animation: loader-fly 2s ease-in-out infinite alternate;
        }
        .loader-bar {
          animation: loader-bar-slide 1.3s ease-in-out infinite;
        }
        .loader-exhaust {
          animation: loader-exhaust-fade 0.9s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
