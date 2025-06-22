module.exports = {
  beforeRouter(req, res) {
    if (req?.body?.tools?.length) {
      req.body.tools = req.body.tools.filter(
        (tool) =>
          !["NotebookRead", "NotebookEdit", "mcp__ide__executeCode"].includes(
            tool.name
          )
      );
    }
  },
};
