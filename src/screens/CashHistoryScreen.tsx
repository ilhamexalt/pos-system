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

  // Helper function to get reason for balance change
  const getChangeReason = (desc: string): { reason: string; isDecrease: boolean } => {
    const lowerDesc = desc.toLowerCase();

    if (lowerDesc.includes("berkurang")) {
      // Cek alasan berkurang
      if (lowerDesc.includes("pembelian") || lowerDesc.includes("buying")) {
        return { reason: "Pembelian Barang", isDecrease: true };
      } else if (lowerDesc.includes("pengeluaran") || lowerDesc.includes("outcome")) {
        return { reason: "Pengeluaran", isDecrease: true };
      } else if (lowerDesc.includes("tarik") || lowerDesc.includes("withdraw")) {
        return { reason: "Penarikan Tunai", isDecrease: true };
      }
      return { reason: "Saldo Berkurang", isDecrease: true };
    } else if (lowerDesc.includes("bertambah")) {
      // Cek alasan bertambah
      if (lowerDesc.includes("penjualan") || lowerDesc.includes("selling")) {
        return { reason: "Penjualan", isDecrease: false };
      } else if (lowerDesc.includes("pemasukan") || lowerDesc.includes("income")) {
        return { reason: "Pemasukan", isDecrease: false };
      } else if (lowerDesc.includes("setor") || lowerDesc.includes("deposit")) {
        return { reason: "Setoran Tunai", isDecrease: false };
      }
      return { reason: "Saldo Bertambah", isDecrease: false };
    }

    return { reason: desc || "Tidak ada keterangan", isDecrease: false };
  };

  const renderItem = ({ item }: { item: CashEntry }) => {
    const { reason, isDecrease } = getChangeReason(item.desc);

    return (
      <View style={styles.itemContainer}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.nominalText, isDecrease && styles.nominalDecrease]}
            >
              {isDecrease ? "- " : "+ "}
              {format().formatCurrency(item.nominal)}
            </Text>
            <Text style={[styles.reasonText, isDecrease && { color: Colors.red }]}>
              {reason}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {format().formatDateToCustom(item.updated_at)}
          </Text>
        </View>
        {item.desc && (
          <Text style={styles.descText} numberOfLines={2}>
            {item.desc}
          </Text>
        )}
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
    padding: 10,
    paddingBottom: 0,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  reasonText: {
    fontSize: 12,
    color: Colors.green,
    fontFamily: "MontserratSemiBold",
    marginTop: 2,
  },
  descText: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: "MontserratRegular",
    marginTop: 8,
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
