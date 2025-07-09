// app/(tabs)/(dashboard-details)/legal-info.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Linking, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Removed Stack from import

// --- Policy Content ---
const PRIVACY_POLICY_CONTENT = `
Your privacy is paramount to us at E-Waste Manager. This policy details how we collect, use, store, and protect your personal data in relation to our e-waste management services.

1.  Information Collection: We collect personal information (name, contact details, address) for scheduling e-waste pickups and account management. We also collect data about the types of devices you wish to recycle.
2.  Use of Information: Your data is used to facilitate pickup services, process recycling requests, communicate service updates, and improve our app and services. Anonymized data may be used for environmental reporting and research.
3.  Data Sharing: We share only necessary information with our certified recycling partners to complete your service requests. We explicitly state that we do not sell your personal data to third parties for marketing purposes.
4.  Data Security: We employ industry-standard security measures, including encryption and secure servers, to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
5.  Your Rights: You have the right to access, update, or request deletion of your personal data. You can manage your notification preferences and opt-out of certain data uses via app settings.
6.  Changes to Policy: We may update this policy periodically. We will notify you of any significant changes.

By using the E-Waste Manager app, you consent to the data practices described in this Privacy Policy.
`;

const TERMS_OF_SERVICE_CONTENT = `
Welcome to E-Waste Manager! By using our application, you agree to these Terms of Service. Please read them carefully.

1.  Service Description: E-Waste Manager provides a platform for users to responsibly recycle their electronic waste by connecting them with certified collection and recycling services.
2.  User Responsibilities:
    * Provide accurate and complete information for pickups.
    * Ensure devices are safe and prepared for collection (e.g., batteries removed if required, data wiped).
    * Comply with all local and national e-waste regulations.
3.  Data Security & Privacy: We are committed to protecting your data. Please refer to our Privacy Policy for full details on data collection and usage. You are responsible for wiping data from your devices before handover.
4.  Limitation of Liability: E-Waste Manager acts as an intermediary. While we partner with reputable recyclers, we are not liable for any damages, loss, or data breaches that occur during the recycling process by third-party partners.
5.  Intellectual Property: All content within the app (text, graphics, logos) is the property of E-Waste Manager or its licensors.
6.  Termination: We reserve the right to suspend or terminate your access to the service for violations of these terms.
7.  Governing Law: These terms are governed by the laws of India.

Your continued use of the E-Waste Manager app signifies your acceptance of these terms.
`;

const DATA_PERMISSIONS_CONTENT = `
At E-Waste Manager, we believe in transparency regarding your data. This section outlines how we request and use various data permissions within the app.

1.  Location Services:
    * Purpose: To identify your nearest e-waste collection points and facilitate precise pickup scheduling.
    * Permission: Required for accurate service delivery. You can disable it, but some features may be limited.
2.  Camera Access:
    * Purpose: To allow you to take photos of your e-waste items for accurate assessment during the scheduling process.
    * Permission: Optional. If denied, you may need to manually describe items.
3.  Storage Access (Photos/Media):
    * Purpose: To allow you to upload existing photos of your e-waste items from your device gallery.
    * Permission: Optional.
4.  Contact Information (Optional):
    * Purpose: (Future Feature) To suggest contacts for group recycling drives or share referral codes.
    * Permission: Strictly optional, only used with your explicit consent for features you choose to engage with.

We are committed to using your data responsibly and only for the purposes explicitly stated to enhance your e-waste recycling experience. Your data is not sold or shared with third parties for marketing.
`;
// --- END Policy Content ---

// Interface for LegalDocItemProps
interface LegalDocItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress: () => void;
  isSpecificDoc?: boolean;
}

const DEBOUNCE_DELAY = 500; // milliseconds - adjust as needed

