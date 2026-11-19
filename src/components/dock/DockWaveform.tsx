import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { colors } from "../../constants/colors";

const LFO_DURATIONS = [420, 560, 360, 720, 480, 640, 390, 800];
const NUM_STRANDS = 25;
const STRANDS_CONFIG = Array.from({ length: NUM_STRANDS }, (_, i) => {
  const dist = Math.abs(i - 12);
  const normDist = dist / 12;
  const weight = Math.cos(normDist * (Math.PI / 2)) ** 1.6;
  const lfoIndex = (i * 3) % LFO_DURATIONS.length;
  return { dist, weight, lfoIndex };
});

interface DockWaveformProps {
  showAnimatingLine: boolean;
  isVoice: boolean;
  isListening: boolean;
  onToggleListening: () => void;
}

export function DockWaveform({
  showAnimatingLine,
  isVoice,
  isListening,
  onToggleListening,
}: DockWaveformProps) {
  const [trackWidth, setTrackWidth] = useState(140);

  const sweepAnim = useRef(new Animated.Value(0)).current;
  const voiceOpacityAnim = useRef(new Animated.Value(0)).current;
  const voiceScaleYAnim = useRef(new Animated.Value(0)).current;
  const sweepOpacityAnim = useRef(new Animated.Value(1)).current;

  const lfoValues = useRef(
    LFO_DURATIONS.map(() => new Animated.Value(0))
  ).current;

  // Line sweep loop
  useEffect(() => {
    if (!showAnimatingLine) {
      sweepAnim.stopAnimation();
      Animated.timing(sweepOpacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
      return;
    }
    sweepAnim.setValue(0);
    Animated.timing(sweepOpacityAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    const sweepLoop = Animated.loop(
      Animated.timing(sweepAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    sweepLoop.start();
    return () => sweepLoop.stop();
  }, [sweepAnim, sweepOpacityAnim, showAnimatingLine]);

  // LFO resonance loops
  useEffect(() => {
    const loops = lfoValues.map((val, idx) => {
      const dur = LFO_DURATIONS[idx];
      return Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: 1,
            duration: dur,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: dur,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
    });
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [lfoValues]);

  // Shapeshift between scan line & voice intake
  useEffect(() => {
    if (isVoice) {
      Animated.parallel([
        Animated.timing(sweepOpacityAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(voiceOpacityAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(voiceScaleYAnim, {
          toValue: isListening ? 1 : 0.28,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(voiceOpacityAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(voiceScaleYAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sweepOpacityAnim, {
          toValue: showAnimatingLine ? 1 : 0,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [
    isVoice,
    isListening,
    showAnimatingLine,
    sweepOpacityAnim,
    voiceOpacityAnim,
    voiceScaleYAnim,
  ]);

  const strandInterpolations = useMemo(() => {
    return STRANDS_CONFIG.map(({ weight, lfoIndex }) => {
      const lfo = lfoValues[lfoIndex];
      const minScale = Math.max(0.08, 0.12 * weight);
      const maxScale = Math.max(0.1, 0.15 + 0.85 * weight);
      return lfo.interpolate({
        inputRange: [0, 1],
        outputRange: [minScale, maxScale],
      });
    });
  }, [lfoValues]);

  const barWidth = Math.max(45, trackWidth * 0.42);
  const sweepTranslateX = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-barWidth, trackWidth + barWidth],
  });

  return (
    <View
      style={styles.container}
      onLayout={(e: LayoutChangeEvent) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - trackWidth) > 1) {
          setTrackWidth(w);
        }
      }}
    >
      <View style={styles.baselineTrack}>
        <Animated.View
          style={[
            styles.sweepBar,
            {
              width: barWidth,
              transform: [{ translateX: sweepTranslateX }],
              opacity: sweepOpacityAnim,
            },
          ]}
        />
      </View>

      <Animated.View
        pointerEvents={isVoice ? "auto" : "none"}
        style={[
          styles.voiceOverlay,
          {
            opacity: voiceOpacityAnim,
            transform: [{ scaleY: voiceScaleYAnim }],
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle voice intake"
          onPress={onToggleListening}
          style={styles.touchWrap}
        >
          <View style={styles.strandsRow}>
            {strandInterpolations.map((scaleAnim, idx) => (
              <Animated.View
                key={idx}
                style={[
                  styles.strand,
                  {
                    transform: [{ scaleY: scaleAnim }],
                  },
                ]}
              />
            ))}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  baselineTrack: {
    width: "100%",
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 2,
    overflow: "hidden",
    position: "relative",
  },
  sweepBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    height: "100%",
    borderRadius: 2,
    backgroundColor: colors.signal,
  },
  voiceOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  touchWrap: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  strandsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 24,
  },
  strand: {
    width: 2.5,
    height: 20,
    marginHorizontal: 1.5,
    borderRadius: 1.5,
    backgroundColor: colors.signal,
    shadowColor: colors.signal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 3,
    elevation: 2,
  },
});
