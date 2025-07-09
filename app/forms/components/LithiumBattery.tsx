// app/forms/components/LithiumBattery.tsx
import React, { useState } from "react";
import { ProductForm } from "@/components/ProductForm";
import { MultiSelectCheckbox } from "@/components/MultiSelectCheckbox"; // Assuming this component exists

interface CategoryFormProps {
    displayCategoryName: string; // The actual name for the heading (e.g., "Lithium Battery")
}

const LithiumBattery: React.FC<CategoryFormProps> = ({ displayCategoryName }) => {
    const batteryTypeOptions = ["Li-ion (Lithium-ion)", "Li-Po (Lithium Polymer)", "LiFePO4 (Lithium Iron Phosphate)", "Other Lithium Battery"];
    const batteryCapacityOptions = ["< 1000 mAh", "1000 - 3000 mAh", "3001 - 5000 mAh", "> 5000 mAh"];
    const batteryBrandOptions = ["Samsung", "LG Chem", "Panasonic", "Sony", "EVE", "CATL", "Duracell", "Energizer", "Other"];

    const [selectedBatteryTypes, setSelectedBatteryTypes] = useState<string[]>([]);
    const [selectedBatteryCapacities, setSelectedBatteryCapacities] = useState<string[]>([]);

    return (
        <ProductForm
            category={displayCategoryName} // Uses the passed display name for the main form heading
            brandOptions={batteryBrandOptions}
            customFields={
                <>
                    <MultiSelectCheckbox
                        label="Battery Type"
                        options={batteryTypeOptions}
                        selected={selectedBatteryTypes}
                        onChange={setSelectedBatteryTypes}
                    />
                    <MultiSelectCheckbox
                        label="Capacity (mAh)"
                        options={batteryCapacityOptions}
                        selected={selectedBatteryCapacities}
                        onChange={setSelectedBatteryCapacities}
                    />
                </>
            }
            // onSubmit={() => console.log("Lithium Battery Form Submitted")}
        />
    );
}

export default LithiumBattery;