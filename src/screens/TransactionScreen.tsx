import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import { useTransactionStore } from "../stores/transactionStore";
import TransactionItem from "../components/TransactionItem";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import Loading from "../components/Loading";
import { Ionicons } from "@expo/vector-icons";
import { format } from "../utils/format";
import Modal from "../components/Modal";

export default function TransactionScreen() {
  const transactions = useTransactionStore((state) => state.transactions);
  const loading = useTransactionStore((state) => state.loading);
  const fetchTransactions = useTransactionStore(
    (state) => state.fetchTransactions
  );
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"created_at" | "amount" | "type">(
    "created_at"
  );
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const sortedAndFilteredData = useMemo(() => {
    let filtered = [...transactions];

    if (selectedMonth !== null && selectedYear !== null) {
      filtered = filtered.filter((t) => {
        const date = new Date(t.created_at ?? "");
        return (
          date.getMonth() === selectedMonth &&
          date.getFullYear() === selectedYear
        );
      });
    }

    switch (sortBy) {
      case "amount":
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case "type":
        filtered.sort((a, b) => a.type.localeCompare(b.type));
        break;
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.created_at ?? "").getTime() -
            new Date(a.created_at ?? "").getTime()
        );
    }

    return filtered;
  }, [transactions, sortBy, selectedMonth, selectedYear]);

  // 💰 Hitung total income & outcome
  const { totalIncome, totalOutcome } = useMemo(() => {
    const totalIncome = sortedAndFilteredData
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalOutcome = sortedAndFilteredData
      .filter((t) => t.type === "outcome")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return { totalIncome, totalOutcome };
  }, [sortedAndFilteredData]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading && !refreshing) {
    return <Loading visible={true} onRequestClose={() => {}} />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* === Filter === */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              if (sortBy === "created_at") setSortBy("amount");
              else if (sortBy === "amount") setSortBy("type");
              else setSortBy("created_at");
            }}
          >
            <Ionicons name="filter-outline" size={16} color={Colors.black} />
            <Text style={styles.filterText}>Sort: {sortBy}</Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              width: 120,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => setVisible(true)}
            >
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={Colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, { width: 90 }]}
              onPress={() => {
                const now = new Date();
                if (selectedMonth === null) {
                  setSelectedMonth(now.getMonth());
                  setSelectedYear(now.getFullYear());
                } else {
                  setSelectedMonth(null);
                  setSelectedYear(null);
                }
              }}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color={Colors.black}
              />
              <Text style={styles.filterText}>
                {selectedMonth !== null && selectedYear !== null
                  ? `${months[selectedMonth]} ${selectedYear}`
                  : "All Time"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={sortedAndFilteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TransactionItem transaction={item} />}
          ListEmptyComponent={
            <View>
              <Image
                source={require("../../assets/gif/empty.gif")}
                style={styles.image}
              />
              <Text style={styles.emptyText}>Your transaction is empty</Text>
            </View>
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
        />

        <Modal
          type="action"
          visible={!!visible}
          onClose={() => setVisible(false)}
          onConfirm={() => setVisible(false)}
          cancelText="Close"
          hiddenButtonConfirm
          children={
            <View>
              <Text
                style={{
                  fontSize: 18,
                  color: Colors.black,
                  marginBottom: 8,
                  fontFamily: "MontserratBold",
                }}
              >
                Summary (
                {selectedMonth !== null
                  ? `${months[selectedMonth]} ${selectedYear}`
                  : "All Time"}
                )
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 6,
                  width: "100%",
                }}
              >
                <View>
                  <Text
                    style={{
                      color: Colors.secondary,
                      fontFamily: "MontserratRegular",
                    }}
                  >
                    Income
                  </Text>
                  <Text
                    style={{
                      fontFamily: "MontserratSemiBold",
                      fontSize: 16,
                      color: Colors.green,
                    }}
                  >
                    {format().formatCurrency(totalIncome)}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      color: Colors.secondary,
                      fontFamily: "MontserratRegular",
                    }}
                  >
                    Outcome
                  </Text>
                  <Text
                    style={{
                      fontFamily: "MontserratSemiBold",
                      fontSize: 16,
                      color: Colors.red,
                    }}
                  >
                    {format().formatCurrency(totalOutcome)}
                  </Text>
                </View>
              </View>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingBottom: 0,
  },
  filterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    height: 40,
    width: 140,
  },
  filterText: {
    fontSize: 12,
    color: Colors.black,
    fontFamily: "MontserratSemiBold",
  },
  image: {
    width: "auto",
    height: 250,
    marginTop: 200,
  },
  emptyText: {
    color: Colors.secondary,
    fontSize: 12,
    textAlign: "center",
    fontFamily: "MontserratRegular",
  },
});
