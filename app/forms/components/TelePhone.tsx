// app/forms/components/TelePhone.tsx
import React, { useState } from "react";
import { ProductForm } from "@/components/ProductForm";
import { MultiSelectCheckbox } from "@/components/MultiSelectCheckbox"; // Assuming this component exists

interface CategoryFormProps {
    displayCategoryName: string; // The actual name for the heading (e.g., "Telephones")
}

const TelePhone: React.FC<CategoryFormProps> = ({ displayCategoryName }) => {
    const phoneTypeOptions = ["Corded", "Cordless (DECT)", "VoIP Phone", "Fax Machine"];
    const phoneBrandOptions = ["Panasonic", "Gigaset", "Motorola", "Siemens", "Cisco", "Polycom", "AT&T", "VTech", "Other"];

    const [selectedPhoneTypes, setSelectedPhoneTypes] = useState<string[]>([]);

    return (
        <ProductForm
            category={displayCategoryName} // Uses the passed display name for the main form heading
            brandOptions={phoneBrandOptions}
            customFields={
                <MultiSelectCheckbox
                    label="Phone Type"
                    options={phoneTypeOptions}
                    selected={selectedPhoneTypes}
                    onChange={setSelectedPhoneTypes}
                />
            }
            // onSubmit={() => console.log("Telephone Form Submitted")}
        />
    );
}

export default TelePhone;