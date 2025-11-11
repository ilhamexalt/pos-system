import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { supabase } from "../config/supabase";
import { CashEntry } from "../types";
import { format } from "../utils/format";
import { Colors } from "../constants/Colors";

const CashHistoryScreen = () => {
  const [cashData, setCashData] = useState<CashEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCashData = useCallback(async () => {
    // Set loading/refreshing, tetapi jangan reset data/error
    if (!refreshing) {
      setLoading(true);
    }
    setError(null);
    try {
      const { data, error } = await supabase
        .from("cash")
        .select("id, nominal, desc, updated_at")
        .order("updated_at", { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      if (data) {
        setCashData(data as CashEntry[]);
      }
    } catch (err: any) {
      setError("Gagal memuat riwayat kas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCashData();
  }, [fetchCashData]);

  useEffect(() => {
    fetchCashData();
  }, [fetchCashData]);

  const renderItem = ({ item }: { item: CashEntry }) => {
    const isDecrease = item.desc.toLowerCase().includes("berkurang");
    return (
      <View style={styles.itemContainer}>
        <View style={styles.row}>
          <Text
            style={[styles.nominalText, isDecrease && styles.nominalDecrease]}
          >
            {format().formatCurrency(item.nominal)}
          </Text>
          <Text style={styles.dateText}>
            {format().formatDateToCustom(item.updated_at)}
          </Text>
        </View>
        <Text style={[styles.descText, isDecrease && { color: Colors.red }]}>
          Deskripsi: {item.desc}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cashData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>Tidak ada riwayat kas.</Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.whiteSmoke,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContainer: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  nominalText: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: "MontserratBold",
  },
  nominalDecrease: {
    color: "red",
  },
  dateText: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: "MontserratRegular",
  },
  descText: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: "MontserratRegular",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    fontFamily: "MontserratRegular",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: Colors.gray,
    fontFamily: "MontserratRegular",
  },
});

export default CashHistoryScreen;
