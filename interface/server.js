const express = require("express");
const fs = require("fs-extra");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = 4000;
const filePath = path.join(__dirname, "received.json");

app.get("/health", (req, res) => {
  res.json({ ok: true });
});
app.post("/callbacks/steps", async (req, res) => {
  try {
    await fs.writeJson(filePath, req.body, { spaces: 2 });
    console.log("Callback received and saved.");
    res.json({ saved: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save JSON" });
  }
});
app.get("/guides/:id", async (req, res) => {
  try {
    const data = await fs.readJson(filePath);
    if (parseInt(req.params.id) !== data.guide_id) {
      return res.status(404).send("Guide not found");
    }

    let html = `
      <html>
        <head>
          <title>Guide ${data.guide_id}</title>
          <link rel="stylesheet" href="/style.css" />
        </head>
        <body>
          <h1>Guide ${data.guide_id}</h1>
          <div class="steps">
    `;

    data.steps.forEach(step => {
      html += `
        <div class="step">
          <h3>${step.title}</h3>
          <p>At ${step.second}s</p>
          <img src="${step.image_url}" />
        </div>
      `;
    });

    html += `</div></body></html>`;
    res.send(html);
  } catch (err) {
    res.status(500).send("No data available");
  }
});

app.listen(PORT, () => {
  console.log(`Interface running on http://localhost:${PORT}`);
});
