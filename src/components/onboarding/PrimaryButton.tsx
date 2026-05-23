import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type PrimaryButtonProps = Omit<PressableProps, "style"> & {
  label: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  label,
  loading = false,
  disabled,
  style,
  ...rest
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.label, isDisabled && styles.labelDisabled]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  buttonDisabled: {
    backgroundColor: "#d1d5db",
  },
  buttonPressed: {
    opacity: 0.9,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  labelDisabled: {
    color: "#9ca3af",
  },
});
