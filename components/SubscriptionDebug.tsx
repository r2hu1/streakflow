import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSubscription } from "@/lib/revenuecat";

export function SubscriptionDebug() {
  const { customerInfo, offerings, isSubscribed, isLoading } =
    useSubscription();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Subscription Debug</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{isLoading ? "Loading..." : "Loaded"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Is Subscribed:</Text>
        <Text style={styles.value}>{isSubscribed ? "YES ✓" : "NO ✗"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Current Offering:</Text>
        <Text style={styles.value}>
          {offerings?.current?.identifier || "None configured"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Available Packages:</Text>
        {offerings?.current?.availablePackages.map((pkg) => (
          <Text key={pkg.identifier} style={styles.value}>
            • {pkg.identifier}: {pkg.product.priceString}
          </Text>
        ))}
        {!offerings?.current?.availablePackages.length && (
          <Text style={styles.value}>No packages available</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Entitlements:</Text>
        <Text style={styles.value}>
          {JSON.stringify(customerInfo?.entitlements.active, null, 2)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  section: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },
  value: {
    fontSize: 14,
    color: "#fff",
  },
});
