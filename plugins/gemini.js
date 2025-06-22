module.exports = {
  afterTransformRequest(req, res) {
    if (Array.isArray(req.body.tools)) {
      // rewrite tools definition
      req.body.tools.forEach((tool) => {
        if (tool.function.name === "BatchTool") {
          // HACK: Gemini does not support objects with empty properties
          tool.function.parameters.properties.invocations.items.properties.input.type =
            "number";
          return;
        }
        Object.keys(tool.function.parameters.properties).forEach((key) => {
          const prop = tool.function.parameters.properties[key];
          if (
            prop.type === "string" &&
            !["enum", "date-time"].includes(prop.format)
          ) {
            delete prop.format;
          }
        });
      });
    }
    if (req.body?.messages?.length) {
      req.body.messages.forEach((message) => {
        if (message.content === null) {
          if (message.tool_calls) {
            message.content = JSON.stringify(message.tool_calls);
          }
        }
      });
    }
  },
};
