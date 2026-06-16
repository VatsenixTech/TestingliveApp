require("dotenv").config();

const OpenAI = require("openai");

console.log("API KEY LOADED:", process.env.OPENAI_API_KEY ? "YES" : "NO");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
  try {
    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: "Say hello to NoPromptJobs",
    });

    console.log(response.output_text);
  } catch (error) {
    console.log("AI ERROR:", error.message);
  }
}

test();