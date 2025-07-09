// app/forms/components/Laptop.tsx
import React from 'react';
import { ProductForm } from '@/components/ProductForm'; // Adjust path if needed

interface CategoryFormProps {
  displayCategoryName: string; // The actual name for the heading (e.g., "Laptops & Tablets")
}

const Laptop: React.FC<CategoryFormProps> = ({ displayCategoryName }) => {
  const laptopOsOptions = ["Windows", "macOS", "ChromeOS", "Linux"];
  const laptopBrandOptions = ["Apple", "Dell", "HP", "Lenovo", "Acer", "Asus", "Microsoft", "Samsung", "Other"];

  return (
    <ProductForm
      category={displayCategoryName} // Use this for the form's main heading
      osOptions={laptopOsOptions}
      brandOptions={laptopBrandOptions}
    />
  );
};

export default Laptop;