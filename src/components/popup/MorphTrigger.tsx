import { useCallback, useRef } from "react";
import { Dimensions, type View } from "react-native";
import { useOlive } from "../../context/OliveProvider";
import type { SourceRect } from "./popupTypes";

function fallbackRect(): SourceRect {
  const { width, height } = Dimensions.get("window");
  return {
    x: width / 2 - 48,
    y: height / 2 - 20,
    width: 96,
    height: 40,
  };
}

export function measureNodeInRoot(
  node: View | null,
  rootNode: View | null
): Promise<SourceRect> {
  return new Promise((resolve) => {
    if (!node || typeof node.measureInWindow !== "function") {
      resolve(fallbackRect());
      return;
    }

    const readNode = (rx: number, ry: number) => {
      node.measureInWindow((x, y, width, height) => {
        if (
          typeof width === "number" &&
          typeof height === "number" &&
          width > 0 &&
          height > 0
        ) {
          resolve({
            x: x - rx,
            y: y - ry,
            width,
            height,
          });
        } else {
          resolve(fallbackRect());
        }
      });
    };

    if (rootNode && typeof rootNode.measureInWindow === "function") {
      rootNode.measureInWindow((rx, ry) => {
        readNode(typeof rx === "number" ? rx : 0, typeof ry === "number" ? ry : 0);
      });
    } else {
      readNode(0, 0);
    }
  });
}

export function useMorphTrigger(triggerId: string) {
  const triggerRef = useRef<View | null>(null);
  const { activePopup, activeTriggerId, rootContainerRef } = useOlive();
  const isMorphedOut = activeTriggerId === triggerId;

  const measureAndOpen = useCallback(
    (onMeasured: (rect: SourceRect) => void) => {
      if (activePopup !== null) return;
      measureNodeInRoot(triggerRef.current, rootContainerRef.current).then(
        (rect) => {
          onMeasured(rect);
        }
      );
    },
    [activePopup, rootContainerRef]
  );

  return {
    triggerRef,
    isMorphedOut,
    measureAndOpen,
  };
}
