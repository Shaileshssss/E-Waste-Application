import { COLORS } from "@/constants/theme";
import { formStyles } from "@/styles/form.style";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';

type Props = {
    category: string;
    value: string;
    onChange: (val: string) => void;
}

export const QuantityOptions = ({ category, value, onChange }: Props) => {
    const [open, setOpen] = React.useState(false);
    const [items, setItems] = React.useState<{ label: string; value: string } []> (
        []
    );

    React.useEffect(() => {
        let ranges: string[] = [];

        if (category === "Cables & wires") {
            ranges = ["1to5","5to5"];
        } else {
            ranges = [
                "1to5",
                "5to10",
                "10to15",
                "15to20",
                "20to25",
                "25to30",
                "30to60",
            ]
        }

        setItems(ranges.map((range) => ({ label: range, value: range})))
    }, [category]);

    return (
        <View style={styles.container}>
                    <Text style={formStyles.label}>
                      Quantity <Text style={{ color: COLORS.error }}>*</Text>
                    </Text>
            <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={(callback) => onChange(callback(value))}
            setItems={setItems}
            style={styles.dropdown}
            placeholder="Select Quantity"
            zIndex={3000}
            zIndexInverse={1000}
            listMode="SCROLLVIEW"
            />
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        zIndex: 10,
    },
    label : {
        marginBottom: 6,
        fontWeight: "600",
        fontSize: 16,
        color: "#333",
    },
    dropdown: {
        borderColor: "#ccc",
        backgroundColor: "#fff",
    }
})