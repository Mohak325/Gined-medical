"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCompare } from "@/lib/medical/CompareProvider";
import { getCompareColleges } from "@/app/medical/compare/actions";
import { X, Scale } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function CompareTray() {
  const { ids, remove, clear } = useCompare();
  const [colleges, setColleges] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (ids.length === 0) {
      setColleges([]);
      return;
    }
    
    // Fetch minimal details (just names) for the tray
    let mounted = true;
    getCompareColleges(ids).then(data => {
      if (mounted) {
        setColleges(data.map(c => ({ id: c!.id, name: c!.name })));
      }
    });

    return () => { mounted = false; };
  }, [ids]);

  if (ids.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-[var(--z-drawer)] bg-ink border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] text-paper-bright"
      >
        <div className="max-w-ledger mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex-grow flex items-center gap-4 w-full overflow-x-auto pb-2 md:pb-0">
            {colleges.map((c) => (
              <div 
                key={c.id} 
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-[var(--radius-sm)] px-3 py-1.5 shrink-0"
              >
                <span className="text-small font-medium truncate max-w-[150px]">{c.name}</span>
                <button 
                  onClick={() => remove(c.id)}
                  className="text-white/50 hover:text-white transition-colors"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {colleges.length < 3 && (
              <div className="text-micro text-white/40 italic whitespace-nowrap">
                Add up to {3 - colleges.length} more...
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
            <button 
              onClick={clear}
              className="text-small text-white/60 hover:text-white transition-colors"
            >
              Clear All
            </button>
            <Link 
              href={`/medical/compare?ids=${ids.join(",")}`}
              className="px-6 py-2.5 bg-gold text-ink font-semibold rounded-[var(--radius-sm)] hover:bg-gold-deep transition-colors inline-flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <Scale className="w-4 h-4" />
              Compare
            </Link>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
