import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { Post } from "../models";
import { relatedPosts, REVIEWS } from "../places";
import { useOlive } from "../context/OliveProvider";

type TabKind = "Details" | "Reviews" | "Related";
const TABS: TabKind[] = ["Details", "Reviews", "Related"];

// Fixed Instagram post image aspect ratio (1:1 square standard)
export const INSTAGRAM_POST_ASPECT_RATIO = 1;

export function PostCard({
  post,
  hideAuthor = false,
}: {
  post: Post;
  hideAuthor?: boolean;
}) {
  const { colors, isSaved, toggleSave, startGuidance, closeSearch } =
    useOlive();
  const [activeModalTab, setActiveModalTab] = useState<TabKind | null>(null);

  const reviews = REVIEWS[post.id] ?? [];
  const related = relatedPosts(post);
  const saved = isSaved(post.id);

  const openPlace = () => {
    closeSearch();
    router.push(`/p/${post.id}`);
  };

  const openAuthorProfile = () => {
    closeSearch();
    router.push({
      pathname: "/profile",
      params: { author: post.author, id: post.id },
    });
  };

  return (
    <View style={styles.card}>
      {/* Author Header (hidden on profile screen where author is already displayed) */}
      {!hideAuthor && (
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${post.author}'s profile`}
            onPress={openAuthorProfile}
            style={styles.authorGroup}
          >
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: colors.surfaceMuted },
              ]}
            >
              {post.image ? (
                <Image source={post.image} style={styles.avatarPhoto} />
              ) : (
                <Text style={[styles.avatarLetter, { color: colors.text }]}>
                  {post.author[0]}
                </Text>
              )}
            </View>
            <View style={styles.authorMeta}>
              <Text style={[styles.authorName, { color: colors.text }]}>
                {post.author}
              </Text>
              <Text style={[styles.authorSub, { color: colors.muted }]}>
                {post.kind} · {post.category} · {post.distanceKm} km
              </Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* Image with Time Badge - Fixed Instagram Aspect Ratio */}
      <Pressable
        accessibilityRole="button"
        onPress={openPlace}
        style={styles.imageWrap}
      >
        <Image source={post.image} style={styles.postImage} />
        <View
          style={[
            styles.whenBadge,
            { backgroundColor: colors.badgeBg, borderColor: colors.line },
          ]}
        >
          <Text style={[styles.whenBadgeText, { color: colors.badgeText }]}>
            {post.when}
          </Text>
        </View>
      </Pressable>

      <View style={styles.tabContainer}>
        {/* Details / Reviews / Related Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {TABS.map((tab) => {
            const badgeCount =
              tab === "Reviews" && reviews.length > 0
                ? ` · ${reviews.length}`
                : "";
            return (
              <Pressable
                key={tab}
                accessibilityRole="button"
                onPress={() => setActiveModalTab(tab)}
                style={({ pressed }) => [
                  styles.tabChip,
                  {
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.line,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[styles.tabChipText, { color: colors.text }]}>
                  {tab}
                  {badgeCount}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Bookmark Icon */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? "Remove bookmark" : "Save place"}
          onPress={() => toggleSave(post.id)}
          style={({ pressed }) => [
            styles.saveBtn,
            {
              backgroundColor: saved ? colors.signalLight : colors.surfaceMuted,
              borderColor: saved ? colors.signal : colors.line,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={18}
            color={saved ? colors.signal : colors.muted}
          />
        </Pressable>
      </View>

      {/* Post snippet */}
      <Pressable onPress={openPlace}>
        <View
          style={[
            styles.bodySnippet,
            { backgroundColor: colors.surfaceMuted, borderColor: colors.line },
          ]}
        >
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            {post.body}
          </Text>
        </View>
      </Pressable>

      {/* Info Modal for Details / Reviews / Related */}
      <Modal
        visible={activeModalTab !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModalTab(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Dismiss modal"
            style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}
            onPress={() => setActiveModalTab(null)}
          />
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: colors.bg,
                borderColor: colors.signal,
              },
            ]}
          >
            {/* Top Handle */}
            <View style={styles.modalHeader}>
              <View
                style={[styles.modalHandle, { backgroundColor: colors.line }]}
              />
              <Pressable
                accessibilityLabel="Close"
                onPress={() => setActiveModalTab(null)}
                style={[
                  styles.modalClose,
                  {
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.line,
                  },
                ]}
              >
                <Ionicons name="close" size={18} color={colors.text} />
              </Pressable>
            </View>

            {/* Modal Tab Switcher */}
            <View style={styles.modalTabsRow}>
              {TABS.map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => setActiveModalTab(tab)}
                  style={[
                    styles.modalTabBtn,
                    {
                      backgroundColor:
                        activeModalTab === tab
                          ? colors.text
                          : colors.surfaceMuted,
                      borderColor:
                        activeModalTab === tab ? colors.text : colors.line,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalTabBtnText,
                      {
                        color:
                          activeModalTab === tab ? colors.bg : colors.muted,
                        fontWeight: activeModalTab === tab ? "700" : "500",
                      },
                    ]}
                  >
                    {tab}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Modal Tab Body */}
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
            >
              {activeModalTab === "Details" && (
                <View style={styles.detailsContent}>
                  <Text style={[styles.detailTitle, { color: colors.text }]}>
                    {post.title}
                  </Text>
                  <Text
                    style={[styles.detailBody, { color: colors.textSecondary }]}
                  >
                    {post.body}
                  </Text>

                  <View
                    style={[
                      styles.infoGrid,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.line,
                      },
                    ]}
                  >
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: colors.muted }]}>
                        Location
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        {post.place}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: colors.muted }]}>
                        Hours
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        {post.when}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: colors.muted }]}>
                        Distance
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        {post.distanceKm} km away
                      </Text>
                    </View>
                  </View>

                  {/* In-app guide me button */}
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setActiveModalTab(null);
                      startGuidance(post);
                    }}
                    style={({ pressed }) => [
                      styles.guideActionBtn,
                      {
                        backgroundColor: colors.signal,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Ionicons
                      name="navigate"
                      size={16}
                      color={colors.signalForeground}
                    />
                    <Text
                      style={[
                        styles.guideActionText,
                        { color: colors.signalForeground },
                      ]}
                    >
                      Guide me there
                    </Text>
                  </Pressable>
                </View>
              )}

              {activeModalTab === "Reviews" && (
                <View style={styles.reviewsContent}>
                  {reviews.length === 0 ? (
                    <Text style={[styles.emptyText, { color: colors.muted }]}>
                      No reviews yet. Be the first to visit and share thoughts!
                    </Text>
                  ) : (
                    reviews.map((rev) => (
                      <View
                        key={rev.by}
                        style={[
                          styles.reviewCard,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.line,
                          },
                        ]}
                      >
                        <View style={styles.reviewHeader}>
                          <View
                            style={[
                              styles.reviewAvatar,
                              { backgroundColor: colors.surfaceMuted },
                            ]}
                          >
                            <Text
                              style={[
                                styles.reviewAvatarLetter,
                                { color: colors.text },
                              ]}
                            >
                              {rev.by[0]}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.reviewAuthor,
                              { color: colors.text },
                            ]}
                          >
                            {rev.by}
                          </Text>
                          <View style={styles.starsRow}>
                            {Array.from({ length: rev.stars }).map((_, i) => (
                              <Ionicons
                                key={i}
                                name="star"
                                size={13}
                                color={colors.signal}
                              />
                            ))}
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.reviewText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {rev.text}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              )}

              {activeModalTab === "Related" && (
                <View style={styles.relatedContent}>
                  {related.length === 0 ? (
                    <Text style={[styles.emptyText, { color: colors.muted }]}>
                      Nothing similar nearby right now.
                    </Text>
                  ) : (
                    related.map((rel) => (
                      <Pressable
                        key={rel.id}
                        onPress={() => {
                          setActiveModalTab(null);
                          closeSearch();
                          router.push(`/p/${rel.id}`);
                        }}
                        style={({ pressed }) => [
                          styles.relatedRow,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.line,
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                      >
                        <View style={styles.relatedMeta}>
                          <Text
                            style={[
                              styles.relatedTitle,
                              { color: colors.text },
                            ]}
                          >
                            {rel.author}
                          </Text>
                          <Text
                            style={[styles.relatedSub, { color: colors.muted }]}
                          >
                            {rel.title}
                          </Text>
                        </View>
                        <Text
                          style={[styles.relatedDist, { color: colors.signal }]}
                        >
                          {rel.distanceKm} km
                        </Text>
                      </Pressable>
                    ))
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 36,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  authorGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: "700",
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
  },
  authorSub: {
    fontSize: 12.5,
    marginTop: 1,
  },

  imageWrap: {
    width: "100%",
    aspectRatio: INSTAGRAM_POST_ASPECT_RATIO,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
  },
  postImage: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    resizeMode: "cover",
  },
  whenBadge: {
    position: "absolute",
    left: 12,
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  whenBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  tabsScroll: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 10,
    paddingBottom: 4,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  saveBtn: {
    padding: 6,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bodySnippet: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  bodyText: {
    fontSize: 13.5,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContainer: {
    width: "100%",
    height: "98%",
    borderRadius: 32,
    borderWidth: 2,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  modalClose: {
    position: "absolute",
    right: 16,
    top: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTabsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  modalTabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
  },
  modalTabBtnText: {
    fontSize: 13,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  detailsContent: {
    gap: 14,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  detailBody: {
    fontSize: 14.5,
    lineHeight: 21,
  },
  infoGrid: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  guideActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 9999,
    marginTop: 8,
  },
  guideActionText: {
    fontSize: 15,
    fontWeight: "700",
  },
  reviewsContent: {
    gap: 12,
  },
  reviewCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarLetter: {
    fontSize: 12,
    fontWeight: "700",
  },
  reviewAuthor: {
    fontSize: 13.5,
    fontWeight: "600",
    flex: 1,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 18,
  },
  relatedContent: {
    gap: 10,
  },
  relatedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  relatedMeta: {
    flex: 1,
    marginRight: 12,
  },
  relatedTitle: {
    fontSize: 14.5,
    fontWeight: "600",
  },
  relatedSub: {
    fontSize: 12.5,
    marginTop: 2,
  },
  relatedDist: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 13.5,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 32,
  },
});
