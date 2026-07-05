// Lok Sabha parliamentary constituency data — central government (MPs are Union representatives).
import { getLokSabhaMp } from "./lokSabhaRoster";

export type ProjectStatus = "planned" | "in-progress" | "completed" | "delayed";

export interface GovernmentProject {
  id: string;
  title: string;
  description: string;
  department: string;
  budget: number;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  expectedCompletion: string;
}

export interface Constituency {
  id: string;
  name: string;
  state: string;
  district: string;
  population: string;
  mpName: string;
  mpParty: string;
  summary: string;
  projects: GovernmentProject[];
}

const RAW_CONSTITUENCIES: Constituency[] = [
  {
    id: "mumbai-south",
    name: "Mumbai South",
    state: "Maharashtra",
    district: "Mumbai City",
    population: "14.2 lakh",
    mpName: "Arvind Ganpat Sawant",
    mpParty: "Shiv Sena (UBT)",
    summary: "Coastal urban Lok Sabha seat covering Colaba, Fort, and Marine Drive.",
    projects: [
      { id: "MS-ROAD-01", title: "Marine Drive Coastal Road Phase II", description: "Elevated coastal road with stormwater drainage upgrades.", department: "MoRTH / MPLADS", budget: 420_00_00_000, status: "in-progress", progress: 68, startDate: "2025-04-01", expectedCompletion: "2026-12-31" },
      { id: "MS-HEALTH-01", title: "Colaba PHC Modernisation", description: "24×7 emergency wing and telemedicine booths.", department: "MoHFW", budget: 8_50_00_000, status: "completed", progress: 100, startDate: "2025-01-15", expectedCompletion: "2026-03-30" },
    ],
  },
  {
    id: "pune-city",
    name: "Pune City",
    state: "Maharashtra",
    district: "Pune",
    population: "31.5 lakh",
    mpName: "Murlidhar Mohol",
    mpParty: "BJP",
    summary: "Educational and IT hub — smart mobility and lake rejuvenation priorities.",
    projects: [
      { id: "PC-METRO-01", title: "Pune Metro Line 3 Extension", description: "Hinjewadi IT Park to Shivajinagar corridor.", department: "MoHUA", budget: 1_200_00_00_000, status: "in-progress", progress: 55, startDate: "2024-11-01", expectedCompletion: "2028-03-31" },
      { id: "PC-EDU-01", title: "Digital Classrooms — 120 Schools", description: "Smart boards and connectivity for municipal schools.", department: "MoE", budget: 18_00_00_000, status: "completed", progress: 100, startDate: "2025-02-01", expectedCompletion: "2026-01-31" },
    ],
  },
  {
    id: "new-delhi",
    name: "New Delhi",
    state: "Delhi",
    district: "New Delhi",
    population: "2.5 lakh",
    mpName: "Bansuri Swaraj",
    mpParty: "BJP",
    summary: "National capital Lok Sabha seat — heritage, diplomacy zone, and urban services.",
    projects: [
      { id: "ND-HERITAGE-01", title: "Connaught Place Pedestrianisation", description: "Heritage plaza restoration and barrier-free access.", department: "MoHUA / NDMC", budget: 65_00_00_000, status: "in-progress", progress: 44, startDate: "2025-06-01", expectedCompletion: "2027-03-31" },
      { id: "ND-WATER-01", title: "Yamuna Floodplain Sewage Interception", description: "Trunk sewer upgrades along central Delhi wards.", department: "Jal Shakti", budget: 28_00_00_000, status: "planned", progress: 15, startDate: "2026-04-01", expectedCompletion: "2028-06-30" },
    ],
  },
  {
    id: "bangalore-south",
    name: "Bangalore South",
    state: "Karnataka",
    district: "Bengaluru Urban",
    population: "22.8 lakh",
    mpName: "Tejasvi Surya",
    mpParty: "BJP",
    summary: "Silicon Valley of India — traffic decongestion and lake restoration.",
    projects: [
      { id: "BS-METRO-01", title: "Namma Metro Purple Line Extension", description: "Jayanagar to Electronic City connectivity.", department: "MoHUA", budget: 980_00_00_000, status: "in-progress", progress: 62, startDate: "2024-09-01", expectedCompletion: "2027-12-31" },
      { id: "BS-LAKE-01", title: "Bellandur Lake Remediation Phase II", description: "Desilting, STP upgrades, and biodiversity buffer.", department: "MoEFCC", budget: 42_00_00_000, status: "in-progress", progress: 38, startDate: "2025-05-01", expectedCompletion: "2027-06-30" },
    ],
  },
  {
    id: "chennai-central",
    name: "Chennai Central",
    state: "Tamil Nadu",
    district: "Chennai",
    population: "19.4 lakh",
    mpName: "Dayanidhi Maran",
    mpParty: "DMK",
    summary: "Historic port city seat — flood resilience and public transport.",
    projects: [
      { id: "CC-FLOOD-01", title: "Royapuram Stormwater Network", description: "Micro-tunnel drains and pump stations for monsoon flooding.", department: "MoHUA", budget: 55_00_00_000, status: "in-progress", progress: 51, startDate: "2025-03-01", expectedCompletion: "2027-01-31" },
      { id: "CC-HEALTH-01", title: "Central Chennai PHC Upgrade", description: "Dialysis unit and maternal care expansion.", department: "MoHFW", budget: 12_00_00_000, status: "completed", progress: 100, startDate: "2025-01-01", expectedCompletion: "2026-02-28" },
    ],
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    state: "Telangana",
    district: "Hyderabad",
    population: "24.1 lakh",
    mpName: "Asaduddin Owaisi",
    mpParty: "AIMIM",
    summary: "Deccan metropolis — Old City heritage and IT corridor infrastructure.",
    projects: [
      { id: "HY-METRO-01", title: "Metro Blue Line Old City Stations", description: "Charminar area stations with heritage-sensitive design.", department: "MoHUA", budget: 720_00_00_000, status: "in-progress", progress: 47, startDate: "2025-02-01", expectedCompletion: "2028-03-31" },
      { id: "HY-SKILL-01", title: "T-Hub Skill Centre Expansion", description: "Startup incubation and youth employment programmes.", department: "MoSJE", budget: 18_00_00_000, status: "in-progress", progress: 72, startDate: "2025-04-01", expectedCompletion: "2026-09-30" },
    ],
  },
  {
    id: "kolkata-south",
    name: "Kolkata South",
    state: "West Bengal",
    district: "Kolkata",
    population: "18.7 lakh",
    mpName: "Mala Roy",
    mpParty: "AITC",
    summary: "Cultural capital seat — tram-modernisation and riverfront development.",
    projects: [
      { id: "KS-TRAM-01", title: "Tram Corridor Modernisation", description: "Heritage tram routes with electric fleet and accessibility.", department: "MoRTH", budget: 38_00_00_000, status: "in-progress", progress: 33, startDate: "2025-07-01", expectedCompletion: "2027-12-31" },
      { id: "KS-RIVER-01", title: "Hooghly Riverfront Walkway", description: "Embankment lighting, ghats, and public recreation zones.", department: "MoHUA", budget: 25_00_00_000, status: "planned", progress: 18, startDate: "2026-01-01", expectedCompletion: "2028-06-30" },
    ],
  },
  {
    id: "ahmedabad-east",
    name: "Ahmedabad East",
    state: "Gujarat",
    district: "Ahmedabad",
    population: "21.3 lakh",
    mpName: "Hasmukh Patel",
    mpParty: "BJP",
    summary: "Industrial and textile hub — air quality and MSME cluster roads.",
    projects: [
      { id: "AE-AIR-01", title: "Industrial Zone Air Monitoring", description: "Real-time emission sensors across Naroda and Vatva.", department: "MoEFCC", budget: 8_00_00_000, status: "completed", progress: 100, startDate: "2025-02-01", expectedCompletion: "2025-11-30" },
      { id: "AE-ROAD-01", title: "Ring Road East Connectivity", description: "Freight corridor linking MSME clusters to NH-48.", department: "MoRTH", budget: 95_00_00_000, status: "in-progress", progress: 58, startDate: "2025-05-01", expectedCompletion: "2027-08-31" },
    ],
  },
  {
    id: "lucknow",
    name: "Lucknow",
    state: "Uttar Pradesh",
    district: "Lucknow",
    population: "28.9 lakh",
    mpName: "Rajnath Singh",
    mpParty: "BJP",
    summary: "State capital seat — urban drainage and heritage tourism corridors.",
    projects: [
      { id: "LK-DRAIN-01", title: "Gomti River Embankment Drainage", description: "Flood mitigation and sewage diversion along central wards.", department: "Jal Shakti", budget: 48_00_00_000, status: "in-progress", progress: 41, startDate: "2025-06-01", expectedCompletion: "2027-03-31" },
      { id: "LK-TOUR-01", title: "Hazratganj Heritage Walk", description: "Pedestrian plaza, signage, and civic lighting upgrade.", department: "MoT", budget: 14_00_00_000, status: "in-progress", progress: 66, startDate: "2025-03-01", expectedCompletion: "2026-08-31" },
    ],
  },
  {
    id: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    district: "Jaipur",
    population: "30.7 lakh",
    mpName: "Manju Sharma",
    mpParty: "BJP",
    summary: "Pink City seat — water security and UNESCO heritage conservation.",
    projects: [
      { id: "JP-WATER-01", title: "Amanishah Nallah Rejuvenation", description: "Stormwater channel restoration and park development.", department: "Jal Shakti", budget: 32_00_00_000, status: "in-progress", progress: 54, startDate: "2025-04-01", expectedCompletion: "2027-01-31" },
      { id: "JP-HERITAGE-01", title: "Walled City Infrastructure", description: "Underground utilities and tourist safety upgrades.", department: "MoT / ASI", budget: 22_00_00_000, status: "in-progress", progress: 49, startDate: "2025-01-01", expectedCompletion: "2026-12-31" },
    ],
  },
  {
    id: "bhopal",
    name: "Bhopal",
    state: "Madhya Pradesh",
    district: "Bhopal",
    population: "17.9 lakh",
    mpName: "Alok Sharma",
    mpParty: "BJP",
    summary: "Lake City seat — Upper Lake conservation and smart mobility.",
    projects: [
      { id: "BP-LAKE-01", title: "Upper Lake Catchment Restoration", description: "Wetland buffers and pollution interception.", department: "MoEFCC", budget: 26_00_00_000, status: "in-progress", progress: 45, startDate: "2025-05-01", expectedCompletion: "2027-06-30" },
      { id: "BP-BUS-01", title: "BRTS Corridor Extension", description: "Electric bus rapid transit to new townships.", department: "MoHUA", budget: 58_00_00_000, status: "planned", progress: 22, startDate: "2026-02-01", expectedCompletion: "2028-12-31" },
    ],
  },
  {
    id: "patna-sahib",
    name: "Patna Sahib",
    state: "Bihar",
    district: "Patna",
    population: "20.5 lakh",
    mpName: "Ravi Shankar Prasad",
    mpParty: "BJP",
    summary: "Historic Ganga-side seat — river ghats and rural connectivity.",
    projects: [
      { id: "PS-GANGA-01", title: "Ganga Ghat Modernisation", description: "Flood-resilient ghats, lighting, and sanitation.", department: "Jal Shakti", budget: 35_00_00_000, status: "in-progress", progress: 52, startDate: "2025-03-01", expectedCompletion: "2027-02-28" },
      { id: "PS-ROAD-01", title: "Rural Link Roads — 32 Villages", description: "PMGSY-allied all-weather roads to Patna markets.", department: "MoRD", budget: 28_00_00_000, status: "in-progress", progress: 61, startDate: "2025-06-01", expectedCompletion: "2026-11-30" },
    ],
  },
  {
    id: "ernakulam",
    name: "Ernakulam",
    state: "Kerala",
    district: "Ernakulam",
    population: "16.8 lakh",
    mpName: "Hibi Eden",
    mpParty: "INC",
    summary: "Port and backwater seat — coastal roads and fisherfolk welfare.",
    projects: [
      { id: "EK-COAST-01", title: "Coastal Road Resilience", description: "Sea-wall reinforcement and evacuation routes.", department: "MoRTH", budget: 42_00_00_000, status: "in-progress", progress: 48, startDate: "2025-04-01", expectedCompletion: "2027-05-31" },
      { id: "EK-FISH-01", title: "Harbour Cold Chain Facility", description: "Fish auction hall and refrigerated storage for exports.", department: "MoFAHD", budget: 16_00_00_000, status: "completed", progress: 100, startDate: "2025-01-01", expectedCompletion: "2026-01-31" },
    ],
  },
  {
    id: "guwahati",
    name: "Guwahati",
    state: "Assam",
    district: "Kamrup Metropolitan",
    population: "11.2 lakh",
    mpName: "Bijuli Kalita Medhi",
    mpParty: "BJP",
    summary: "North-East gateway seat — Brahmaputra embankments and hill connectivity.",
    projects: [
      { id: "GW-BRAH-01", title: "Brahmaputra Embankment Strengthening", description: "Erosion control and flood early-warning systems.", department: "Jal Shakti", budget: 52_00_00_000, status: "in-progress", progress: 39, startDate: "2025-05-01", expectedCompletion: "2027-08-31" },
      { id: "GW-HILL-01", title: "Hill Road Safety Programme", description: "Guard rails and landslide mitigation on NH-27 approach.", department: "MoRTH", budget: 24_00_00_000, status: "in-progress", progress: 55, startDate: "2025-02-01", expectedCompletion: "2026-10-31" },
    ],
  },
  {
    id: "amritsar",
    name: "Amritsar",
    state: "Punjab",
    district: "Amritsar",
    population: "13.6 lakh",
    mpName: "Gurjeet Singh Aujla",
    mpParty: "INC",
    summary: "Border pilgrimage seat — Golden Temple precinct and farm-to-market roads.",
    projects: [
      { id: "AM-PILG-01", title: "Heritage Corridor Expansion", description: "Pedestrian zones and sanitation around sacred precinct.", department: "MoT", budget: 38_00_00_000, status: "in-progress", progress: 67, startDate: "2025-01-01", expectedCompletion: "2026-09-30" },
      { id: "AM-AGRI-01", title: "Farm-to-Market Cold Storage", description: "Mandi-linked cold chain for potato and wheat growers.", department: "MoAFW", budget: 19_00_00_000, status: "in-progress", progress: 58, startDate: "2025-04-01", expectedCompletion: "2027-03-31" },
    ],
  },
];

/** Keeps mpName/mpParty aligned with lokSabhaRoster.ts (18th Lok Sabha, 2024). */
function withRosterMp(c: Constituency): Constituency {
  const mp = getLokSabhaMp(c.id);
  return mp ? { ...c, mpName: mp.name, mpParty: mp.party } : c;
}

export const CONSTITUENCIES: Constituency[] = RAW_CONSTITUENCIES.map(withRosterMp);

export function getConstituencyById(id: string): Constituency | undefined {
  return CONSTITUENCIES.find((c) => c.id === id);
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: "Planned",
  "in-progress": "In Progress",
  completed: "Completed",
  delayed: "Delayed",
};