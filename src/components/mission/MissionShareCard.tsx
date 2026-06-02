import { forwardRef } from "react";
import { Image, StyleSheet, Text, View, type View as ViewType } from "react-native";

import { theme } from "@/constants/theme";
import type { MissionSummary } from "@/types/mission";

type MissionShareCardProps = {
  mission: MissionSummary;
  reflection: string;
  photoUri: string | null;
};

/** Off-screen–friendly card captured as PNG for the system share sheet. */
export const MissionShareCard = forwardRef<ViewType, MissionShareCardProps>(
  function MissionShareCard({ mission, reflection, photoUri }, ref) {
    const quote =
      reflection.trim().length > 0
        ? reflection.trim()
        : "A small moment in real life.";

    return (
      <View ref={ref} style={styles.card} collapsable={false}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
        ) : null}
        <View style={styles.content}>
          <Text style={styles.brand}>Alica</Text>
          <Text style={styles.category}>{mission.category}</Text>
          <Text style={styles.title}>{mission.title}</Text>
          <Text style={styles.quote}>"{quote}"</Text>
          <Text style={styles.footer}>Done in real life.</Text>
        </View>
      </View>
    );
  },
);

const CARD_WIDTH = 360;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: theme.text,
    borderRadius: 16,
    overflow: "hidden",
  },
  photo: {
    width: CARD_WIDTH,
    height: 200,
  },
  content: {
    padding: 20,
    gap: 6,
  },
  brand: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.primary,
    letterSpacing: 1.2,
  },
  category: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.primary,
    textTransform: "capitalize",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f9fafb",
    lineHeight: 26,
    marginBottom: 8,
  },
  quote: {
    fontSize: 16,
    lineHeight: 22,
    color: "#e5e7eb",
    fontStyle: "italic",
  },
  footer: {
    marginTop: 12,
    fontSize: 12,
    color: theme.textTertiary,
  },
});
