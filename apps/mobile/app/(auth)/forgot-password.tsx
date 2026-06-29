import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { router, Link } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { resetPassword } = useAuthStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    setLoading(true);
    const result = await resetPassword(email.trim());
    setLoading(false);

    if (result.error) {
      Alert.alert("Error", result.error);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: insets.top,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: COLORS.primary[600] + "20",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Ionicons name="mail" size={40} color={COLORS.primary[400]} />
        </View>
        <Text style={{ color: COLORS.white, fontSize: 24, fontWeight: "800", textAlign: "center" }}>
          Check Your Email
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
          We've sent password reset instructions to{"\n"}
          <Text style={{ color: COLORS.white, fontWeight: "600" }}>{email}</Text>
        </Text>
        <Pressable
          onPress={() => router.replace("/(auth)/login")}
          style={{
            backgroundColor: COLORS.primary[600],
            borderRadius: 14,
            paddingVertical: 14,
            paddingHorizontal: 32,
            marginTop: 32,
          }}
        >
          <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 16 }}>
            Back to Login
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: insets.top + 40,
        }}
      >
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          <Text style={{ color: COLORS.white, fontSize: 16, marginLeft: 8 }}>
            Back
          </Text>
        </Pressable>

        <View style={{ alignItems: "center", marginBottom: 36 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: COLORS.primary[600] + "20",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="key" size={36} color={COLORS.primary[400]} />
          </View>
          <Text style={{ color: COLORS.white, fontSize: 26, fontWeight: "800" }}>
            Reset Password
          </Text>
          <Text
            style={{
              color: COLORS.dark[400],
              fontSize: 15,
              marginTop: 8,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Enter your email and we'll send you instructions to reset your
            password.
          </Text>
        </View>

        {/* Email Input */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: COLORS.dark[300],
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Email
          </Text>
          <View
            style={{
              backgroundColor: COLORS.dark[800],
              borderRadius: 14,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: COLORS.dark[700],
            }}
          >
            <Ionicons
              name="mail"
              size={20}
              color={COLORS.dark[400]}
              style={{ marginLeft: 14 }}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.dark[500]}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                flex: 1,
                color: COLORS.white,
                fontSize: 16,
                paddingVertical: 14,
                paddingHorizontal: 12,
              }}
            />
          </View>
        </View>

        {/* Reset Button */}
        <Pressable
          onPress={handleReset}
          disabled={loading}
          style={{
            backgroundColor: COLORS.primary[600],
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text
              style={{ color: COLORS.white, fontWeight: "800", fontSize: 17 }}
            >
              Send Reset Link
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
