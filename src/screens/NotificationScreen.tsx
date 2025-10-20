import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useNotificationStore } from "../stores/notificationStore";
import NotificationItem from "../components/NotificationItem";
import Loading from "../components/Loading";
import { Colors } from "../constants/Colors";
import Modal from "../components/Modal";

export default function NotificationScreen() {
  const notifications = useNotificationStore((state) => state.notifications);
  const loading = useNotificationStore((state) => state.loading);
  const fetchNotifications = useNotificationStore(
    (state) => state.fetchNotifications
  );
  const subscribeToNotifications = useNotificationStore(
    (state) => state.subscribeToNotifications
  );
  const unsubscribe = useNotificationStore((state) => state.unsubscribe);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const [visible, setVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleMarkAllAsRead = async () => {
    setVisible(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNotifications();
    subscribeToNotifications();

    return () => {
      unsubscribe();
    };
  }, [fetchNotifications, subscribeToNotifications, unsubscribe]);

  if (loading && !refreshing) {
    return <Loading visible={true} onRequestClose={() => {}} />;
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.9}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={handleMarkAllAsRead}
          disabled={notifications.filter((n) => !n.is_read).length === 0}
        >
          <Text
            style={[
              styles.categoryText,
              {
                color:
                  notifications.filter((n) => !n.is_read).length > 0
                    ? Colors.primary
                    : Colors.secondary,
              },
            ]}
          >
            Mark as Read ({notifications.filter((n) => !n.is_read).length})
          </Text>
        </TouchableOpacity>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <NotificationItem notification={item} onMarkAsRead={markAsRead} />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No notifications</Text>
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>

      <Modal
        type="action"
        visible={!!visible}
        onClose={() => setVisible(false)}
        onConfirm={async () => {
          await markAllAsRead();
          setVisible(false);
        }}
        children={<Text style={styles.categoryText}>Tandai Sudah Dibaca</Text>}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingBottom: 50,
  },
  empty: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: Colors.secondary,
    fontFamily: "MontserratRegular",
  },
  categoryText: {
    color: Colors.primary,
    fontSize: 12,
    textAlign: "right",
    marginBottom: 10,
    fontFamily: "MontserratRegular",
  },
});
