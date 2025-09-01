const express = require("express");
const multer = require("multer");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();
const app = express();
const upload = multer({ dest: "uploads/" });

const PORT = 8000;
const TOKEN = process.env.IMPORT_TOKEN;

// Health endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Middleware for token validation
function checkAuth(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth || auth !== `Bearer ${TOKEN}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.use(express.json());

// ✅ Allow both JSON and file uploads
app.post(
  "/process-video",
  checkAuth,
  (req, res, next) => {
    if (req.headers["content-type"]?.includes("multipart/form-data")) {
      upload.single("file")(req, res, next); // use multer for file uploads
    } else {
      next(); // allow JSON
    }
  },
  async (req, res) => {
    const { guide_id, callback_url, video_url } = req.body;

    if (!guide_id || !callback_url) {
      return res.status(422).json({ error: "guide_id and callback_url required" });
    }

    if (!req.file && !video_url) {
      return res.status(422).json({ error: "Need file or video_url" });
    }

    // ✅ Mocked response with local images (make sure 1.jpg, 2.jpg, 3.jpg exist in interface/public/)
    const steps = {
      guide_id: parseInt(guide_id),
      steps: [
        {
          index: 1,
          second: 5,
          title: "Frame 00:05",
          image_url: "http://localhost:4000/1.jpg"
        },
        {
          index: 2,
          second: 10,
          title: "Frame 00:10",
          image_url: "http://localhost:4000/2.jpg"
        },
        {
          index: 3,
          second: 15,
          title: "Frame 00:15",
          image_url: "http://localhost:4000/3.jpg"
        }
      ]
    };

    // Return mocked steps immediately
    res.json(steps);

    // Send steps to the callback URL
    try {
      await axios.post(callback_url, steps);
      console.log("✅ Callback sent to:", callback_url);
    } catch (err) {
      console.error("❌ Callback failed:", err.message);
    }
  }
);

app.listen(PORT, () => {
  console.log(`API service running on http://localhost:${PORT}`);
});
