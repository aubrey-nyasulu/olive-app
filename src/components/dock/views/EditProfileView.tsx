import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { UserProfile } from "../../../profiles";
import { useThemeStyles, type ColorPalette } from "../../../theme";

interface EditProfileViewProps {
  profile: UserProfile;
  onSave: (patch: { name: string; neighborhood: string; bio: string }) => void;
}

export function EditProfileView({ profile, onSave }: EditProfileViewProps) {
  const { styles, colors } = useThemeStyles(createStyles);
  const [name, setName] = useState(profile.name);
  const [neighborhood, setNeighborhood] = useState(profile.neighborhood);
  const [bio, setBio] = useState(profile.bio);

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      neighborhood: neighborhood.trim() || profile.neighborhood,
      bio: bio.trim(),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Profile Info</Text>
        <Text style={styles.subtitle}>
          Update how your name, neighborhood, and bio appear
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.muted}
            style={styles.input}
            maxLength={48}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Neighborhood</Text>
          <TextInput
            value={neighborhood}
            onChangeText={setNeighborhood}
            placeholder="Area or neighborhood"
            placeholderTextColor={colors.muted}
            style={styles.input}
            maxLength={60}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tell neighbors a little about yourself"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.bioInput]}
            multiline
            numberOfLines={3}
            maxLength={180}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save profile info"
          disabled={!canSave}
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveBtn,
            !canSave && styles.saveBtnDisabled,
            pressed && canSave && styles.btnPressed,
          ]}
        >
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: -0.2,
      color: colors.text,
    },
    subtitle: {
      fontSize: 12,
      marginTop: 2,
      color: colors.muted,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 28,
      gap: 14,
    },
    fieldGroup: {
      gap: 6,
    },
    label: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textSecondary,
    },
    input: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surfaceMuted,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text,
    },
    bioInput: {
      minHeight: 82,
      textAlignVertical: "top",
    },
    saveBtn: {
      marginTop: 4,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.signal,
    },
    saveBtnDisabled: {
      opacity: 0.45,
    },
    btnPressed: {
      opacity: 0.78,
    },
    saveBtnText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });
