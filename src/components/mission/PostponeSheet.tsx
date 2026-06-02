import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/onboarding/PrimaryButton";
import { theme } from "@/constants/theme";
import { MAX_POSTPONE_DAYS, MIN_POSTPONE_MINUTES } from "@/lib/deliveries";

type PostponeSheetProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  loading?: boolean;
};

function defaultPickTime(): Date {
  const d = new Date();
  d.setMinutes(d.getMinutes() + MIN_POSTPONE_MINUTES + 60);
  d.setSeconds(0, 0);
  return d;
}

function maxPickTime(): Date {
  const d = new Date();
  d.setDate(d.getDate() + MAX_POSTPONE_DAYS);
  return d;
}

function minPickTime(): Date {
  const d = new Date();
  d.setMinutes(d.getMinutes() + MIN_POSTPONE_MINUTES);
  return d;
}

export function formatReturnTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function PostponeSheet({
  visible,
  onClose,
  onConfirm,
  loading = false,
}: PostponeSheetProps) {
  const [picked, setPicked] = useState(defaultPickTime);
  const minimum = minPickTime();
  const maximum = maxPickTime();

  useEffect(() => {
    if (visible) {
      setPicked(defaultPickTime());
    }
  }, [visible]);

  function onChange(_event: DateTimePickerEvent, date?: Date) {
    if (date) setPicked(date);
  }

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>When should we check back?</Text>
          <Text style={styles.lead}>
            Pick a time that works for you. We&apos;ll nudge you then — at least{" "}
            {MIN_POSTPONE_MINUTES} minutes from now.
          </Text>

          <DateTimePicker
            value={picked}
            mode="datetime"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={minimum}
            maximumDate={maximum}
            onChange={onChange}
          />

          <Text style={styles.preview}>{formatReturnTime(picked.toISOString())}</Text>

          <PrimaryButton
            label="Set reminder"
            loading={loading}
            onPress={() => onConfirm(picked)}
          />
          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={onClose}
            style={styles.cancel}
          >
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: theme.spacing.screenLarge,
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 8,
  },
  lead: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  preview: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.primaryStrong,
    textAlign: "center",
    marginVertical: 12,
  },
  cancel: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelLabel: {
    fontSize: 15,
    color: theme.textSecondary,
    fontWeight: "500",
  },
});
