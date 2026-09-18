const {
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  completion,
  unloadModel
} = require("@qvac/sdk");

const readline = require("readline");

async function main() {
  console.log("Loading QVAC model...");

  const modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0
  });

  console.log("Model loaded!");
  console.log("Type a question and press Enter.");
  console.log("Type 'exit' to quit.\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = () => {
    rl.question("Ask QVAC: ", async (question) => {
      if (question.toLowerCase() === "exit") {
        rl.close();
        await unloadModel({ modelId });
        return;
      }

      console.log("\nAI:");

      const result = completion({
        modelId,
        history: [
          {
            role: "user",
            content: question
          }
        ],
        stream: true
      });

      for await (const token of result.tokenStream) {
        process.stdout.write(token);
      }

      console.log("\n");
      askQuestion();
    });
  };

  askQuestion();
}

main().catch(console.error);