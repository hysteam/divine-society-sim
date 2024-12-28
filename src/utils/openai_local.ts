
1| import OpenAI from 'openai'; // 导入 OpenAI 库
2| import { zodResponseFormat } from "openai/helpers/zod"; // 从 OpenAI 库中导入 zodResponseFormat 帮助函数
3| import { z } from 'zod'; // 导入 zod 库，用于定义和验证数据结构
4| import { useOpenAIStore } from '@/stores/openAIStore'; // 导入自定义的 openAIStore，用于存储 OpenAI 配置
5| 
6| let openaiInstance: OpenAI | null = null; // 初始化 openaiInstance 变量，初始值为 null
7| 
8| const getOpenAIInstance = () => { // 定义获取 OpenAI 实例的函数
9|   const apiKey = useOpenAIStore.getState().apiKey; // 从 store 中获取 API 密钥
10|   
11|   if (!apiKey) { // 如果没有设置 API 密钥
12|     throw new Error('OpenAI API key not set. Please set your API key to use this feature.'); // 抛出错误提示需要设置 API 密钥
13|   }
14| 
15|   if (!openaiInstance || openaiInstance.apiKey !== apiKey) { // 如果 openaiInstance 为空或 API 密钥不匹配
16|     openaiInstance = new OpenAI({ // 创建新的 OpenAI 实例
17|       apiKey: apiKey, // 设置 API 密钥
18|       dangerouslyAllowBrowser: true // 允许浏览器使用
19|     });
20|   }
21| 
22|   return openaiInstance; // 返回 OpenAI 实例
23| };
24| 
25| // 定义 God 的响应结构
26| const GodResponseSchema = z.object({
27|   message: z.string(), // 消息内容，类型为字符串
28|   actions: z.array(z.string()), // 动作数组，元素类型为字符串
29|   affectedEntities: z.array(z.string()).optional(), // 受影响的实体数组，元素类型为字符串，可选
30|   priority: z.string().describe("can be only one of the followings low, medium, high") // 优先级，描述为低、中、高三种之一
31| });
32| 
33| // 定义 Agent 的响应结构
34| const AgentResponseSchema = z.object({
35|   message: z.string(), // 消息内容，类型为字符串
36|   action: z.string(), // 动作，类型为字符串
37|   resources: z.array(z.string()).optional(), // 资源数组，元素类型为字符串，可选
38|   status: z.string().describe("can be only one of the following idle, working, done") // 状态，描述为空闲、工作、完成三种之一
39| });
40| 
41| // 定义 Agent 的决策结构
42| const AgentDecisionSchema = z.object({
43|   message: z.string(), // 消息内容，类型为字符串
44|   action: z.enum(['move', 'gather', 'build', 'trade', 'explore', 'communicate']), // 动作，类型为枚举
45|   target: z.object({
46|     x: z.number().optional(), // 目标 X 坐标，类型为数字，可选
47|     y: z.number().optional(), // 目标 Y 坐标，类型为数字，可选
48|     agentId: z.string().optional(), // 目标代理 ID，类型为字符串，可选
49|     resource: z.string().optional() // 目标资源，类型为字符串，可选
50|   }),
51|   speech: z.string().optional() // 讲话内容，类型为字符串，可选
52| });
53| 
54| export const generateAgentResponse = async (prompt: string) => { // 定义生成 Agent 响应的异步函数
55|   const openai = getOpenAIInstance(); // 获取 OpenAI 实例
56|   const response = await openai.beta.chat.completions.parse({ // 调用 OpenAI API 生成响应
57|     model: "gpt-4o-mini", // 使用的模型名称
58|     messages: [
59|       {
60|         role: "system",
61|         content: "You are an AI agent in a simulated world. Respond with structured JSON decisions and actions. Your response must be a valid JSON object." // 系统消息内容
62|       },
63|       {
64|         role: "user",
65|         content: prompt // 用户输入的提示
66|       }
67|     ],
68|     response_format: zodResponseFormat(AgentResponseSchema, "AgentResponse"), // 设置响应格式为 AgentResponseSchema
69|   });
70|   console.log(response, response.choices[0].message, response.choices[0].message.content); // 打印响应内容
71|   const content = JSON.parse(response.choices[0].message.content); // 解析响应内容
72|   const output = AgentResponseSchema.parse(content); // 验证并解析响应内容
73|   if (!content) throw new Error("No content in response"); // 如果响应内容为空则抛出错误
74|   
75|   return output; // 返回解析后的响应内容
76| };
77| 
78| export const generateGodResponse = async (prompt: string) => { // 定义生成 God 响应的异步函数
79|   const openai = getOpenAIInstance(); // 获取 OpenAI 实例
80|   const response = await openai.chat.completions.create({ // 调用 OpenAI API 生成响应
81|     model: "gpt-4o-mini", // 使用的模型名称
82|     messages: [
83|       {
84|         role: "system",
85|         content: "You are the God AI overseeing a simulated world. Make decisions that affect the world and its inhabitants. Respond with a structured JSON object containing your divine insights." // 系统消息内容
86|       },
87|       {
88|         role: "user",
89|         content: prompt // 用户输入的提示
90|       }
91|     ],
92|     response_format: zodResponseFormat(GodResponseSchema, "GodResponse"), // 设置响应格式为 GodResponseSchema
93|   });
94|   console.log(response, response.choices[0].message, response.choices[0].message.content); // 打印响应内容
95|   const content = JSON.parse(response.choices[0].message.content); // 解析响应内容
96|   const output = GodResponseSchema.parse(content); // 验证并解析响应内容
97|   if (!content) throw new Error("No content in response"); // 如果响应内容为空则抛出错误
98|   
99|   return output; // 返回解析后的响应内容
100| };
101| 
102| export const generateAgentDecision = async ( // 定义生成 Agent 决策的异步函数
103|   agent: { // 代理对象
104|     name: string; // 名称
105|     species: string; // 物种
106|     traits: string[]; // 特征数组
107|     resources: string[]; // 资源数组
108|     status: string; // 状态
109|   },
110|   nearbyAgents: Array<{ // 附近代理数组
111|     name: string; // 名称
112|     species: string; // 物种
113|     resources: string[]; // 资源数组
114|     distance: number; // 距离
115|   }>,
116|   surroundings: { // 周围环境对象
117|     biome: string; // 生物群系
118|     resources: string[]; // 资源数组
119|     structures: string[]; // 结构数组
120|   }
121| ) => {
122|   const openai = getOpenAIInstance(); // 获取 OpenAI 实例
123|   try {
124|     const response = await openai.chat.completions.create({ // 调用 OpenAI API 生成响应
125|       model: "gpt-4", // 使用的模型名称
126|       messages: [
127|         {
128|           role: "system",
129|           content: `You are an AI agent in a simulated world. You are a ${agent.species} named ${agent.name} with traits: ${agent.traits.join(', ')}. 
130|           Make decisions based on your species behavior, traits, and current situation. Respond with a structured decision including action and optional speech.` // 系统消息内容
131|         },
132|         {
133|           role: "user",
134|           content: JSON.stringify({ // 用户输入的提示
135|             currentState: {
136|               status: agent.status, // 代理状态
137|               resources: agent.resources, // 代理资源
138|             },
139|             surroundings: surroundings, // 周围环境
140|             nearbyAgents: nearbyAgents, // 附近代理
141|           })
142|         }
143|       ],
144|       response_format: { type: "json_object" } // 设置响应格式为 JSON 对象
145|     });
146| 
147|     const content = JSON.parse(response.choices[0].message.content); // 解析响应内容
148|     const decision = AgentDecisionSchema.parse(content); // 验证并解析响应内容
149|     return decision; // 返回解析后的决策
150|   } catch (error) {
151|     console.error('Error generating agent decision:', error); // 打印错误信息
152|     // 如果发生错误，返回默认决策
153|     return {
154|       message: "Continuing current activity", // 消息内容
155|       action: "move" as const, // 动作类型
156|       target: { x: 0, y: 0 } // 目标坐标
157|     };
158|   }
159| };
