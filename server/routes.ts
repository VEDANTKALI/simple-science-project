import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

// Set up OpenAI client using Replit AI Integrations
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Seed initial data if DB is empty
  async function seedDatabase() {
    try {
      const existingItems = await storage.getExplanations();
      if (existingItems.length === 0) {
        await storage.createExplanation({ 
          originalText: "E=mc^2 indicates that the increased relativistic mass (m) of a body comes from the energy of motion of the body—that is, its kinetic energy (E)—divided by the speed of light squared (c^2).", 
          simplifiedText: "Energy and mass are the same thing, just in different forms. If you have a little bit of mass, it can be turned into a huge amount of energy, and vice versa." 
        });
        await storage.createExplanation({ 
          originalText: "In the event of a default under the terms of this Agreement, the non-defaulting party shall have the right to terminate this Agreement immediately upon written notice to the defaulting party, without prejudice to any other rights or remedies available at law or in equity.", 
          simplifiedText: "If someone breaks the rules of this contract, the other person can end the contract right away by sending a letter. They can also still take legal action if they want to." 
        });
      }
    } catch (e) {
      console.error("Failed to seed database:", e);
    }
  }
  
  // Start seeding in background
  seedDatabase();

  app.get(api.explanations.list.path, async (req, res) => {
    try {
      const allExplanations = await storage.getExplanations();
      res.json(allExplanations);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch explanations" });
    }
  });

  app.post(api.explanations.simplify.path, async (req, res) => {
    try {
      const input = api.explanations.simplify.input.parse(req.body);
      
      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { 
            role: "system", 
            content: "You are an expert at explaining complex concepts to 5-year-olds. Take the user's complex text (which might be science, legal, technical, etc.) and rewrite it so a child can easily understand it. Use simple words, short sentences, and everyday analogies. Keep it brief and directly explain the core concept." 
          },
          { 
            role: "user", 
            content: input.text 
          }
        ],
        temperature: 1, // Parameter restricted to 1 by guidelines
      });
      
      const simplifiedText = response.choices[0]?.message?.content || "Sorry, I couldn't simplify that text.";
      
      // Save to database
      const explanation = await storage.createExplanation({
        originalText: input.text,
        simplifiedText,
      });

      res.status(200).json({
        originalText: explanation.originalText,
        simplifiedText: explanation.simplifiedText
      });
      
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message || "Validation failed",
          field: err.errors[0]?.path.join('.'),
        });
      }
      
      console.error("Simplification error:", err);
      res.status(500).json({ message: "An error occurred while simplifying the text." });
    }
  });

  return httpServer;
}
