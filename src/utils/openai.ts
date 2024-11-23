import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

export const generateAgentResponse = async (prompt: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an AI agent in a simulated world. Respond with structured decisions and actions."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" }
  });

  return response.choices[0].message.content;
};

export const generateGodResponse = async (prompt: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are the God AI overseeing a simulated world. Make decisions that affect the world and its inhabitants."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" }
  });

  return response.choices[0].message.content;
};