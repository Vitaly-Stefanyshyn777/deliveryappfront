import { Suspense } from "react";
import { ShopCatalogView } from "@/components/pages/ShopCatalogView";

function ShopPageContent() {
  return <ShopCatalogView />;
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div>Завантаження...</div>}>
      <ShopPageContent />
    </Suspense>
  );
}
