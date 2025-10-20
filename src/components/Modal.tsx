import React, { ReactNode } from "react";
import {
  Modal as ModalExpo,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

type ModalType = "alert" | "action";

interface ModalProps {
  type: ModalType;
  visible: boolean;
  message?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onClose: () => void;
  onConfirm?: () => void;
  hiddenButtonConfirm?: boolean;
  hiddenButtonCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  children?: ReactNode;
}

export default function Modal({
  type,
  visible,
  message,
  iconName = "alert-circle-outline",
  iconColor = Colors.red,
  onClose,
  onConfirm,
  confirmText = "Confirmation",
  cancelText = "Cancel",
  hiddenButtonConfirm = false,
  hiddenButtonCancel = false,
  children,
}: ModalProps) {
  const content = (
    <View style={styles.modalContent}>
      {type === "alert" ? (
        <>
          <Ionicons name={iconName} size={44} color={iconColor} />
          <Text style={styles.modalMessage}>{message}</Text>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.9}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              backgroundColor: Colors.primary,
              width: 35,
              height: 35,
              position: "absolute",
              top: -15,
              right: -15,
              borderRadius: 20,
            }}
          >
            <Ionicons name="close-outline" size={35} color={Colors.white} />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={{ marginBottom: 10 }}>{children}</View>
          <View style={styles.buttonRow}>
            {!hiddenButtonCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                activeOpacity={0.9}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            {!hiddenButtonConfirm && (
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={onConfirm}
                activeOpacity={0.9}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.confirmText}>{confirmText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );

  return (
    <ModalExpo
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {type === "alert" ? (
          <TouchableWithoutFeedback onPress={onClose}>
            {content}
          </TouchableWithoutFeedback>
        ) : (
          content
        )}
      </View>
    </ModalExpo>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.blackTransparent,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "75%",
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    height: "auto",
  },
  modalMessage: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 15,
    textTransform: "capitalize",
    fontFamily: "MontserratRegular",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: Colors.secondary,
  },
  confirmText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "MontserratRegular",
  },
  cancelText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "MontserratRegular",
  },
});
