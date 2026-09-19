"use client";

import { motion, AnimatePresence } from "framer-motion";
import CollegeResultCard from "./CollegeResultCard";
import { type College, type CutoffEntry } from "@/lib/medical/mockData";
import { type ConfidenceLevel } from "@/lib/medical/confidence";

interface ResultItem {
  college: College;
  cutoff: CutoffEntry;
  confidence: ConfidenceLevel;
}

interface ResultsListProps {
  results: ResultItem[];
  userRank: number;
}

export default function ResultsList({ results, userRank }: ResultsListProps) {
  return (
    <motion.div layout className="space-y-4">
      <AnimatePresence mode="popLayout">
        {results.map((item, i) => (
          <CollegeResultCard
            key={item.college.id}
            college={item.college}
            cutoff={item.cutoff}
            confidence={item.confidence}
            userRank={userRank}
            index={i}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
