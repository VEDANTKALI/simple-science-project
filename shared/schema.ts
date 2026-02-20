import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const explanations = pgTable("explanations", {
  id: serial("id").primaryKey(),
  originalText: text("original_text").notNull(),
  simplifiedText: text("simplified_text").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertExplanationSchema = createInsertSchema(explanations).omit({
  id: true,
  createdAt: true,
});

export type Explanation = typeof explanations.$inferSelect;
export type InsertExplanation = z.infer<typeof insertExplanationSchema>;

// API Request Types
export type SimplifyRequest = {
  text: string;
};

// Response Types
export type SimplifyResponse = {
  originalText: string;
  simplifiedText: string;
};
