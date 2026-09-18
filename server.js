const express = require("express");

const {
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  completion,
  unloadModel
} = require("@qvac/sdk");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

let modelId = null;

async function start() {
  console.log("Loading QVAC...");

  modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0
  });

  console.log("QVAC loaded!");

  app.post("/ask", async (req, res) => {
    console.log("QUESTION:", req.body.question);

    try {
      const result = completion({
        modelId,
        history: [
          {
            role: "user",
            content: req.body.question
          }
        ],
        stream: true
      });

      let answer = "";

      for await (const token of result.tokenStream) {
        answer += token;
      }

      console.log("ANSWER:", answer);

      res.json({ answer });
    } catch (error) {
      console.error("ERROR:", error);
      res.status(500).json({
        answer: "Error: " + error.message
      });
    }
  });

  app.listen(PORT, () => {
    console.log(`Running at http://localhost:${PORT}`);
  });
}

start().catch(console.error);

// Keep Node running
setInterval(() => {}, 1000);