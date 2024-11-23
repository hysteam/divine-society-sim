import OpenAI from 'openai';
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from 'zod';
import { useOpenAIStore } from '@/stores/openAIStore';

let openaiInstance: OpenAI | null = null;

const getOpenAIInstance = () => {
  const apiKey = useOpenAIStore.getState().apiKey;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not set. Please set your API key to use this feature.');
  }

  if (!openaiInstance || openaiInstance.apiKey !== apiKey) {
    openaiInstance = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  return openaiInstance;
};

// Define the schema for God's response
const GodResponseSchema = z.object({
  message: z.string(),
  actions: z.array(z.string()),
  affectedEntities: z.array(z.string()).optional(),
  priority: z.string().describe("can be only one of the followings low, medium, high")
});

// Define the schema for Agent's response
const AgentResponseSchema = z.object({
  message: z.string(),
  action: z.string(),
  resources: z.array(z.string()).optional(),
  status: z.string().describe("can be only one of the following idle, working, done")
});

// Define the schema for Agent's decision
const AgentDecisionSchema = z.object({
  message: z.string(),
  action: z.enum(['move', 'gather', 'build', 'trade', 'explore', 'communicate']),
  target: z.object({
    x: z.number().optional(),
    y: z.number().optional(),
    agentId: z.string().optional(),
    resource: z.string().optional()
  }),
  speech: z.string().optional()
});

export const generateAgentResponse = async (prompt: string) => {
  const openai = getOpenAIInstance();
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
  console.log(response, response.choices[0].message, response.choices[0].message.content);
  const content = JSON.parse(response.choices[0].message.content);
  const output = AgentResponseSchema.parse(content);
  if (!content) throw new Error("No content in response");
  
  return output;
};

export const generateGodResponse = async (prompt: string) => {
  const openai = getOpenAIInstance();
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
  console.log(response, response.choices[0].message, response.choices[0].message.content);
  const content = JSON.parse(response.choices[0].message.content);
  const output = GodResponseSchema.parse(content);
  if (!content) throw new Error("No content in response");
  
  return output;
};

export const generateAgentDecision = async (
  agent: {
    name: string;
    species: string;
    traits: string[];
    resources: string[];
    status: string;
  },
  nearbyAgents: Array<{
    name: string;
    species: string;
    resources: string[];
    distance: number;
  }>,
  surroundings: {
    biome: string;
    resources: string[];
    structures: string[];
  }
) => {
  const openai = getOpenAIInstance();
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI agent in a simulated world. You are a ${agent.species} named ${agent.name} with traits: ${agent.traits.join(', ')}. 
          Make decisions based on your species behavior, traits, and current situation. Respond with a structured decision including action and optional speech.`
        },
        {
          role: "user",
          content: JSON.stringify({
            currentState: {
              status: agent.status,
              resources: agent.resources,
            },
            surroundings: surroundings,
            nearbyAgents: nearbyAgents,
          })
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = JSON.parse(response.choices[0].message.content);
    const decision = AgentDecisionSchema.parse(content);
    return decision;
  } catch (error) {
    console.error('Error generating agent decision:', error);
    // Return a default decision if there's an error
    return {
      message: "Continuing current activity",
      action: "move" as const,
      target: { x: 0, y: 0 }
    };
  }
};