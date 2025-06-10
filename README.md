# Claude Code Router

> This is a tool for routing Claude Code requests to different models, and you can customize any request.

## Usage

1. Install Claude Code

```shell
npm install -g @anthropic-ai/claude-code
```

2. Install Claude Code Router

```shell
npm install -g @musistudio/claude-code-router
```

3. Start Claude Code by claude-code-router

```shell
ccr code
```


## Plugin[Beta]

The plugin allows users to rewrite Claude Code prompt and custom router. The plugin path is in `$HOME/.claude-code-router/plugins`. Currently, there are two demos available: 
1. [custom router](https://github.com/musistudio/claude-code-router/blob/dev/custom-prompt/plugins/deepseek.js)
2. [rewrite prompt](https://github.com/musistudio/claude-code-router/blob/dev/custom-prompt/plugins/gemini.js)

You need to move them to the `$HOME/.claude-code-router/plugins` directory and configure 'usePlugin' in `$HOME/.claude-code-router/config.json`，like this:

```json
{
    "usePlugin": "gemini",
    "LOG": true,
    "OPENAI_API_KEY": "",
    "OPENAI_BASE_URL": "",
    "OPENAI_MODEL": ""
}
```

## Features
- [x] Plugins
- [ ] Support change models
- [ ] Support scheduled tasks


## Some tips:
If you’re using the DeepSeek API provided by the official website, you might encounter an “exceeding context” error after several rounds of conversation (since the official API only supports a 64K context window). In this case, you’ll need to discard the previous context and start fresh. Alternatively, you can use ByteDance’s DeepSeek API, which offers a 128K context window and supports KV cache.

Note: claude code consumes a huge amount of tokens, but thanks to DeepSeek’s low cost, you can use claude code at a fraction of Claude’s price, and you don’t need to subscribe to the Claude Max plan.

Some interesting points: Based on my testing, including a lot of context information can help narrow the performance gap between these LLM models. For instance, when I used Claude-4 in VSCode Copilot to handle a Flutter issue, it messed up the files in three rounds of conversation, and I had to roll everything back. However, when I used claude code with DeepSeek, after three or four rounds of conversation, I finally managed to complete my task—and the cost was less than 1 RMB!


