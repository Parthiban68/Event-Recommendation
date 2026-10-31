import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { z } from "zod";
import { addUtcDays } from "../src/utils/date";
import { isHttpUrl } from "../src/utils/url";

const prisma = new PrismaClient();

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const seedEventSchema = z
  .object({
    title: z.string().trim().min(5).max(160),
    summary: z.string().trim().min(10).max(300).optional(),
    description: z.string().trim().min(30),
    category: z.string().trim().min(2).max(60),
    requiredSkills: z.array(z.string().trim().min(1)).min(1),
    interests: z.array(z.string().trim().min(1)).min(1),
    daysFromNow: z.number().int().min(0).max(365).optional(),
    startTime: z.string().regex(timePattern, "startTime must use HH:MM").optional(),
    endTime: z
      .string()
      .regex(timePattern, "endTime must use HH:MM")
      .optional(),
    timezone: z.string().trim().min(1).max(64).default("UTC"),
    location: z.string().trim().min(2).max(160).optional(),
    isOnline: z.boolean().default(false),
    bannerUrl: z
      .string()
      .trim()
      .refine(isHttpUrl, "bannerUrl must be a valid http(s) URL")
      .optional(),
    registrationUrl: z
      .string()
      .trim()
      .refine(isHttpUrl, "registrationUrl must be a valid http(s) URL")
      .optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  })
  .refine(
    (event) => !event.endTime || !event.startTime || event.endTime > event.startTime,
    "endTime must be after startTime",
  );

type SeedEventInput = z.input<typeof seedEventSchema>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function makeSummary(description: string): string {
  const firstSentence = description.split(/(?<=[.!?])\s/)[0] ?? description;
  return firstSentence.slice(0, 240);
}

