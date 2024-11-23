import OpenAI from 'openai';
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

// Define the schema for God's response
const GodResponseSchema = z.object({
  message: z.string(),
  actions: z.array(z.string()),
  affectedEntities: z.array(z.string()).optional(),
  priority: z.string().describe("can be only one of the followings low, medium, high"),
  timestamp: z.date()
});

// Define the schema for Agent's response
const AgentResponseSchema = z.object({
  message: z.string(),
  action: z.string(),
  resources: z.array(z.string()).optional(),
  status: z.string().describe("can be only one of the following idle, working, done")
});

export const generateAgentResponse = async (prompt: string) => {
  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an AI agent in a simulated world. Respond with structured JSON decisions and actions. Your response must be a valid JSON object."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: zodResponseFormat(AgentResponseSchema, "AgentResponse"),
  });

  const content = response.choices[0].message.parsed;
  if (!content) throw new Error("No content in response");
  
  return content.AgentResponse || content;
};

export const generateGodResponse = async (prompt: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are the God AI overseeing a simulated world. Make decisions that affect the world and its inhabitants. Respond with a structured JSON object containing your divine insights."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: zodResponseFormat(GodResponseSchema, "GodResponse"),
  });

  const content = response.choices[0].message.parsed;
  if (!content) throw new Error("No content in response");
  
  return content.GodResponse || content;
};