import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description:
    "Chính sách bảo mật của Français avec Céline: thông tin thu thập, mục đích sử dụng và quyền của học viên đối với dữ liệu cá nhân.",
};

const UPDATED_AT = "23/07/2026";

export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-ink">Chính sách bảo mật</h1>
      <p className="mt-2 text-sm text-ink/60">Cập nhật lần cuối: {UPDATED_AT}</p>

      <div className="mt-8 max-w-none text-ink/90 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_p]:mt-3 [&_p]:leading-relaxed [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1.5">
        <p>
          Français avec Céline ("chúng tôi") tôn trọng quyền riêng tư của học viên và cam kết
          bảo vệ thông tin cá nhân mà bạn cung cấp khi sử dụng nền tảng học tiếng Pháp trực
          tuyến tại francaisavecceline.vercel.app. Chính sách này giải thích chúng tôi thu
          thập, sử dụng và bảo vệ thông tin của bạn như thế nào.
        </p>

        <h2>1. Thông tin chúng tôi thu thập</h2>
        <ul>
          <li>Họ tên, địa chỉ email và ảnh đại diện — lấy từ tài khoản Google khi bạn đăng nhập bằng Google.</li>
          <li>Thông tin đăng ký khoá học: khoá học đã đăng ký, tiến độ học tập, kết quả bài tập.</li>
          <li>Bài nộp và tệp đính kèm bạn tải lên khi làm bài tập.</li>
          <li>Thông tin liên hệ nếu bạn chủ động gửi qua các kênh Zalo, Messenger.</li>
        </ul>

        <h2>2. Mục đích sử dụng thông tin</h2>
        <ul>
          <li>Tạo và quản lý tài khoản học viên trên hệ thống.</li>
          <li>Theo dõi tiến độ học tập, chấm và phản hồi bài tập.</li>
          <li>Gửi thông báo liên quan đến khoá học (hạn nộp bài, kết quả chấm bài...).</li>
          <li>Hỗ trợ, liên hệ và giải đáp thắc mắc của học viên.</li>
          <li>Cải thiện chất lượng nền tảng và trải nghiệm học tập.</li>
        </ul>

        <h2>3. Chia sẻ thông tin với bên thứ ba</h2>
        <p>
          Chúng tôi không bán, cho thuê hoặc trao đổi thông tin cá nhân của học viên cho bất kỳ
          bên thứ ba nào ngoài mục đích vận hành nền tảng. Thông tin có thể được xử lý bởi các
          nhà cung cấp dịch vụ kỹ thuật (lưu trữ máy chủ, cơ sở dữ liệu, lưu trữ tệp đính kèm)
          để vận hành website, và các bên này chỉ được truy cập dữ liệu ở mức cần thiết để cung
          cấp dịch vụ.
        </p>

        <h2>4. Đăng nhập bằng Google</h2>
        <p>
          Khi bạn chọn đăng nhập bằng Google, chúng tôi chỉ yêu cầu quyền truy cập cơ bản: tên,
          email và ảnh đại diện công khai — không yêu cầu quyền truy cập Gmail, Google Drive
          hay bất kỳ dữ liệu nhạy cảm nào khác trong tài khoản Google của bạn.
        </p>

        <h2>5. Bảo mật thông tin</h2>
        <p>
          Chúng tôi áp dụng các biện pháp kỹ thuật hợp lý để bảo vệ thông tin cá nhân khỏi truy
          cập, sử dụng hoặc tiết lộ trái phép. Tuy nhiên, không có phương thức truyền dữ liệu
          nào qua Internet là an toàn tuyệt đối.
        </p>

        <h2>6. Quyền của học viên</h2>
        <p>Bạn có quyền:</p>
        <ul>
          <li>Yêu cầu xem lại thông tin cá nhân mà chúng tôi đang lưu trữ.</li>
          <li>Yêu cầu chỉnh sửa thông tin không chính xác.</li>
          <li>Yêu cầu xoá tài khoản và dữ liệu cá nhân liên quan.</li>
          <li>Thu hồi quyền truy cập đã cấp qua tài khoản Google bất kỳ lúc nào tại phần quản lý bảo mật của tài khoản Google.</li>
        </ul>

        <h2>7. Liên hệ</h2>
        <p>
          Nếu có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ với chúng tôi
          qua Zalo hoặc Messenger ở góc trái màn hình.
        </p>
      </div>
    </article>
  );
}
