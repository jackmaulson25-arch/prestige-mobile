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
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);

    if (result.error) {
      Alert.alert("Login Failed", result.error);
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "prestige://auth/callback",
          skipBrowserRedirect: false,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleAppleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: "prestige://auth/callback",
        },
      });
      if (error) throw error;
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

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
        {/* Logo / Brand */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: COLORS.primary[600],
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="diamond" size={40} color={COLORS.white} />
          </View>
          <Text
            style={{ color: COLORS.white, fontSize: 28, fontWeight: "800" }}
          >
            PrestigeSupliments
          </Text>
          <Text
            style={{
              color: COLORS.dark[400],
              fontSize: 16,
              marginTop: 8,
            }}
          >
            Premium supplement guidance
          </Text>
        </View>

        {/* Email Input */}
        <View style={{ marginBottom: 14 }}>
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

        {/* Password Input */}
        <View style={{ marginBottom: 8 }}>
          <Text
            style={{
              color: COLORS.dark[300],
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Password
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
              name="lock-closed"
              size={20}
              color={COLORS.dark[400]}
              style={{ marginLeft: 14 }}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor={COLORS.dark[500]}
              secureTextEntry={!showPassword}
              style={{
                flex: 1,
                color: COLORS.white,
                fontSize: 16,
                paddingVertical: 14,
                paddingHorizontal: 12,
              }}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={{ padding: 14 }}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={COLORS.dark[400]}
              />
            </Pressable>
          </View>
        </View>

        {/* Forgot Password */}
        <Pressable
          onPress={() => router.push("/(auth)/forgot-password")}
          style={{ alignSelf: "flex-end", marginBottom: 24 }}
        >
          <Text style={{ color: COLORS.primary[400], fontWeight: "600" }}>
            Forgot password?
          </Text>
        </Pressable>

        {/* Login Button */}
        <Pressable
          onPress={handleLogin}
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
              Sign In
            </Text>
          )}
        </Pressable>

        {/* Divider */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 24,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: COLORS.dark[700] }} />
          <Text style={{ color: COLORS.dark[500], marginHorizontal: 16, fontSize: 14 }}>
            or continue with
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: COLORS.dark[700] }} />
        </View>

        {/* Social Login Buttons */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable
            onPress={handleGoogleLogin}
            style={{
              flex: 1,
              backgroundColor: COLORS.dark[800],
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: COLORS.dark[700],
            }}
          >
            <Ionicons name="logo-google" size={20} color={COLORS.white} />
            <Text
              style={{
                color: COLORS.white,
                fontWeight: "600",
                marginLeft: 8,
                fontSize: 15,
              }}
            >
              Google
            </Text>
          </Pressable>
          <Pressable
            onPress={handleAppleLogin}
            style={{
              flex: 1,
              backgroundColor: COLORS.dark[800],
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: COLORS.dark[700],
            }}
          >
            <Ionicons name="logo-apple" size={22} color={COLORS.white} />
            <Text
              style={{
                color: COLORS.white,
                fontWeight: "600",
                marginLeft: 8,
                fontSize: 15,
              }}
            >
              Apple
            </Text>
          </Pressable>
        </View>

        {/* Sign Up Link */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 32,
          }}
        >
          <Text style={{ color: COLORS.dark[400], fontSize: 15 }}>
            Don't have an account?{" "}
          </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text
                style={{
                  color: COLORS.primary[400],
                  fontWeight: "700",
                  fontSize: 15,
                }}
              >
                Sign Up
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
