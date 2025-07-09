// // components/CustomAlertModal.tsx
// import React from 'react';
// import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

// const COLORS = {
//   primary: '#5CB85C',
//   text: '#333333',
//   white: '#FFFFFF',
//   darkGray: '#666666',
//   lightGray: '#F0F0F0',
// };

// interface CustomAlertModalProps {
//   visible: boolean;
//   title: string;
//   message: string;
//   onClose: () => void;
// }

// export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({ visible, title, message, onClose }) => {
//   return (
//     <Modal
//       transparent={true}
//       animationType="fade"
//       visible={visible}
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.alertBox}>
//           <Text style={styles.alertTitle}>{title}</Text>
//           <Text style={styles.alertMessage}>{message}</Text>
//           <TouchableOpacity style={styles.alertButton} onPress={onClose}>
//             <Text style={styles.alertButtonText}>OK</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   alertBox: {
//     width: '80%',
//     backgroundColor: COLORS.white,
//     borderRadius: 10,
//     padding: 20,
//     alignItems: 'center',
//     shadowColor: COLORS.white,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 8,
//   },
//   alertTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: COLORS.text,
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   alertMessage: {
//     fontSize: 16,
//     color: COLORS.darkGray,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   alertButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 10,
//     paddingHorizontal: 30,
//     borderRadius: 25,
//     marginTop: 10,
//   },
//   alertButtonText: {
//     color: COLORS.white,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });