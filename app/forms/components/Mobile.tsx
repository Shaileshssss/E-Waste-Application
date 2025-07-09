import React from "react";
import { ProductForm } from "@/components/ProductForm";

interface CategoryFormProps {
  displayCategoryName: string;
}

const Mobile: React.FC<CategoryFormProps> = ({ displayCategoryName }) => {
  const MobileosOptions = ["Android", "iOS"];
  const MobilebrandOptions = [
    "Samsung",
    "Vivo",
    "Oppo",
    "Iphone",
    "OnePlus",
    "Others",
    "Nokia",
  ];

  return (
    <ProductForm
      category={displayCategoryName}
      osOptions={MobileosOptions}
      brandOptions={MobilebrandOptions}
    />
  );
};

export default Mobile;
