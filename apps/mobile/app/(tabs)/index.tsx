import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import type { PremiumContent } from "@/types";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, subscription } = useAuthStore();
  const [featuredContent, setFeaturedContent] = useState<PremiumContent[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadContent = useCallback(async () => {
    const { data } = await supabase
      .from("premium_content")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setFeaturedContent(data);
  }, []);

  useEffect(() => {
    loadContent();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContent();
    setRefreshing(false);
  };

  const tierName = subscription
    ? subscription.tier_id
      ? "Active"
      : "Free"
    : "Free";

  const contentTypeIcons: Record<string, string> = {
    article: "document-text",
    video: "videocam",
    guide: "compass",
    recipe: "restaurant",
    workout: "barbell",
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.dark[900] }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary[500]}
        />
      }
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <Text style={{ color: COLORS.dark[400], fontSize: 14, fontWeight: "500" }}>
          Welcome back
        </Text>
        <Text
          style={{
            color: COLORS.white,
            fontSize: 28,
            fontWeight: "800",
            marginTop: 4,
          }}
        >
          {user?.full_name || "Athlete"} 💪
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
            backgroundColor: COLORS.dark[800],
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            alignSelf: "flex-start",
          }}
        >
          <Ionicons
            name="diamond"
            size={14}
            color={subscription ? COLORS.accent.gold : COLORS.dark[400]}
          />
          <Text
            style={{
              color: subscription ? COLORS.accent.gold : COLORS.dark[400],
              fontSize: 13,
              fontWeight: "600",
              marginLeft: 6,
            }}
          >
            {subscription ? "Premium Member" : "Free Tier"}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          marginBottom: 32,
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => router.push("/(tabs)/content")}
          style={{
            flex: 1,
            backgroundColor: COLORS.primary[600],
            borderRadius: 16,
            padding: 16,
            alignItems: "center",
          }}
        >
          <Ionicons name="library" size={28} color={COLORS.white} />
          <Text
            style={{ color: COLORS.white, fontWeight: "700", marginTop: 8 }}
          >
            Browse Content
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(tabs)/subscribe")}
          style={{
            flex: 1,
            backgroundColor: COLORS.dark[800],
            borderRadius: 16,
            padding: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: COLORS.dark[700],
          }}
        >
          <Ionicons name="diamond" size={28} color={COLORS.accent.gold} />
          <Text
            style={{ color: COLORS.accent.gold, fontWeight: "700", marginTop: 8 }}
          >
            Upgrade
          </Text>
        </Pressable>
      </View>

      {/* Featured Content */}
      <View style={{ paddingHorizontal: 20 }}>
        <Text
          style={{
            color: COLORS.white,
            fontSize: 20,
            fontWeight: "700",
            marginBottom: 16,
          }}
        >
          Featured Content
        </Text>
        {featuredContent.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => router.push(`/content/${item.slug}`)}
            style={{
              backgroundColor: COLORS.dark[800],
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: COLORS.dark[700],
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: COLORS.dark[700],
                  borderRadius: 8,
                  padding: 8,
                  marginRight: 12,
                }}
              >
                <Ionicons
                  name={
                    (contentTypeIcons[item.content_type] as any) || "document"
                  }
                  size={20}
                  color={COLORS.primary[400]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  {item.title}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                  <View
                    style={{
                      backgroundColor:
                        item.required_tier_slug === "premium"
                          ? COLORS.accent.gold + "20"
                          : item.required_tier_slug === "basic"
                          ? COLORS.primary[500] + "20"
                          : COLORS.dark[600],
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 10,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          item.required_tier_slug === "premium"
                            ? COLORS.accent.gold
                            : item.required_tier_slug === "basic"
                            ? COLORS.primary[400]
                            : COLORS.dark[300],
                        fontSize: 11,
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.required_tier_slug}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: COLORS.dark[400],
                      fontSize: 12,
                      marginLeft: 8,
                    }}
                  >
                    {item.content_type}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.dark[400]}
              />
            </View>
            {item.excerpt && (
              <Text
                style={{ color: COLORS.dark[300], fontSize: 14, lineHeight: 20 }}
                numberOfLines={2}
              >
                {item.excerpt}
              </Text>
            )}
          </Pressable>
        ))}
      </View>

      {/* Upgrade CTA (if free tier) */}
      {!subscription && (
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 8,
            backgroundColor: COLORS.primary[600] + "15",
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: COLORS.primary[600] + "30",
          }}
        >
          <Text
            style={{ color: COLORS.white, fontSize: 18, fontWeight: "700" }}
          >
            Unlock Premium Content
          </Text>
          <Text
            style={{
              color: COLORS.dark[300],
              fontSize: 14,
              marginTop: 8,
              lineHeight: 20,
            }}
          >
            Get access to exclusive guides, workout programs, and personalized
            supplement stacks.
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/subscribe")}
            style={{
              backgroundColor: COLORS.primary[500],
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
              marginTop: 16,
            }}
          >
            <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 16 }}>
              View Plans
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
