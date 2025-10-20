import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Transaction } from "../types";
import { format } from "../utils/format";
import { Colors } from "../constants/Colors";

interface Props {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: Props) {
  const isIncome = transaction.type === "income";

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={
              isIncome
                ? "arrow-up-right-box-outline"
                : "arrow-down-left-box-outline"
            }
            size={22}
            color={isIncome ? Colors.green : Colors.red}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>
            {format().capitalizeEachWord(
              transaction.description ?? "No description"
            )}
          </Text>
          <Text style={styles.subText}>
            {format().capitalizeEachWord(transaction.status)}
          </Text>

          {transaction.created_at && (
            <Text style={styles.time}>
              {transaction?.created_at.replace("T", " ").slice(0, 19)}
            </Text>
          )}
        </View>

        <View style={styles.amountContainer}>
          <Text
            style={[
              styles.amount,
              { color: isIncome ? Colors.green : Colors.red },
            ]}
          >
            {isIncome ? "+" : "-"} Rp{" "}
            {(transaction.amount || 0).toLocaleString("id-ID")}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontFamily: "MontserratSemiBold",
    color: Colors.black,
  },
  subText: {
    fontSize: 10,
    color: Colors.secondary,
    marginTop: 2,
    fontFamily: "MontserratRegular",
  },
  time: {
    fontSize: 10,
    color: Colors.secondary,
    marginTop: 3,
    fontFamily: "MontserratRegular",
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 14,
    fontFamily: "MontserratBold",
  },
});
