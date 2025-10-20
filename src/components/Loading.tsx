import React from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/Colors";

interface LoadingProps {
  visible?: boolean;
  onRequestClose?: () => void;
}

const Loading = ({ visible, onRequestClose }: LoadingProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.modalText}>Loading...</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  modalContainer: {
    width: "auto",
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 8,
    alignItems: "center",
  },
  modalText: {
    marginTop: 20,
    textAlign: "center",
    fontFamily: "MontserratRegular",
  },
});

export default Loading;
