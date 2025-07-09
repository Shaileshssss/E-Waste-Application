import { formStyles } from "@/styles/form.style";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { MultiSelectCheckbox } from "./MultiSelectCheckbox";
import { QuantityOptions } from "./Quantity";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { router } from "expo-router";

type ProductFormProps = {
  category: string;
  osOptions?: string[];
  brandOptions: string[];
  customFields?: React.ReactNode;
  onSubmit?: (formData: any) => void;
};

export function ProductForm({
  category,
  osOptions,
  brandOptions,
  customFields,
  onSubmit,
}: ProductFormProps) {
  const [form, setForm] = useState({
    os: [],
    brand: [],
    model: "",
    manufactureDate: "",
    description: "",
    quantity: "",
  });

  const [errors, setErrors] = useState({
    brand: "",
    quantity: "",
  });

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const insertProduct = useMutation(api.products.insertProduct);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!form.brand || form.brand.length === 0) {
      newErrors.brand = "Please select at least one brand";
    }
    if (!form.quantity) {
      newErrors.quantity = "Quantity is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      allowsEditing: true,
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setSelectedImages((prev) => [...prev, ...uris]);
      console.log("Selected image URIs:", uris);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let imageIds: string[] = [];

      if (selectedImages.length > 0) {
        for (const imageUri of selectedImages) {
          const uploadUrl = await generateUploadUrl();
          const uploadResult = await FileSystem.uploadAsync(
            uploadUrl,
            imageUri,
            {
              httpMethod: "POST",
              uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
              mimeType: "image/jpeg",
            }
          );

          if (uploadResult.status !== 200) throw new Error("Upload failed");

          const { storageId } = JSON.parse(uploadResult.body);
          imageIds.push(storageId);
        }
      }

      await insertProduct({
        categoryId: category,
        os: form.os,
        brand: form.brand,
        model: form.model,
        manufactureDate: form.manufactureDate,
        description: form.description,
        quantity: form.quantity,
        images: imageIds,
      });

      Alert.alert("Success", "Thanks for filling the form!");

      setForm({
        os: [],
        brand: [],
        model: "",
        manufactureDate: "",
        description: "",
        quantity: "",
      });
      setSelectedImages([]);
      setErrors({ brand: "", quantity: "" });

      onSubmit && onSubmit({
        os: [],
        brand: [],
        model: "",
        manufactureDate: "",
        description: "",
        quantity: "",
      });
    } catch (error) {
      console.error("Failed to submit:", error);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={formStyles.container}
      enableOnAndroid={true}
      extraScrollHeight={100}
    >
      <Text style={formStyles.title}>{category}</Text>

      {osOptions && osOptions.length > 0 && (
        <MultiSelectCheckbox
          label="Operating System"
          options={osOptions}
          selected={form.os}
          onChange={(selected) => handleChange("os", selected)}
        />
      )}

      <MultiSelectCheckbox
        label="Brand *"
        options={brandOptions}
        selected={form.brand}
        onChange={(selected) => handleChange("brand", selected)}
      />

      {errors.brand && (
        <Text style={{ color: "red", marginBottom: 10 }}>{errors.brand}</Text>
      )}

      {customFields && <View>{customFields}</View>}

      <View style={formStyles.field}>
        <Text style={formStyles.label}>Model</Text>
        <TextInput
          style={formStyles.input}
          value={form.model}
          onChangeText={(text) => handleChange("model", text)}
          placeholder="Enter Model (Optional)"
        />
      </View>

      <View style={formStyles.field}>
        <Text style={formStyles.label}>Purchase/Manufacture Date</Text>
        <TextInput
          style={formStyles.input}
          value={form.manufactureDate}
          onChangeText={(text) => handleChange("manufactureDate", text)}
          placeholder="e.g. Jan 2025 (Optional)"
        />
      </View>

      <QuantityOptions
        category={category}
        value={form.quantity}
        onChange={(val) => handleChange("quantity", val)}
      />
      {errors.quantity && (
        <Text style={{ color: "red", marginBottom: 10 }}>
          {errors.quantity}
        </Text>
      )}

      <View style={formStyles.field}>
        <Text style={formStyles.label}>Description</Text>
        <TextInput
          style={formStyles.textarea}
          value={form.description}
          onChangeText={(text) => handleChange("description", text)}
          multiline
          placeholder="Add some notes... (Optional)"
        />
      </View>

      <TouchableOpacity
        onPress={pickImage}
        style={{ ...formStyles.uploadButton, marginBottom: 10 }}
      >
        <Text style={{ textAlign: "center" }}>
          {selectedImages.length > 0
            ? "Change / Add More Images"
            : "Upload Images (Optional)"}
        </Text>
      </TouchableOpacity>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {selectedImages.map((uri, index) => (
          <Image
            key={index}
            source={{ uri }}
            style={{
              width: 100,
              height: 100,
              marginRight: 10,
              borderRadius: 8,
            }}
          />
        ))}
      </ScrollView>

      <TouchableOpacity style={formStyles.submitButton} onPress={handleSubmit}>
        <Text style={formStyles.submitButtonText}>Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity
      style={formStyles.cancelButton}
      onPress={() => router.back()}>
        <Text style={formStyles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}
