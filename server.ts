import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Parse JSON payloads (support large base64 uploads up to 100MB for videos)
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ extended: true, limit: "100mb" }));

  // Serve static uploaded files
  app.use("/uploads", express.static(uploadsDir, {
    maxAge: "1d",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".mp4")) {
        res.setHeader("Content-Type", "video/mp4");
      } else if (filePath.endsWith(".webm")) {
        res.setHeader("Content-Type", "video/webm");
      } else if (filePath.endsWith(".gif")) {
        res.setHeader("Content-Type", "image/gif");
      }
    }
  }));

  // API Endpoint to upload files to server storage
  app.post("/api/upload", (req, res) => {
    try {
      const { fileName, fileData, mimeType } = req.body;

      if (!fileData) {
        return res.status(400).json({ error: "No file data provided" });
      }

      // Extract base64 payload
      const base64Data = fileData.replace(/^data:([A-Za-z-+/]+);base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Generate a clean unique filename
      const timeStamp = Date.now();
      const sanitizedOriginalName = (fileName || "media")
        .toLowerCase()
        .replace(/[^a-z0-9_.-]/g, "_");
      
      const finalFileName = `${timeStamp}_${sanitizedOriginalName}`;
      const filePath = path.join(uploadsDir, finalFileName);

      fs.writeFileSync(filePath, buffer);

      // Determine host protocol and origin
      const host = req.get("host") || "localhost:3000";
      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
      const hostedUrl = `${protocol}://${host}/uploads/${finalFileName}`;

      console.log(`[Storage] Saved hosted media: ${filePath} -> ${hostedUrl}`);

      return res.json({
        success: true,
        fileName: finalFileName,
        hostedUrl,
        size: buffer.length,
        mimeType: mimeType || "application/octet-stream",
      });
    } catch (error: any) {
      console.error("[Storage] Upload error:", error);
      return res.status(500).json({ error: error.message || "Failed to save file to server storage" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", storage: "active" });
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
