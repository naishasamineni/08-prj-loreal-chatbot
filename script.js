const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const latestQuestion = document.getElementById("latestQuestion");

/* 
  For local testing:
  leave WORKER_URL as empty string
  and keep secrets.js in index.html

  After Cloudflare deploy:
  paste your Worker URL below
  and remove secrets.js from index.html
*/
const WORKER_URL = "https://holy-star-046c.naisha-loreal.workers.dev/";

const messages = [
  {
    role: "system",
    content:
      "You are L'Oréal's Smart Routine & Product Advisor. Only answer questions about L'Oréal products, beauty routines, skincare, haircare, makeup, fragrance, ingredients, and product recommendations. If a question is unrelated, politely say that you can only help with L'Oréal products, beauty routines, and beauty-related topics. Be friendly, clear, and helpful. When giving recommendations, ask a few useful follow-up questions if needed, such as skin type, hair type, goals, or product preferences.",
  },
  {
    role: "assistant",
    content:
      "Hi! I’m your L'Oréal beauty advisor. Ask me about skincare, makeup, haircare, fragrance, or personalized routines.",
  },
];

function addMessage(text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  if (sender === "user") {
    messageDiv.classList.add("user-message");
  } else {
    messageDiv.classList.add("assistant-message");
  }

  const bubbleDiv = document.createElement("div");
  bubbleDiv.classList.add("bubble");
  bubbleDiv.textContent = text;

  messageDiv.appendChild(bubbleDiv);
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

chatWindow.innerHTML = "";
addMessage(
  "Hi! I’m your L'Oréal beauty advisor. Ask me about skincare, makeup, haircare, fragrance, or personalized routines.",
  "assistant",
);

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userText = userInput.value.trim();
  if (!userText) return;

  latestQuestion.textContent = `Latest question: ${userText}`;
  addMessage(userText, "user");

  messages.push({
    role: "user",
    content: userText,
  });

  userInput.value = "";

  try {
    let response;

    if (WORKER_URL) {
      response = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
        }),
      });
    } else {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: messages,
          temperature: 0.7,
          max_tokens: 300,
        }),
      });
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Something went wrong.");
    }

    const botReply = data.choices[0].message.content;

    addMessage(botReply, "assistant");

    messages.push({
      role: "assistant",
      content: botReply,
    });
  } catch (error) {
    addMessage(
      "Sorry, I’m having trouble connecting right now. Please try again.",
      "assistant",
    );
    console.error("Error:", error);
  }
});
