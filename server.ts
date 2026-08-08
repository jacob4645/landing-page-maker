import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure uploads and media directories exist in the project root
  const uploadsDir = path.join(process.cwd(), "uploads");
  const mediaDir = path.join(process.cwd(), "media");
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
  }

  // Parse JSON payloads (support large base64 uploads up to 100MB for videos)
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ extended: true, limit: "100mb" }));

  // Static options for media files
  const staticMediaOptions = {
    maxAge: "1d",
    setHeaders: (res: express.Response, filePath: string) => {
      if (filePath.endsWith(".mp4")) {
        res.setHeader("Content-Type", "video/mp4");
      } else if (filePath.endsWith(".webm")) {
        res.setHeader("Content-Type", "video/webm");
      } else if (filePath.endsWith(".gif")) {
        res.setHeader("Content-Type", "image/gif");
      }
    }
  };

  // Serve static uploaded files from both /uploads and /media routes
  app.use("/uploads", express.static(uploadsDir, staticMediaOptions));
  app.use("/media", express.static(mediaDir, staticMediaOptions));

  // API Endpoint to list all hosted files stored in the script folders
  app.get("/api/media", (req, res) => {
    try {
      const rawHost = req.headers["x-forwarded-host"] || req.get("host") || "localhost:3000";
      const host = Array.isArray(rawHost) ? rawHost[0] : rawHost;
      const rawProtocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
      const protocol = Array.isArray(rawProtocol) ? rawProtocol[0] : rawProtocol;
      const baseUrl = `${protocol}://${host}`;

      const getFilesFromDir = (dir: string, route: string) => {
        if (!fs.existsSync(dir)) return [];
        return fs.readdirSync(dir).map((file) => {
          const stats = fs.statSync(path.join(dir, file));
          return {
            fileName: file,
            path: `/${route}/${file}`,
            url: `/${route}/${file}`,
            fullUrl: `${baseUrl}/${route}/${file}`,
            size: stats.size,
            createdAt: stats.birthtime,
          };
        });
      };

      const uploadsFiles = getFilesFromDir(uploadsDir, "uploads");
      const mediaFiles = getFilesFromDir(mediaDir, "media");

      return res.json({
        success: true,
        uploads: uploadsFiles,
        media: mediaFiles,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to list media files" });
    }
  });

  // API Endpoint to delete a file from server storage
  app.delete("/api/media/:fileName", (req, res) => {
    try {
      const fileName = req.params.fileName;
      if (!fileName || fileName.includes("..") || fileName.includes("/")) {
        return res.status(400).json({ error: "Invalid file name" });
      }

      const uploadPath = path.join(uploadsDir, fileName);
      const mediaPath = path.join(mediaDir, fileName);

      let deleted = false;
      if (fs.existsSync(uploadPath)) {
        fs.unlinkSync(uploadPath);
        deleted = true;
      }
      if (fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
        deleted = true;
      }

      if (deleted) {
        return res.json({ success: true, message: "File deleted successfully" });
      } else {
        return res.status(404).json({ error: "File not found" });
      }
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to delete file" });
    }
  });

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

      // Save to BOTH uploads/ and media/ directories inside the script
      const uploadPath = path.join(uploadsDir, finalFileName);
      const mediaPath = path.join(mediaDir, finalFileName);

      fs.writeFileSync(uploadPath, buffer);
      fs.writeFileSync(mediaPath, buffer);

      // Determine host protocol and origin
      const rawHost = req.headers["x-forwarded-host"] || req.get("host") || "localhost:3000";
      const host = Array.isArray(rawHost) ? rawHost[0] : rawHost;
      const rawProtocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
      const protocol = Array.isArray(rawProtocol) ? rawProtocol[0] : rawProtocol;
      
      const relativePath = `/uploads/${finalFileName}`;
      const mediaRelativePath = `/media/${finalFileName}`;
      const fullHostedUrl = `${protocol}://${host}${relativePath}`;

      console.log(`[Storage] Saved hosted media to script folders:`);
      console.log(` - ${uploadPath}`);
      console.log(` - ${mediaPath}`);

      return res.json({
        success: true,
        fileName: finalFileName,
        hostedUrl: relativePath, // Relative URL works everywhere without localhost issues
        fullHostedUrl,
        mediaUrl: mediaRelativePath,
        relativePath: `media/${finalFileName}`,
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
