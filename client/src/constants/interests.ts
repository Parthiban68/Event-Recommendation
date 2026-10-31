export const TECHNOLOGY_TAGS = [
  "React.js",
  "Next.js",
  "Node.js",
  "Express.js",
  "NestJS",
  "TypeScript",
  "PostgreSQL",
  "MongoDB",
  "Python",
  "AI/ML",
  "AWS",
  "Docker",
  "System Design",
] as const;

export type TechnologyTag = (typeof TECHNOLOGY_TAGS)[number];

export const CATEGORIES = [
  "Frontend",
  "Backend",
  "Full Stack",
  "Database",
  "AI & ML",
  "Cloud Computing",
  "DevOps",
  "System Design",
] as const;

export const SAMPLE_PROFILE = {
  skills: ["Node.js", "Express.js", "TypeScript"],
  interests: ["React.js", "PostgreSQL"],
};

export const EMPTY_FILTERS = {
  search: "",
  category: "",
  technology: "",
  format: "all",
  dateFrom: "",
  dateTo: "",
} as const;
