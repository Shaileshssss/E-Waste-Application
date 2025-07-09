// app/(tabs)/(dashboard-details)/messages-screen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard, // Import Keyboard for manual dismissal
  Dimensions, // Import Dimensions for dynamic max height
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth, useUser } from '@clerk/clerk-expo';


// Define Message types for clarity
interface Message {
  id: string; // Unique ID for React Native FlatList keyExtractor
  sender: 'user' | 'bot'; // 'user' for human, 'bot' for AI assistant
  text: string;
  timestamp: string; // ISO string format for consistent display
}

export default function ChatbotScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList<Message>>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // --- NEW: State for dynamic input height ---
  const [messageInputHeight, setMessageInputHeight] = useState(40); // Initial height, same as minHeight
  // --- END NEW ---

  // Use Clerk hooks to get user information
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userObjectLoaded } = useUser();

  // Keep useAction for the Gemini API call via Convex
  const chatWithGeminiAction = useAction(api.gemini.chatWithGemini);

  // Define max height for the TextInput based on screen dimensions
  const MAX_MESSAGE_INPUT_HEIGHT = Dimensions.get('window').height * 0.2; // Max 20% of screen height for input

  // Effect to set initial greeting based on user data
  useEffect(() => {
    console.log("Client: User loaded state:", userObjectLoaded, "User:", user?.fullName || user?.id || 'Not loaded');

    // Only set initial messages once user object is loaded and messages are currently empty
    if (userObjectLoaded && messages.length === 0) {
        const userName = user?.fullName || user?.id || 'there';
        setMessages([
            { id: 'initial_1', sender: 'bot', text: `Hello ${userName}! I am your E-Waste Recycling Assistant. How can I help you today?`, timestamp: new Date().toISOString() },
            { id: 'initial_2', sender: 'bot', text: 'You can ask me about recycling locations, proper disposal, or the impact of electronic waste.', timestamp: new Date().toISOString() },
        ]);
        console.log("Client: Initial personalized bot messages set.");
    }
  }, [userObjectLoaded, user?.fullName, user?.id, messages.length]);

  // Effect to scroll to bottom when new messages are added
  useEffect(() => {
    console.log("Client: Messages updated, attempting to scroll to end.");
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // --- NEW: Handler for dynamic input height ---
  const handleMessageInputContentSizeChange = (event: any) => {
    const newHeight = Math.max(40, Math.min(MAX_MESSAGE_INPUT_HEIGHT, event.nativeEvent.contentSize.height));
    setMessageInputHeight(newHeight);
  };
  // --- END NEW ---

  const handleSendMessage = async () => {
    const userMessageText = inputText.trim();
    if (!userMessageText || isTyping) {
      console.log("Client: Message not sent - empty input or bot is typing.");
      return;
    }

    if (!isSignedIn) {
        Alert.alert("Login Required", "Please log in to chat with the E-Waste Assistant.");
        return;
    }

    const newUserMessage: Message = {
      id: `temp_${Date.now()}`,
      sender: 'user',
      text: userMessageText,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsTyping(true);
    Keyboard.dismiss();
    // --- NEW: Reset input height after sending message ---
    setMessageInputHeight(40); // Reset to min height
    // --- END NEW ---


    try {
      let chatHistoryForGemini: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      messages.forEach(msg => {
        chatHistoryForGemini.push({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] });
      });
      chatHistoryForGemini.push({ role: "user", parts: [{ text: userMessageText }] });


      console.log('Client: Calling Convex action to chat with Gemini...');
      const geminiResponse = await chatWithGeminiAction({
        chatHistory: chatHistoryForGemini,
        prompt: userMessageText,
      });
      console.log("Client: Received response from Convex Gemini action:", geminiResponse);


      let botResponseText = 'Sorry, I could not get a response. Please try again.';

      if (geminiResponse.success && geminiResponse.response) {
        botResponseText = geminiResponse.response;
        console.log("Client: Gemini response successful.");
      } else if (geminiResponse.error) {
        botResponseText = `Error from AI: ${geminiResponse.error}.`;
        console.error('Client: Convex Action Error (from server):', geminiResponse.error);
        if (geminiResponse.error.includes("API key missing")) {
            Alert.alert("Configuration Error", "The Gemini API key is not configured on the Convex backend. Please contact support. Check Convex Dashboard -> Settings -> Environment Variables.");
        }
      } else {
        console.error('Client: Convex action response structure unexpected or empty (from server):', geminiResponse);
      }

      const newBotMessage: Message = {
        id: `temp_${Date.now() + 1}`,
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newBotMessage]);

    } catch (error: any) {
      console.error('Client: Error calling Convex action for Gemini chat:', error);
      const errorMessage: Message = {
        id: `temp_error_${Date.now()}`,
        sender: 'bot',
        text: 'Oops! Something went wrong while connecting to the assistant. Please check your internet connection or try a different question.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      console.log("Client: AI typing indicator hidden.");
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubbleContainer,
      item.sender === 'user' ? styles.myMessage : styles.botMessage,
    ]}>
      <Text style={item.sender === 'user' ? styles.myMessageText : styles.botMessageText}>
        {item.text}
      </Text>
      <Text style={styles.messageTimestamp}>
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  if (!userObjectLoaded) {
      console.log("Client: Displaying loading screen for user data...");
      return (
          <SafeAreaView style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading user data...</Text>
          </SafeAreaView>
      );
  }

  const headerTitle = user?.fullName ? `E-Waste Assistant - ${user.fullName}` : `E-Waste Assistant - ${user?.id || 'Guest'}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.keyboardAvoidingContainer}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          style={styles.flatListStyle}
        />

        {isTyping && (
          <View style={styles.typingIndicatorContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.typingIndicatorText}>Assistant is typing...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              { height: messageInputHeight } // Apply dynamic height here
            ]}
            placeholder="Ask me about e-waste..."
            placeholderTextColor={COLORS.gray}
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isTyping}
            // --- NEW: Add onContentSizeChange prop ---
            onContentSizeChange={handleMessageInputContentSizeChange}
            // --- END NEW ---
            textAlignVertical="top" // Ensure text starts from top for multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            {isTyping ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={24} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.brand,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: COLORS.brand,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 24,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  flatListStyle: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    paddingBottom: 25, // Ensures messages are visible above input when keyboard is up
  },
  messageBubbleContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginBottom: 8,
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 2,
  },
  myMessageText: {
    color: COLORS.white,
    fontSize: 16,
  },
  botMessageText: {
    color: COLORS.text,
    fontSize: 16,
  },
  messageTimestamp: {
    fontSize: 10,
    color: COLORS.gray,
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginBottom: 5,
  },
  typingIndicatorText: {
    marginLeft: 8,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Align items to center vertically within inputContainer
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderRadius: 55,
    borderTopColor: COLORS.lightGray,
    backgroundColor: "orange",
    marginBottom: 24,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.text,
    marginRight: 10,
    backgroundColor: COLORS.white,
    minHeight: 40, // Set a minimum height
    // maxHeight is now handled by the state and onContentSizeChange
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});