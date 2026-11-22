import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { X, Footprints, Bike, Car, CheckCircle2, ArrowRight } from "lucide-react-native";
import { useOlive } from "../context/OliveProvider";
import { useThemeStyles, type ColorPalette } from "../theme";
import { PlaceMap } from "./PlaceMap";

export function GuidanceModal() {
  const { styles, colors } = useThemeStyles(createStyles);
  const { activeGuidance, nextGuidanceStep, stopGuidance } = useOlive();

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

  const ModeIcon =
    mode === "walking" ? Footprints : mode === "cycling" ? Bike : Car;

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={stopGuidance}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          accessibilityLabel="Dismiss guidance"
          style={styles.modalBackdrop}
          onPress={stopGuidance}
        />
        <View style={styles.container}>
          {/* Top Handle & Dismiss */}
          <View style={styles.topBar}>
            <View style={styles.handleBar} />
            <Pressable
              accessibilityLabel="Close guidance"
              onPress={stopGuidance}
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && styles.closeBtnPressed,
              ]}
            >
              <X size={20} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Active Status Header */}
            <View style={styles.statusRow}>
              <View style={styles.modeBadge}>
                <ModeIcon size={16} color={colors.signal} />
                <Text style={styles.modeBadgeText}>
                  {mode.toUpperCase()} GUIDANCE
                </Text>
              </View>

              <View style={styles.etaBox}>
                <Text style={styles.etaValue}>
                  {etaMinutes} <Text style={styles.etaUnit}>min</Text>
                </Text>
                <Text style={styles.distRemaining}>
                  {distanceRemainingKm} km away
                </Text>
              </View>
            </View>

            {/* Place Title */}
            <View style={styles.venueInfo}>
              <Text style={styles.venueName}>{post.author}</Text>
              <Text style={styles.venuePlace}>
                {post.place} · {post.category}
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercent}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.stepCountText}>
              Step {currentStepIndex + 1} of {steps.length}
            </Text>

            {/* Large Turn-by-Turn Guidance Banner */}
            <View style={styles.instructionCard}>
              <View
                style={[
                  styles.stepIconWrap,
                  isFinalStep
                    ? styles.stepIconWrapSignal
                    : styles.stepIconWrapText,
                ]}
              >
                {(() => {
                  const StepIcon = currentStep.iconName;
                  return <StepIcon size={28} color={colors.bg} />;
                })()}
              </View>

              <View style={styles.instructionTextWrap}>
                <Text style={styles.instructionDistance}>
                  In {currentStep.distance}
                </Text>
                <Text style={styles.instructionMain}>
                  {currentStep.instruction}
                </Text>
                <Text style={styles.instructionLandmark}>
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
              <Text style={styles.allStepsHeader}>ROUTE ITINERARY</Text>
              {steps.map((step, idx) => {
                const isPast = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <View
                    key={step.id}
                    style={[styles.stepRow, isPast && styles.stepRowPast]}
                  >
                    <View
                      style={[
                        styles.stepMiniDot,
                        isCurrent
                          ? styles.stepMiniDotCurrent
                          : isPast
                          ? styles.stepMiniDotPast
                          : styles.stepMiniDotFuture,
                      ]}
                    />
                    <View style={styles.stepRowContent}>
                      <Text
                        style={[
                          styles.stepRowInstruction,
                          isCurrent
                            ? styles.stepRowInstructionCurrent
                            : styles.stepRowInstructionDefault,
                        ]}
                      >
                        {step.instruction}
                      </Text>
                      <Text style={styles.stepRowSub}>
                        {step.distance} · {step.landmark}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.bottomDock}>
            <Pressable
              accessibilityRole="button"
              onPress={isFinalStep ? stopGuidance : nextGuidanceStep}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.primaryBtnPressed,
              ]}
            >
              {isFinalStep ? (
                <CheckCircle2 size={18} color={colors.signalForeground} />
              ) : (
                <ArrowRight size={18} color={colors.signalForeground} />
              )}
              <Text style={styles.primaryBtnText}>
                {isFinalStep ? "Arrived at Destination" : "Next Direction"}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={stopGuidance}
              style={({ pressed }) => [
                styles.cancelBtn,
                pressed && styles.cancelBtnPressed,
              ]}
            >
              <Text style={styles.cancelBtnText}>End guidance</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  container: {
    width: "100%",
    maxHeight: "88%",
    borderRadius: 32,
    borderWidth: 2,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    backgroundColor: colors.bg,
    borderColor: colors.signal,
  },
  topBar: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    top: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line,
  },
  closeBtnPressed: {
    opacity: 0.6,
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
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    backgroundColor: colors.signalLight,
    borderColor: colors.signal,
  },
  modeBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: colors.signal,
  },
  etaBox: {
    alignItems: "flex-end",
  },
  etaValue: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.text,
  },
  etaUnit: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.muted,
  },
  distRemaining: {
    fontSize: 12,
    color: colors.muted,
  },
  venueInfo: {
    marginTop: 16,
  },
  venueName: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: colors.text,
  },
  venuePlace: {
    fontSize: 14,
    marginTop: 2,
    color: colors.muted,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    marginTop: 16,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: colors.signal,
  },
  stepCountText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "right",
    color: colors.muted,
  },
  instructionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    shadowColor: colors.text,
  },
  stepIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIconWrapSignal: {
    backgroundColor: colors.signal,
  },
  stepIconWrapText: {
    backgroundColor: colors.text,
  },
  instructionTextWrap: {
    flex: 1,
  },
  instructionDistance: {
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.signal,
  },
  instructionMain: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
    lineHeight: 24,
    color: colors.text,
  },
  instructionLandmark: {
    fontSize: 14,
    marginTop: 4,
    color: colors.muted,
  },
  mapWrap: {
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  allStepsWrap: {
    marginTop: 24,
  },
  allStepsHeader: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
    color: colors.muted,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  stepRowPast: {
    opacity: 0.45,
  },
  stepMiniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  stepMiniDotCurrent: {
    backgroundColor: colors.signal,
  },
  stepMiniDotPast: {
    backgroundColor: colors.muted,
  },
  stepMiniDotFuture: {
    backgroundColor: colors.line,
  },
  stepRowContent: {
    flex: 1,
  },
  stepRowInstruction: {
    fontSize: 14,
    lineHeight: 18,
  },
  stepRowInstructionCurrent: {
    color: colors.signal,
    fontWeight: "700",
  },
  stepRowInstructionDefault: {
    color: colors.text,
    fontWeight: "500",
  },
  stepRowSub: {
    fontSize: 12,
    marginTop: 2,
    color: colors.muted,
  },
  bottomDock: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    gap: 8,
    backgroundColor: colors.surface,
    borderTopColor: colors.line,
  },
  primaryBtn: {
    flexDirection: "row",
    height: 56,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.signal,
  },
  primaryBtnPressed: {
    opacity: 0.85,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.signalForeground,
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelBtnPressed: {
    opacity: 0.6,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.muted,
  },
});
