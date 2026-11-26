import type { ReactNode } from "react";
import type { ImageSourcePropType } from "react-native";
import type { Post } from "../../models";
import type { UserProfile } from "../../profiles";

export type SourceRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SourceStyleSpec = {
  borderRadius: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
};

export type MorphHeaderSpec = {
  /** Icon inside the source pressable that glides into the pop-up header */
  icon?: {
    render: (color: string, size: number) => ReactNode;
    x: number;
    y: number;
    size: number;
    color: string;
    targetBgColor?: string;
  };
  /** Text inside the source pressable that glides into the pop-up header title */
  title?: {
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontWeight?: "500" | "600" | "700" | "800";
    color: string;
  };
  /** Final window title when icon-only or expanded title differs from pill text */
  headerTitle?: string;
  /** Optional subtitle shown in the expanded window header */
  headerSubtitle?: string;
  /** Secondary parts of the pill (count, chevron, etc.) that dissolve cleanly on expand */
  ghostContent?: ReactNode;
};

export type PopupOrigin = {
  triggerId: string;
  rect: SourceRect;
  style: SourceStyleSpec;
  headerMorph?: MorphHeaderSpec;
  /** Optional dynamic lookup for closing story morphs onto the currently active item */
  resolveCloseRect?: (payload: PopupPayload) => Promise<SourceRect | null>;
};

export type PopupPayload =
  | { type: "comments"; post: Post }
  | { type: "details"; post: Post }
  | { type: "post_options"; post: Post }
  | { type: "reshare"; post: Post }
  | { type: "reactions_list"; postId: string; postAuthor: string }
  | { type: "story"; initialIndex: number; activeIndex?: number }
  | {
      type: "image_viewer";
      image: ImageSourcePropType;
      naturalWidth: number;
      naturalHeight: number;
      place?: string;
      author?: string;
    }
  | { type: "edit_profile"; profile: UserProfile }
  | { type: "profile_visitors" }
  | { type: "message"; recipient: UserProfile }
  | { type: "profile_saved" }
  | { type: "profile_settings" }
  | { type: "report"; targetUser: UserProfile };

export type ActivePopupState = {
  id: number;
  payload: PopupPayload;
  history: PopupPayload[];
  origin: PopupOrigin;
  closing: boolean;
};
