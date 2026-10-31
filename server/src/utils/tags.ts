export const SUPPORTED_TAGS = [
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

export type SupportedTag = (typeof SUPPORTED_TAGS)[number];

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

const aliasEntries: Array<[string, SupportedTag]> = [
  ["react", "React.js"],
  ["reactjs", "React.js"],
  ["react.js", "React.js"],
  ["react js", "React.js"],
  ["next", "Next.js"],
  ["nextjs", "Next.js"],
  ["next.js", "Next.js"],
  ["next js", "Next.js"],
  ["node", "Node.js"],
  ["nodejs", "Node.js"],
  ["node.js", "Node.js"],
  ["node js", "Node.js"],
  ["node.js backend", "Node.js"],
  ["node backend", "Node.js"],
  ["express", "Express.js"],
  ["expressjs", "Express.js"],
  ["express.js", "Express.js"],
  ["express js", "Express.js"],
  ["nest", "NestJS"],
  ["nestjs", "NestJS"],
  ["nest.js", "NestJS"],
  ["typescript", "TypeScript"],
  ["ts", "TypeScript"],
  ["postgres", "PostgreSQL"],
  ["postgresql", "PostgreSQL"],
  ["mongo", "MongoDB"],
  ["mongodb", "MongoDB"],
  ["python", "Python"],
  ["ai", "AI/ML"],
  ["ml", "AI/ML"],
  ["ai/ml", "AI/ML"],
  ["ai & ml", "AI/ML"],
  ["ai and ml", "AI/ML"],
  ["artificial intelligence", "AI/ML"],
  ["machine learning", "AI/ML"],
  ["aws", "AWS"],
  ["amazon web services", "AWS"],
  ["docker", "Docker"],
  ["system design", "System Design"],
  ["system-design", "System Design"],
];

const aliasMap = new Map<string, SupportedTag>(aliasEntries);

for (const tag of SUPPORTED_TAGS) {
  aliasMap.set(normalizeKey(tag), tag);
}

export function canonicalizeTag(value: string): string {
  return aliasMap.get(normalizeKey(value)) ?? value.trim().replace(/\s+/g, " ");
}

export function isSupportedTag(value: string): value is SupportedTag {
  return (SUPPORTED_TAGS as readonly string[]).includes(value);
}

export function tagKey(value: string): string {
  return normalizeKey(canonicalizeTag(value));
}

export function uniqueByTag<T>(
  values: T[],
  getTag: (value: T) => string,
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const value of values) {
    const key = tagKey(getTag(value));
    if (!seen.has(key)) {
      seen.add(key);
      result.push(value);
    }
  }

  return result;
}

export function formatList(values: string[]): string {
  if (values.length === 0) return "";
  if (values.length === 1) return values[0]!;
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}
