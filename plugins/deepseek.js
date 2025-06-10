const {
  log,
  streamOpenAIResponse,
  createClient,
} = require("claude-code-router");

const thinkRouter = {
  name: "think",
  description: `This agent is used solely for complex reasoning and thinking tasks. It should not be called for information retrieval or repetitive, frequent requests. Only use this agent for tasks that require deep analysis or problem-solving. If there is an existing result from the Thinker agent, do not call this agent again. You are only responsible for deep thinking to break down tasks, no coding or tool calls are needed. Finally, return the broken-down steps in order, for example:\n1. xxx\n2. xxx\n3. xxx`,
  run(args) {
    const client = createClient({
      apiKey: process.env.THINK_AGENT_API_KEY,
      baseURL: process.env.THINK_AGENT_BASE_URL,
    });
    const messages = JSON.parse(JSON.stringify(args.messages));
    messages.forEach((msg) => {
      if (Array.isArray(msg.content)) {
        msg.content = JSON.stringify(msg.content);
      }
    });

    let startIdx = messages.findIndex((msg) => msg.role !== "system");
    if (startIdx === -1) startIdx = messages.length;

    for (let i = startIdx; i < messages.length; i++) {
      const expectedRole = (i - startIdx) % 2 === 0 ? "user" : "assistant";
      messages[i].role = expectedRole;
    }

    if (
      messages.length > 0 &&
      messages[messages.length - 1].role === "assistant"
    ) {
      messages.push({
        role: "user",
        content:
          "Please follow the instructions provided above to resolve the issue.",
      });
    }
    delete args.tools;
    return client.chat.completions.create({
      ...args,
      messages,
      model: process.env.THINK_AGENT_MODEL,
    });
  },
};

class Router {
  constructor() {
    this.routers = [thinkRouter];
    this.client = createClient({
      apiKey: process.env.ROUTER_AGENT_API_KEY,
      baseURL: process.env.ROUTER_AGENT_BASE_URL,
    });
  }
  async route(args) {
    log(`Request Router: ${JSON.stringify(args, null, 2)}`);
    const res = await this.client.chat.completions.create({
      ...args,
      messages: [
        ...args.messages,
        {
          role: "system",
          content: `## **Guidelines:**  
  - **Trigger the "think" mode when the user's request involves deep thinking, complex reasoning, or multi-step analysis.**  
  - **Criteria:**  
      - Involves multi-layered logical reasoning or causal analysis  
      - Requires establishing connections or pattern recognition between different pieces of information  
      - Involves cross-domain knowledge integration or weighing multiple possibilities  
      - Requires creative thinking or non-direct inference  
  ### **Special Case:**  
  - **When the user sends "test", respond with "success" only.**  
  
  ### **Format requirements:**  
  - When you need to trigger the "think" mode, return the following JSON format:  
  \`\`\`json
  {
    "use": "think"
  }
  \`\`\`
  `,
        },
      ],
      model: process.env.ROUTER_AGENT_MODEL,
      stream: false,
    });
    let result;
    try {
      const text = res.choices[0].message.content;
      if (!text) {
        throw new Error("No text");
      }
      result = JSON.parse(
        text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)
      );
    } catch (e) {
      res.choices[0].delta = res.choices[0].message;
      log(`No Router: ${JSON.stringify(res.choices[0].message)}`);
      return [res];
    }
    const router = this.routers.find((item) => item.name === result.use);
    if (!router) {
      res.choices[0].delta = res.choices[0].message;
      log(`No Router: ${JSON.stringify(res.choices[0].message)}`);
      return [res];
    }
    log(`Use Router: ${router.name}`);
    if (router.name === "think") {
      const agentResult = await router.run({
        ...args,
        stream: false,
      });
      try {
        args.messages.push({
          role: "user",
          content:
            `${router.name} Agent Result: ` +
            agentResult.choices[0].message.content,
        });
        log(
          `${router.name} Agent Result: ` +
            agentResult.choices[0].message.content
        );
        return await this.route(args);
      } catch (error) {
        console.log(agentResult);
        throw error;
      }
    }
    return router.run(args);
  }
}

const router = new Router();
module.exports = async function handle(req, res, next) {
  const completions = await router.route(req.body);
  streamOpenAIResponse(res, completions, req.body.model);
};