export default function LegalInfoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [currentDocView, setCurrentDocView] = useState<'menu' | 'privacy' | 'terms' | 'data'>('menu');
  const [currentContent, setCurrentContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const lastPressTimeRef = useRef(0); // Use useRef for persistent debounce state

  // Map docType to its content constant
  const policyContents: Record<string, string> = {
    privacy: PRIVACY_POLICY_CONTENT,
    terms: TERMS_OF_SERVICE_CONTENT,
    data: DATA_PERMISSIONS_CONTENT,
  };

  // Function to load content dynamically (now getting from local constants)
  const loadContent = useCallback(async (docType: 'privacy' | 'terms' | 'data' | 'menu') => {
    setIsLoading(true);
    setCurrentContent(''); // Clear previous content

    // Simulate network delay or complex processing (still useful for visualizing loading)
    await new Promise(resolve => setTimeout(resolve, 500));

    let contentToLoad = '';
    // Check if docType is a valid key in policyContents before accessing
    if (docType !== 'menu' && policyContents.hasOwnProperty(docType)) {
      contentToLoad = policyContents[docType];
    }
    
    setCurrentContent(contentToLoad.trim());
    setIsLoading(false);
    console.log(`[Content Load]: Content loaded for ${docType}`);
  }, [policyContents]);

  // Effect to handle initial load from params or when docView changes
  useEffect(() => {
    console.log("[Lifecycle]: useEffect triggered. Params.docType:", params.docType, "CurrentDocView:", currentDocView, "CurrentContent length:", currentContent.length);

    if (typeof params.docType === 'string' && currentDocView === 'menu') {
      const doc = params.docType as 'privacy' | 'terms' | 'data';
      if (['privacy', 'terms', 'data'].includes(doc)) {
        console.log("[Lifecycle]: Initializing from params, setting currentDocView:", doc);
        setCurrentDocView(doc);
        // Load content will be triggered by the conditional logic below or handleOpenDoc
      }
    }
    
    if (currentDocView !== 'menu' && currentContent === '' && !isLoading) {
      console.log("[Lifecycle]: currentDocView changed to a doc type, content not loaded, triggering loadContent for:", currentDocView);
      loadContent(currentDocView);
    }

  }, [params.docType, currentDocView, currentContent, isLoading, loadContent]);


  const handlePressAction = useCallback((action: () => void, name: string) => {
    const now = Date.now();
    const lastPress = lastPressTimeRef.current;
    const timeSinceLastPress = now - lastPress;

    console.log(`[Debounce]: Attempting action for "${name}". Now: ${now}, Last Press: ${lastPress}, Time Since Last: ${timeSinceLastPress}`);

    if (timeSinceLastPress < DEBOUNCE_DELAY) {
      console.log(`[Debounce]: Debounced! Ignoring rapid press for "${name}".`);
      return;
    }

    lastPressTimeRef.current = now;
    console.log(`[Debounce]: Executing action for "${name}". lastPressTimeRef.current set to: ${lastPressTimeRef.current}`);
    action();
  }, []);

  const handleOpenDoc = (docType: 'privacy' | 'terms' | 'data') => {
    handlePressAction(() => {
      console.log("[Action]: handleOpenDoc called for docType:", docType);
      setCurrentDocView(docType);
      loadContent(docType); // Trigger content load
    }, `OpenDoc-${docType}`);
  };

  const handleBackToMenu = () => {
    handlePressAction(() => {
      console.log("[Action]: handleBackToMenu called.");
      setCurrentDocView('menu');
      setCurrentContent(''); // Clear content when going back to menu
    }, "BackToMenu");
  };

  const handleAlertClick = (policyName: string, message: string) => {
    handlePressAction(() => {
      console.log(`[Action]: Alert click for "${policyName}" - Attempting Alert.alert`);
      Alert.alert(policyName, message);
    }, `Alert-${policyName}`);
  };


  let headerTitle = '';
  let headerLeftAction: () => void;

  if (currentDocView === 'menu') {
    headerTitle = 'Legal Information';
    // When on the main menu, the back action is to router.back
    headerLeftAction = () => handlePressAction(() => router.back(), "RouterBack");
  } else {
    // When viewing a specific doc, the back action is to return to the menu
    if (currentDocView === 'privacy') {
      headerTitle = 'Privacy Policy';
    } else if (currentDocView === 'terms') {
      headerTitle = 'Terms of Service';
    } else if (currentDocView === 'data') {
      headerTitle = 'Data Permissions';
    }
    headerLeftAction = handleBackToMenu;
  }


  const LegalDocItem: React.FC<LegalDocItemProps> = ({ icon, text, onPress, isSpecificDoc = false }) => (
    <TouchableOpacity style={styles.docItem} onPress={onPress}>
      <View style={styles.docItemLeft}>
        <Ionicons name={icon} size={22} color={COLORS.text} style={styles.docIcon} />
        <Text style={styles.docText}>{text}</Text>
      </View>
      {isSpecificDoc ? (
        <Ionicons name="chevron-forward" size={20} color={COLORS.darkGray} />
      ) : (
        <Ionicons name="open-outline" size={20} color={COLORS.darkGray} />
      )}
    </TouchableOpacity>
  );

  const renderContent = () => {
    console.log("[Render]: renderContent is rendering. CurrentDocView:", currentDocView, "IsLoading:", isLoading, "CurrentContent Length:", currentContent.length);

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Policy...</Text>
        </View>
      );
    }

    if (currentDocView !== 'menu' && currentContent) {
      return (
        <ScrollView style={styles.docContentScrollView}>
          <Text style={styles.docContentText}>{currentContent}</Text>
        </ScrollView>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Policies</Text>
          <LegalDocItem
            icon="document-text-outline"
            text="Privacy Policy"
            onPress={() => handleOpenDoc('privacy')}
            isSpecificDoc
          />
          <LegalDocItem
            icon="receipt-outline"
            text="Terms of Service"
            onPress={() => handleOpenDoc('terms')}
            isSpecificDoc
          />
          <LegalDocItem
            icon="lock-closed-outline"
            text="Data Permissions"
            onPress={() => handleOpenDoc('data')}
            isSpecificDoc
          />
          <LegalDocItem
            icon="file-tray-stacked-outline"
            text="Cookie Policy"
            onPress={() => handleAlertClick('Cookie Policy', 'This content would be displayed in-app or via external link if preferred. For now, it\'s an alert.')}
          />
          <LegalDocItem
            icon="leaf-outline"
            text="Responsible Recycling Policy"
            onPress={() => handleAlertClick('Responsible Recycling Policy', 'This could be an in-app page detailing your commitment.')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compliance & Information</Text>
          <LegalDocItem
            icon="shield-checkmark-outline"
            text="Environmental Regulations"
            onPress={() => handleAlertClick('Environmental Regulations', 'Information regarding local and national e-waste regulations and how our service complies.')}
          />
          <LegalDocItem
            icon="code-slash-outline"
            text="Open Source Licenses"
            onPress={() => handleAlertClick('Licenses', 'Display list of licenses (e.g., navigate to a static page or list them here).')}
          />
        </View>

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            Please review these documents carefully. Your continued use of the E-Waste Manager app implies agreement with our policies.
          </Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header View */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={headerLeftAction} style={styles.customHeaderBackButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>{headerTitle}</Text>
        {/* Placeholder for potential right header content if needed */}
        <View style={styles.customHeaderRightSpacer} /> 
      </View>

      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Custom Header Styles
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align items to the start
    backgroundColor: COLORS.white,
    paddingVertical: 12, // Standard padding
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
    marginRight: 10, // Space between icon and title
  },
  customHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1, // Allow title to take up remaining space
  },
  customHeaderRightSpacer: { // To balance the header if there's no right button
    width: 40, // Approx width of back button + margin
  },
  // Existing styles below
  scrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  docContentScrollView: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  docContentText: {
    fontSize: 15,
    color: COLORS.darkGray,
    lineHeight: 24,
    textAlign: 'justify',
  },
  // Removed `backButton` style as it's replaced by `customHeaderBackButton`
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
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  docItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  docIcon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
  },
  docText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  disclaimerContainer: {
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginTop: 10,
  },
  disclaimerText: {
    fontSize: 13,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
  },
});
