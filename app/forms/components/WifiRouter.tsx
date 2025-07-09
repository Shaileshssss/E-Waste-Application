// app/forms/components/WifiRouter.tsx
import React, { useState } from "react";
import { ProductForm } from "@/components/ProductForm";
import { MultiSelectCheckbox } from "@/components/MultiSelectCheckbox"; // Assuming this component exists

interface CategoryFormProps {
    displayCategoryName: string; // The actual name for the heading (e.g., "WIFI Devices")
}

const WifiRouter: React.FC<CategoryFormProps> = ({ displayCategoryName }) => {
    const wifiBandOptions = ["Single-Band (2.4GHz)", "Dual-Band (2.4GHz & 5GHz)", "Tri-Band (2.4GHz & two 5GHz)"];
    const wifiStandardOptions = ["Wi-Fi 4 (802.11n)", "Wi-Fi 5 (802.11ac)", "Wi-Fi 6 (802.11ax)", "Wi-Fi 6E"];
    const wifiBrandOptions = ["TP-Link", "Netgear", "D-Link", "Asus", "Linksys", "Google Nest", "Tenda", "Other"];

    const [selectedWifiBands, setSelectedWifiBands] = useState<string[]>([]);
    const [selectedWifiStandards, setSelectedWifiStandards] = useState<string[]>([]);

    return (
        <ProductForm
            category={displayCategoryName} // Uses the passed display name for the main form heading
            brandOptions={wifiBrandOptions}
            customFields={
                <>
                    <MultiSelectCheckbox
                        label="WiFi Band Support"
                        options={wifiBandOptions}
                        selected={selectedWifiBands}
                        onChange={setSelectedWifiBands}
                    />
                    <MultiSelectCheckbox
                        label="WiFi Standard"
                        options={wifiStandardOptions}
                        selected={selectedWifiStandards}
                        onChange={setSelectedWifiStandards}
                    />
                </>
            }
            // You can add an onSubmit handler here if this specific form needs one
            // onSubmit={() => console.log("WiFi Router Form Submitted")}
        />
    );
}

export default WifiRouter;