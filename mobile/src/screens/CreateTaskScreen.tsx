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
  createTask,
  TaskPriority,
} from "../services/api";
import { useAuth } from "../store/AuthContext";

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CreateTask: undefined;
};

type Props = NativeStackScreenProps<
  RootStackParamList,
  "CreateTask"
>;

const CreateTaskScreen = ({
  navigation,
}: Props) => {
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] =
    useState<TaskPriority>("medium");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateTask = async () => {
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

      await createTask(token, {
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
        "Task created successfully.",
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
          "Unable to create task."
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
        Create New Task
      </Text>

      <Text style={styles.label}>Title *</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Complete assignment"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Add task details"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>
        Scheduled At
      </Text>

      <TextInput
        style={styles.input}
        placeholder="2026-10-03T18:00:00.000Z"
        value={scheduledAt}
        onChangeText={setScheduledAt}
        autoCapitalize="none"
      />

      <Text style={styles.hint}>
        Use ISO format: YYYY-MM-DDTHH:mm:ss.sssZ
      </Text>

      <Text style={styles.label}>
        Deadline
      </Text>

      <TextInput
        style={styles.input}
        placeholder="2026-10-05T23:59:59.000Z"
        value={deadline}
        onChangeText={setDeadline}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Priority</Text>

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

      <Text style={styles.label}>Category</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Development"
        value={category}
        onChangeText={setCategory}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={
            submitting
              ? "Creating..."
              : "Create Task"
          }
          onPress={handleCreateTask}
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
    marginBottom: 8,
    marginTop: 16,
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
  hint: {
    fontSize: 11,
    color: "#777",
    marginTop: 5,
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

export default CreateTaskScreen;