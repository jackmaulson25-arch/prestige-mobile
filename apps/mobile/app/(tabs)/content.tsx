import { View, Text, FlatList, Pressable, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, TIER_COLORS } from "@/constants/colors";
import type { PremiumContent, TierSlug } from "@/types";

const TIER_HIERARCHY: Record<TierSlug, number> = {
  free: 0,
  basic: 1,
  premium: 2,
};

export default function ContentScreen() {
  const insets = useSafeAreaInsets();
  const { subscription } = useAuthStore();
  const [content, setContent] = useState<PremiumContent[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const userTier: TierSlug = (subscription?.status === "active"
    ? "premium"
    : "free") as TierSlug;

  const loadContent = useCallback(async () => {
    let query = supabase
      .from("premium_content")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("content_type", filter);
    }

    const { data } = await query;
    if (data) setContent(data);
  }, [filter]);

  useEffect(() => {
    loadContent();
  }, [filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContent();
    setRefreshing(false);
  };

  const canAccess = (requiredTier: string): boolean => {
    return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier as TierSlug];
  };

  const contentTypeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    article: "document-text",
    video: "videocam",
    guide: "compass",
    recipe: "restaurant",
    workout: "barbell",
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "article", label: "Articles" },
    { key: "guide", label: "Guides" },
    { key: "recipe", label: "Recipes" },
    { key: "workout", label: "Workouts" },
    { key: "video", label: "Videos" },
  ];

  const renderItem = ({ item }: { item: PremiumContent }) => {
    const locked = !canAccess(item.required_tier_slug);

    return (
      <Pressable
        onPress={() => {
          if (locked) {
            router.push("/(tabs)/subscribe");
          } else {
            router.push(`/content/${item.slug}`);
          }
        }}
        style={{
          backgroundColor: COLORS.dark[800],
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: locked ? COLORS.dark[700] : COLORS.primary[600] + "40",
          opacity: locked ? 0.7 : 1,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View
            style={{
              backgroundColor: locked ? COLORS.dark[700] : COLORS.primary[600] + "20",
              borderRadius: 12,
              padding: 12,
              marginRight: 14,
            }}
          >
            <Ionicons
              name={contentTypeIcons[item.content_type] || "document"}
              size={24}
              color={locked ? COLORS.dark[400] : COLORS.primary[400]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: COLORS.white,
                fontSize: 16,
                fontWeight: "700",
                marginBottom: 6,
              }}
            >
              {item.title}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View
                style={{
                  backgroundColor: TIER_COLORS[item.required_tier_slug] + "20",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    color: TIER_COLORS[item.required_tier_slug],
                    fontSize: 11,
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  {item.required_tier_slug}
                </Text>
              </View>
              <Text style={{ color: COLORS.dark[400], fontSize: 12 }}>
                {item.content_type}
              </Text>
            </View>
            {item.excerpt && (
              <Text
                style={{ color: COLORS.dark[300], fontSize: 13, marginTop: 8, lineHeight: 19 }}
                numberOfLines={2}
              >
                {item.excerpt}
              </Text>
            )}
          </View>
          {locked ? (
            <Ionicons name="lock-closed" size={20} color={COLORS.dark[400]} />
          ) : (
            <Ionicons name="chevron-forward" size={20} color={COLORS.dark[400]} />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.dark[900] }}>
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20 }}>
        <Text
          style={{
            color: COLORS.white,
            fontSize: 28,
            fontWeight: "800",
            marginBottom: 16,
          }}
        >
          Content Library
        </Text>

        {/* Filter chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ marginBottom: 16 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setFilter(item.key)}
              style={{
                backgroundColor:
                  filter === item.key ? COLORS.primary[600] : COLORS.dark[800],
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                borderWidth: 1,
                borderColor:
                  filter === item.key ? COLORS.primary[500] : COLORS.dark[700],
              }}
            >
              <Text
                style={{
                  color: filter === item.key ? COLORS.white : COLORS.dark[300],
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={content}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Ionicons name="document-outline" size={48} color={COLORS.dark[600]} />
            <Text style={{ color: COLORS.dark[400], fontSize: 16, marginTop: 12 }}>
              No content found
            </Text>
          </View>
        }
      />
    </View>
  );
}
