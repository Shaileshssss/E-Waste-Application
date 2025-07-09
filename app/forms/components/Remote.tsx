// app/forms/components/Remote.tsx
import React, { useState } from "react";
import { ProductForm } from "@/components/ProductForm";
import { MultiSelectCheckbox } from "@/components/MultiSelectCheckbox"; // Assuming this component exists

interface CategoryFormProps {
    displayCategoryName: string; // The actual name for the heading (e.g., "Remotes")
}

const Remote: React.FC<CategoryFormProps> = ({ displayCategoryName }) => {
    const remoteTypeOptions = ["TV Remote", "AC Remote", "Set-Top Box Remote", "Universal Remote", "Gaming Console Remote", "Other"];
    const remoteBrandOptions = ["Universal", "LG", "Samsung", "Sony", "Philips", "Tata Sky", "Dish TV", "Airtel", "Videocon", "Other"];

    const [selectedRemoteTypes, setSelectedRemoteTypes] = useState<string[]>([]);

    return (
        <ProductForm
            category={displayCategoryName} // Uses the passed display name for the main form heading
            brandOptions={remoteBrandOptions}
            customFields={
                <MultiSelectCheckbox
                    label="Remote Type"
                    options={remoteTypeOptions}
                    selected={selectedRemoteTypes}
                    onChange={setSelectedRemoteTypes}
                />
            }
            // onSubmit={() => console.log("Remote Form Submitted")}
        />
    );
}

export default Remote;