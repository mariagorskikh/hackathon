#!/usr/bin/env node

import express from 'express';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Project NANDA company information
const COMPANY_INFO = {
  name: "Project NANDA",
  description: `Project NANDA (Networked Agents And Decentralized AI) is pioneering the future of decentralized intelligence at MIT Media Lab. We build on Anthropic's Model Context Protocol (MCP) to create a true Internet of AI Agents, where billions of specialized AI agents collaborate across a decentralized architecture. Each agent performs discrete functions while communicating seamlessly, navigating autonomously, socializing, learning, earning and transacting. NANDA adds the critical infrastructure needed for distributed agent intelligence at scale, including discovery mechanisms, search functionality, authentication protocols, and verifiable agent-to-agent exchange accountability.`,
  focus_areas: [
    "Decentralized AI Infrastructure",
    "Agent-to-Agent Communication Protocols",
    "AI Agent Discovery and Search",
    "Secure Agent Authentication",
    "Distributed Knowledge Networks",
    "Model Context Protocol (MCP) Extensions"
  ],
  stage: "MIT Research Project",
  approach: "Open-source development and academic research collaboration",
  network: "Global network of universities and research institutions including MIT, Cornell, ETH Zurich, University of Tokyo, and 15+ international partners",
  website: "https://nanda.media.mit.edu",
  contact: "dec-ai@media.mit.edu"
};

// Create the MCP server instance
function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "project-nanda-server",
    version: "1.0.0"
  });

  // Add the requestinfo tool
  server.tool(
    "requestinfo",
    {
      category: z.string().optional().describe("Category of information to retrieve: 'overview', 'focus', 'contact', 'investment', or 'all'")
    },
    async ({ category = "all" }) => {
      let responseText: string;
      
      switch (category) {
        case "overview":
          responseText = `${COMPANY_INFO.name}\n\n${COMPANY_INFO.description}`;
          break;
        case "focus":
          responseText = `${COMPANY_INFO.name} Focus Areas:\n\n${COMPANY_INFO.focus_areas.map(area => `• ${area}`).join('\n')}\n\nInvestment Stage: ${COMPANY_INFO.stage}\nApproach: ${COMPANY_INFO.approach}`;
          break;
        case "contact":
          responseText = `${COMPANY_INFO.name} Contact Information:\n\nWebsite: ${COMPANY_INFO.website}\nEmail: ${COMPANY_INFO.contact}`;
          break;
        case "investment":
          responseText = `${COMPANY_INFO.name} Investment Details:\n\nStage: ${COMPANY_INFO.stage}\nFocus Areas: ${COMPANY_INFO.focus_areas.join(', ')}\nApproach: ${COMPANY_INFO.approach}\nNetwork: ${COMPANY_INFO.network}`;
          break;
        case "all":
        default:
          responseText = `${COMPANY_INFO.name} - Complete Information\n\n` +
            `OVERVIEW:\n${COMPANY_INFO.description}\n\n` +
            `FOCUS AREAS:\n${COMPANY_INFO.focus_areas.map(area => `• ${area}`).join('\n')}\n\n` +
            `INVESTMENT DETAILS:\n` +
            `• Stage: ${COMPANY_INFO.stage}\n` +
            `• Approach: ${COMPANY_INFO.approach}\n` +
            `• Network: ${COMPANY_INFO.network}\n\n` +
            `CONTACT:\n` +
            `• Website: ${COMPANY_INFO.website}\n` +
            `• Email: ${COMPANY_INFO.contact}`;
          break;
      }

      return {
        content: [{
          type: "text",
          text: responseText
        }]
      };
    }
  );

  return server;
}

// Start the HTTP server with Streamable HTTP transport
async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json());

  // Enable CORS for all routes
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Mcp-Session-Id');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Map to store transports by session ID
  const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

  // Handle MCP endpoint - supports POST, GET, and DELETE
  app.all('/mcp', async (req, res) => {
    try {
      // Handle POST requests for client-to-server communication
      if (req.method === 'POST') {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        let transport: StreamableHTTPServerTransport;

        if (sessionId && transports[sessionId]) {
          // Reuse existing transport
          transport = transports[sessionId];
        } else if (!sessionId && isInitializeRequest(req.body)) {
          // New initialization request
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (sessionId) => {
              // Store the transport by session ID
              transports[sessionId] = transport;
              console.log(`Session initialized: ${sessionId}`);
            }
          });

          // Clean up transport when closed
          transport.onclose = () => {
            if (transport.sessionId) {
              delete transports[transport.sessionId];
              console.log(`Session closed: ${transport.sessionId}`);
            }
          };

          // Create and connect the MCP server
          const server = createMcpServer();
          await server.connect(transport as any);
        } else {
          // Invalid request
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Bad Request: No valid session ID provided or not an initialization request',
            },
            id: null,
          });
          return;
        }

        // Handle the request
        await transport.handleRequest(req, res, req.body);
      }
      // Handle GET requests for server-to-client notifications
      else if (req.method === 'GET') {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        if (!sessionId || !transports[sessionId]) {
          res.status(400).send('Invalid or missing session ID');
          return;
        }
        
        const transport = transports[sessionId];
        await transport.handleRequest(req, res);
      }
      // Handle DELETE requests for session termination
      else if (req.method === 'DELETE') {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        if (!sessionId || !transports[sessionId]) {
          res.status(400).send('Invalid or missing session ID');
          return;
        }
        
        const transport = transports[sessionId];
        delete transports[sessionId];
        transport.close();
        res.status(200).send('Session terminated');
      }
      // Method not allowed
      else {
        res.status(405).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Method not allowed',
          },
          id: null,
        });
      }
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  });

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ 
      status: 'healthy', 
      service: 'project-nanda-mcp-server',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Root endpoint with basic info
  app.get('/', (_req, res) => {
    res.json({
      name: 'Project NANDA MCP Server',
      version: '1.0.0',
      description: 'Model Context Protocol server for Project NANDA information',
      endpoints: {
        mcp: '/mcp',
        health: '/health'
      },
      transport: 'Streamable HTTP',
      company: COMPANY_INFO.name
    });
  });

  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`🚀 Project NANDA MCP Server running on port ${PORT}`);
    console.log(`📡 MCP endpoint: http://localhost:${PORT}/mcp`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 Transport: Streamable HTTP`);
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}); 