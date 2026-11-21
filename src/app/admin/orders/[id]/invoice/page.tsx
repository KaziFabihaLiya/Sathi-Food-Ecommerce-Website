import Invoice from "@/components/admin/Invoice";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Invoice id={id} />;
}
