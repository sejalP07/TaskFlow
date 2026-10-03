import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../store/AuthContext";
import {
  deleteTask,
  getTasks,
  Task,
  toggleTaskComplete,
} from "../services/api";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CreateTask: undefined;
};
const TaskListScreen = () => {
  const { token, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = async () => {
    if (!token) {
      return;
    }

    try {
      const response = await getTasks(token);
      setTasks(response.data.tasks);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        await logout();
        return;
      }

      Alert.alert(
        "Error",
        "Unable to load your tasks."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [token])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const handleToggleComplete = async (task: Task) => {
    if (!token) {
      return;
    }

    try {
      const response = await toggleTaskComplete(
        token,
        task._id
      );

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item._id === task._id
            ? response.data.task
            : item
        )
      );
    } catch {
      Alert.alert(
        "Error",
        "Unable to update task."
      );
    }
  };

  const handleDelete = (task: Task) => {
    Alert.alert(
      "Delete task",
      `Delete "${task.title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!token) {
              return;
            }

            try {
              await deleteTask(token, task._id);

              setTasks((currentTasks) =>
                currentTasks.filter(
                  (item) => item._id !== task._id
                )
              );
            } catch {
              Alert.alert(
                "Error",
                "Unable to delete task."
              );
            }
          },
        },
      ]
    );
  };

  const renderTask = ({
    item,
  }: {
    item: Task;
  }) => {
    return (
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              item.completed &&
                styles.checkboxCompleted,
            ]}
            onPress={() =>
              handleToggleComplete(item)
            }
          >
            {item.completed && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>

          <View style={styles.taskContent}>
            <Text
              style={[
                styles.taskTitle,
                item.completed &&
                  styles.completedText,
              ]}
            >
              {item.title}
            </Text>

            {item.description ? (
              <Text
                style={[
                  styles.description,
                  item.completed &&
                    styles.completedText,
                ]}
              >
                {item.description}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.deleteText}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.priority}>
            {item.priority.toUpperCase()}
          </Text>

          {item.category ? (
            <Text style={styles.category}>
              {item.category}
            </Text>
          ) : null}
        </View>

        {item.deadline ? (
          <Text style={styles.deadline}>
            Deadline:{" "}
            {new Date(
              item.deadline
            ).toLocaleString()}
          </Text>
        ) : null}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Loading tasks...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={renderTask}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={
          tasks.length === 0
            ? styles.emptyContainer
            : styles.list
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                My Tasks
              </Text>

              <Text style={styles.count}>
                {tasks.length}{" "}
                {tasks.length === 1
                  ? "task"
                  : "tasks"}
              </Text>
            </View>

            <View style={styles.headerActions}>
            <TouchableOpacity
                onPress={() =>
                navigation.navigate("CreateTask")
                }
            >
                <Text style={styles.addButton}>+ Add</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={logout}>
                <Text style={styles.logout}>Logout</Text>
            </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              No tasks yet
            </Text>

            <Text style={styles.emptyText}>
              Create your first task to get started.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
  },
  count: {
    marginTop: 4,
    color: "#666",
  },
  logout: {
    color: "#d32f2f",
    fontWeight: "600",
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderColor: "#777",
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: "#222",
    borderColor: "#222",
  },
  checkmark: {
    color: "#fff",
    fontWeight: "700",
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  description: {
    marginTop: 5,
    color: "#666",
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  deleteText: {
    color: "#d32f2f",
    fontWeight: "600",
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 8,
  },
  priority: {
    fontSize: 11,
    fontWeight: "700",
  },
  category: {
    fontSize: 11,
    color: "#666",
  },
  deadline: {
    marginTop: 8,
    fontSize: 12,
    color: "#777",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  emptyText: {
    marginTop: 8,
    textAlign: "center",
    color: "#666",
  },
  headerActions: {
  flexDirection: "row",
  alignItems: "center",
  gap: 16,
},
addButton: {
  fontWeight: "700",
  fontSize: 15,
},
});

export default TaskListScreen;