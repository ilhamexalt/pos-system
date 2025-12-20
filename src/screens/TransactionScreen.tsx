import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
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
  const loadingMore = useTransactionStore((state) => state.loadingMore);
  const hasMore = useTransactionStore((state) => state.hasMore);
  const allDataLoaded = useTransactionStore((state) => state.allDataLoaded);
  const fetchTransactions = useTransactionStore(
    (state) => state.fetchTransactions
  );
  const fetchAllTransactions = useTransactionStore(
    (state) => state.fetchAllTransactions
  );
  const fetchMoreTransactions = useTransactionStore(
    (state) => state.fetchMoreTransactions
  );
  const [refreshing, setRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  // Predefined filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(transactions.map(t => t.category).filter(Boolean))] as string[];
    const paymentMethods = ["qris", "cash"];
    const platforms = ["shopee", "offline", "grab", "gojek", "null"];
    return { categories, paymentMethods, platforms };
  }, [transactions]);

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

  const filteredData = useMemo(() => {
    let filtered = [...transactions];

    // Filter by month/year (UTC timezone)
    if (selectedMonth !== null && selectedYear !== null) {
      filtered = filtered.filter((t) => {
        const date = new Date(t.created_at ?? "");
        return (
          date.getUTCMonth() === selectedMonth &&
          date.getUTCFullYear() === selectedYear
        );
      });
    }

    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter((t) => t.category?.toLowerCase() === filterCategory.toLowerCase());
    }

    // Filter by payment method
    if (filterPaymentMethod) {
      filtered = filtered.filter((t) => t.payment_method?.toLowerCase() === filterPaymentMethod.toLowerCase());
    }

    // Filter by platform (skip when category is selling - show all platforms)
    const isSelling = filterCategory?.toLowerCase() === "selling";
    if (filterPlatform && !isSelling) {
      if (filterPlatform === "null") {
        // Filter where platform is null or undefined
        filtered = filtered.filter((t) => !t.platform);
      } else {
        filtered = filtered.filter((t) => t.platform?.toLowerCase() === filterPlatform.toLowerCase());
      }
    }

    // Sort by created_at descending
    filtered.sort(
      (a, b) =>
        new Date(b.created_at ?? "").getTime() -
        new Date(a.created_at ?? "").getTime()
    );

    return filtered;
  }, [transactions, selectedMonth, selectedYear, filterCategory, filterPaymentMethod, filterPlatform]);

  // 💰 Hitung total selling & buying berdasarkan bulan saja
  const { totalIncome, totalOutcome } = useMemo(() => {
    // Filter hanya berdasarkan bulan jika ada
    let monthFiltered = [...transactions];

    if (selectedMonth !== null && selectedYear !== null) {
      monthFiltered = monthFiltered.filter((t) => {
        const date = new Date(t.created_at ?? "");
        // Gunakan UTC untuk match dengan Supabase
        return (
          date.getUTCMonth() === selectedMonth &&
          date.getUTCFullYear() === selectedYear
        );
      });
    }

    // Income = total amount dari category 'selling'
    const totalIncome = monthFiltered
      .filter((t) => t.category === "selling")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    // Outcome = total amount dari category 'buying'
    const totalOutcome = monthFiltered
      .filter((t) => t.category === "buying")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return { totalIncome, totalOutcome };
  }, [transactions, selectedMonth, selectedYear]);

  const hasActiveFilters = filterCategory || filterPaymentMethod || filterPlatform;

  const clearAllFilters = () => {
    setFilterCategory(null);
    setFilterPaymentMethod(null);
    setFilterPlatform(null);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Fetch all data when filters are active
  useEffect(() => {
    if (hasActiveFilters && !allDataLoaded) {
      fetchAllTransactions();
    }
  }, [hasActiveFilters, allDataLoaded, fetchAllTransactions]);

  if (loading && !refreshing) {
    return <Loading visible={true} onRequestClose={() => { }} />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* === Filter === */}
        {/* Header with summary and date filter */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => {
              // Fetch all data first for accurate summary
              if (!allDataLoaded) {
                fetchAllTransactions();
              }
              setVisible(true);
            }}
          >
            <Ionicons
              name="stats-chart-outline"
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateButton}
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
            <Ionicons name="calendar-outline" size={16} color={Colors.black} />
            <Text style={styles.filterText}>
              {selectedMonth !== null && selectedYear !== null
                ? `${months[selectedMonth]} ${selectedYear}`
                : "All Time"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterContainer}
        >
          {/* Category Filter */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterCategory && styles.filterChipActive,
            ]}
            onPress={() => {
              // Cycle through categories
              const currentIndex = filterOptions.categories.indexOf(filterCategory || "");
              const nextIndex = (currentIndex + 1) % filterOptions.categories.length;
              const nextCategory = filterOptions.categories[nextIndex] || null;
              setFilterCategory(nextCategory);
              // Clear platform if category is selling
              if (nextCategory?.toLowerCase() === "selling") {
                setFilterPlatform(null);
              }
            }}
            onLongPress={() => {
              // Clear filter on long press
              setFilterCategory(null);
            }}
          >
            <Ionicons
              name="pricetag-outline"
              size={14}
              color={filterCategory ? Colors.white : Colors.black}
            />
            <Text
              style={[
                styles.filterChipText,
                filterCategory && styles.filterChipTextActive,
              ]}
            >
              {filterCategory || "Category"}
            </Text>
          </TouchableOpacity>

          {/* Payment Method Filter */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterPaymentMethod && styles.filterChipActive,
            ]}
            onPress={() => {
              // Cycle through payment methods
              const currentIndex = filterOptions.paymentMethods.indexOf(filterPaymentMethod || "");
              const nextIndex = (currentIndex + 1) % filterOptions.paymentMethods.length;
              setFilterPaymentMethod(filterOptions.paymentMethods[nextIndex] || null);
            }}
            onLongPress={() => {
              // Clear filter on long press
              setFilterPaymentMethod(null);
            }}
          >
            <Ionicons
              name="card-outline"
              size={14}
              color={filterPaymentMethod ? Colors.white : Colors.black}
            />
            <Text
              style={[
                styles.filterChipText,
                filterPaymentMethod && styles.filterChipTextActive,
              ]}
            >
              {filterPaymentMethod || "Payment"}
            </Text>
          </TouchableOpacity>

          {/* Platform Filter */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterPlatform && styles.filterChipActive,
              filterCategory?.toLowerCase() === "selling" && styles.filterChipDisabled,
            ]}
            disabled={filterCategory?.toLowerCase() === "selling"}
            onPress={() => {
              // Cycle through platform options
              const currentIndex = filterOptions.platforms.indexOf(filterPlatform || "");
              const nextIndex = (currentIndex + 1) % filterOptions.platforms.length;
              setFilterPlatform(filterOptions.platforms[nextIndex] || null);
            }}
            onLongPress={() => {
              // Clear filter on long press
              setFilterPlatform(null);
            }}
          >
            <Ionicons
              name="storefront-outline"
              size={14}
              color={
                filterCategory?.toLowerCase() === "selling"
                  ? Colors.secondary
                  : filterPlatform
                    ? Colors.white
                    : Colors.black
              }
            />
            <Text
              style={[
                styles.filterChipText,
                filterPlatform && styles.filterChipTextActive,
                filterCategory?.toLowerCase() === "selling" && styles.filterChipTextDisabled,
              ]}
            >
              {filterPlatform || "Platform"}
            </Text>
          </TouchableOpacity>

          {/* Clear All Button */}
          {hasActiveFilters && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearAllFilters}
            >
              <Ionicons name="close-circle" size={14} color={Colors.red} />
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Loading indicator when fetching all data for filter */}
        {loading && hasActiveFilters && (
          <View style={styles.filterLoading}>
            <Text style={styles.loadingText}>Loading all data...</Text>
          </View>
        )}

        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TransactionItem transaction={item} />}
          ListEmptyComponent={
            loading ? null : (
              <View>
                <Image
                  source={require("../../assets/gif/empty.gif")}
                  style={styles.image}
                />
                <Text style={styles.emptyText}>Your transaction is empty</Text>
              </View>
            )
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMore}>
                <Text style={styles.loadingText}>Loading more...</Text>
              </View>
            ) : null
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={() => {
            if (hasMore && !loadingMore && !hasActiveFilters && selectedMonth === null) {
              fetchMoreTransactions();
            }
          }}
          onEndReachedThreshold={0.5}
          // Performance optimizations
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 80,
            offset: 80 * index,
            index,
          })}
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
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  filterScrollView: {
    marginBottom: 10,
    maxHeight: 50,
    flexGrow: 0,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 10,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    height: 36,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipDisabled: {
    backgroundColor: "#f0f0f0",
    opacity: 0.6,
  },
  filterChipText: {
    fontSize: 12,
    color: Colors.black,
    fontFamily: "MontserratSemiBold",
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  filterChipTextDisabled: {
    color: Colors.secondary,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    fontSize: 12,
    color: Colors.red,
    fontFamily: "MontserratSemiBold",
  },
  filterLoading: {
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginBottom: 10,
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
  loadingMore: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loadingText: {
    color: Colors.secondary,
    fontSize: 12,
    fontFamily: "MontserratRegular",
  },
});
