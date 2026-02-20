import { db } from "./db";
import { explanations, type InsertExplanation, type Explanation } from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  getExplanations(): Promise<Explanation[]>;
  createExplanation(explanation: InsertExplanation): Promise<Explanation>;
}

export class DatabaseStorage implements IStorage {
  async getExplanations(): Promise<Explanation[]> {
    return await db.select().from(explanations).orderBy(desc(explanations.createdAt));
  }

  async createExplanation(insertExplanation: InsertExplanation): Promise<Explanation> {
    const [explanation] = await db
      .insert(explanations)
      .values(insertExplanation)
      .returning();
    return explanation;
  }
}

export const storage = new DatabaseStorage();
