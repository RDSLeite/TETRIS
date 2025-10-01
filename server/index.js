// index.js
const express = require("express");
const cors = require("cors");
const app = express();

// routes / caminhos para controlar scores
const scoresRoutes = require("./server/routes/scores");

app.use(cors());
app.use(express.json());

app.use("/api/scores", scoresRoutes);

app.get("/", (req, res) => {
  res.send("Olá com Express!");
});

app.listen(3000, () => {
  console.log("API rodando em http://localhost:3000");
});
