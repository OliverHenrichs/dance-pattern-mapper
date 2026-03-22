import { useMemo, useState } from "react";
import { IPatternList } from "@/src/pattern/types/IPatternList";
import { PatternListWithPatterns } from "@/src/pattern/data/types/IExportData";

export type ImportAction = "skip" | "replace";

export interface ImportDecision {
  list: IPatternList;
  action: ImportAction;
  existingList?: IPatternList;
}

interface UseImportDecisionsProps {
  importedLists: PatternListWithPatterns[];
  existingLists: IPatternList[];
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
