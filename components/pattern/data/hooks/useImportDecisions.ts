import { useMemo, useState } from "react";
import { PatternList } from "@/components/pattern/types/PatternList";
import { PatternListWithPatterns } from "@/components/pattern/data/types/IExportData";

export type ImportAction = "skip" | "replace";

export interface ImportDecision {
  list: PatternList;
  action: ImportAction;
  existingList?: PatternList;
}

interface UseImportDecisionsProps {
  importedLists: PatternListWithPatterns[];
  existingLists: PatternList[];
}

export const useImportDecisions = ({
  importedLists,
  existingLists,
}: UseImportDecisionsProps) => {
  // Initialize decisions for each imported list
  const [decisions, setDecisions] = useState<Map<string, ImportAction>>(() => {
    const map = new Map<string, ImportAction>();
    importedLists.forEach((list) => {
      const exists = existingLists.some((e) => e.id === list.id);
      map.set(list.id, exists ? "skip" : "replace");
    });
    return map;
  });
  const setAction = (listId: string, action: ImportAction) => {
    setDecisions(new Map(decisions.set(listId, action)));
  };
  const getImportDecisions = (): ImportDecision[] => {
    return importedLists.map((list) => {
      const action = decisions.get(list.id) || "replace";
      const existingList = existingLists.find((e) => e.id === list.id);
      return {
        list,
        action,
        existingList,
      };
    });
  };
  const stats = useMemo(() => {
    const conflictCount = importedLists.filter((list) =>
      existingLists.some((e) => e.id === list.id),
    ).length;
    const totalPatternsCount = importedLists.reduce(
      (sum, list) => sum + list.patterns.length,
      0,
    );
    return {
      conflictCount,
      totalPatternsCount,
      totalLists: importedLists.length,
    };
  }, [importedLists, existingLists]);
  return {
    decisions,
    setAction,
    getImportDecisions,
    stats,
  };
};
