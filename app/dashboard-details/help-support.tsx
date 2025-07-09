// app/(tabs)/(dashboard-details)/help-support.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useRef, useCallback for potential debounce
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Linking, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useRouter } from 'expo-router'; // Removed Stack from import

// --- FAQ Data ---
const FAQ_DATA = [
  {
    id: '1',
    question: 'What is E-Waste and why is it important to recycle?',
    answer: 'E-waste (electronic waste) includes discarded electrical or electronic devices. Recycling it is crucial because it contains hazardous materials (like lead, mercury) that harm the environment if landfilled, and valuable materials (like gold, copper) that can be recovered, conserving resources and reducing pollution.',
  },
  {
    id: '2',
    question: 'What types of electronic waste does this system accept?',
    answer: 'Our system accepts a wide range of electronic waste, including laptops, smartphones, tablets, cameras, printers, monitors, TVs, small home appliances, and various computer accessories. Please check our detailed guides for a comprehensive list.',
  },
  {
    id: '3',
    question: 'How do I schedule an e-waste pickup through the app?',
    answer: 'To schedule a pickup, navigate to the "Sell" or "Donate" section in the app. You can list your items, choose a convenient pickup date and time, and specify your address. Our collection team will handle the rest!',
  },
  {
    id: '4',
    question: 'Is there a cost associated with e-waste recycling or pickup?',
    answer: 'Our standard e-waste collection and recycling services are generally free for common household electronics. For large commercial quantities or specialized equipment, there might be a nominal fee or specific terms, which will be clearly communicated during the scheduling process.',
  },
  {
    id: '5',
    question: 'What happens to my data on devices I recycle?',
    answer: 'Data security is our top priority. We strongly recommend you factory reset and wipe your devices before pickup. However, our recycling partners follow strict data destruction protocols (like physical shredding or certified wiping) to ensure your personal information is irretrievably removed.',
  },
];
// --- END FAQ Data ---

interface SupportItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress: () => void;
}

const DEBOUNCE_DELAY = 500; // Define a debounce delay, similar to legal-info.tsx

