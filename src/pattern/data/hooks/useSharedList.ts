import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { subscribeToSharedList } from "@/src/firebase/FirebaseListService";
import {
  getPatternListById,
  savePatternList,
  savePatterns,
} from "@/src/pattern/data/PatternListStorage";
import { PatternListWithPatterns } from "@/src/pattern/data/types/IExportData";
import i18n from "@/app/i18n";

/**
 * Maintains a live Firestore subscription for a single shared list.
 *
 * When the publisher pushes changes the updated list and its patterns are
 * written to local AsyncStorage, then onUpdated() is called so callers can
 * refresh their in-memory state.
 *
 * When the publisher unpublishes (document deleted), the local copy is kept,
 * made editable (readonly cleared), shareCode cleared, and the user is
 * notified via an Alert so they know the list is now fully theirs.
 *
 * The subscription is automatically torn down when shareCode changes or the
 * component unmounts.
 */
export function useSharedList(
  shareCode: string | undefined,
  listId: string | undefined,
  onUpdated: () => void,
): void {
  // Stable callback ref so the effect does not re-subscribe on every render
  const onUpdatedRef = useRef(onUpdated);
  useEffect(() => {
    onUpdatedRef.current = onUpdated;
  });

  useEffect(() => {
    if (!shareCode) return;

    return subscribeToSharedList(
      shareCode,
      async (updated: PatternListWithPatterns) => {
        try {
          // Preserve the local readonly flag — it is a subscriber-side concept
          // and is intentionally absent from the Firestore document. Without
          // this, every sync would silently clear readonly on subscribed lists.
          const existing = await getPatternListById(updated.id);
          const listToSave = { ...updated, readonly: existing?.readonly };
          await savePatternList(listToSave);
          await savePatterns(updated.id, updated.patterns);
          onUpdatedRef.current();
        } catch (err) {
          console.warn("useSharedList: failed to persist update", err);
        }
      },
      async (err) => {
        if (err.message === "Shared list no longer exists." && listId) {
          try {
            const existing = await getPatternListById(listId);
            if (existing) {
              await savePatternList({
                ...existing,
                shareCode: undefined,
                readonly: undefined,
              });
              onUpdatedRef.current();
              // Only notify subscribers (readonly === true).
              // The publisher triggered the delete intentionally and gets a
              // confirmation directly in the ShareListModal instead.
              if (existing.readonly) {
                Alert.alert(
                  i18n.t("listUnpublishedTitle"),
                  i18n.t("listUnpublishedMessage", { name: existing.name }),
                );
              }
            }
          } catch (saveErr) {
            console.warn("useSharedList: failed to detach list", saveErr);
          }
        } else {
          console.warn("useSharedList: subscription error", err.message);
        }
      },
    );
  }, [shareCode, listId]);
}
