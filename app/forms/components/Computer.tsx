import React from "react";
import { ProductForm } from "@/components/ProductForm";

interface CategoryFormProps {
  displayCategoryName: string;
}

const Computer: React.FC<CategoryFormProps> = ({ displayCategoryName }) => {
  const computerOsOptions = ["Windows", "macOS", "ChromeOS", "Linux"];
  const computerBrandOptions = [
    "Apple",
    "Dell",
    "HP",
    "Lenovo",
    "Acer",
    "Asus",
    "Microsoft",
    "Samsung",
    "Other",
  ];

  return (
    <ProductForm
      category={displayCategoryName}
      osOptions={computerOsOptions}
      brandOptions={computerBrandOptions}
    />
  );
};

export default Computer;
