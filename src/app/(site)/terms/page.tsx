import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
  description:
    "Điều khoản sử dụng nền tảng học tiếng Pháp trực tuyến Français avec Céline.",
};

const UPDATED_AT = "23/07/2026";

export default function TermsOfServicePage() {
  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-ink">Điều khoản sử dụng</h1>
      <p className="mt-2 text-sm text-ink/60">Cập nhật lần cuối: {UPDATED_AT}</p>

      <div className="mt-8 max-w-none text-ink/90 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_p]:mt-3 [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1.5">
        <p>
          Khi truy cập và sử dụng nền tảng Français avec Céline tại
          francaisavecceline.vercel.app, bạn đồng ý tuân thủ các điều khoản sử dụng dưới đây.
          Vui lòng đọc kỹ trước khi đăng ký tài khoản hoặc khoá học.
        </p>

        <h2>1. Tài khoản học viên</h2>
        <ul>
          <li>Học viên đăng ký/đăng nhập bằng tài khoản Google và chịu trách nhiệm bảo mật tài khoản của mình.</li>
          <li>Thông tin đăng ký (họ tên, email...) cần chính xác và trung thực.</li>
          <li>Không được chia sẻ tài khoản cho người khác sử dụng.</li>
        </ul>

        <h2>2. Đăng ký khoá học và học phí</h2>
        <ul>
          <li>Học viên đăng ký khoá học theo thông tin, mức học phí được công bố trên website tại thời điểm đăng ký.</li>
          <li>Chính sách hoàn tiền (nếu có) sẽ được thông báo cụ thể theo từng khoá học hoặc theo thoả thuận trực tiếp với Français avec Céline.</li>
        </ul>

        <h2>3. Bản quyền nội dung</h2>
        <ul>
          <li>Toàn bộ video bài giảng, tài liệu, bài tập thuộc bản quyền của Français avec Céline.</li>
          <li>Học viên chỉ được sử dụng nội dung khoá học cho mục đích học tập cá nhân, không được sao chép, chia sẻ, đăng tải lại hoặc thương mại hoá dưới bất kỳ hình thức nào khi chưa có sự đồng ý bằng văn bản.</li>
        </ul>

        <h2>4. Quy tắc ứng xử</h2>
        <p>
          Học viên cam kết sử dụng nền tảng một cách văn minh, không đăng tải nội dung vi
          phạm pháp luật, phản cảm hoặc gây ảnh hưởng đến học viên khác và giảng viên.
        </p>

        <h2>5. Tạm ngưng hoặc chấm dứt tài khoản</h2>
        <p>
          Français avec Céline có quyền tạm ngưng hoặc chấm dứt quyền truy cập của tài khoản
          vi phạm các điều khoản trên, bao gồm nhưng không giới hạn ở việc chia sẻ tài khoản,
          sao chép nội dung khoá học trái phép.
        </p>

        <h2>6. Giới hạn trách nhiệm</h2>
        <p>
          Chúng tôi nỗ lực đảm bảo nền tảng hoạt động ổn định, tuy nhiên không đảm bảo website
          hoạt động liên tục không gián đoạn hoặc không có lỗi kỹ thuật. Français avec Céline
          không chịu trách nhiệm cho các thiệt hại gián tiếp phát sinh từ việc sử dụng hoặc
          không thể sử dụng nền tảng.
        </p>

        <h2>7. Thay đổi điều khoản</h2>
        <p>
          Điều khoản sử dụng có thể được cập nhật theo thời gian. Phiên bản mới nhất luôn được
          đăng tải tại trang này.
        </p>

        <h2>8. Liên hệ</h2>
        <p>
          Mọi thắc mắc về điều khoản sử dụng, vui lòng liên hệ với chúng tôi qua Zalo hoặc
          Messenger ở góc trái màn hình.
        </p>
      </div>
    </article>
  );
}
