import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/stores/auth";
import { View, ActivityIndicator } from "react-native";
import { COLORS } from "@/constants/colors";

export default function RootLayout() {
  const { initialize, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.dark[900],
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.dark[900] },
          animation: "fade",
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
        <Stack.Screen
          name="content/[slug]"
          options={{
            presentation: "modal",
            headerShown: true,
            headerTitle: "Content",
            headerStyle: { backgroundColor: COLORS.dark[800] },
            headerTintColor: COLORS.white,
          }}
        />
      </Stack>
    </>
  );
}
