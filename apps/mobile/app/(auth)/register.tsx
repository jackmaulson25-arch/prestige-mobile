import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { router, Link } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const result = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);

    if (result.error) {
      Alert.alert("Registration Failed", result.error);
    } else {
      Alert.alert(
        "Check Your Email",
        "We've sent you a confirmation link. Please verify your email to continue.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 40,
          paddingHorizontal: 24,
          paddingBottom: 40,
        }}
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 36 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              backgroundColor: COLORS.primary[600],
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <Ionicons name="diamond" size={36} color={COLORS.white} />
          </View>
          <Text style={{ color: COLORS.white, fontSize: 26, fontWeight: "800" }}>
            Create Account
          </Text>
          <Text style={{ color: COLORS.dark[400], fontSize: 15, marginTop: 6 }}>
            Start your supplement journey
          </Text>
        </View>

        {/* Full Name */}
        <View style={{ marginBottom: 14 }}>
          <Text style={{ color: COLORS.dark[300], fontSize: 14, fontWeight: "600", marginBottom: 8 }}>
            Full Name
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
            <Ionicons name="person" size={20} color={COLORS.dark[400]} style={{ marginLeft: 14 }} />
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="John Doe"
              placeholderTextColor={COLORS.dark[500]}
              autoCapitalize="words"
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

        {/* Email */}
        <View style={{ marginBottom: 14 }}>
          <Text style={{ color: COLORS.dark[300], fontSize: 14, fontWeight: "600", marginBottom: 8 }}>
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
            <Ionicons name="mail" size={20} color={COLORS.dark[400]} style={{ marginLeft: 14 }} />
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

        {/* Password */}
        <View style={{ marginBottom: 14 }}>
          <Text style={{ color: COLORS.dark[300], fontSize: 14, fontWeight: "600", marginBottom: 8 }}>
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
            <Ionicons name="lock-closed" size={20} color={COLORS.dark[400]} style={{ marginLeft: 14 }} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Min 8 characters"
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
            <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: 14 }}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={COLORS.dark[400]} />
            </Pressable>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: COLORS.dark[300], fontSize: 14, fontWeight: "600", marginBottom: 8 }}>
            Confirm Password
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
            <Ionicons name="lock-closed" size={20} color={COLORS.dark[400]} style={{ marginLeft: 14 }} />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
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
          </View>
        </View>

        {/* Register Button */}
        <Pressable
          onPress={handleRegister}
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
            <Text style={{ color: COLORS.white, fontWeight: "800", fontSize: 17 }}>
              Create Account
            </Text>
          )}
        </Pressable>

        {/* Login Link */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 28 }}>
          <Text style={{ color: COLORS.dark[400], fontSize: 15 }}>
            Already have an account?{" "}
          </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={{ color: COLORS.primary[400], fontWeight: "700", fontSize: 15 }}>
                Sign In
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
