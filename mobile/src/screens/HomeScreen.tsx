import React from "react";
import {
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../store/AuthContext";

const HomeScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to TaskFlow</Text>

      <Text style={styles.email}>
        {user?.email}
      </Text>

      <Button
        title="Logout"
        onPress={logout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 12,
  },
  email: {
    marginBottom: 24,
    color: "#666",
  },
});

export default HomeScreen;