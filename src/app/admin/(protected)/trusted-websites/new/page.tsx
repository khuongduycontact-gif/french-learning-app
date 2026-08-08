import TrustedWebsiteForm from "@/components/TrustedWebsiteForm";

export default function NewTrustedWebsitePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Thêm website</h1>
        <div className="ribbon-rule mt-3" />
      </div>
      <TrustedWebsiteForm />
    </div>
  );
}
