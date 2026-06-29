import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

export default function SubscribeScreen() {
  const insets = useSafeAreaInsets();
  const { tiers, subscription } = useAuthStore();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [purchasing, setPurchasing] = useState(false);

  const handleSubscribe = async (tierSlug: string) => {
    if (tierSlug === "free") return;
    setPurchasing(true);

    try {
      // RevenueCat purchase would happen here
      // import Purchases from 'react-native-purchases';
      // const { customerInfo } = await Purchases.purchasePackage(package);
      Alert.alert(
        "Purchase",
        `RevenueCat purchase flow for ${tierSlug} ${billingCycle} plan.\n\nIn production, this triggers the native IAP flow.`,
        [{ text: "OK" }]
      );
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      // import Purchases from 'react-native-purchases';
      // const customerInfo = await Purchases.restorePurchases();
      Alert.alert("Restore", "Checking for previous purchases...");
    } catch (error) {
      Alert.alert("Error", "Could not restore purchases.");
    }
  };

  const activeTierSlug = subscription?.status === "active" ? "premium" : "free";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.dark[900] }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <Text
          style={{ color: COLORS.white, fontSize: 28, fontWeight: "800" }}
        >
          Choose Your Plan
        </Text>
        <Text
          style={{ color: COLORS.dark[300], fontSize: 16, marginTop: 8, lineHeight: 22 }}
        >
          Unlock your full potential with premium supplement guidance.
        </Text>
      </View>

      {/* Billing Toggle */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 20,
          backgroundColor: COLORS.dark[800],
          borderRadius: 12,
          padding: 4,
          marginBottom: 24,
        }}
      >
        {(["monthly", "yearly"] as const).map((cycle) => (
          <Pressable
            key={cycle}
            onPress={() => setBillingCycle(cycle)}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 10,
              backgroundColor:
                billingCycle === cycle ? COLORS.primary[600] : "transparent",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: billingCycle === cycle ? COLORS.white : COLORS.dark[400],
                fontWeight: "700",
                fontSize: 15,
              }}
            >
              {cycle === "monthly" ? "Monthly" : "Yearly"}
            </Text>
            {cycle === "yearly" && (
              <Text
                style={{
                  color: COLORS.accent.gold,
                  fontSize: 11,
                  fontWeight: "600",
                  marginTop: 2,
                }}
              >
                Save 17%
              </Text>
            )}
          </Pressable>
        ))}
      </View>

      {/* Tier Cards */}
      {tiers.map((tier) => {
        const isActive = activeTierSlug === tier.slug;
        const isPremium = tier.slug === "premium";
        const price =
          billingCycle === "yearly" ? tier.price_yearly : tier.price_monthly;

        return (
          <View
            key={tier.id}
            style={{
              marginHorizontal: 20,
              marginBottom: 16,
              backgroundColor: COLORS.dark[800],
              borderRadius: 20,
              padding: 20,
              borderWidth: isPremium ? 2 : 1,
              borderColor: isPremium
                ? COLORS.accent.gold
                : isActive
                ? COLORS.primary[500]
                : COLORS.dark[700],
            }}
          >
            {isPremium && (
              <View
                style={{
                  position: "absolute",
                  top: -12,
                  left: 20,
                  backgroundColor: COLORS.accent.gold,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: COLORS.dark[900], fontWeight: "800", fontSize: 12 }}>
                  MOST POPULAR
                </Text>
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <View>
                <Text
                  style={{
                    color: isPremium ? COLORS.accent.gold : COLORS.white,
                    fontSize: 22,
                    fontWeight: "800",
                  }}
                >
                  {tier.name}
                </Text>
                {isActive && (
                  <View
                    style={{
                      backgroundColor: COLORS.primary[500] + "20",
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      borderRadius: 10,
                      marginTop: 6,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.primary[400],
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      CURRENT PLAN
                    </Text>
                  </View>
                )}
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{ color: COLORS.white, fontSize: 32, fontWeight: "800" }}
                >
                  ${price === 0 ? "0" : price.toFixed(2)}
                </Text>
                {price > 0 && (
                  <Text style={{ color: COLORS.dark[400], fontSize: 13 }}>
                    /{billingCycle === "monthly" ? "mo" : "yr"}
                  </Text>
                )}
              </View>
            </View>

            {/* Features */}
            <View style={{ marginTop: 16, marginBottom: 16 }}>
              {(tier.features as string[]).map((feature, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={isPremium ? COLORS.accent.gold : COLORS.primary[400]}
                  />
                  <Text
                    style={{
                      color: COLORS.dark[200],
                      fontSize: 14,
                      marginLeft: 10,
                      flex: 1,
                    }}
                  >
                    {feature}
                  </Text>
                </View>
              ))}
            </View>

            {/* Subscribe Button */}
            {tier.slug !== "free" && !isActive && (
              <Pressable
                onPress={() => handleSubscribe(tier.slug)}
                disabled={purchasing}
                style={{
                  backgroundColor: isPremium ? COLORS.accent.gold : COLORS.primary[600],
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: "center",
                  opacity: purchasing ? 0.7 : 1,
                }}
              >
                <Text
                  style={{
                    color: isPremium ? COLORS.dark[900] : COLORS.white,
                    fontWeight: "800",
                    fontSize: 16,
                  }}
                >
                  {purchasing ? "Processing..." : `Subscribe to ${tier.name}`}
                </Text>
              </Pressable>
            )}

            {tier.slug === "free" && (
              <View
                style={{
                  backgroundColor: COLORS.dark[700],
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: COLORS.dark[300], fontWeight: "600", fontSize: 16 }}
                >
                  Free Forever
                </Text>
              </View>
            )}
          </View>
        );
      })}

      {/* Restore Purchases */}
      <Pressable
        onPress={handleRestore}
        style={{ alignItems: "center", marginTop: 8, paddingVertical: 12 }}
      >
        <Text style={{ color: COLORS.primary[400], fontSize: 15, fontWeight: "600" }}>
          Restore Purchases
        </Text>
      </Pressable>
    </ScrollView>
  );
}
