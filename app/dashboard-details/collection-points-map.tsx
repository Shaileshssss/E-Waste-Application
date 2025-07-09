import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Platform, Alert, Dimensions, Linking } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

// --- Mock Data for Collection Points (REPLACE WITH YOUR OWN STATIC DATA) ---
interface CollectionPoint {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  contactInfo: string;
  hours: string;
  acceptedItems: string[];
}

const MOCK_COLLECTION_POINTS: CollectionPoint[] = [
  {
    _id: 'cp1',
    name: 'EcoRecycle Center - Kasturba Road Bengaluru',
    latitude: 12.9716, // Example: Bangalore city center
    longitude: 77.5946,
    address: '123 E-Waste Blvd, Bengaluru',
    contactInfo: '1800-EWaste (Recycle@example.com)',
    hours: 'Mon-Sat: 9 AM - 6 PM',
    acceptedItems: ['Laptops', 'Smartphones', 'Batteries', 'Printers'],
  },
  {
    _id: 'cp2',
    name: 'GreenTech Collection Point - Yelahanka Bengaluru',
    latitude: 13.0827, // Example: North Bangalore
    longitude: 77.5878,
    address: '456 Tech Park Rd, Bengaluru',
    contactInfo: '080-12345678 (info@greentech.com)',
    hours: 'Mon-Fri: 10 AM - 5 PM',
    acceptedItems: ['Servers', 'Networking Gear', 'Monitors', 'Cables'],
  },
  {
    _id: 'cp3',
    name: 'Community E-Drop Off - BTM LAYOUT Bengaluru',
    latitude: 12.9165, // Example: South Bangalore
    longitude: 77.6101,
    address: '789 Community Lane, Bengaluru',
    contactInfo: '+91 9988776655 (community@ewaste.org)',
    hours: 'Weekends: 10 AM - 2 PM',
    acceptedItems: ['Small Appliances', 'CDs/DVDs', 'Keyboards', 'Mice'],
  },
];
// --- END Mock Data ---

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const DEBOUNCE_DELAY = 500; // Debounce delay for touchables

