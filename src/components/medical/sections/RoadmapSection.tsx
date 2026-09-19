"use client";

import { useCinematicContext } from "@/lib/medical/CinematicProvider";
import { useTrack } from "@/lib/medical/TrackProvider";
import dynamic from "next/dynamic";
import RoadmapStatic from "@/components/medical/sections/RoadmapStatic";
import roadmapUgData from "@/content/roadmap.ug.json";

const RoadmapPinned = dynamic(() => import("@/components/medical/cinematic/RoadmapPinned"), { ssr: false });
// Fallback if PG data doesn't exist, we use UG data for now
import roadmapPgData from "@/content/roadmap.ug.json"; 

export default function RoadmapSection({ id }: { id: string }) {
  const cinematic = useCinematicContext();
  const { track } = useTrack();
  const steps = track === "ug" ? roadmapUgData.steps : roadmapPgData.steps;

  return (
    <section id={id} aria-labelledby="roadmap-heading" className="bg-paper">
      {cinematic
        ? <RoadmapPinned steps={steps} />
        : <RoadmapStatic steps={steps} />}
    </section>
  );
}
