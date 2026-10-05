import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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

type PickerType =
  | "scheduledAt"
  | "deadline"
  | null;

const EditTaskScreen = ({
  route,
  navigation,
}: Props) => {
  const { token } = useAuth();
  const task = route.params;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] =
    useState(task.description ?? "");

  const [scheduledAt, setScheduledAt] =
    useState<Date | null>(
      task.scheduledAt
        ? new Date(task.scheduledAt)
        : null
    );

  const [deadline, setDeadline] =
    useState<Date | null>(
      task.deadline
        ? new Date(task.deadline)
        : null
    );

  const [pickerType, setPickerType] =
    useState<PickerType>(null);

  const [priority, setPriority] =
    useState<TaskPriority>(task.priority);

  const [category, setCategory] =
    useState(task.category ?? "");

  const [submitting, setSubmitting] =
    useState(false);

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

    if (
      event.type === "dismissed" ||
      !selectedDate
    ) {
      return;
    }

    if (pickerType === "scheduledAt") {
      setScheduledAt(selectedDate);
    } else if (pickerType === "deadline") {
      setDeadline(selectedDate);
    }
  };

  const clearDate = (
    type: "scheduledAt" | "deadline"
  ) => {
    if (type === "scheduledAt") {
      setScheduledAt(null);
    } else {
      setDeadline(null);
    }
  };

  const formatDateTime = (
    date: Date | null
  ) => {
    if (!date) {
      return "Not selected";
    }

    return date.toLocaleString();
  };

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

    const now = new Date();

    if (scheduledAt && scheduledAt < now) {
      Alert.alert(
        "Validation",
        "Scheduled time cannot be in the past."
      );
      return;
    }

    if (deadline && deadline < now) {
      Alert.alert(
        "Validation",
        "Deadline cannot be in the past."
      );
      return;
    }

    if (
      scheduledAt &&
      deadline &&
      deadline.getTime() <
        scheduledAt.getTime()
    ) {
      Alert.alert(
        "Validation",
        "Deadline cannot be earlier than the scheduled time."
      );
      return;
    }

    try {
      setSubmitting(true);

      await updateTask(token, task.taskId, {
        title: title.trim(),
        description:
          description.trim() || undefined,
        scheduledAt: scheduledAt
          ? scheduledAt.toISOString()
          : undefined,
        deadline: deadline
          ? deadline.toISOString()
          : undefined,
        priority,
        category:
          category.trim() || undefined,
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>
            Edit Task
          </Text>

          <Text style={styles.subtitle}>
            Update the details of your task.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>
            Task Details
          </Text>

          <Text style={styles.label}>
            Title *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Task title"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
            maxLength={200}
          />

          <Text style={styles.characterHint}>
            {title.length}/200
          </Text>

          <Text style={styles.label}>
            Description
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.textArea,
            ]}
            placeholder="Add task details"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={2000}
          />

          <Text style={styles.label}>
            Schedule
          </Text>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() =>
              openPicker("scheduledAt")
            }
            activeOpacity={0.8}
          >
            <Text style={styles.dateIcon}>
              📅
            </Text>

            <View style={styles.dateContent}>
              <Text style={styles.dateTitle}>
                Scheduled At
              </Text>

              <Text style={styles.dateValue}>
                {scheduledAt
                  ? formatDateTime(
                      scheduledAt
                    )
                  : "Select date & time"}
              </Text>
            </View>
          </TouchableOpacity>

          {scheduledAt && (
            <TouchableOpacity
              onPress={() =>
                clearDate("scheduledAt")
              }
            >
              <Text style={styles.clearText}>
                Clear scheduled time
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() =>
              openPicker("deadline")
            }
            activeOpacity={0.8}
          >
            <Text style={styles.dateIcon}>
              ⏰
            </Text>

            <View style={styles.dateContent}>
              <Text style={styles.dateTitle}>
                Deadline
              </Text>

              <Text style={styles.dateValue}>
                {deadline
                  ? formatDateTime(deadline)
                  : "Select deadline"}
              </Text>
            </View>
          </TouchableOpacity>

          {deadline && (
            <TouchableOpacity
              onPress={() =>
                clearDate("deadline")
              }
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

          <Text style={styles.label}>
            Priority
          </Text>

          <View style={styles.priorityRow}>
            {(
              [
                "low",
                "medium",
                "high",
              ] as TaskPriority[]
            ).map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.priorityButton,
                  priority === item &&
                    styles.prioritySelected,
                ]}
                onPress={() =>
                  setPriority(item)
                }
                activeOpacity={0.8}
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
            ))}
          </View>

          <Text style={styles.label}>
            Category
          </Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. Development"
            placeholderTextColor="#999"
            value={category}
            onChangeText={setCategory}
            maxLength={50}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            submitting &&
              styles.saveButtonDisabled,
          ]}
          onPress={handleUpdate}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <>
              <ActivityIndicator color="#fff" />

              <Text style={styles.buttonText}>
                Saving...
              </Text>
            </>
          ) : (
            <Text style={styles.buttonText}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Changes are saved to your TaskFlow account.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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
  header: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#222",
  },
  subtitle: {
    marginTop: 7,
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#edf0f4",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#222",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginTop: 18,
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: "#fafbfc",
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#222",
  },
  textArea: {
    minHeight: 110,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  characterHint: {
    fontSize: 11,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafbfc",
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  dateIcon: {
    fontSize: 21,
    marginRight: 12,
  },
  dateContent: {
    flex: 1,
  },
  dateTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
    marginBottom: 3,
  },
  dateValue: {
    fontSize: 14,
    color: "#222",
  },
  clearText: {
    color: "#d32f2f",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#fafbfc",
  },
  prioritySelected: {
    backgroundColor: "#222",
    borderColor: "#222",
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#555",
  },
  priorityTextSelected: {
    color: "#fff",
  },
  saveButton: {
    minHeight: 54,
    borderRadius: 12,
    backgroundColor: "#222",
    marginTop: 18,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  footerText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginTop: 12,
  },
});

export default EditTaskScreen;