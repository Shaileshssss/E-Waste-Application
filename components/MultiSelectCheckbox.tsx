import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";

type Props = {
    label: string;
    options: string[];
    selected: string[];
    onChange: (selectedOptions: string[]) => void;
    icons?: Record<string, keyof typeof Ionicons.glyphMap>;
    showError?: boolean;
};

export const MultiSelectCheckbox = ({
    label,
    options,
    selected,
    onChange,
    icons,
    showError = false,
}: Props) => {
    const scales = useRef(
        options.reduce((acc, option) => {
            acc[option] = new Animated.Value(1);
            return acc;
        }, {} as Record<string, Animated.Value>)
    ).current;

    const toggleOption = (option: string) => {
        Animated.sequence([
            Animated.spring(scales[option], {
                toValue: 1.1,
                useNativeDriver: true,
            }),
            Animated.spring(scales[option], {
                toValue: 1,
                useNativeDriver: true,
            }),
        ]).start();

        if (selected.includes(option)) {
            onChange(selected.filter((item) => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.optionsWrapper}>
                {options.map((option) => (
                    <Animated.View
                        key={option}
                        style={[
                            styles.pillWrapper,
                            { transform: [{ scale: scales[option] }] },
                        ]}
                    >
                        <TouchableOpacity
                            style={[
                                styles.pill,
                                selected.includes(option) && styles.selectedPill,
                            ]}
                            onPress={() => toggleOption(option)}
                        >
                            {icons?.[option] && (
                                <Ionicons
                                    name={icons[option]}
                                    size={16}
                                    color={selected.includes(option) ? "#fff" : "#333"}
                                    style={{ marginRight: 6 }}
                                />
                            )}
                            <Text
                                style={[
                                    styles.pillText,
                                    selected.includes(option) && styles.selectedPillText,
                                ]}
                            >
                                {option}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>

            {showError && selected.length === 0 && (
                <Text style={styles.errorText}>Please select at least one option.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontWeight: "600",
        fontSize: 16,
        marginBottom: 10,
        color: "#333",
    },
    optionsWrapper: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    pillWrapper: {
        borderRadius: 20,
    },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: "#e5e7eb",
    },
    selectedPill: {
        backgroundColor: "#16a34a",
    },
    pillText: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
    },
    selectedPillText: {
        color: "#fff",
        fontWeight: "600",
    },
    errorText: {
        color: "red",
        marginTop: 6,
    },
});