export default function CollectionPointsMapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [currentRegion, setCurrentRegion] = useState({
    latitude: 12.9716, // Default to Bangalore city center
    longitude: 77.5946,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null); // New state for selected point
  const lastPressTimeRef = useRef(0); // For debouncing

  // Debounce utility function
  const handlePressAction = useCallback((action: () => void, name: string = "unnamed_action") => {
    const now = Date.now();
    const lastPress = lastPressTimeRef.current;
    const timeSinceLastPress = now - lastPress;

    // console.log(`[Debounce - ${name}]: Attempting action. Now: ${now}, Last Press: ${lastPress}, Time Since Last: ${timeSinceLastPress}`);

    if (timeSinceLastPress < DEBOUNCE_DELAY) {
      // console.log(`[Debounce - ${name}]: Debounced! Ignoring rapid press.`);
      return;
    }

    lastPressTimeRef.current = now;
    // console.log(`[Debounce - ${name}]: Executing action.`);
    action();
  }, []);

  // Use mock data directly
  const collectionPoints = MOCK_COLLECTION_POINTS;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        Alert.alert('Location Permission Required', 'Please enable location services in your device settings to find nearby collection points.');
        setLoading(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          // timeout: 5000,
        });
        setCurrentRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error getting current location:", err);
        setErrorMsg('Could not get current location. Showing default region.');
        Alert.alert('Location Error', 'Failed to get your current location. Please ensure GPS is enabled.');
        setLoading(false);
      }
    })();
  }, []);

  const handleMarkerPress = (point: CollectionPoint) => {
    console.log("Marker pressed:", point.name);
    // Set the selected point to display details in the bottom bar
    setSelectedPoint(point);
    // Optionally, animate the map to center on the selected marker
    mapRef.current?.animateToRegion({
      latitude: point.latitude,
      longitude: point.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }, 500);
  };

  const handleGetDirections = (point: CollectionPoint) => {
    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
    const latLng = `${point.latitude},${point.longitude}`;
    const label = encodeURIComponent(point.name);
    const url = Platform.select({
      ios: `${scheme}://?q=${label}&ll=${latLng}`,
      android: `${scheme}:${latLng}?q=${label}`,
    });

    if (url) {
      Linking.openURL(url).catch(err => {
        console.error("Failed to open maps app:", err);
        Alert.alert("Error", "Could not open map application.");
      });
    } else {
        Alert.alert("Error", "Could not form directions URL.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => handlePressAction(() => router.back(), "RouterBack")} style={styles.customHeaderBackButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>E-Waste Collection Points</Text>
        {/* Spacer to visually balance header */}
        <View style={styles.customHeaderRightSpacer} />
      </View>

      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding your location...</Text>
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={currentRegion}
            showsUserLocation={true}
            followsUserLocation={true}
            onRegionChangeComplete={(region) => setCurrentRegion(region)}
            onMapReady={() => console.log("Map is ready")}
            onPress={() => setSelectedPoint(null)} // Dismiss info bar when map background is tapped
          >
            {collectionPoints.map(point => (
              <Marker
                key={point._id}
                coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                title={point.name}
                description={point.address}
                onPress={() => handleMarkerPress(point)} // This will set selectedPoint
                pinColor={COLORS.primary}
              >
                {/* Callout is nested inside Marker */}
                <Callout tooltip>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{point.name}</Text>
                    <Text style={styles.calloutAddress}>{point.address}</Text>
                    <Text style={styles.calloutDetails}>Hours: {point.hours}</Text>
                    <Text style={styles.calloutDetails}>Contact: {point.contactInfo}</Text>
                    <TouchableOpacity
                      style={styles.calloutDirectionsButton}
                      onPress={() => handlePressAction(() => handleGetDirections(point), `GetDirections-${point._id}`)}
                    >
                      <Text style={styles.calloutDirectionsButtonText}>Get Directions</Text>
                    </TouchableOpacity>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          {/* Bottom Info Bar for Selected Point */}
          {selectedPoint && (
            <View style={styles.bottomInfoBar}>
              <View style={styles.bottomInfoBarHeader}>
                <Text style={styles.bottomInfoBarTitle}>{selectedPoint.name}</Text>
                <TouchableOpacity onPress={() => handlePressAction(() => setSelectedPoint(null), "DismissInfoBar")}>
                  <Ionicons name="close-circle-outline" size={28} color={COLORS.darkGray} />
                </TouchableOpacity>
              </View>
              <Text style={styles.bottomInfoBarAddress}>{selectedPoint.address}</Text>
              <Text style={styles.bottomInfoBarDetails}>Hours: {selectedPoint.hours}</Text>
              <Text style={styles.bottomInfoBarDetails}>Contact: {selectedPoint.contactInfo}</Text>
              <Text style={styles.bottomInfoBarAcceptedItems}>Accepts: {selectedPoint.acceptedItems.join(', ')}</Text>
              <TouchableOpacity
                style={styles.bottomInfoBarDirectionsButton}
                onPress={() => handlePressAction(() => handleGetDirections(selectedPoint), `DirectionsFromBar-${selectedPoint._id}`)}
              >
                <Text style={styles.bottomInfoBarDirectionsButtonText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
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
    justifyContent: 'flex-start',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    elevation: 2,
    shadowColor: COLORS.black,
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
    flex: 1,
  },
  customHeaderRightSpacer: {
    width: 40,
  },
  // End Custom Header Styles
  loadingOverlay: {
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
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.red,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  map: {
    flex: 1, // Make map take all available space
    width: '100%',
  },
  calloutContainer: {
    width: 250,
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  calloutAddress: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginBottom: 3,
  },
  calloutDetails: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  calloutAcceptedItems: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 5,
    fontWeight: '500',
  },
  calloutDirectionsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  calloutDirectionsButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  // --- New styles for Bottom Info Bar ---
  bottomInfoBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -3 }, // Shadow at the top
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    maxHeight: '40%', // Prevent it from taking too much screen space
  },
  bottomInfoBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bottomInfoBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1, // Allows title to take available space
    marginRight: 10,
  },
  bottomInfoBarAddress: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  bottomInfoBarDetails: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  bottomInfoBarAcceptedItems: {
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 5,
    fontWeight: '500',
  },
  bottomInfoBarDirectionsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  bottomInfoBarDirectionsButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
});
