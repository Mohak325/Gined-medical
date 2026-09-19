"use server";
import { getCollegeById } from "@/lib/medical/api";

export async function getCompareColleges(ids: string[]) {
  const colleges = await Promise.all(ids.map(id => getCollegeById(id)));
  return colleges.filter(Boolean);
}
