import express from 'express';
import { Innertube } from 'youtubei.js';

const app = express();
const port = process.env.PORT || 3000; // Render injects PORT automatically

// 🔎 Search endpoint
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing query" });

    const yt = await Innertube.create();
    const results = await yt.search(query, { type: 'video' });
    const first = results.videos[0];

    res.json({
      title: first.title.text,
      artist: first.author.name,
      cover: first.best_thumbnail.url,
      videoId: first.id,
      url: `https://www.youtube.com/watch?v=${first.id}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🎵 Download audio
app.get('/download/audio/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    const yt = await Innertube.create();
    const stream = await yt.download(videoId, { type: 'audio' });

    res.setHeader('Content-Disposition', `attachment; filename="${videoId}.mp3"`);
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🎬 Download video
app.get('/download/video/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    const yt = await Innertube.create();
    const stream = await yt.download(videoId, { type: 'video' });

    res.setHeader('Content-Disposition', `attachment; filename="${videoId}.mp4"`);
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
