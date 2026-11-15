import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Post } from "../models";
import { useOlive } from "../context/OliveProvider";

type PlaceMapProps = {
  post: Post;
  height?: number;
  interactive?: boolean;
};

export function PlaceMap({
  post,
  height = 240,
  interactive = true,
}: PlaceMapProps) {
  const { colors } = useOlive();
  const [zoomLevel, setZoomLevel] = useState(1);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  const scalePulse = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.8],
  });

  const opacityPulse = pulseAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.8, 0.4, 0],
  });

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.3, 1.8));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.3, 0.7));

  return (
    <View
      style={[
        styles.mapCard,
        {
          height,
          backgroundColor: colors.mapGround,
          borderColor: colors.line,
        },
      ]}
    >
      {/* Aesthetic Topographic & Street Grid Canvas */}
      <View
        style={[
          styles.canvas,
          {
            transform: [{ scale: zoomLevel }],
          },
        ]}
      >
        {/* Subtle Water feature */}
        <View
          style={[
            styles.waterFeature,
            { backgroundColor: colors.mapWater, borderColor: colors.line },
          ]}
        />

        {/* Minimalist Grid Street Network */}
        <View style={[styles.mainRoad, { backgroundColor: colors.mapRoad }]} />
        <View
          style={[
            styles.crossRoad,
            { backgroundColor: colors.mapRoad },
          ]}
        />
        <View
          style={[
            styles.diagonalRoad,
            { backgroundColor: colors.mapRoad },
          ]}
        />
        <View
          style={[
            styles.secondaryRoad1,
            { backgroundColor: colors.mapRoad },
          ]}
        />
        <View
          style={[
            styles.secondaryRoad2,
            { backgroundColor: colors.mapRoad },
          ]}
        />

        {/* Street Name Labels */}
        <Text
          style={[
            styles.streetLabel,
            styles.streetLabel1,
            { color: colors.muted },
          ]}
        >
          Presidential Way
        </Text>
        <Text
          style={[
            styles.streetLabel,
            styles.streetLabel2,
            { color: colors.muted },
          ]}
        >
          {post.place}
        </Text>

        {/* Route trail leading to venue */}
        <View style={[styles.routeTrail, { borderColor: colors.signal }]} />

        {/* Radar Pulse around venue */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              borderColor: colors.signal,
              transform: [{ scale: scalePulse }],
              opacity: opacityPulse,
            },
          ]}
        />

        {/* Destination Marker */}
        <View style={[styles.beaconPin, { backgroundColor: colors.signal }]}>
          <View style={styles.beaconInnerDot} />
        </View>

        {/* Current user location dot */}
        <View style={[styles.userDot, { backgroundColor: colors.text }]}>
          <View style={[styles.userDotInner, { backgroundColor: colors.bg }]} />
        </View>
      </View>

      {/* Top Floating Badge: Category & Distance */}
      <View
        style={[
          styles.overlayBadge,
          { backgroundColor: colors.badgeBg, borderColor: colors.line },
        ]}
      >
        <Ionicons name="location" size={13} color={colors.signal} />
        <Text style={[styles.badgeText, { color: colors.text }]}>
          {post.distanceKm} km · {post.category}
        </Text>
      </View>

      {/* Map Controls: Zoom in/out */}
      {interactive && (
        <View style={styles.controls}>
          <Pressable
            accessibilityLabel="Zoom in"
            onPress={handleZoomIn}
            style={({ pressed }) => [
              styles.controlBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.line,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons name="add" size={18} color={colors.text} />
          </Pressable>
          <Pressable
            accessibilityLabel="Zoom out"
            onPress={handleZoomOut}
            style={({ pressed }) => [
              styles.controlBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.line,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons name="remove" size={18} color={colors.text} />
          </Pressable>
        </View>
      )}

      {/* Bottom Coordinates readout */}
      <View
        style={[
          styles.bottomInfo,
          { backgroundColor: colors.badgeBg, borderColor: colors.line },
        ]}
      >
        <Text style={[styles.coordsText, { color: colors.muted }]}>
          {post.lat.toFixed(4)}° N, {Math.abs(post.lng).toFixed(4)}° W
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  canvas: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
  },
  waterFeature: {
    position: "absolute",
    bottom: -30,
    left: -40,
    width: 220,
    height: 120,
    borderRadius: 70,
    borderWidth: 1,
    opacity: 0.6,
  },
  mainRoad: {
    position: "absolute",
    width: "140%",
    height: 12,
    top: "48%",
    transform: [{ rotate: "-15deg" }],
  },
  crossRoad: {
    position: "absolute",
    width: 10,
    height: "140%",
    left: "52%",
    transform: [{ rotate: "18deg" }],
  },
  diagonalRoad: {
    position: "absolute",
    width: "120%",
    height: 8,
    top: "28%",
    transform: [{ rotate: "35deg" }],
  },
  secondaryRoad1: {
    position: "absolute",
    width: "100%",
    height: 6,
    bottom: "22%",
    transform: [{ rotate: "-8deg" }],
  },
  secondaryRoad2: {
    position: "absolute",
    width: 6,
    height: "100%",
    left: "24%",
  },
  streetLabel: {
    position: "absolute",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  streetLabel1: {
    top: "38%",
    left: "12%",
    transform: [{ rotate: "-15deg" }],
  },
  streetLabel2: {
    bottom: "16%",
    right: "12%",
  },
  routeTrail: {
    position: "absolute",
    width: 90,
    height: 70,
    borderStyle: "dashed",
    borderWidth: 2,
    borderRadius: 24,
    top: "36%",
    left: "40%",
    opacity: 0.6,
  },
  pulseRing: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    top: "43%",
    left: "50%",
    marginLeft: -22,
    marginTop: -22,
  },
  beaconPin: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    top: "43%",
    left: "50%",
    marginLeft: -12,
    marginTop: -12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E8590C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  beaconInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  userDot: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    top: "65%",
    left: "34%",
    alignItems: "center",
    justifyContent: "center",
  },
  userDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  overlayBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  controls: {
    position: "absolute",
    right: 12,
    top: 12,
    gap: 6,
  },
  controlBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomInfo: {
    position: "absolute",
    bottom: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  coordsText: {
    fontSize: 10,
    fontWeight: "500",
  },
});
