/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const workerUrl = "https://winter-dawn-3baa.zwhite6.workers.dev/";


// Keep the conversation history so the bot can respond with context.
const conversationMessages = [
  {
    role: "system",
    content:
      "You are a helpful L'Oréal beauty assistant. Answer only questions about L'Oréal products, beauty routines, skincare, haircare, makeup, and fragrance.",
  },
];


// A short list of words that make a question relevant to L'Oréal.
const lorealKeywords = [
  "loreal",
  "l'oréal",
  "beauty",
  "makeup",
  "skincare",
  "haircare",
  "fragrance",
  "routine",
  "product",
  "foundation",
  "lipstick",
  "mascara",
  "serum",
  "moisturizer",
  "cleanser",
  "shampoo",
  "conditioner",
  "perfume",
  "hair",
  "skin",
];


// Check if the message looks like an L'Oréal question.
function isLOréalQuestion(message) {
  const lowerMessage = message.toLowerCase();
  return lorealKeywords.some((keyword) => lowerMessage.includes(keyword));
}


// Add a message to the chat display.
function addMessageToChat(role, text) {
  const message = document.createElement("p");
  const label = role === "user" ? "You" : "Bot";
  message.innerHTML = `<strong>${label}:</strong> ${text}`;
  if (role === "user") {
    message.classList.add("user-message");
  } else {
    message.classList.add("bot-message");
  }
  chatWindow.appendChild(message);
}


// Send the user message to the worker and return the bot reply.
async function getBotReply(messages) {
  const latestMessage = messages[messages.length - 1].content;


  // If the message is not about L'Oréal, answer with a simple reminder.
  if (!isLOréalQuestion(latestMessage)) {
    return "I can only help with L'Oréal products, beauty routines, and skincare questions.";
  }


  const response = await fetch(workerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages,
    }),
  });


  const data = await response.json();


  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content;
  }


  return "I am having trouble reaching the assistant right now. Please try again.";
}


// Set initial message
addMessageToChat("bot", "👋 Hello! Ask me about L'Oréal products or routines.");


/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();


  const userMessage = userInput.value.trim();


  if (!userMessage) {
    return;
  }


  // Save the user's message in the conversation history.
  conversationMessages.push({ role: "user", content: userMessage });


  // Show the user's message in the chat window.
  addMessageToChat("user", userMessage);
  userInput.value = "";


  // Show a temporary loading message.
  const loadingMessage = document.createElement("p");
  loadingMessage.innerHTML = "<strong>Bot:</strong> Thinking...";
  chatWindow.appendChild(loadingMessage);


  // Get the reply from the worker using the full conversation history.
  const reply = await getBotReply(conversationMessages);


  // Save the bot reply in the conversation history.
  conversationMessages.push({ role: "assistant", content: reply });


  // Replace the loading message with the real reply.
  loadingMessage.innerHTML = `<strong>Bot:</strong> ${reply}`;
  chatWindow.scrollTop = chatWindow.scrollHeight;
});
