import React, { useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  TaskPriority,
  updateTask,
} from "../services/api";
import { useAuth } from "../store/AuthContext";

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

type Props = NativeStackScreenProps<
  RootStackParamList,
  "EditTask"
>;

const EditTaskScreen = ({
  route,
  navigation,
}: Props) => {
  const { token } = useAuth();
  const task = route.params;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(
    task.description ?? ""
  );
  const [scheduledAt, setScheduledAt] = useState(
    task.scheduledAt ?? ""
  );
  const [deadline, setDeadline] = useState(
    task.deadline ?? ""
  );
  const [priority, setPriority] =
    useState<TaskPriority>(task.priority);
  const [category, setCategory] = useState(
    task.category ?? ""
  );
  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async () => {
    if (!token) {
      return;
    }

    if (!title.trim()) {
      Alert.alert(
        "Validation",
        "Please enter a task title."
      );
      return;
    }

    try {
      setSubmitting(true);

      await updateTask(token, task.taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        scheduledAt:
          scheduledAt.trim() || undefined,
        deadline: deadline.trim() || undefined,
        priority,
        category: category.trim() || undefined,
      });

      Alert.alert(
        "Success",
        "Task updated successfully.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          "Unable to update task."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>
        Edit Task
      </Text>

      <Text style={styles.label}>Title *</Text>

      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Task title"
      />

      <Text style={styles.label}>
        Description
      </Text>

      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Task description"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>
        Scheduled At
      </Text>

      <TextInput
        style={styles.input}
        value={scheduledAt}
        onChangeText={setScheduledAt}
        placeholder="2026-10-03T18:00:00.000Z"
        autoCapitalize="none"
      />

      <Text style={styles.label}>
        Deadline
      </Text>

      <TextInput
        style={styles.input}
        value={deadline}
        onChangeText={setDeadline}
        placeholder="2026-10-05T23:59:59.000Z"
        autoCapitalize="none"
      />

      <Text style={styles.label}>
        Priority
      </Text>

      <View style={styles.priorityRow}>
        {(["low", "medium", "high"] as TaskPriority[]).map(
          (item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.priorityButton,
                priority === item &&
                  styles.prioritySelected,
              ]}
              onPress={() => setPriority(item)}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === item &&
                    styles.priorityTextSelected,
                ]}
              >
                {item.toUpperCase()}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <Text style={styles.label}>
        Category
      </Text>

      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
        placeholder="e.g. Development"
      />

      <View style={styles.buttonContainer}>
        <Button
          title={
            submitting
              ? "Saving..."
              : "Save Changes"
          }
          onPress={handleUpdate}
          disabled={submitting}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  prioritySelected: {
    backgroundColor: "#222",
    borderColor: "#222",
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "700",
  },
  priorityTextSelected: {
    color: "#fff",
  },
  buttonContainer: {
    marginTop: 28,
  },
});

export default EditTaskScreen;