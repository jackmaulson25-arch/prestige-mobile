import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, TIER_COLORS } from "@/constants/colors";
import type { PremiumContent, TierSlug } from "@/types";

const TIER_HIERARCHY: Record<TierSlug, number> = {
  free: 0,
  basic: 1,
  premium: 2,
};

export default function ContentDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { subscription } = useAuthStore();
  const [content, setContent] = useState<PremiumContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userTier: TierSlug = (subscription?.status === "active"
    ? "premium"
    : "free") as TierSlug;

  useEffect(() => {
    loadContent();
  }, [slug]);

  const loadContent = async () => {
    if (!slug) return;

    const { data, error: fetchError } = await supabase
      .from("premium_content")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (fetchError || !data) {
      setError("Content not found");
      setLoading(false);
      return;
    }

    // Check access
    const canAccess =
      TIER_HIERARCHY[userTier] >=
      TIER_HIERARCHY[data.required_tier_slug as TierSlug];

    if (!canAccess) {
      setError("locked");
      setContent(data);
      setLoading(false);
      return;
    }

    setContent(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.dark[900],
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
      </View>
    );
  }

  if (error === "locked" && content) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.dark[900],
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: COLORS.accent.gold + "20",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Ionicons name="lock-closed" size={40} color={COLORS.accent.gold} />
        </View>
        <Text
          style={{
            color: COLORS.white,
            fontSize: 24,
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          Premium Content
        </Text>
        <Text
          style={{
            color: COLORS.dark[300],
            fontSize: 16,
            textAlign: "center",
            marginTop: 12,
            lineHeight: 24,
          }}
        >
          This content requires a{" "}
          <Text style={{ color: TIER_COLORS[content.required_tier_slug], fontWeight: "700" }}>
            {content.required_tier_slug}
          </Text>{" "}
          subscription to access.
        </Text>
        <Pressable
          onPress={() => {
            router.back();
            setTimeout(() => router.push("/(tabs)/subscribe"), 100);
          }}
          style={{
            backgroundColor: COLORS.accent.gold,
            borderRadius: 14,
            paddingVertical: 14,
            paddingHorizontal: 32,
            marginTop: 24,
          }}
        >
          <Text style={{ color: COLORS.dark[900], fontWeight: "800", fontSize: 16 }}>
            Upgrade Now
          </Text>
        </Pressable>
      </View>
    );
  }

  if (error || !content) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.dark[900],
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="alert-circle" size={48} color={COLORS.error} />
        <Text style={{ color: COLORS.white, fontSize: 18, marginTop: 12 }}>
          {error || "Content not found"}
        </Text>
      </View>
    );
  }

  // Simple markdown-like rendering
  const renderBody = (text: string) => {
    return text.split("\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <Text
            key={index}
            style={{
              color: COLORS.white,
              fontSize: 24,
              fontWeight: "800",
              marginTop: 24,
              marginBottom: 12,
            }}
          >
            {line.replace("# ", "")}
          </Text>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <Text
            key={index}
            style={{
              color: COLORS.white,
              fontSize: 20,
              fontWeight: "700",
              marginTop: 20,
              marginBottom: 8,
            }}
          >
            {line.replace("## ", "")}
          </Text>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <Text
            key={index}
            style={{
              color: COLORS.primary[300],
              fontSize: 17,
              fontWeight: "700",
              marginTop: 16,
              marginBottom: 6,
            }}
          >
            {line.replace("### ", "")}
          </Text>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <View key={index} style={{ flexDirection: "row", marginVertical: 3, paddingLeft: 8 }}>
            <Text style={{ color: COLORS.primary[400], marginRight: 8 }}>•</Text>
            <Text style={{ color: COLORS.dark[200], fontSize: 15, flex: 1, lineHeight: 22 }}>
              {line.replace("- ", "")}
            </Text>
          </View>
        );
      }
      if (line.startsWith("> ")) {
        return (
          <View
            key={index}
            style={{
              borderLeftWidth: 3,
              borderLeftColor: COLORS.primary[500],
              paddingLeft: 12,
              marginVertical: 8,
            }}
          >
            <Text style={{ color: COLORS.dark[300], fontSize: 15, fontStyle: "italic", lineHeight: 22 }}>
              {line.replace("> ", "")}
            </Text>
          </View>
        );
      }
      if (line.trim() === "") {
        return <View key={index} style={{ height: 8 }} />;
      }
      return (
        <Text
          key={index}
          style={{
            color: COLORS.dark[200],
            fontSize: 15,
            lineHeight: 24,
            marginVertical: 2,
          }}
        >
          {line}
        </Text>
      );
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.dark[900] }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
    >
      {/* Badge */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <View
          style={{
            backgroundColor: TIER_COLORS[content.required_tier_slug] + "20",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              color: TIER_COLORS[content.required_tier_slug],
              fontSize: 12,
              fontWeight: "700",
              textTransform: "uppercase",
            }}
          >
            {content.required_tier_slug}
          </Text>
        </View>
        <Text style={{ color: COLORS.dark[400], fontSize: 13, marginLeft: 10 }}>
          {content.content_type}
        </Text>
      </View>

      {/* Title */}
      <Text
        style={{
          color: COLORS.white,
          fontSize: 28,
          fontWeight: "800",
          marginBottom: 8,
          lineHeight: 36,
        }}
      >
        {content.title}
      </Text>

      {/* Date */}
      {content.published_at && (
        <Text style={{ color: COLORS.dark[400], fontSize: 13, marginBottom: 20 }}>
          Published {new Date(content.published_at).toLocaleDateString()}
        </Text>
      )}

      {/* Body */}
      {renderBody(content.body)}
    </ScrollView>
  );
}
