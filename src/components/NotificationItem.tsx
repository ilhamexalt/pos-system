import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Notification } from "../types";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

interface Props {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
}: Props) {
  const isRead = notification.is_read;

  const getTimeAgo = (dateString: string) => {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.item, isRead ? styles.read : styles.unread]}
      onPress={() => !isRead && onMarkAsRead(notification.id)}
    >
      <View style={styles.header}>
        <Ionicons
          name={isRead ? "notifications-outline" : "notifications"}
          size={22}
          color={isRead ? Colors.secondary : Colors.primary}
          style={{ marginRight: 8 }}
        />
        <Text style={[styles.title, isRead && styles.titleRead]}>
          {notification.title}
        </Text>
      </View>

      <Text style={styles.description}>{notification.description}</Text>

      {notification.created_at && (
        <Text style={styles.time}>{getTimeAgo(notification.created_at)}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: Colors.white,
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  read: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    color: Colors.black,
    flexShrink: 1,
    fontFamily: "MontserratSemiBold",
  },
  titleRead: {
    color: Colors.secondary,
    fontFamily: "MontserratRegular",
  },
  description: {
    fontSize: 13,
    color: Colors.secondary,
    marginBottom: 6,
    fontFamily: "MontserratRegular",
  },
  time: {
    fontSize: 11,
    color: Colors.secondary,
    alignSelf: "flex-end",
    fontFamily: "MontserratRegular",
  },
});
