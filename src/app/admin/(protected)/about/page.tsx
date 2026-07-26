export const dynamic = "force-dynamic";

import { getAboutPage } from "@/lib/about";
import AboutForm from "@/components/AboutForm";

export default async function AdminAboutPage() {
  const about = await getAboutPage();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Trang Giới thiệu</h1>
        <div className="ribbon-rule mt-3" />
      </div>
      <AboutForm initial={about} />
    </div>
  );
}
