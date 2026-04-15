import express from 'express';
import { Innertube } from 'youtubei.js';

const app = express();
const port = process.env.PORT || 3000; // Render injects PORT automatically

// Utility: create a single Innertube client once
let yt;
(async () => {
  try {
    yt = await Innertube.create();
    console.log("YouTube client initialized");
  } catch (err) {
    console.error("Failed to initialize YouTube client:", err);
  }
})();

// 🔎 Search endpoint
app.get('/search', async (req, res) => {
  try {
    if (!yt) return res.status(500).json({ error: "YouTube client not ready" });

    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing query parameter ?q=" });

    const results = await yt.search(query, { type: 'video' });
    if (!results.videos || results.videos.length === 0) {
      return res.status(404).json({ error: "No results found" });
    }

    const first = results.videos[0];
    res.json({
      title: first.title.text,
      artist: first.author.name,
      cover: first.best_thumbnail.url,
      videoId: first.id,
      url: `https://www.youtube.com/watch?v=${first.id}`
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🎵 Download audio
app.get('/download/audio/:id', async (req, res) => {
  try {
    if (!yt) return res.status(500).json({ error: "YouTube client not ready" });

    const videoId = req.params.id;
    const stream = await yt.download(videoId, { type: 'audio' });

    res.setHeader('Content-Disposition', `attachment; filename="${videoId}.mp3"`);
    stream.pipe(res);
  } catch (err) {
    console.error("Audio download error:", err);
    res.status(500).json({ error: "Failed to download audio" });
  }
});

// 🎬 Download video
app.get('/download/video/:id', async (req, res) => {
  try {
    if (!yt) return res.status(500).json({ error: "YouTube client not ready" });

    const videoId = req.params.id;
    const stream = await yt.download(videoId, { type: 'video' });

    res.setHeader('Content-Disposition', `attachment; filename="${videoId}.mp4"`);
    stream.pipe(res);
  } catch (err) {
    console.error("Video download error:", err);
    res.status(500).json({ error: "Failed to download video" });
  }
});

// ✅ Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
