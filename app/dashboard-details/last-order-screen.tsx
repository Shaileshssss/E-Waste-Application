import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { COLORS } from "@/constants/theme";
import { format } from "date-fns";

interface OrderProduct {
  productId: string;
  name: string;
  image: string;
  discountPrice: number;
  originalPrice: number;
  quantity: number;
}

interface Order {
  _id: string;
  userId: string;
  products: OrderProduct[];
  totalAmount: number;
  savedAmount: number;
  orderDate: number;
  _creationTime: number;
}

export default function LastOrderScreen() {
  const router = useRouter();
  const { userId: clerkUserId } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [pdfContent, setPdfContent] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");

  const currentUser = useQuery(
    api.users?.getUserByClerkId,
    clerkUserId ? { clerkId: clerkUserId } : "skip"
  );

  const lastOrder = useQuery(
    api.orders?.getLastOrder,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const allOrders = useQuery(
    api.orders?.getAllOrders,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  const orderItems: OrderProduct[] = useMemo(
    () => lastOrder?.products || [],
    [lastOrder]
  );
  const orderTotal = useMemo(() => lastOrder?.totalAmount || 0, [lastOrder]);
  const orderSaved = useMemo(() => lastOrder?.savedAmount || 0, [lastOrder]);
  const orderDate = useMemo(
    () =>
      lastOrder?.orderDate
        ? format(new Date(lastOrder.orderDate), "MMM dd,yyyy")
        : "N/A",
    [lastOrder]
  );
  const orderIdDisplay = useMemo(
    () =>
      lastOrder?._id ? lastOrder._id.toString().slice(-6).toUpperCase() : "N/A",
    [lastOrder]
  );

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const numToWordsLessThan100 = (num: number): string => {
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    return (
      tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + ones[num % 10] : "")
    );
  };

  const numToWordsLessThan1000 = (num: number): string => {
    let result = "";
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + " Hundred";
      num %= 100;
      if (num !== 0) result += " ";
    }
    result += numToWordsLessThan100(num);
    return result.trim();
  };

  const convertNumberToWords = (amount: number): string => {
    if (amount === 0) return "Zero Rupees Only";

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let result = "";
    const lakh = 100000;
    const crore = 10000000;

    if (rupees >= crore) {
      result += numToWordsLessThan100(Math.floor(rupees / crore)) + " Crore ";
      result +=
        numToWordsLessThan1000(Math.floor((rupees % crore) / lakh)) + " Lakh ";
      result +=
        numToWordsLessThan1000(Math.floor((rupees % lakh) / 1000)) +
        " Thousand ";
      result += numToWordsLessThan1000(rupees % 1000);
    } else if (rupees >= lakh) {
      result += numToWordsLessThan100(Math.floor(rupees / lakh)) + " Lakh ";
      result +=
        numToWordsLessThan1000(Math.floor((rupees % lakh) / 1000)) +
        " Thousand ";
      result += numToWordsLessThan1000(rupees % 1000);
    } else if (rupees >= 1000) {
      result +=
        numToWordsLessThan1000(Math.floor(rupees / 1000)) + " Thousand ";
      result += numToWordsLessThan1000(rupees % 1000);
    } else if (rupees > 0) {
      result += numToWordsLessThan1000(rupees);
    } else {
      result = "Zero";
    }

    result = result.trim();
    if (result) {
      result += " Rupees";
    } else {
      result = "Zero Rupees";
    }

    if (paise > 0) {
      result += " and " + numToWordsLessThan100(paise) + " Paise";
    }

    return result.trim() + " Only";
  };

  const generatePdfContent = (
    data: Order | Order[],
    isAllOrders: boolean = false
  ): string => {
    let content = "";
    content += `==============================================\n`;
    content += `  E-Waste Recycling Order Copy\n`;
    content += `==============================================\n\n`;

    if (isAllOrders && Array.isArray(data)) {
      content += `Report Generated: ${format(new Date(), "MMM dd,yyyy HH:mm")}\n`;
      content += `User ID: ${currentUser?.clerkId || "N/A"}\n`;
      content += `Total Orders: ${data.length}\n`;
      content += `\n----------------------------------------------\n\n`;

      data.forEach((ord, index) => {
        content += `Order ID: ${ord._id.toString().slice(-6).toUpperCase()}\n`;
        content += `Date: ${format(new Date(ord.orderDate), "MMMM dd,yyyy HH:mm")}\n`;
        content += `Total Value: ₹${ord.totalAmount.toFixed(2)}\n`;
        if (ord.savedAmount > 0.01) {
          content += `You Saved: ₹${ord.savedAmount.toFixed(2)}\n`;
        }
        content += `Items:\n`;
        ord.products.forEach((item) => {
          content += `- ${item.name}\n`;
          content += `  Qty: ${item.quantity} @ ₹${item.discountPrice.toFixed(2)} each\n`;
          content += `  Subtotal: ₹${(item.discountPrice * item.quantity).toFixed(2)}\n`;
        });
        content += `\n----------------------------------------------\n\n`;
      });
      content += `End of Report.\n`;
    } else if (!isAllOrders && !Array.isArray(data)) {
      const ord = data as Order;
      content += `Order ID: ${ord._id.toString().slice(-6).toUpperCase()}\n`;
      content += `Date: ${format(new Date(ord.orderDate), "MMMM dd,yyyy HH:mm")}\n`;
      content += `\n--- Order Details ---\n`;

      ord.products.forEach((item) => {
        content += `\nItem: ${item.name}\n`;
        content += `  Qty: ${item.quantity} @ ₹${item.discountPrice.toFixed(2)} each\n`;
        content += `  Subtotal: ₹${(item.discountPrice * item.quantity).toFixed(2)}\n`;
      });

      content += `\n----------------------------------------------\n`;
      content += `Total Items Value: ₹${(ord.totalAmount + ord.savedAmount).toFixed(2)}\n`;
      content += `Discount/Saved: ₹${ord.savedAmount.toFixed(2)}\n`;
      content += `Net Amount Paid: ₹${ord.totalAmount.toFixed(2)}\n`;
      content += `Amount in Words: ${convertNumberToWords(ord.totalAmount)}\n`;
      content += `\nThank you for choosing E-Waste Recycling! ♻️`;
    }

    content += `\n==============================================`;
    return content;
  };

  const handleDownloadPdf = (
    orderData: Order | Order[],
    title: string,
    isAllOrders: boolean = false
  ) => {
    const content = generatePdfContent(orderData, isAllOrders);
    setPdfContent(content);
    setPdfTitle(title);
    setModalVisible(true);

    Alert.alert(
      "Simulated PDF Download",
      `A PDF for "${title}" would be generated and downloaded. For now, view the content in the modal.`,
      [
        {
          text: "OK",
          onPress: () => console.log("Simulated download acknowledged"),
        },
      ]
    );
  };

  const handleSendEmail = async (orderData: Order, emailSubject: string) => {
    const emailBody = generatePdfContent(orderData, false);
    const recipient = currentUser?.email || "";
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
        Alert.alert(
          "Email Client Opened",
          "Your email client should have opened with the order copy drafted."
        );
      } else {
        Alert.alert(
          "Error",
          "Could not open email client. Please ensure you have one configured."
        );
      }
    } catch (error) {
      console.error("Failed to open email client:", error);
      Alert.alert("Error", "Failed to open email client.");
    }
  };

  const handleSendAllOrdersEmail = async () => {
    if (!allOrders || allOrders.length === 0) {
      Alert.alert("No Orders", "There are no orders to send via email.");
      return;
    }
    const emailSubject = `Your E-Waste Recycling Order Report - All Orders`;
    const emailBody = generatePdfContent(allOrders, true);
    const recipient = currentUser?.email || "";
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
        Alert.alert(
          "Email Client Opened",
          "Your email client should have opened with the all orders report drafted."
        );
      } else {
        Alert.alert(
          "Error",
          "Could not open email client. Please ensure you have one configured."
        );
      }
    } catch (error) {
      console.error("Failed to open email client (all orders):", error);
      Alert.alert("Error", "Failed to open email client for all orders.");
    }
  };

  if (
    lastOrder === undefined ||
    currentUser === undefined ||
    allOrders === undefined
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: COLORS.brand,
            borderBottomWidth: 1,
            borderBottomColor: "#ccc",
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-circle" size={22} color={COLORS.primary} />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              marginLeft: 12,
              color: COLORS.text,
            }}
          >
            Your Last Order
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderOrderItem = ({ item }: { item: OrderProduct }) => (
    <View style={styles.orderItemCard}>
      <Text style={styles.orderItemName}>{item.name}</Text>

      <View style={styles.orderItemQtyPriceRow}>
        <Text style={styles.orderItemQuantity}>
          Qty: {String(item.quantity)}
        </Text>
        <Text style={styles.orderItemPrice}>
          @ ₹{String(item.discountPrice.toFixed(2))}
        </Text>
      </View>

      <Text style={styles.orderItemSubtotalLine}>
        Subtotal: ₹{String((item.discountPrice * item.quantity).toFixed(2))}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: COLORS.brand,
          borderBottomWidth: 1,
          borderBottomColor: "#ccc",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            marginLeft: 12,
            color: COLORS.text,
          }}
        >
          Your Last Order
        </Text>
      </View>
      <ScrollView style={styles.contentScrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Order #{orderIdDisplay} Details</Text>
          <Text style={styles.orderDateText}>Date: {orderDate}</Text>

          {lastOrder ? (
            <View style={styles.orderSummaryContainer}>
              <Text style={styles.summaryHeading}>Purchased Items:</Text>
              <FlatList
                data={orderItems}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.productId}
                contentContainerStyle={styles.orderList}
                ListEmptyComponent={
                  <Text style={styles.noItemsInOrder}>
                    No items found in this order.
                  </Text>
                }
                scrollEnabled={false}
              />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Paid:</Text>
                <Text style={styles.summaryValue}>
                  ₹{orderTotal.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.amountInWordsText}>
                Amount in words: {convertNumberToWords(orderTotal)}
              </Text>
              {orderSaved > 0.01 && (
                <Text style={styles.savedAmountText}>
                  You saved ₹{orderSaved.toFixed(2)}!
                </Text>
              )}

              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() =>
                  handleDownloadPdf(
                    lastOrder,
                    `Order_${orderIdDisplay}_Copy.pdf`,
                    false
                  )
                }
              >
                <Ionicons name="download" size={16} color={COLORS.white} />
                <Text style={styles.downloadButtonText}>
                  Download Last Order (PDF)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.emailButton}
                onPress={() =>
                  handleSendEmail(
                    lastOrder,
                    `Your E-Waste Order Copy - ${orderIdDisplay}`
                  )
                }
              >
                <Ionicons name="mail" size={16} color={COLORS.primary} />
                <Text style={styles.emailButtonText}>
                  Send Last Order via Email
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noOrderContainer}>
              <Ionicons name="cube-outline" size={80} color={COLORS.darkGray} />
              <Text style={styles.noOrderText}>
                No recent order details available. Start recycling today!
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/")}
                style={styles.shopNowButton}
              >
                <Text style={styles.shopNowButtonText}>Go to Home</Text>
              </TouchableOpacity>
            </View>
          )}

          {allOrders && allOrders.length > 0 && (
            <View style={styles.allOrdersButtonsContainer}>
              <TouchableOpacity
                style={styles.downloadAllOrdersButton}
                onPress={() =>
                  handleDownloadPdf(allOrders, `All_My_Orders_Copy.pdf`, true)
                }
              >
                <Ionicons name="documents" size={16} color={COLORS.primary} />
                <Text style={styles.downloadAllOrdersButtonText}>
                  Download All Orders (PDF)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.emailAllOrdersButton}
                onPress={handleSendAllOrdersEmail}
              >
                <Ionicons name="mail" size={16} color={COLORS.primary} />
                <Text style={styles.emailAllOrdersButtonText}>
                  Send All Orders via Email
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={() => router.push("/dashboard-details/all-orders-screen")}
            style={styles.viewAllOrdersButton}
          >
            <Text style={styles.viewAllOrdersButtonText}>
              View All My Orders
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>{pdfTitle}</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={modalStyles.closeButton}
            >
              <Ionicons name="close-circle" size={30} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
          <ScrollView style={modalStyles.pdfContentScrollView}>
            <Text style={modalStyles.pdfContentText}>{pdfContent}</Text>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  contentScrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  backButton: {
    paddingRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 5,
  },
  orderDateText: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 20,
  },
  orderSummaryContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  summaryHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 5,
  },
  orderList: {
    paddingVertical: 5,
  },
  orderItemCard: {
    flexDirection: "column",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    alignItems: "flex-start",
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    width: "100%",
  },
  orderItemQtyPriceRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    marginTop: 2,
  },
  orderItemQuantity: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginRight: 10,
  },
  orderItemPrice: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  orderItemSubtotalLine: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.primary,
    width: "100%",
    textAlign: "left",
    marginTop: 4,
  },
  noItemsInOrder: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: "center",
    paddingVertical: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 10,
  },
  summaryLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  amountInWordsText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontStyle: "italic",
    textAlign: "right",
    marginTop: 5,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  savedAmountText: {
    fontSize: 14,
    color: COLORS.green,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  noOrderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  noOrderText: {
    fontSize: 18,
    color: COLORS.darkGray,
    marginTop: 20,
    textAlign: "center",
  },
  shopNowButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
  },
  shopNowButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  downloadButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  downloadButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 8,
  },
  emailButton: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    width: "100%",
  },
  emailButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 8,
  },
  allOrdersButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 15,
    marginBottom: 20,
  },
  downloadAllOrdersButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  downloadAllOrdersButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "bold",
    marginLeft: 6,
    textAlign: "center",
  },
  emailAllOrdersButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  emailAllOrdersButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "bold",
    marginLeft: 6,
    textAlign: "center",
  },
  viewAllOrdersButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  viewAllOrdersButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 0 : 50,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    padding: 5,
    position: "absolute",
    right: 20,
  },
  pdfContentScrollView: {
    flex: 1,
    padding: 20,
  },
  pdfContentText: {
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: COLORS.text,
    lineHeight: 20,
  },
});
