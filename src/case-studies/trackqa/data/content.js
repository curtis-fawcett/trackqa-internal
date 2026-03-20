export const trackqaContent = {
  title: "TrackQA – Internal QA Management Tool",

  overview:
    "TrackQA is an internal QA management tool built to organize how bugs, tickets, and verification workflows are handled. The goal was to replace scattered communication with a structured, reliable system that improves visibility, accountability, and workflow consistency.",

  problem: [
    "QA issues were often tracked in messages or memory",
    "There was no consistent ticket structure",
    "Ownership could be unclear",
    "Important bugs could be forgotten",
    "Progress visibility was limited",
  ],

  solution: [
    "Built a centralized internal ticket system",
    "Created defined workflow statuses from Open to Closed",
    "Locked key fields after creation to protect ticket history",
    "Used owner dropdowns instead of free text for consistency",
    "Added resolution summaries and QA verification tracking",
  ],

  architecture: [
    "React powers the frontend interface",
    "React Router handles dashboard, ticket, and case study navigation",
    "Local Storage persists ticket and project data",
    "Component-based structure supports future scaling and backend migration",
  ],

  before: [
    "Issues were handled informally",
    "No clear workflow between creation, testing, and verification",
    "Ownership was harder to track",
    "Historical changes were easy to lose",
  ],

  after: [
    "Tickets move through a structured workflow",
    "Ownership is visible at a glance",
    "QA verification appears only when relevant",
    "Timeline history improves traceability and accountability",
  ],

  tech: ["React", "React Router", "Local Storage", "Vite"],

  impact: [
    "Improved clarity around QA workflow",
    "Made ticket status easier to track",
    "Created a more structured internal process",
    "Demonstrated practical frontend architecture and workflow design",
  ],
};