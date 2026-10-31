import "dotenv/config";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL ||=
  "postgresql://test:test@localhost:5432/recommended_events_test";
process.env.CLIENT_ORIGIN ||= "http://localhost:5173";