const rawEvents: SeedEventInput[] = [
  {
    title: "React 19 Deep Dive: Server Components in Practice",
    description:
      "A hands-on session on React 19 features, server components, transitions and pragmatic patterns for shipping modern React interfaces. Includes a live refactor of a data-heavy dashboard.",
    category: "Frontend",
    requiredSkills: ["React.js", "TypeScript"],
    interests: ["React.js", "TypeScript", "Frontend"],
    daysFromNow: 6,
    startTime: "18:00",
    endTime: "20:30",
    location: "Online",
    isOnline: true,
    registrationUrl: "https://react.dev/community",
  },
  {
    title: "Next.js Production Patterns: App Router, Caching & Performance",
    description:
      "Practical guidance for running Next.js in production: App Router boundaries, caching layers, streaming, image optimisation and measuring Core Web Vitals at scale.",
    category: "Frontend",
    requiredSkills: ["Next.js", "React.js", "TypeScript"],
    interests: ["Next.js", "React.js", "Full Stack"],
    daysFromNow: 14,
    startTime: "17:30",
    endTime: "20:00",
    location: "Online",
    isOnline: true,
    registrationUrl: "https://nextjs.org/events",
  },
  {
    title: "Node.js at Scale: Event Loop, Streams & Performance",
    description:
      "Understand the Node.js event loop, backpressure, worker threads and streaming APIs through production case studies. Learn how to diagnose latency spikes and memory pressure.",
    category: "Backend",
    requiredSkills: ["Node.js", "Express.js", "PostgreSQL"],
    interests: ["Node.js", "Express.js", "Backend"],
    daysFromNow: 9,
    startTime: "10:00",
    endTime: "17:00",
    location: "Bengaluru, Karnataka - NIMHANS Convention Centre",
    isOnline: false,
    registrationUrl: "https://nodejs.org/en/about/events",
  },
  {
    title: "Building Resilient REST APIs with Express.js",
    description:
      "Design production-grade Express APIs with validation, centralised error handling, authentication boundaries, rate limiting and observable request pipelines.",
    category: "Backend",
    requiredSkills: ["Express.js", "Node.js", "PostgreSQL"],
    interests: ["Express.js", "Node.js", "PostgreSQL", "Backend"],
    daysFromNow: 22,
    startTime: "18:00",
    endTime: "21:00",
    location: "Online",
    isOnline: true,
    registrationUrl: "https://expressjs.com/en/resources/community.html",
  },
  {
    title: "NestJS Architecture: Modules, Guards & Microservices",
    description:
      "Explore scalable NestJS architecture, dependency injection, guards, interceptors and how to split a modular monolith into well-bounded services without losing developer velocity.",
    category: "Backend",
    requiredSkills: ["NestJS", "TypeScript", "Node.js"],
    interests: ["NestJS", "Node.js", "Backend"],
    daysFromNow: 34,
    startTime: "11:00",
    endTime: "18:00",
    location: "Hyderabad, Telangana - T-Hub",
    isOnline: false,
    registrationUrl: "https://nestjs.com/events",
  },
  {
    title: "PostgreSQL Performance Tuning Workshop",
    description:
      "A practical workshop on query plans, indexes, statistics, connection pooling and schema design. Bring a slow query and leave with a repeatable tuning checklist.",
    category: "Database",
    requiredSkills: ["PostgreSQL", "System Design"],
    interests: ["PostgreSQL", "Database", "System Design"],
    daysFromNow: 18,
    startTime: "09:30",
    endTime: "16:30",
    location: "Online",
    isOnline: true,
    registrationUrl: "https://www.postgresql.org/about/events/",
  },
  {
    title: "MongoDB Data Modeling for Modern Applications",
    description:
      "Learn document modelling patterns, aggregation pipelines and indexing strategies for MongoDB. Compare access patterns and trade-offs with relational modelling.",
    category: "Database",
    requiredSkills: ["MongoDB", "Node.js"],
    interests: ["MongoDB", "Database", "Node.js"],
    daysFromNow: 45,
    startTime: "14:00",
    endTime: "18:00",
    location: "Pune, Maharashtra - Ritz-Carlton Ballroom",
    isOnline: false,
    registrationUrl: "https://www.mongodb.com/events",
  },
  {
    title: "Full Stack TypeScript: React, Node & PostgreSQL",
    description:
      "Build an end-to-end TypeScript application with shared types, Prisma, React and Node. Covers project structure, validation, testing and deployment fundamentals.",
    category: "Full Stack",
    requiredSkills: ["TypeScript", "React.js", "Node.js", "PostgreSQL"],
    interests: [
      "Full Stack",
      "TypeScript",
      "React.js",
      "PostgreSQL",
    ],
    daysFromNow: 25,
    startTime: "10:00",
    endTime: "17:00",
    location: "Online",
    isOnline: true,
    registrationUrl: "https://www.typescriptlang.org/community/",
  },
  {
    title: "AI-Powered Product Development with LLMs",
    description:
      "From prompt design to evaluation, guardrails and cost control: a product-focused tour of building reliable LLM features with Python and modern AI tooling.",
    category: "AI & ML",
    requiredSkills: ["Python", "AI/ML"],
    interests: ["AI/ML", "Python", "Full Stack"],
    daysFromNow: 38,
    startTime: "18:30",
    endTime: "20:30",
    location: "Online",
    isOnline: true,
    registrationUrl: "https://www.deeplearning.ai/events/",
  },
  {
    title: "Machine Learning in Production: MLOps Foundations",
    description:
      "A full-day exploration of model packaging, reproducible training, deployment pipelines, monitoring and drift detection on AWS with containerised workloads.",
    category: "AI & ML",
    requiredSkills: ["Python", "AWS", "Docker"],
    interests: ["AI/ML", "Python", "AWS", "DevOps"],
    daysFromNow: 60,
    startTime: "10:00",
    endTime: "18:00",
    location: "Bengaluru, Karnataka - AWS Builder Loft",
    isOnline: false,
    registrationUrl: "https://aws.amazon.com/events/",
  },
  {
    title: "AWS Cloud Foundations: IAM, VPC & Well-Architected",
    description:
      "A practical introduction to AWS identity, networking and the Well-Architected Framework. Learn the decisions that keep cloud workloads secure and cost-effective.",
    category: "Cloud Computing",
    requiredSkills: ["AWS", "System Design"],
    interests: ["AWS", "Cloud Computing", "DevOps"],
    daysFromNow: 4,
    startTime: "11:00",
    endTime: "15:00",
    location: "Online",
    isOnline: true,
    registrationUrl: "https://aws.amazon.com/events/",
  },
  {
    title: "Docker & Kubernetes for Application Developers",
    description:
      "Containerise an application, design health checks and deploy to Kubernetes. Covers local development workflows, resource limits and debugging in-cluster.",
    category: "DevOps",
    requiredSkills: ["Docker", "AWS", "Node.js"],
    interests: ["Docker", "DevOps", "AWS", "Node.js"],
    daysFromNow: 30,
    startTime: "09:00",
    endTime: "17:00",
    location: "Mumbai, Maharashtra - Jio World Convention Centre",
    isOnline: false,
    registrationUrl: "https://www.docker.com/events/",
  },
  {
    title: "CI/CD with GitHub Actions and Docker",
    description:
      "Build secure, fast delivery pipelines with GitHub Actions, reusable workflows, container builds, environment protection and automated deployment gates.",
    category: "DevOps",
    requiredSkills: ["Docker", "Node.js"],
    interests: ["DevOps", "Docker", "Node.js"],
    daysFromNow: 52,
    startTime: "18:00",
    endTime: "20:00",
    location: "Online",
    isOnline: true,
    registrationUrl: "https://github.com/features/actions",
  },
  {
    title: "System Design Interview Masterclass",
    description:
      "Work through real system design scenarios: capacity estimation, API design, data storage, caching, queues and failure handling. Includes live mock interview feedback.",
    category: "System Design",
    requiredSkills: ["System Design", "PostgreSQL"],
    interests: ["System Design", "PostgreSQL", "Backend"],
    daysFromNow: 3,
    startTime: "19:00",
    endTime: "21:30",
    location: "Online",
    isOnline: true,
    registrationUrl: "https://dev.events/",
  },
  {
    title: "Scaling Event-Driven Systems with Node.js & Kafka",
    description:
      "Understand partitioning, consumer groups, idempotency and schema evolution when building event-driven Node.js services that must survive real production traffic.",
    category: "Backend",
    requiredSkills: ["Node.js", "System Design", "Docker"],
    interests: ["Node.js", "System Design", "Backend", "DevOps"],
    daysFromNow: 65,
    startTime: "10:00",
    endTime: "17:00",
    location: "Bengaluru, Karnataka - Prestige Tech Park",
    isOnline: false,
    registrationUrl: "https://nodejs.org/en/about/events",
  },
  {
    title: "Prisma & PostgreSQL: Type-Safe Data Access",
    description:
      "Model a relational schema with Prisma, generate type-safe clients and handle migrations safely. Includes query optimisation and testing strategies for data layers.",
    category: "Full Stack",
    requiredSkills: ["PostgreSQL", "TypeScript", "Node.js"],
    interests: ["PostgreSQL", "TypeScript", "Node.js", "Full Stack"],
    daysFromNow: 20,
    startTime: "16:00",
    endTime: "19:00",
    location: "Online",
    isOnline: true,
    registrationUrl: "https://www.prisma.io/events",
  },
  {
    title: "Modern Data Fetching with React Query",
    description:
      "Move beyond useEffect-based fetching. Learn caching, background refetching, optimistic updates and error boundaries for resilient React data flows.",
    category: "Frontend",
    requiredSkills: ["React.js", "TypeScript"],
    interests: ["React.js", "TypeScript", "Frontend"],
    daysFromNow: 40,
    startTime: "18:00",
    endTime: "20:00",
    location: "New Delhi - India Habitat Centre",
    isOnline: false,
    registrationUrl: "https://react.dev/community",
  },
  {
    title: "Next.js + AI: Building Intelligent Web Apps",
    description:
      "Combine Next.js App Router with AI SDKs to build streaming, context-aware interfaces. Covers latency budgets, tool calling and safe server-side API integration.",
    category: "Full Stack",
    requiredSkills: ["Next.js", "React.js", "AI/ML"],
    interests: ["Next.js", "AI/ML", "React.js", "Full Stack"],
    daysFromNow: 55,
    startTime: "17:00",
    endTime: "20:00",
    location: "Online",
    isOnline: true,
    registrationUrl: "https://nextjs.org/events",
  },
  {
    title: "Serverless APIs with Node.js & AWS Lambda",
    description:
      "Design serverless APIs with Node.js, Lambda, API Gateway and DynamoDB. Discuss cold starts, observability, cost models and when serverless is the wrong choice.",
    category: "Cloud Computing",
    requiredSkills: ["Node.js", "AWS"],
    interests: ["AWS", "Node.js", "Cloud Computing", "Backend"],
    daysFromNow: 75,
    startTime: "11:00",
    endTime: "14:00",
    location: "Online",
    isOnline: true,
    registrationUrl: "https://aws.amazon.com/events/",
  },
  {
    title: "Observability for Distributed Systems",
    description:
      "A practitioner-led day on metrics, logs, traces and service level objectives. Learn how to instrument distributed services and turn telemetry into faster incident resolution.",
    category: "DevOps",
    requiredSkills: ["Docker", "System Design", "AWS"],
    interests: ["DevOps", "System Design", "AWS", "Cloud Computing"],
    daysFromNow: 88,
    startTime: "09:30",
    endTime: "17:30",
    location: "Hyderabad, Telangana - HITEC City Convention Centre",
    isOnline: false,
    registrationUrl: "https://www.cncf.io/events/",
  },
  {
    title: "GraphQL Federation for Large Teams",
    summary: "Draft outline for a federation migration workshop.",
    description:
      "A planned workshop on splitting a monolithic GraphQL schema into federated subgraphs, covering gateway composition, entity references, schema checks and rollout strategy for large engineering organisations.",
    category: "Backend",
    requiredSkills: ["Node.js", "System Design"],
    interests: ["Backend", "System Design"],
    status: "DRAFT",
  },
  {
    title: "Advanced React Performance Lab",
    summary: "Draft lab on profiling and rendering performance.",
    description:
      "An interactive lab exploring React profiler workflows, memoisation trade-offs, concurrent rendering, list virtualisation and measuring real user performance before and after optimisation.",
    category: "Frontend",
    requiredSkills: ["React.js", "TypeScript"],
    interests: ["React.js", "Frontend"],
    status: "DRAFT",
  },
  {
    title: "Kubernetes Security Deep Dive",
    summary: "Draft session on hardening Kubernetes workloads.",
    description:
      "A planned deep dive into Kubernetes security: workload identity, network policies, admission control, secret management, runtime detection and practical hardening checklists for production clusters.",
    category: "DevOps",
    requiredSkills: ["Docker", "AWS"],
    interests: ["DevOps", "Docker", "AWS"],
    status: "DRAFT",
  },
  {
    title: "Data Engineering with PostgreSQL",
    summary: "Draft workshop on analytical workloads in PostgreSQL.",
    description:
      "A planned workshop covering ingestion patterns, partitioning, indexing for analytics, incremental transforms and when to move analytical workloads from PostgreSQL to a dedicated warehouse.",
    category: "Database",
    requiredSkills: ["PostgreSQL", "Python"],
    interests: ["PostgreSQL", "Database"],
    status: "DRAFT",
  },
];

const seedAdminSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(12, "SEED_ADMIN_PASSWORD must be at least 12 characters")
    .max(200),
});

async function main(): Promise<void> {
  const events = z.array(seedEventSchema).length(24).parse(rawEvents);
  const isProduction = process.env.NODE_ENV === "production";

  const seedAdmin = seedAdminSchema.parse({
    name: process.env.SEED_ADMIN_NAME ?? "EventHub Admin",
    email: process.env.SEED_ADMIN_EMAIL ?? "admin@eventhub.dev",
    password:
      process.env.SEED_ADMIN_PASSWORD ??
      (isProduction
        ? ""
        : "Admin@12345!"),
  });

  const passwordHash = await bcrypt.hash(seedAdmin.password, 12);
  const admin = await prisma.admin.upsert({
    where: { email: seedAdmin.email },
    update: { name: seedAdmin.name, isActive: true },
    create: {
      name: seedAdmin.name,
      email: seedAdmin.email,
      passwordHash,
    },
  });

  const today = new Date();

  for (const seedEvent of events) {
    const eventDate =
      seedEvent.daysFromNow === undefined
        ? null
        : addUtcDays(today, seedEvent.daysFromNow);
    const data = {
      title: seedEvent.title,
      seedKey: slugify(seedEvent.title),
      summary: seedEvent.summary ?? makeSummary(seedEvent.description),
      description: seedEvent.description,
      category: seedEvent.category,
      requiredSkills: seedEvent.requiredSkills,
      interests: seedEvent.interests,
      bannerUrl: seedEvent.bannerUrl ?? null,
      eventDate,
      startTime: seedEvent.startTime ?? "",
      endTime: seedEvent.endTime ?? null,
      timezone: seedEvent.timezone,
      location: seedEvent.location ?? "",
      isOnline: seedEvent.isOnline,
      registrationUrl: seedEvent.registrationUrl ?? "",
      status: seedEvent.status,
      createdById: admin.id,
    };

    await prisma.event.upsert({
      where: { title: seedEvent.title },
      update: data,
      create: data,
    });
  }

  const [total, published, draft] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.event.count({ where: { status: "DRAFT" } }),
  ]);

  console.log(
    `Seed complete: ${events.length} events upserted (${total} total, ${published} published, ${draft} draft)`,
  );
  console.log(`Admin ready: ${admin.email}`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
