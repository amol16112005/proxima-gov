// MP portal accounts — one login per Lok Sabha constituency (Union / central government).
// MP names/parties from lokSabhaRoster.ts (18th Lok Sabha, 2024). See DEVELOPER_MP_CREDENTIALS.md

import { getLokSabhaMp } from "./lokSabhaRoster";

export interface MpAccount {
  id: string;
  username: string;
  pin: string;
  name: string;
  phone: string;
  constituencyId: string;
  party: string;
  email: string;
  termStart: string;
  bio: string;
}

const LOGIN_CREDENTIALS: Array<{
  id: string;
  username: string;
  pin: string;
  phone: string;
  constituencyId: string;
}> = [
  { id: "mp-001", username: "mp.mumbai-south", pin: "482910", phone: "9876543210", constituencyId: "mumbai-south" },
  { id: "mp-002", username: "mp.pune-city", pin: "573821", phone: "9876543211", constituencyId: "pune-city" },
  { id: "mp-003", username: "mp.new-delhi", pin: "384729", phone: "9876543212", constituencyId: "new-delhi" },
  { id: "mp-004", username: "mp.bangalore-south", pin: "495830", phone: "9876543213", constituencyId: "bangalore-south" },
  { id: "mp-005", username: "mp.chennai-central", pin: "506941", phone: "9876543214", constituencyId: "chennai-central" },
  { id: "mp-006", username: "mp.hyderabad", pin: "617052", phone: "9876543215", constituencyId: "hyderabad" },
  { id: "mp-007", username: "mp.kolkata-south", pin: "728163", phone: "9876543216", constituencyId: "kolkata-south" },
  { id: "mp-008", username: "mp.ahmedabad-east", pin: "839274", phone: "9876543217", constituencyId: "ahmedabad-east" },
  { id: "mp-009", username: "mp.lucknow", pin: "940385", phone: "9876543218", constituencyId: "lucknow" },
  { id: "mp-010", username: "mp.jaipur", pin: "151496", phone: "9876543219", constituencyId: "jaipur" },
  { id: "mp-011", username: "mp.bhopal", pin: "262507", phone: "9876543220", constituencyId: "bhopal" },
  { id: "mp-012", username: "mp.patna-sahib", pin: "373618", phone: "9876543221", constituencyId: "patna-sahib" },
  { id: "mp-013", username: "mp.ernakulam", pin: "484729", phone: "9876543222", constituencyId: "ernakulam" },
  { id: "mp-014", username: "mp.guwahati", pin: "595830", phone: "9876543223", constituencyId: "guwahati" },
  { id: "mp-015", username: "mp.amritsar", pin: "606941", phone: "9876543224", constituencyId: "amritsar" },
];

export const MP_REGISTRY: MpAccount[] = LOGIN_CREDENTIALS.map((cred) => {
  const mp = getLokSabhaMp(cred.constituencyId)!;
  return {
    ...cred,
    name: mp.name,
    party: mp.party,
    email: mp.email,
    termStart: mp.termStart,
    bio: mp.bio,
  };
});

export function getMpByUsername(username: string): MpAccount | undefined {
  const normalized = username.trim().toLowerCase();
  return MP_REGISTRY.find((mp) => mp.username.toLowerCase() === normalized);
}

export function verifyMpCredentials(
  username: string,
  pin: string
): MpAccount | undefined {
  const mp = getMpByUsername(username);
  if (!mp) return undefined;
  const normalizedPin = pin.replace(/\D/g, "");
  if (normalizedPin.length !== 6 || normalizedPin !== mp.pin) return undefined;
  return mp;
}

export function getMpByPhone(phone: string): MpAccount | undefined {
  const normalized = phone.replace(/\D/g, "").slice(-10);
  return MP_REGISTRY.find((mp) => mp.phone === normalized);
}

export function getMpById(id: string): MpAccount | undefined {
  return MP_REGISTRY.find((mp) => mp.id === id);
}