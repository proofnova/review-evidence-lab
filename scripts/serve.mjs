import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
};
http
  .createServer((request, response) => {
    try {
      const name = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      if (name.split(/[\\/]/).some((part) => part.startsWith(".")))
        throw new Error("Hidden paths are not served");
      const file = path.resolve(
        root,
        `.${name.endsWith("/") ? name + "index.html" : name}`,
      );
      if (!file.startsWith(root + path.sep) || !fs.statSync(file).isFile())
        throw new Error("Not a file");
      response.writeHead(200, {
        "Content-Type": types[path.extname(file)] ?? "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      });
      fs.createReadStream(file).pipe(response);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  })
  .listen(4173, "127.0.0.1", () =>
    console.log("Local preview: http://127.0.0.1:4173"),
  );
