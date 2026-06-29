import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, subscription, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: "diamond" as const,
      label: "Subscription",
      value: subscription?.status === "active" ? "Active" : "Free Tier",
      color: subscription?.status === "active" ? COLORS.accent.gold : COLORS.dark[400],
      onPress: () => router.push("/(tabs)/subscribe"),
    },
    {
      icon: "card" as const,
      label: "Billing History",
      value: "",
      color: COLORS.primary[400],
      onPress: () => {},
    },
    {
      icon: "notifications" as const,
      label: "Notifications",
      value: "",
      color: COLORS.primary[400],
      onPress: () => {},
    },
    {
      icon: "shield-checkmark" as const,
      label: "Privacy Policy",
      value: "",
      color: COLORS.primary[400],
      onPress: () => {},
    },
    {
      icon: "document-text" as const,
      label: "Terms of Service",
      value: "",
      color: COLORS.primary[400],
      onPress: () => {},
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.dark[900] }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
    >
      {/* Profile Header */}
      <View style={{ alignItems: "center", paddingHorizontal: 20, marginBottom: 32 }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: COLORS.primary[600],
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ color: COLORS.white, fontSize: 36, fontWeight: "800" }}>
            {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={{ color: COLORS.white, fontSize: 24, fontWeight: "800" }}>
          {user?.full_name || "User"}
        </Text>
        <Text style={{ color: COLORS.dark[400], fontSize: 15, marginTop: 4 }}>
          {user?.email}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 12,
            backgroundColor: COLORS.dark[800],
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Ionicons
            name="diamond"
            size={16}
            color={subscription?.status === "active" ? COLORS.accent.gold : COLORS.dark[400]}
          />
          <Text
            style={{
              color: subscription?.status === "active" ? COLORS.accent.gold : COLORS.dark[400],
              fontWeight: "700",
              fontSize: 14,
              marginLeft: 8,
            }}
          >
            {subscription?.status === "active" ? "Premium Member" : "Free Tier"}
          </Text>
        </View>
      </View>

      {/* Stats */}
      {subscription?.status === "active" && (
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 20,
            marginBottom: 24,
            gap: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: COLORS.dark[800],
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: COLORS.primary[400], fontSize: 24, fontWeight: "800" }}>
              {subscription.billing_cycle === "yearly" ? "Yearly" : "Monthly"}
            </Text>
            <Text style={{ color: COLORS.dark[400], fontSize: 12, marginTop: 4 }}>
              Billing Cycle
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: COLORS.dark[800],
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: COLORS.accent.gold, fontSize: 24, fontWeight: "800" }}>
              {subscription.cancel_at_period_end ? "Ending" : "Active"}
            </Text>
            <Text style={{ color: COLORS.dark[400], fontSize: 12, marginTop: 4 }}>
              Status
            </Text>
          </View>
        </View>
      )}

      {/* Menu Items */}
      <View style={{ paddingHorizontal: 20 }}>
        {menuItems.map((item, index) => (
          <Pressable
            key={index}
            onPress={item.onPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.dark[800],
              padding: 16,
              borderRadius: 14,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                backgroundColor: item.color + "15",
                borderRadius: 10,
                padding: 10,
                marginRight: 14,
              }}
            >
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: "600", flex: 1 }}>
              {item.label}
            </Text>
            {item.value ? (
              <Text style={{ color: COLORS.dark[400], fontSize: 14, marginRight: 8 }}>
                {item.value}
              </Text>
            ) : null}
            <Ionicons name="chevron-forward" size={18} color={COLORS.dark[500]} />
          </Pressable>
        ))}
      </View>

      {/* Sign Out */}
      <Pressable
        onPress={handleSignOut}
        style={{
          marginHorizontal: 20,
          marginTop: 16,
          backgroundColor: COLORS.error + "15",
          borderRadius: 14,
          padding: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ color: COLORS.error, fontWeight: "700", fontSize: 16 }}>
          Sign Out
        </Text>
      </Pressable>

      {/* App Version */}
      <Text
        style={{
          color: COLORS.dark[600],
          textAlign: "center",
          marginTop: 24,
          fontSize: 13,
        }}
      >
        PrestigeSupliments v1.0.0
      </Text>
    </ScrollView>
  );
}
