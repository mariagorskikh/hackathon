# How to create a Context Agent and launch via MCP

**Build and deploy a Model Context Protocol (MCP) server for your company in minutes!**

This template provides everything you need to create an AI-accessible information server about your company. Perfect for integrating with AI systems that support MCP.

## 🎯 What You'll Build

An MCP server that allows AI systems to request information about your company, including:
- Company overview and description
- Focus areas and expertise
- Contact information
- Investment/partnership details
- Any custom categories you define

## 📋 Prerequisites

- Node.js 18+ installed
- Basic familiarity with editing JSON/TypeScript files
- A GitHub account (for deployment)

## 🛠 Step-by-Step Setup Guide

### Step 1: Get the Template

1. **Fork or download this repository**
2. **Clone to your local machine:**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

### Step 2: Customize for Your Company

#### 📝 **File 1: `package.json` - Project Information**

Update these fields with your company info:

```json
{
  "name": "your-company-mcp-server",           // ← Change this
  "description": "MCP server for Your Company information",  // ← Change this
  "author": "Your Company Name",               // ← Change this
  "keywords": [
    "mcp",
    "model-context-protocol", 
    "your-company-name",                       // ← Change this
    "ai",
    "typescript"
  ]
}
```

#### 🏢 **File 2: `src/index.ts` - Company Information**

This is the main file you need to customize. Find the `COMPANY_INFO` section (around line 10) and replace with your details:

```typescript
const COMPANY_INFO = {
  name: "Your Company Name",                   // ← Change this
  
  description: `Write a compelling description of your company here. 
  What do you do? What's your mission? What makes you unique? 
  This will be the main overview that AI systems will see.`,  // ← Change this
  
  focus_areas: [                               // ← Change these
    "Your Main Service/Product Area",
    "Another Key Focus Area", 
    "Technology Stack You Use",
    "Industry You Serve",
    "Your Expertise Areas"
  ],
  
  stage: "Description of your company stage",  // ← Change this
  // Examples: "Early-stage startup", "Established company", "Fortune 500", etc.
  
  approach: "Your company's approach/methodology",  // ← Change this
  // Examples: "Customer-first design", "Agile development", "Data-driven decisions"
  
  network: "Your network/partnerships description",  // ← Change this
  // Examples: "Global partner network", "Industry associations", "Client base"
  
  website: "https://yourcompany.com",          // ← Change this
  contact: "hello@yourcompany.com"             // ← Change this
};
```

#### 🤖 **File 3: `src/index.ts` - Server Name**

Find the server creation section (around line 31) and update:

```typescript
const server = new McpServer({
  name: "your-company-server",                 // ← Change this
  version: "1.0.0"
});
```

#### 📱 **File 4: `examples/mcp-client-config.json` - MCP Client Configuration**

Update the server name for MCP client integration:

```json
{
  "mcpServers": {
    "your-company": {                          // ← Change this
      "comment": "Example configuration for MCP clients - update with your company details",
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "PORT": "3000"
      }
    }
  }
}
```

### Step 3: Test Your Server

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Test it works:**
   ```bash
   npm test
   ```

   You should see your company information displayed for different categories!

### Step 4: Test with MCP Inspector

1. **Open MCP Inspector:**
   ```bash
   npx @modelcontextprotocol/inspector
   ```

2. **In the inspector interface:**
   - Transport Type: `Streamable HTTP`
   - URL: `http://localhost:3000/mcp`
   - Click **Connect**

3. **Test the `requestinfo` tool:**
   - Try different categories: `"overview"`, `"focus"`, `"contact"`, `"all"`
   - Verify your company information appears correctly

## 🚀 Deployment Options

### Option 1: Railway (Recommended - Free & Easy)

1. **Create Railway account:** [railway.app](https://railway.app)
2. **Connect your GitHub repo**
3. **Deploy automatically** - Railway detects the configuration
4. **Get your URL** - Use `https://your-app.railway.app/mcp` for AI integration

### Option 2: Docker

```bash
docker build -t your-company-mcp .
docker run -p 3000:3000 your-company-mcp
```

### Option 3: Other Platforms

The server works on any platform that supports Node.js. See `DEPLOYMENT.md` for detailed instructions.

## 🤖 Ready for AI Integration

Your deployed MCP server is now ready for AI systems to connect to at: `https://your-deployed-url.com/mcp`

For advanced users who want to integrate with AI systems, see the configuration examples in `examples/mcp-client-config.json`.

## 🎨 Advanced Customization

### Adding More Information Categories

In `src/index.ts`, you can add more cases to the switch statement:

```typescript
case "pricing":
  responseText = `${COMPANY_INFO.name} Pricing Information:\n\n[Your pricing details]`;
  break;
  
case "team":
  responseText = `${COMPANY_INFO.name} Team:\n\n[Your team information]`;
  break;
```

### Adding More Tools

You can add additional tools beyond `requestinfo`:

```typescript
server.tool(
  "get_case_studies",
  {
    industry: z.string().optional().describe("Filter by industry")
  },
  async ({ industry }) => {
    // Your implementation here
    return {
      content: [{
        type: "text", 
        text: "Your case studies information"
      }]
    };
  }
);
```

## 📁 Project Structure

```
├── src/
│   └── index.ts          # Main server code (CUSTOMIZE THIS)
├── examples/
│   ├── mcp-client-config.json # MCP client config (CUSTOMIZE THIS)
│   └── test-client.ts     # Test script
├── package.json           # Project info (CUSTOMIZE THIS)
├── tsconfig.json         # TypeScript config (NO CHANGES NEEDED)
├── Dockerfile            # Docker config (NO CHANGES NEEDED)
├── Procfile             # Railway config (NO CHANGES NEEDED)
└── README.md            # This file
```

## 🆘 Troubleshooting

### Server won't start
- Make sure you ran `npm install`
- Check that Node.js 18+ is installed
- Try `npm run build` first

### Inspector can't connect
- Make sure server is running (`npm start`)
- Use the correct URL: `http://localhost:3000/mcp`
- Check the server logs for errors

### AI can't access deployed server
- Verify the deployment URL works: `https://your-url.com/health`
- Make sure you're using the `/mcp` endpoint
- Check CORS settings if accessing from browser

## 💡 Tips for Success

1. **Keep descriptions clear and concise** - AI systems work better with well-structured information
2. **Test thoroughly** - Use the inspector and test client to verify everything works
3. **Start simple** - Get the basic info working before adding advanced features
4. **Monitor logs** - Check server logs to debug issues

## 🎉 You're Done!

Congratulations! You now have a working, deployed MCP server for your company! Your server is:

✅ **Live and accessible** - Running on the web with a public URL  
✅ **MCP compliant** - Ready for AI systems to discover and use  
✅ **Production ready** - Includes health checks, error handling, and proper deployment  
✅ **Customizable** - Easy to extend with more tools and information

This creates new possibilities for integrating your company information with AI systems and building innovative applications.

## 📚 Learn More

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [NANDA: The Internet of AI Agents](https://nanda.media.mit.edu)

---

**Happy building! 🚀**

*Made with ❤️ for the developer community* 
