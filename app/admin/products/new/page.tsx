import ProductCreateForm from "@/components/admin/ProductCreateForm";

export const metadata = { title: "商品追加 | 管理" };

export default function Page() {
  return (
    <div className="p-6">
      <ProductCreateForm />
    </div>
  );
}
