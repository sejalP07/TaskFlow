import React, { useState } from "react";
import {
  Alert,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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

type PickerType = "scheduledAt" | "deadline" | null;

const CreateTaskScreen = ({
  navigation,
}: Props) => {
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [scheduledAt, setScheduledAt] = useState<Date | null>(
    null
  );
  const [deadline, setDeadline] = useState<Date | null>(null);

  const [pickerType, setPickerType] =
    useState<PickerType>(null);

  const [priority, setPriority] =
    useState<TaskPriority>("medium");

  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openPicker = (type: PickerType) => {
    setPickerType(type);
  };

  const handlePickerChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setPickerType(null);
    }

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    if (pickerType === "scheduledAt") {
      setScheduledAt(selectedDate);
    } else if (pickerType === "deadline") {
      setDeadline(selectedDate);
    }

    // On iOS, keep the picker open until the user finishes.
    if (Platform.OS === "ios") {
      if (pickerType === "scheduledAt") {
        setScheduledAt(selectedDate);
      } else if (pickerType === "deadline") {
        setDeadline(selectedDate);
      }
    }
  };

  const clearDate = (type: "scheduledAt" | "deadline") => {
    if (type === "scheduledAt") {
      setScheduledAt(null);
    } else {
      setDeadline(null);
    }
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) {
      return "Not selected";
    }

    return date.toLocaleString();
  };

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
        scheduledAt: scheduledAt
          ? scheduledAt.toISOString()
          : undefined,
        deadline: deadline
          ? deadline.toISOString()
          : undefined,
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

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => openPicker("scheduledAt")}
      >
        <Text style={styles.dateButtonText}>
          {scheduledAt
            ? formatDateTime(scheduledAt)
            : "Select scheduled date & time"}
        </Text>
      </TouchableOpacity>

      {scheduledAt && (
        <TouchableOpacity
          onPress={() => clearDate("scheduledAt")}
        >
          <Text style={styles.clearText}>
            Clear scheduled time
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.label}>
        Deadline
      </Text>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => openPicker("deadline")}
      >
        <Text style={styles.dateButtonText}>
          {deadline
            ? formatDateTime(deadline)
            : "Select deadline date & time"}
        </Text>
      </TouchableOpacity>

      {deadline && (
        <TouchableOpacity
          onPress={() => clearDate("deadline")}
        >
          <Text style={styles.clearText}>
            Clear deadline
          </Text>
        </TouchableOpacity>
      )}

      {pickerType && (
        <DateTimePicker
          value={
            pickerType === "scheduledAt"
              ? scheduledAt || new Date()
              : deadline || new Date()
          }
          mode="datetime"
          display="default"
          onChange={handlePickerChange}
        />
      )}

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
  dateButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 15,
  },
  dateButtonText: {
    fontSize: 15,
    color: "#333",
  },
  clearText: {
    color: "#d32f2f",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 7,
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