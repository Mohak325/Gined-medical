"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsapContext";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

// TopoJSON for India
const INDIA_TOPO_JSON = "https://raw.githubusercontent.com/Anujarya300/bubble_maps/master/data/geography-data/india.topo.json";

const MEDICAL_HUBS = [
  { name: "Delhi", coordinates: [77.1025, 28.7041] },
  { name: "Mumbai", coordinates: [72.8777, 19.0760] },
  { name: "Bangalore", coordinates: [77.5946, 12.9716] },
  { name: "Chennai", coordinates: [80.2707, 13.0827] },
  { name: "Kolkata", coordinates: [88.3639, 22.5726] },
  { name: "Hyderabad", coordinates: [78.4867, 17.3850] },
  { name: "Pune", coordinates: [73.8567, 18.5204] },
  { name: "Ahmedabad", coordinates: [72.5714, 23.0225] },
  { name: "Jaipur", coordinates: [75.7873, 26.9124] },
  { name: "Lucknow", coordinates: [80.9462, 26.8467] },
  { name: "Chandigarh", coordinates: [76.7794, 30.7333] },
  { name: "Bhopal", coordinates: [77.4126, 23.2599] },
  { name: "Patna", coordinates: [85.1376, 25.5941] },
  { name: "Guwahati", coordinates: [91.7362, 26.1445] },
  { name: "Kochi", coordinates: [76.2673, 9.9312] },
];

export default function CoverageDraw() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create a timeline triggered when the map comes into view
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
          end: "bottom 80%",
          toggleActions: "play none none reverse", // Play on enter, reverse on leave back
        },
      });

      // 1. Fade in the states
      tl.fromTo(
        ".india-state",
        { opacity: 0, scale: 0.95, transformOrigin: "center center" },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: {
            amount: 1,
            from: "random", // pop in randomly
          },
          ease: "back.out(1.5)",
        },
        0
      );

      // 2. Pop in the markers
      tl.fromTo(
        ".medical-hub-marker",
        { opacity: 0, scale: 0, y: 10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: "back.out(2)",
        },
        "-=0.5"
      );

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full relative h-[600px] flex items-center justify-center">
      {/* Glow behind the map */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,75,0.08)_0%,transparent_60%)] pointer-events-none" />
      
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1050,
          center: [81, 23] // Centered perfectly on India
        }}
        className="w-full h-full object-contain filter drop-shadow-xl"
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={INDIA_TOPO_JSON}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                className="india-state outline-none transition-colors duration-250 hover:fill-[#3A3A3A] hover:stroke-1"
                fill="#2A2A2A" // Dark grey fitting the cinematic dark mode
                stroke="#C9A24B" // Gold borders
                strokeWidth={0.5}
              />
            ))
          }
        </Geographies>

        {MEDICAL_HUBS.map((hub) => (
          <Marker key={hub.name} coordinates={hub.coordinates as [number, number]}>
            <g className="medical-hub-marker" style={{ transformOrigin: "12px 24px" }}>
              <g transform="translate(-12, -24)">
                <path
                  d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"
                  fill="#C9A24B" // Gold pin
                  stroke="#0A0A0A"
                  strokeWidth={1}
                />
                <circle cx="12" cy="10" r="3" fill="#0A0A0A" />
              </g>
            </g>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
