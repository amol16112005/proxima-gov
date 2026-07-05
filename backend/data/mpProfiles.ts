/** Public Lok Sabha MP profiles — sourced from 18th Lok Sabha (2024 election). */

import { LOK_SABHA_ROSTER, type LokSabhaMpRecord } from "./lokSabhaRoster";

export interface MpPublicProfile {
  constituencyId: string;
  name: string;
  party: string;
  photoPath: string;
  termStart: string;
  termEnd: string;
  bio: string;
  email: string;
  committees: string[];
  attendancePct: number;
  questionsAsked: number;
  billsIntroduced: number;
}

function toPublicProfile(mp: LokSabhaMpRecord): MpPublicProfile {
  return {
    constituencyId: mp.constituencyId,
    name: mp.name,
    party: mp.party,
    photoPath: `/mp/${mp.constituencyId}.svg`,
    termStart: mp.termStart,
    termEnd: mp.termEnd,
    bio: mp.bio,
    email: mp.email,
    committees: mp.committees,
    attendancePct: mp.attendancePct,
    questionsAsked: mp.questionsAsked,
    billsIntroduced: mp.billsIntroduced,
  };
}

export const MP_PUBLIC_PROFILES: MpPublicProfile[] = LOK_SABHA_ROSTER.map(toPublicProfile);

export function getMpProfileByConstituency(constituencyId: string): MpPublicProfile | undefined {
  return MP_PUBLIC_PROFILES.find((p) => p.constituencyId === constituencyId);
}