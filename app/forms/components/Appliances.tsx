import { MultiSelectCheckbox } from "@/components/MultiSelectCheckbox";
import { ProductForm } from "@/components/ProductForm";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { COLORS } from "@/constants/theme";

// Removed AppliancesFormProps interface as it's no longer used for the component's direct props

export default function Appliances() { // Removed { category }: AppliancesFormProps from here
  // State to manage which appliance form is currently visible
  const [selectedApplianceType, setSelectedApplianceType] = useState<"Micro Oven" | "Fridge">("Micro Oven");

  // --- Micro Oven States ---
  const [ovenType, setOvenType] = useState<string[]>([]);
  const [ovenPower, setOvenPower] = useState<string[]>([]);

  // --- Fridge States ---
  const [fridgeType, setFridgeType] = useState<string[]>([]);
  const [fridgeCapacity, setFridgeCapacity] = useState<string[]>([]);

  // Common Brand Options for Appliances
  const commonApplianceBrands = ["LG", "Samsung", "Whirlpool", "Bosch", "Panasonic", "Sony", "Philips", "Haier", "Godrej", "Bajaj", "Other"];

  // Handle Micro Oven form submission and reset
  const handleOvenSubmit = () => {
    console.log("Micro Oven Form Submitted!");
    setOvenType([]);
    setOvenPower([]);
  };

  // Handle Fridge form submission and reset
  const handleFridgeSubmit = () => {
    console.log("Fridge Form Submitted!");
    setFridgeType([]);
    setFridgeCapacity([]);
  };

  return (
    <ScrollView contentContainerStyle={localStyles.scrollViewContent}>
      {/*
        The overall category heading (e.g., "Micro oven & Fridge") was here.
        It has been removed because this component no longer receives the 'category' prop directly.
        The ProductForm components below will still render their specific category headings
        (e.g., "Micro Oven" or "Fridge").
      */}

      {/* Segmented Control / Tabs for Appliance Type Selection */}
      <View style={localStyles.segmentedControlContainer}>
        <TouchableOpacity
          style={[
            localStyles.segmentedButton,
            selectedApplianceType === "Micro Oven" && localStyles.segmentedButtonActive,
          ]}
          onPress={() => setSelectedApplianceType("Micro Oven")}
        >
          <Text
            style={[
              localStyles.segmentedButtonText,
              selectedApplianceType === "Micro Oven" && localStyles.segmentedButtonTextActive,
            ]}
          >
            Micro Oven
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            localStyles.segmentedButton,
            selectedApplianceType === "Fridge" && localStyles.segmentedButtonActive,
          ]}
          onPress={() => setSelectedApplianceType("Fridge")}
        >
          <Text
            style={[
              localStyles.segmentedButtonText,
              selectedApplianceType === "Fridge" && localStyles.segmentedButtonTextActive,
            ]}
          >
            Fridge
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conditional Rendering of ProductForm based on selected type */}
      {selectedApplianceType === "Micro Oven" && (
        <ProductForm
          category="Micro Oven" // This will be the heading for the Micro Oven form
          brandOptions={commonApplianceBrands}
          customFields={
            <>
              <MultiSelectCheckbox
                label="Oven Type"
                options={["Solo", "Grill", "Convection", "OTG"]}
                selected={ovenType}
                onChange={setOvenType}
              />
              <MultiSelectCheckbox
                label="Power Consumption (Watts)"
                options={["<800W", "800W-1000W", "1001W-1200W", "1201W+"]}
                selected={ovenPower}
                onChange={setOvenPower}
              />
            </>
          }
          onSubmit={handleOvenSubmit}
        />
      )}

      {selectedApplianceType === "Fridge" && (
        <ProductForm
          category="Fridge" // This will be the heading for the Fridge form
          brandOptions={commonApplianceBrands}
          customFields={
            <>
              <MultiSelectCheckbox
                label="Fridge Type"
                options={["Single Door", "Double Door", "Side-by-Side", "French Door", "Mini/Compact"]}
                selected={fridgeType}
                onChange={setFridgeType}
              />
              <MultiSelectCheckbox
                label="Capacity (Litres)"
                options={["<150L", "150L-250L", "251L-350L", "351L-500L", "501L+"]}
                selected={fridgeCapacity}
                onChange={setFridgeCapacity}
              />
            </>
          }
          onSubmit={handleFridgeSubmit}
        />
      )}
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  scrollViewContent: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  // Removed mainCategoryHeading as it's no longer part of this component's render
  segmentedControlContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 25,
    padding: 5,
    justifyContent: 'space-around',
  },
  segmentedButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 3,
  },
  segmentedButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  segmentedButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray,
  },
  segmentedButtonTextActive: {
    color: COLORS.white,
  },
});