require('dotenv').config();

async function test() {
  console.log("Testing local AI assistant endpoint...");
  try {
    const res = await fetch("http://localhost:3000/api/public/ai-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "tell me about python course" }),
    });

    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error("Test failed:", err.message);
  }
}

test();
