// app/forms/components/Cables.tsx
import React from "react";
import { ProductForm } from "@/components/ProductForm";
import { MultiSelectCheckbox } from "@/components/MultiSelectCheckbox"; // Make sure this component exists and is imported correctly

interface CategoryFormProps {
    displayCategoryName: string; // The actual name for the heading (e.g., "Cables & Wires")
}

const Cables: React.FC<CategoryFormProps> =({ displayCategoryName }) => {
    const cableTypeOptions = ["HDMI", "VGA", "USB", "LAN", "Power Cord", "Audio", "Others"];
    const cableBrandOptions = ["MX", "Belden", "Finolex", "Polycab", "Others"];

    // State to manage the selected cable types from the MultiSelectCheckbox
    const [selectedCableTypes, setSelectedCableTypes] = React.useState<string[]>([]);

    return (
        <ProductForm
            category={displayCategoryName} // Uses the passed display name for the main form heading
            brandOptions={cableBrandOptions}
            // Pass cable types as a custom field using MultiSelectCheckbox
            customFields={
                <MultiSelectCheckbox
                    label="Cable Type" // Appropriate label for cable types
                    options={cableTypeOptions}
                    selected={selectedCableTypes}
                    onChange={setSelectedCableTypes}
                />
            }
            // You can also add an onSubmit handler here if this specific form needs one
            // onSubmit={() => console.log("Cables Form Submitted")}
        />
    )
}

export default Cables;
