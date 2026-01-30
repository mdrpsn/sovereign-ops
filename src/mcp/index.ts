import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";

const server = new Server(
  { name: "sovereign-ops-bridge", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_infrastructure_status",
        description: "Returns status of the bridge.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "list_files",
        description: "Reads current project directory.",
        inputSchema: { type: "object", properties: {} },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;
  if (name === "get_infrastructure_status") {
    return { content: [{ type: "text", text: "Online." }] };
  }
  if (name === "list_files") {
    const files = await fs.readdir(process.cwd());
    return { content: [{ type: "text", text: `Files: ${files.join(", ")}` }] };
  }
  throw new Error("Tool not found");
});

const transport = new StdioServerTransport();
await server.connect(transport);
