// ─────────────────────────────────────────────────────────────────────────────
// data/dataGovBaseline.ts
// Mock baseline configuration for the Proxima Gov platform.
// Acts as the single source of truth for project structure, milestones,
// and citizen submission form field definitions.
// ─────────────────────────────────────────────────────────────────────────────

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MilestoneStatus = "not-started" | "in-progress" | "completed" | "delayed";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO 8601 date string
  status: MilestoneStatus;
  department: string;
  budget: number; // in INR (₹)
}

export type FormFieldType = "text" | "email" | "textarea" | "select" | "date";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required: boolean;
  options?: FormFieldOption[]; // for "select" type
}

export interface GovBaseline {
  projectId: string;
  projectName: string;
  ministry: string;
  state: string;
  financialYear: string;
  totalBudget: number; // in INR (₹)
  description: string;
  milestones: Milestone[];
  submissionFormFields: FormField[];
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

export const dataGovBaseline: GovBaseline = {
  projectId: "PG-2026-001",
  projectName: "Proxima Digital Governance Initiative",
  ministry: "Ministry of Electronics and Information Technology",
  state: "India (All States & UTs)",
  financialYear: "2026–27",
  totalBudget: 85_00_00_000, // ₹85 crore
  description:
    "A citizen-first digital governance framework that streamlines public service delivery, " +
    "enables transparent milestone tracking for elected representatives, and leverages AI " +
    "to improve responsiveness across all tiers of government.",

  milestones: [
    {
      id: "MS-001",
      title: "Digital Infrastructure Setup",
      description: "Establish secure cloud infrastructure, VPN tunnels, and data residency compliance.",
      dueDate: "2026-09-30",
      status: "completed",
      department: "IT & Infrastructure",
      budget: 12_00_00_000,
    },
    {
      id: "MS-002",
      title: "Citizen Portal Launch",
      description: "Deploy public-facing citizen submission portal with multilingual support.",
      dueDate: "2026-11-15",
      status: "in-progress",
      department: "Public Affairs",
      budget: 8_50_00_000,
    },
    {
      id: "MS-003",
      title: "AI Grievance Processing Engine",
      description: "Integrate Gemini-powered AI to triage, classify, and route citizen grievances automatically.",
      dueDate: "2027-01-31",
      status: "not-started",
      department: "AI & Analytics",
      budget: 15_00_00_000,
    },
    {
      id: "MS-004",
      title: "MP Dashboard Rollout",
      description: "Deploy real-time milestone tracking dashboard for elected MPs and state legislators.",
      dueDate: "2027-03-15",
      status: "not-started",
      department: "Parliamentary Affairs",
      budget: 5_00_00_000,
    },
    {
      id: "MS-005",
      title: "Audit & Compliance Review",
      description: "Independent third-party audit of all systems, data flows, and expenditure.",
      dueDate: "2027-06-30",
      status: "not-started",
      department: "Finance & Audit",
      budget: 3_50_00_000,
    },
  ],

  submissionFormFields: [
    {
      id: "fullName",
      label: "Full Name",
      type: "text",
      placeholder: "Enter your full name",
      required: true,
    },
    {
      id: "email",
      label: "Email Address",
      type: "email",
      placeholder: "you@example.com",
      required: true,
    },
    {
      id: "constituency",
      label: "Constituency / District",
      type: "select",
      required: true,
      options: [
        { label: "Select your constituency", value: "" },
        { label: "Mumbai South, Maharashtra", value: "mumbai-south" },
        { label: "Pune City, Maharashtra", value: "pune-city" },
        { label: "New Delhi, Delhi", value: "new-delhi" },
        { label: "Bangalore South, Karnataka", value: "bangalore-south" },
        { label: "Chennai Central, Tamil Nadu", value: "chennai-central" },
        { label: "Hyderabad, Telangana", value: "hyderabad" },
        { label: "Kolkata South, West Bengal", value: "kolkata-south" },
        { label: "Ahmedabad East, Gujarat", value: "ahmedabad-east" },
        { label: "Lucknow, Uttar Pradesh", value: "lucknow" },
        { label: "Jaipur, Rajasthan", value: "jaipur" },
        { label: "Bhopal, Madhya Pradesh", value: "bhopal" },
        { label: "Patna Sahib, Bihar", value: "patna-sahib" },
        { label: "Ernakulam, Kerala", value: "ernakulam" },
        { label: "Guwahati, Assam", value: "guwahati" },
        { label: "Amritsar, Punjab", value: "amritsar" },
        { label: "Other", value: "other" },
      ],
    },
    {
      id: "category",
      label: "Issue Category",
      type: "select",
      required: true,
      options: [
        { label: "Select a category", value: "" },
        { label: "Infrastructure & Roads", value: "infrastructure" },
        { label: "Healthcare", value: "healthcare" },
        { label: "Education", value: "education" },
        { label: "Water & Sanitation", value: "water-sanitation" },
        { label: "Employment & Welfare", value: "employment" },
        { label: "Public Safety", value: "safety" },
        { label: "Other", value: "other" },
      ],
    },
    {
      id: "subject",
      label: "Subject",
      type: "text",
      placeholder: "Brief subject of your submission",
      required: true,
    },
    {
      id: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Describe your concern, suggestion, or feedback in detail...",
      required: true,
    },
    {
      id: "submissionDate",
      label: "Preferred Follow-up Date",
      type: "date",
      required: false,
    },
  ],
};
