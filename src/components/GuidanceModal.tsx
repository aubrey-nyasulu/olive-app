import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOlive } from "../context/OliveProvider";
import { PlaceMap } from "./PlaceMap";

export function GuidanceModal() {
  const { colors, activeGuidance, nextGuidanceStep, stopGuidance } =
    useOlive();

  if (!activeGuidance) return null;

  const {
    post,
    mode,
    etaMinutes,
    distanceRemainingKm,
    steps,
    currentStepIndex,
  } = activeGuidance;

  const currentStep = steps[currentStepIndex];
  const isFinalStep = currentStepIndex === steps.length - 1;
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;

  const modeIcon =
    mode === "walking"
      ? "walk"
      : mode === "cycling"
        ? "bicycle"
        : "car";

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={stopGuidance}
    >
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        {/* Top Handle & Dismiss */}
        <View style={styles.topBar}>
          <View style={[styles.handleBar, { backgroundColor: colors.line }]} />
          <Pressable
            accessibilityLabel="Close guidance"
            onPress={stopGuidance}
            style={({ pressed }) => [
              styles.closeBtn,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.line,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Active Status Header */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.modeBadge,
                { backgroundColor: colors.signalLight, borderColor: colors.signal },
              ]}
            >
              <Ionicons name={modeIcon} size={16} color={colors.signal} />
              <Text style={[styles.modeBadgeText, { color: colors.signal }]}>
                {mode.toUpperCase()} GUIDANCE
              </Text>
            </View>

            <View style={styles.etaBox}>
              <Text style={[styles.etaValue, { color: colors.text }]}>
                {etaMinutes}{" "}
                <Text style={{ fontSize: 14, fontWeight: "500", color: colors.muted }}>
                  min
                </Text>
              </Text>
              <Text style={[styles.distRemaining, { color: colors.muted }]}>
                {distanceRemainingKm} km away
              </Text>
            </View>
          </View>

          {/* Place Title */}
          <View style={styles.venueInfo}>
            <Text style={[styles.venueName, { color: colors.text }]}>
              {post.author}
            </Text>
            <Text style={[styles.venuePlace, { color: colors.muted }]}>
              {post.place} · {post.category}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: colors.signal,
                },
              ]}
            />
          </View>
          <Text style={[styles.stepCountText, { color: colors.muted }]}>
            Step {currentStepIndex + 1} of {steps.length}
          </Text>

          {/* Large Turn-by-Turn Guidance Banner */}
          <View
            style={[
              styles.instructionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.line,
                shadowColor: colors.text,
              },
            ]}
          >
            <View
              style={[
                styles.stepIconWrap,
                {
                  backgroundColor: isFinalStep ? colors.signal : colors.text,
                },
              ]}
            >
              <Ionicons
                name={currentStep.iconName}
                size={28}
                color={colors.bg}
              />
            </View>

            <View style={styles.instructionTextWrap}>
              <Text style={[styles.instructionDistance, { color: colors.signal }]}>
                In {currentStep.distance}
              </Text>
              <Text style={[styles.instructionMain, { color: colors.text }]}>
                {currentStep.instruction}
              </Text>
              <Text style={[styles.instructionLandmark, { color: colors.muted }]}>
                {currentStep.landmark}
              </Text>
            </View>
          </View>

          {/* Live In-App Route Visualizer */}
          <View style={styles.mapWrap}>
            <PlaceMap post={post} height={200} interactive={false} />
          </View>

          {/* All Steps Preview */}
          <View style={styles.allStepsWrap}>
            <Text style={[styles.allStepsHeader, { color: colors.muted }]}>
              ROUTE ITINERARY
            </Text>
            {steps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <View
                  key={step.id}
                  style={[
                    styles.stepRow,
                    {
                      borderColor: colors.line,
                      opacity: isPast ? 0.45 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.stepMiniDot,
                      {
                        backgroundColor: isCurrent
                          ? colors.signal
                          : isPast
                            ? colors.muted
                            : colors.line,
                      },
                    ]}
                  />
                  <View style={styles.stepRowContent}>
                    <Text
                      style={[
                        styles.stepRowInstruction,
                        {
                          color: isCurrent ? colors.signal : colors.text,
                          fontWeight: isCurrent ? "700" : "500",
                        },
                      ]}
                    >
                      {step.instruction}
                    </Text>
                    <Text style={[styles.stepRowSub, { color: colors.muted }]}>
                      {step.distance} · {step.landmark}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View
          style={[
            styles.bottomDock,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.line,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            onPress={isFinalStep ? stopGuidance : nextGuidanceStep}
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor: colors.signal,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons
              name={isFinalStep ? "checkmark-circle" : "arrow-forward"}
              size={18}
              color={colors.signalForeground}
            />
            <Text
              style={[
                styles.primaryBtnText,
                { color: colors.signalForeground },
              ]}
            >
              {isFinalStep ? "Arrived at Destination" : "Next Direction"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={stopGuidance}
            style={({ pressed }) => [
              styles.cancelBtn,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={[styles.cancelBtnText, { color: colors.muted }]}>
              End guidance
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    top: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  etaBox: {
    alignItems: "flex-end",
  },
  etaValue: {
    fontSize: 26,
    fontWeight: "900",
  },
  distRemaining: {
    fontSize: 12,
  },
  venueInfo: {
    marginTop: 14,
  },
  venueName: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  venuePlace: {
    fontSize: 13,
    marginTop: 2,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    marginTop: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  stepCountText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "right",
  },
  instructionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  stepIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  instructionTextWrap: {
    flex: 1,
  },
  instructionDistance: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  instructionMain: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 2,
    lineHeight: 22,
  },
  instructionLandmark: {
    fontSize: 13,
    marginTop: 4,
  },
  mapWrap: {
    marginTop: 20,
    borderRadius: 18,
    overflow: "hidden",
  },
  allStepsWrap: {
    marginTop: 24,
  },
  allStepsHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  stepMiniDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  stepRowContent: {
    flex: 1,
  },
  stepRowInstruction: {
    fontSize: 14,
    lineHeight: 18,
  },
  stepRowSub: {
    fontSize: 12,
    marginTop: 2,
  },
  bottomDock: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    gap: 8,
  },
  primaryBtn: {
    flexDirection: "row",
    height: 54,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 6,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
