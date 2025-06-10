module.exports = async function handle(req, res, next) {
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
  next();
};
