export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  title: string;
  icon: string;
  items: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "portals",
    title: "Portals & Access",
    icon: "🚪",
    items: [
      {
        id: "what-is-proxima",
        question: "What is Proxima Gov?",
        answer:
          "Proxima Gov is a digital governance platform for Lok Sabha constituencies. Citizens can track MPLADS-funded work, submit community issues, and verify completed projects. MPs receive a constituency dashboard for approvals, execution tracking, and accountability.",
      },
      {
        id: "citizen-vs-mp",
        question: "What is the difference between the Citizen Portal and MP Portal?",
        answer:
          "The Citizen Portal is for registered residents: OTP login, issue submission, notifications, and verification. The MP Portal is restricted to Lok Sabha MPs and their authorised staff: username + PIN login, pending approvals, progress photos, and accountability actions. They are separate accounts.",
      },
      {
        id: "wrong-portal-login",
        question: "Why can't I open MP Login while I'm logged in as a citizen?",
        answer:
          "Only one portal session can be active at a time. If you are signed in as a citizen, log out first, then open MP Login. The same applies if an MP tries to access Citizen Login without logging out.",
      },
      {
        id: "mp-credentials",
        question: "Where do MPs get their username and PIN?",
        answer:
          "MP credentials are issued per Lok Sabha constituency seat (demo usernames and PINs for judges and developers are listed in DEVELOPER_MP_CREDENTIALS.md in the project folder). In production, credentials would be provisioned by the platform administrator.",
      },
    ],
  },
  {
    id: "citizens",
    title: "Citizen Registration & Login",
    icon: "📱",
    items: [
      {
        id: "how-register",
        question: "How do I register as a citizen?",
        answer:
          "Go to Citizen Registration, enter your name, email, mobile number, and select your Lok Sabha constituency. Verify your number with the OTP sent to your phone. Once registered, you can log in anytime with OTP — no password needed.",
      },
      {
        id: "otp-demo",
        question: "I didn't receive an OTP. What should I do?",
        answer:
          "In demo mode, the OTP may be shown on screen after you request it (for testing without SMS). In production, OTPs are sent by SMS. Check your mobile number, wait a minute, and try again. Ensure you are registered before logging in.",
      },
      {
        id: "change-constituency",
        question: "Can I change my constituency after registering?",
        answer:
          "Yes. Open Citizen Portal → Profile and use the change constituency form. Your dashboard, issues, and notifications will follow your updated constituency.",
      },
      {
        id: "low-literacy-help",
        question: "Is there help for users who prefer Hindi or need larger text?",
        answer:
          "Yes. Tap the ♿ accessibility button at the bottom-left of every page. See the Accessibility & Language section in these FAQs for full details on Hindi, larger text, high contrast, and read-aloud.",
      },
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility & Language",
    icon: "♿",
    items: [
      {
        id: "a11y-button",
        question: "What is the ♿ button at the bottom-left of the screen?",
        answer:
          "It is the Proxima Gov accessibility button. It stays fixed at the bottom-left on every page (home, citizen portal, MP portal, transparency, and FAQs). Tap it to open the accessibility menu. Tap again or press Escape to close. It is designed for citizens who prefer Hindi, need larger or higher-contrast text, or want the page read aloud.",
      },
      {
        id: "a11y-features",
        question: "What can I do from the accessibility menu?",
        answer:
          "Four options are available: (1) Language — switch between English and हिन्दी; menus, buttons, and page labels update to your choice. (2) Larger text — increases font size across the portal for easier reading. (3) High contrast — switches to a high-contrast black-and-white view. (4) Read page aloud — uses your browser to read the main page content aloud (works best in Hindi when हिन्दी is selected). Toggle any option on or off at any time.",
      },
      {
        id: "a11y-hindi",
        question: "How do I switch the entire portal to Hindi?",
        answer:
          "Open the ♿ menu and tap हिन्दी. The page refreshes with Hindi labels for navigation, forms, dashboards, and FAQs. Your language choice is remembered on this device. Note: issue titles and MP project descriptions from government data may still appear in English; all portal controls and help text are translated.",
      },
      {
        id: "a11y-saved",
        question: "Will the portal remember my accessibility settings?",
        answer:
          "Yes. Your language, larger-text, and high-contrast choices are saved in your browser on this device, so they apply the next time you visit Proxima Gov. Clearing browser data or using a different device or browser will reset them. No account or login is required to use accessibility features.",
      },
    ],
  },
  {
    id: "issues",
    title: "Submitting Issues",
    icon: "📋",
    items: [
      {
        id: "what-to-submit",
        question: "What kind of issues should I submit here?",
        answer:
          "Submit community development problems in your Lok Sabha constituency: roads, water supply, drains, schools, health centres, public safety infrastructure, and similar MPLADS-eligible local work. This is not for personal legal matters, passport/tax queries, or police FIRs.",
      },
      {
        id: "ai-scan",
        question: "What does the AI scan do when I submit an issue?",
        answer:
          "AI runs two checks: (1) jurisdiction — is the issue inside your constituency and within an MP's development mandate? (2) priority — estimated impact, cost, and urgency. Eligible issues are forwarded to your MP. Out-of-scope issues receive an automated explanation and referral guidance.",
      },
      {
        id: "issue-declined",
        question: "Why was my issue marked \"Not Taken Up\" and not sent to my MP?",
        answer:
          "Common reasons: the location is outside your registered constituency; the matter belongs to police, electricity board, or municipal corporation; or it is a personal/central service request (passport, income tax, individual job plea). Check notifications and your issue detail page for the suggested authority to contact instead.",
      },
      {
        id: "issues-vs-grievances",
        question: "What is the difference between Issues and Grievances?",
        answer:
          "Issues enter the full governance lifecycle: AI triage → MP approval → contractor assignment → live progress → citizen verification → impact analysis. Grievances are structured complaints with AI-assisted routing and department responses — a faster feedback channel, not the full MPLADS execution tracker.",
      },
      {
        id: "track-issue",
        question: "How do I track my issue after submission?",
        answer:
          "Open My Issues to see status and stage. Notifications alert you at each step. Activity History provides a full audit trail. Public progress for your constituency is also visible on the Transparency Dashboard.",
      },
    ],
  },
  {
    id: "mp-workflow",
    title: "MP Dashboard & Workflow",
    icon: "🏛️",
    items: [
      {
        id: "pending-approvals-empty",
        question: "Why does Pending Approvals show \"No pending approvals\"?",
        answer:
          "That section lists citizen issues awaiting your decision after AI triage. If no new eligible issues have been submitted in your constituency, the count is zero. Declined or out-of-scope issues never appear here.",
      },
      {
        id: "upload-photos",
        question: "How do I upload progress photos as an MP?",
        answer:
          "Open an in-progress issue from your dashboard. Click Upload Progress Photo or Upload Completion Photo — your device file picker opens. At least one progress photo and one completion photo are required before you can mark work complete and send it for citizen verification.",
      },
      {
        id: "citizen-verification",
        question: "What happens at the citizen verification stage?",
        answer:
          "After work is marked complete, the submitting citizen reviews photos and confirms whether the work is satisfactory. Their feedback moves the issue to MP Review, where you examine evidence and may approve closure, reopen work, escalate an officer, or order re-inspection.",
      },
      {
        id: "mplads-scope",
        question: "What can MPs approve through this portal?",
        answer:
          "MPs can approve constituency development issues funded through MPLADS and related central/local execution channels shown in the lifecycle. They cannot directly resolve state police matters, discom billing, passport services, or issues outside their parliamentary seat.",
      },
    ],
  },
  {
    id: "transparency-data",
    title: "Transparency & Data",
    icon: "🔍",
    items: [
      {
        id: "transparency-public",
        question: "Who can see the Transparency Dashboard?",
        answer:
          "Anyone can view the public Transparency Dashboard — active projects, budgets, and lifecycle stages across constituencies. Personal citizen details are not exposed; issue ownership is visible only to the submitting citizen and the constituency MP.",
      },
      {
        id: "data-storage",
        question: "Where is my data saved?",
        answer:
          "By default, data is stored locally in SQLite for development. When MongoDB Atlas is configured (MONGODB_URI in .env.local), issue history, citizens, and activity logs persist in the cloud. Demo mode without storage resets when the server restarts.",
      },
      {
        id: "history-audit",
        question: "What is Activity History?",
        answer:
          "Citizens see a personal audit trail of registrations, submissions, verifications, and notifications. MPs and administrators can use constituency-level logs for accountability. Entries are timestamped and tied to issue IDs.",
      },
    ],
  },
];

export function getAllFaqs(): FaqItem[] {
  return FAQ_CATEGORIES.flatMap((c) => c.items);
}