import React from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity /* Removed Alert */ } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { COLORS } from '@/constants/theme'; // Assuming you have COLORS defined for better theming

const screenWidth = Dimensions.get('window').width;

// Define specific colors for each bar to make it more visually distinct
const BAR_COLORS = [
  COLORS.green,      // Example color for Laptops
  COLORS.primary,    // Example color for Mobiles
  COLORS.success,    // Example color for Li-Batteries
  COLORS.darkGreen,  // Example color for Cables
  COLORS.red,        // Example color for WiFi Routers
  // Add more colors here if you have more data points
];

// Sample data for demonstration (using percentages for clarity)
const eWasteData = {
  labels: ["Laptops", "Mobiles", "Li-Batteries", "Cables", "WiFi"],
  datasets: [
    {
      data: [90, 45, 20, 30, 10], // Recycled amounts in percentage
      // Provide individual colors directly within the dataset
      colors: BAR_COLORS.map(color => (opacity = 1) => color), 
    },
  ],
};

const EwasteBarChart = () => {
  const chartConfig = {
    backgroundGradientFrom: COLORS.white,
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: COLORS.lightGray,
    backgroundGradientToOpacity: 1,
    
    // This 'color' function is for labels, grid lines, and axes.
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, 
    
    barPercentage: 0.8, // Controls the width of the bars
    barRadius: 5,       // Adds rounded corners to the bars
    
    useShadowColorFromDataset: false, 

    decimalPlaces: 0, // No decimal places for labels if data is whole numbers
    
    propsForLabels: {
      fontSize: 10,
      fontWeight: 'bold',
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // Makes grid lines solid
      stroke: COLORS.gray, // Color for grid lines
    },
    propsForVerticalLabels: {},
    propsForHorizontalLabels: {},

  };

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>E-Waste Recycling Progress</Text>
      <Text style={styles.chartSubtitle}>Track our Impact on a Greener Planet</Text>

      {eWasteData.datasets[0].data.length > 0 ? (
        <View style={styles.chartWrapper}>
          <BarChart
            data={eWasteData}
            width={screenWidth * 0.9}
            height={280}
            chartConfig={chartConfig}
            verticalLabelRotation={20} // Rotates X-axis labels to prevent overlap
            fromZero={true} // Ensures Y-axis starts from 0 for accurate representation
            style={styles.chartStyle}
            yAxisLabel=""      // Set to empty string if you only want suffix
            yAxisSuffix='%'    // Clearly indicates percentage on Y-axis
            showBarTops={true} // Shows values on top of the bars
            showValuesOnTopOfBars={true} // Ensures values are visible above bars
            
            withCustomBarColorFromData={true} 
            flatColor={true} 
          />
        </View>
      ) : (
        <Text style={styles.noDataText}>No recycling data available at the moment. Check back soon!</Text>
      )}

      <Text style={styles.environmentText}>
        See our recycling progress for e-waste like laptops, mobiles, and batteries—a step towards a sustainable future.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.white, // Uses a theme background color
    borderRadius: 15, // Rounded container for a softer look
    marginHorizontal: 5, // Adds some margin from screen edges
    marginVertical: 5, // Vertical margin for separation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6, // Android shadow
  },
  chartTitle: {
    fontSize: 22, // Larger title
    fontWeight: 'bold',
    marginBottom: 5,
    color: COLORS.black, // Uses a primary theme color
    textAlign: 'center',
  },
  chartSubtitle: {
    fontSize: 15,
    marginBottom: 20, // More space below subtitle
    color: COLORS.textSecondary, // Uses a secondary text color
    textAlign: 'center',
    fontStyle: 'italic', // Italicize subtitle
  },
  chartWrapper: {
    borderRadius: 16,
    overflow: 'hidden', // Ensures inner chart respects border radius
    backgroundColor: COLORS.white, // Chart background matches `backgroundGradientFrom`
  },
  chartStyle: {
    marginVertical: 0, // Resets margin as it's handled by wrapper
    borderRadius: 16,
  },
  environmentText: {
    fontSize: 13, // Slightly smaller font for descriptive text
    textAlign: 'center',
    marginTop: 15, // More space above this text
    paddingHorizontal: 15,
    color: COLORS.text, // Uses a main text color
    lineHeight: 20,
  },
  noDataText: {
    fontSize: 16,
    color: COLORS.gray, // Uses a subtle gray for no data
    marginTop: 20,
    textAlign: 'center',
  }
});

export default EwasteBarChart;