export default function HelpSupportScreen() {
  const router = useRouter();
  const [openFAQId, setOpenFAQId] = useState<string | null>(null);
  const lastPressTimeRef = useRef(0); // For debouncing

  // Debounce utility function
  const handlePressAction = useCallback((action: () => void, name: string) => {
    const now = Date.now();
    const lastPress = lastPressTimeRef.current;
    const timeSinceLastPress = now - lastPress;

    console.log(`[Debounce - ${name}]: Attempting action. Now: ${now}, Last Press: ${lastPress}, Time Since Last: ${timeSinceLastPress}`);

    if (timeSinceLastPress < DEBOUNCE_DELAY) {
      console.log(`[Debounce - ${name}]: Debounced! Ignoring rapid press.`);
      return;
    }

    lastPressTimeRef.current = now;
    console.log(`[Debounce - ${name}]: Executing action.`);
    action();
  }, []);

  const handleFAQToggle = (id: string) => {
    handlePressAction(() => {
      setOpenFAQId(currentId => (currentId === id ? null : id));
    }, `FAQToggle-${id}`);
  };

  const handleContactUs = () => {
    handlePressAction(() => {
      Alert.alert(
        'Contact Us',
        'How would you like to contact us?',
        [
          { text: 'Email Support', onPress: () => Linking.openURL('mailto:support@ewastemanager.com?subject=App%20Support') },
          { text: 'Call Us', onPress: () => Linking.openURL('tel:+919876543210') },
          { text: 'Live Chat (Coming Soon)', onPress: () => Alert.alert('Live Chat', 'Live chat support will be available soon!') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }, "ContactUs");
  };

  const handleReportBug = () => {
    handlePressAction(() => {
      Alert.alert(
        'Report a Bug',
        'Please describe the issue you encountered. Screenshots are helpful!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Send Email', onPress: () => Linking.openURL('mailto:bugs@ewastemanager.com?subject=Bug%20Report%20E-Waste%20App&body=Device:%0AApp%20Version:%0ADescription%20of%20Bug:') },
        ]
      );
    }, "ReportBug");
  };

  const handleRecyclingGuides = () => {
    handlePressAction(() => {
      Alert.alert(
        'Recycling Guides',
        'This section will provide detailed guides on what can be recycled, how to prepare items, and the benefits of proper e-waste disposal.',
        [{ text: 'View Guides', onPress: () => console.log('Navigate to Recycling Guides') }]
      );
    }, "RecyclingGuides");
  };

  const handleEnvironmentalImpact = () => {
    handlePressAction(() => {
      Alert.alert(
        'Environmental Impact',
        'Learn about the positive environmental impact of your contributions through our e-waste management system.',
        [{ text: 'Learn More', onPress: () => console.log('Navigate to Environmental Impact info') }]
      );
    }, "EnvironmentalImpact");
  };

  const handleFindCollectionPoints = () => {
    handlePressAction(() => {
      router.push('/dashboard-details/collection-points-map');
    }, "FindCollectionPoints");
  };

  // Reusable Support Item Component
  const SupportItem: React.FC<SupportItemProps> = ({ icon, text, onPress }) => (
    <TouchableOpacity style={styles.supportItem} onPress={onPress}>
      <View style={styles.supportItemLeft}>
        <Ionicons name={icon} size={22} color={COLORS.text} style={styles.supportIcon} />
        <Text style={styles.supportText}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.darkGray} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header View */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => handlePressAction(() => router.back(), "RouterBack")} style={styles.customHeaderBackButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>Help & Support</Text>
        {/* Spacer to visually center the title if there's no right button */}
        <View style={styles.customHeaderRightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          <SupportItem
            icon="mail-outline"
            text="Contact Our Support Team"
            onPress={handleContactUs}
          />
          <SupportItem
            icon="bug-outline"
            text="Report a Bug"
            onPress={handleReportBug}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {FAQ_DATA.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                onPress={() => handleFAQToggle(faq.id)}
                style={styles.faqQuestionButton}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Ionicons
                  name={openFAQId === faq.id ? "chevron-up-outline" : "chevron-down-outline"}
                  size={20}
                  color={COLORS.darkGray}
                />
              </TouchableOpacity>
              {openFAQId === faq.id && (
                <View style={styles.faqAnswerContainer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learn More About E-Waste</Text>
          <SupportItem
            icon="book-outline"
            text="E-Waste Recycling Guides"
            onPress={handleRecyclingGuides}
          />
          <SupportItem
            icon="earth-outline"
            text="Environmental Impact of E-Waste"
            onPress={handleEnvironmentalImpact}
          />
          <SupportItem
            icon="location-outline"
            text="Find Nearest Collection Points"
            onPress={handleFindCollectionPoints}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Need Immediate Assistance?</Text>
          <Text style={styles.infoBoxText}>
            For urgent queries, please call our helpline.
          </Text>
          <TouchableOpacity style={styles.callButton} onPress={() => handlePressAction(() => Linking.openURL('tel:+919876543210'), "CallHelpline")}>
            <Ionicons name="call-outline" size={18} color={COLORS.white} />
            <Text style={styles.callButtonText}>Call Helpline (+91 98765 43210)</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.brand, // Changed from COLORS.brand to COLORS.background for consistency with other screens
  },
  // Custom Header Styles
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align items to the start
    backgroundColor: COLORS.brand, // Changed from COLORS.brand to COLORS.white for consistency
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    elevation: 2, // Shadow for Android
    shadowColor: COLORS.black, // Shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  customHeaderBackButton: {
    padding: 8,
    marginRight: 10,
  },
  customHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1, // Allows title to take available space
  },
  customHeaderRightSpacer: { // To balance the header if there's no right button
    width: 40, // Approx width of back button + margin
  },
  // Existing styles
  scrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  supportItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  supportIcon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  supportText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  infoBox: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoBoxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  infoBoxText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 15,
  },
  callButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  callButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  faqQuestionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 10,
  },
  faqAnswerContainer: {
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  faqAnswerText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
});
