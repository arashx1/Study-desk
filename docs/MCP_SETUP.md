# Optional tools and MCP

MCP is optional for building ReEntry. No MCP connection has been verified. Do not block T01-T08 on plugin installation.

The .vscode/mcp.json file applies to supported VS Code clients, not automatically to Antigravity. Configure Antigravity tools through the installed client's current MCP settings and official documentation; keep credentials outside this project.

Browser automation can help test ordinary fixture pages. It does not by itself verify unpacked extension APIs, permissions or service-worker behavior. Perform those checks in Chrome/Edge.

GitHub tools are unnecessary until a remote is selected. Supabase is unnecessary for the SQLite local MVP. Do not configure servers, tokens, paid accounts or global settings automatically. Avoid obsolete server examples copied from old setup templates.

References: https://antigravity.google/docs/mcp and https://github.com/microsoft/playwright-mcp
