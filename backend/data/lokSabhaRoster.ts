/**
 * 18th Lok Sabha MPs elected in the 2024 general election.
 * Single source of truth for MP names/parties shown in the app.
 * MPLADS fund data comes separately from data.gov.in — not MP identity.
 */

export interface LokSabhaMpRecord {
  constituencyId: string;
  name: string;
  party: string;
  termStart: string;
  termEnd: string;
  bio: string;
  email: string;
  committees: string[];
  attendancePct: number;
  questionsAsked: number;
  billsIntroduced: number;
}

export const LOK_SABHA_TERM = {
  termStart: "2024-06-01",
  termEnd: "2029-05-31",
} as const;

export const LOK_SABHA_SOURCE = "18th Lok Sabha · 2024 general election";

export const LOK_SABHA_ROSTER: LokSabhaMpRecord[] = [
  {
    constituencyId: "mumbai-south",
    name: "Arvind Ganpat Sawant",
    party: "Shiv Sena (UBT)",
    ...LOK_SABHA_TERM,
    bio: "Lok Sabha MP for Mumbai South; focuses on coastal urban infrastructure and constituency development.",
    email: "arvind.sawant@sansad.gov.in",
    committees: ["Urban Development", "Ports & Shipping"],
    attendancePct: 87,
    questionsAsked: 142,
    billsIntroduced: 4,
  },
  {
    constituencyId: "pune-city",
    name: "Murlidhar Mohol",
    party: "BJP",
    ...LOK_SABHA_TERM,
    bio: "Lok Sabha MP for Pune; former Pune mayor working on smart city and civic infrastructure.",
    email: "murlidhar.mohol@sansad.gov.in",
    committees: ["Urban Development", "Housing"],
    attendancePct: 91,
    questionsAsked: 118,
    billsIntroduced: 6,
  },
  {
    constituencyId: "new-delhi",
    name: "Bansuri Swaraj",
    party: "BJP",
    ...LOK_SABHA_TERM,
    bio: "Lok Sabha MP for New Delhi; advocate working on capital city civic and heritage issues.",
    email: "bansuri.swaraaj@sansad.gov.in",
    committees: ["Law & Justice", "Urban Development"],
    attendancePct: 90,
    questionsAsked: 134,
    billsIntroduced: 5,
  },
  {
    constituencyId: "bangalore-south",
    name: "Tejasvi Surya",
    party: "BJP",
    ...LOK_SABHA_TERM,
    bio: "Lok Sabha MP for Bangalore South; national Yuva Morcha president and Bengaluru civic advocate.",
    email: "tejasvi.surya@sansad.gov.in",
    committees: ["Science & Technology", "Youth Affairs"],
    attendancePct: 88,
    questionsAsked: 121,
    billsIntroduced: 4,
  },
  {
    constituencyId: "chennai-central",
    name: "Dayanidhi Maran",
    party: "DMK",
    ...LOK_SABHA_TERM,
    bio: "Lok Sabha MP for Chennai Central; former Union minister focused on telecom and urban development.",
    email: "dayanidhi.maran@sansad.gov.in",
    committees: ["IT & Communications", "Urban Development"],
    attendancePct: 86,
    questionsAsked: 148,
    billsIntroduced: 3,
  },
  {
    constituencyId: "hyderabad",
    name: "Asaduddin Owaisi",
    party: "AIMIM",
    ...LOK_SABHA_TERM,
    bio: "Lok Sabha MP for Hyderabad; AIMIM president and long-serving parliamentarian from Old City.",
    email: "asaduddin.owaisi@sansad.gov.in",
    committees: ["Minority Affairs", "Home Affairs"],
    attendancePct: 92,
    questionsAsked: 109,
    billsIntroduced: 5,
  },
  {
    constituencyId: "kolkata-south",
    name: "Mala Roy",
    party: "AITC",
    ...LOK_SABHA_TERM,
    bio: "Lok Sabha MP for Kolkata Dakshin; Trinamool Congress leader on civic and transport issues.",
    email: "mala.roy@sansad.gov.in",
    committees: ["Railways", "Urban Development"],
    attendancePct: 85,
    questionsAsked: 137,
    billsIntroduced: 4,
  },
  {
    constituencyId: "ahmedabad-east",
    name: "Hasmukh Patel",
    party: "BJP",
    ...LOK_SABHA_TERM,
    bio: "Lok Sabha MP for Ahmedabad East; industrial corridor and MSME development focus.",
    email: "hasmukh.patel@sansad.gov.in",
    committees: ["MSME", "Industry"],
    attendancePct: 89,
    questionsAsked: 115,
    billsIntroduced: 6,
  },
  {
    constituencyId: "lucknow",
    name: "Rajnath Singh",
    party: "BJP",
    ...LOK_SABHA_TERM,
    bio: "Lok Sabha MP for Lucknow and Union Defence Minister; former UP chief minister.",
    email: "rajnath.singh@sansad.gov.in",
    committees: ["Defence", "Home Affairs"],
    attendancePct: 84,
    questionsAsked: 152,
    billsIntroduced: 3,
  },
  {
    constituencyId: "jaipur",
    name: "Manju Sharma",
    party: "BJP",
    ...LOK_SABHA_TERM,
    bio: "Lok Sabha MP for Jaipur; works on heritage city infrastructure and water security.",
    email: "manju.sharma@sansad.gov.in",
    committees: ["Culture", "Water Resources"],
    attendancePct: 87,
    questionsAsked: 128,
    billsIntroduced: 5,
  },
  {
    constituencyId: "bhopal",
    name: "Alok Sharma",
    party: "BJP",
    ...LOK_SABHA_TERM,
    bio: "Lok Sabha MP for Bhopal; former state minister focused on lake city development.",
    email: "alok.sharma@sansad.gov.in",
    committees: ["Environment", "Urban Development"],
    attendancePct: 88,
    questionsAsked: 119,
    billsIntroduced: 4,
  },
  {
    constituencyId: "patna-sahib",
    name: "Ravi Shankar Prasad",
    party: "BJP",
    ...LOK_SABHA_TERM,
    bio: "Lok Sabha MP for Patna Sahib; former Union Law & IT minister.",
    email: "ravi.shankar.prasad@sansad.gov.in",
    committees: ["Law & Justice", "Electronics & IT"],
    attendancePct: 86,
    questionsAsked: 141,
    billsIntroduced: 4,
  },
  {
    constituencyId: "ernakulam",
    name: "Hibi Eden",
    party: "INC",
    ...LOK_SABHA_TERM,
    bio: "Lok Sabha MP for Ernakulam; Congress leader representing Kochi and coastal Kerala.",
    email: "hibi.eden@sansad.gov.in",
    committees: ["External Affairs", "Petroleum"],
    attendancePct: 90,
    questionsAsked: 112,
    billsIntroduced: 5,
  },
  {
    constituencyId: "guwahati",
    name: "Bijuli Kalita Medhi",
    party: "BJP",
    ...LOK_SABHA_TERM,
    bio: "Lok Sabha MP for Guwahati; North-East connectivity and Brahmaputra flood management.",
    email: "bijuli.medhi@sansad.gov.in",
    committees: ["North Eastern Region", "Road Transport"],
    attendancePct: 83,
    questionsAsked: 145,
    billsIntroduced: 3,
  },
  {
    constituencyId: "amritsar",
    name: "Gurjeet Singh Aujla",
    party: "INC",
    ...LOK_SABHA_TERM,
    bio: "Lok Sabha MP for Amritsar; pilgrimage infrastructure and Punjab civic development.",
    email: "gurjeet.aujla@sansad.gov.in",
    committees: ["Tourism", "Agriculture"],
    attendancePct: 91,
    questionsAsked: 106,
    billsIntroduced: 6,
  },
];

export function getLokSabhaMp(constituencyId: string): LokSabhaMpRecord | undefined {
  return LOK_SABHA_ROSTER.find((m) => m.constituencyId === constituencyId);
}