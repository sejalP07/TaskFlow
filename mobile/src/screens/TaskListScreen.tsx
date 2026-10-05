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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../store/AuthContext";
import {
  Task,
  TaskPriority,
  deleteTask,
  getTasks,
  toggleTaskComplete,
} from "../services/api";

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CreateTask: undefined;
  EditTask: {
    taskId: string;
    title: string;
    description?: string;
    scheduledAt?: string;
    deadline?: string;
    priority: TaskPriority;
    category?: string;
  };
};

type FilterType =
  | "all"
  | "active"
  | "completed"
  | "high";

type SortType =
  | "newest"
  | "deadline"
  | "priority";

const formatDateTime = (value?: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString();
};

const isOverdue = (task: Task) => {
  if (!task.deadline || task.completed) {
    return false;
  }

  const deadline = new Date(task.deadline);

  if (Number.isNaN(deadline.getTime())) {
    return false;
  }

  return deadline.getTime() < Date.now();
};

const TaskListScreen = () => {
  const { token, logout } = useAuth();

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filter, setFilter] =
    useState<FilterType>("all");

  const [sortBy, setSortBy] =
    useState<SortType>("newest");

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

  const visibleTasks = [...tasks]
    .filter((task) => {
      if (filter === "active") {
        return !task.completed;
      }

      if (filter === "completed") {
        return task.completed;
      }

      if (filter === "high") {
        return task.priority === "high";
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "deadline") {
        if (!a.deadline && !b.deadline) {
          return 0;
        }

        if (!a.deadline) {
          return 1;
        }

        if (!b.deadline) {
          return -1;
        }

        return (
          new Date(a.deadline).getTime() -
          new Date(b.deadline).getTime()
        );
      }

      if (sortBy === "priority") {
        const priorityOrder = {
          high: 0,
          medium: 1,
          low: 2,
        };

        return (
          priorityOrder[a.priority] -
          priorityOrder[b.priority]
        );
      }

      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });

  const renderTask = ({
    item,
  }: {
    item: Task;
  }) => {
    const overdue = isOverdue(item);

    return (
      <View
        style={[
          styles.taskCard,
          item.completed && styles.taskCardCompleted,
          overdue && styles.taskCardOverdue,
        ]}
      >
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
              <Text style={styles.checkmark}>
                ✓
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.taskContent}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate("EditTask", {
                taskId: item._id,
                title: item.title,
                description: item.description,
                scheduledAt: item.scheduledAt,
                deadline: item.deadline,
                priority: item.priority,
                category: item.category,
              })
            }
          >
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
                numberOfLines={2}
              >
                {item.description}
              </Text>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.deleteText}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate("EditTask", {
              taskId: item._id,
              title: item.title,
              description: item.description,
              scheduledAt: item.scheduledAt,
              deadline: item.deadline,
              priority: item.priority,
              category: item.category,
            })
          }
        >
          <View style={styles.badgeRow}>
            <Text
              style={[
                styles.badge,
                item.priority === "high"
                  ? styles.priorityHigh
                  : item.priority === "medium"
                  ? styles.priorityMedium
                  : styles.priorityLow,
              ]}
            >
              {item.priority.toUpperCase()}
            </Text>

            {item.category ? (
              <Text style={styles.categoryBadge}>
                {item.category}
              </Text>
            ) : null}

            <Text
              style={[
                styles.statusBadge,
                item.completed
                  ? styles.completedBadge
                  : overdue
                  ? styles.overdueBadge
                  : styles.activeBadge,
              ]}
            >
              {item.completed
                ? "COMPLETED"
                : overdue
                ? "OVERDUE"
                : "ACTIVE"}
            </Text>
          </View>

          {item.scheduledAt ? (
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>
                📅 Scheduled
              </Text>

              <Text
                style={[
                  styles.dateValue,
                  item.completed &&
                    styles.completedMetaText,
                ]}
              >
                {formatDateTime(
                  item.scheduledAt
                )}
              </Text>
            </View>
          ) : null}

          {item.deadline ? (
            <View style={styles.dateRow}>
              <Text
                style={[
                  styles.dateLabel,
                  overdue &&
                    styles.overdueDateLabel,
                ]}
              >
                ⏰ Deadline
              </Text>

              <Text
                style={[
                  styles.dateValue,
                  overdue &&
                    styles.overdueDateValue,
                  item.completed &&
                    styles.completedMetaText,
                ]}
              >
                {formatDateTime(item.deadline)}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
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
        data={visibleTasks}
        keyExtractor={(item) => item._id}
        renderItem={renderTask}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={
          visibleTasks.length === 0
            ? styles.emptyContainer
            : styles.list
        }
        ListHeaderComponent={
          <View>
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
                    navigation.navigate(
                      "CreateTask"
                    )
                  }
                >
                  <Text style={styles.addButton}>
                    + Add
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={logout}
                >
                  <Text style={styles.logout}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterRow}>
              {(
                [
                  "all",
                  "active",
                  "completed",
                  "high",
                ] as FilterType[]
              ).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.filterButton,
                    filter === option &&
                      styles.filterButtonActive,
                  ]}
                  onPress={() =>
                    setFilter(option)
                  }
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === option &&
                        styles.filterTextActive,
                    ]}
                  >
                    {option === "all"
                      ? "All"
                      : option === "active"
                      ? "Active"
                      : option === "completed"
                      ? "Completed"
                      : "High"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sortRow}>
              <Text style={styles.sortLabel}>
                Sort:
              </Text>

              {(
                [
                  "newest",
                  "deadline",
                  "priority",
                ] as SortType[]
              ).map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() =>
                    setSortBy(option)
                  }
                >
                  <Text
                    style={[
                      styles.sortButton,
                      sortBy === option &&
                        styles.sortButtonActive,
                    ]}
                  >
                    {option === "newest"
                      ? "Newest"
                      : option === "deadline"
                      ? "Deadline"
                      : "Priority"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {tasks.length === 0
                ? "No tasks yet"
                : "No matching tasks"}
            </Text>

            <Text style={styles.emptyText}>
              {tasks.length === 0
                ? "Create your first task to get started."
                : "Try changing your filter or sorting option."}
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
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#edf0f4",
  },
  taskCardCompleted: {
    opacity: 0.82,
  },
  taskCardOverdue: {
    borderColor: "#ffb4b4",
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
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  badge: {
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: "hidden",
  },
  priorityHigh: {
    backgroundColor: "#ffe2e2",
    color: "#c62828",
  },
  priorityMedium: {
    backgroundColor: "#fff0c2",
    color: "#9a6b00",
  },
  priorityLow: {
    backgroundColor: "#dff3e4",
    color: "#237a3b",
  },
  categoryBadge: {
    backgroundColor: "#e9edf3",
    color: "#555",
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: "hidden",
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: "hidden",
  },
  activeBadge: {
    backgroundColor: "#e4efff",
    color: "#3568a8",
  },
  completedBadge: {
    backgroundColor: "#e6e6e6",
    color: "#666",
  },
  overdueBadge: {
    backgroundColor: "#ffe2e2",
    color: "#c62828",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
  },
  dateLabel: {
    width: 105,
    fontSize: 12,
    fontWeight: "700",
    color: "#555",
  },
  dateValue: {
    flex: 1,
    fontSize: 12,
    color: "#777",
    lineHeight: 18,
  },
  overdueDateLabel: {
    color: "#c62828",
  },
  overdueDateValue: {
    color: "#c62828",
    fontWeight: "700",
  },
  completedMetaText: {
    color: "#999",
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
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#e9edf3",
  },
  filterButtonActive: {
    backgroundColor: "#222",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
  },
  filterTextActive: {
    color: "#fff",
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },
  sortButton: {
    fontSize: 13,
    color: "#777",
  },
  sortButtonActive: {
    color: "#222",
    fontWeight: "700",
  },
});

export default TaskListScreen;