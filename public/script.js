const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const sendButton = form.querySelector("button");
const chatBox = document.getElementById("chat-box");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  input.value = "";

  // Nonaktifkan form saat menunggu balasan
  input.disabled = true;
  sendButton.disabled = true;

  // Show a "typing..." indicator
  const typingIndicatorHTML = `
    <div class="typing-indicator">
      <span></span><span></span><span></span>
    </div>
  `;
  const typingIndicator = appendMessage("bot", typingIndicatorHTML);

  fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: userMessage }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Remove the "typing..." indicator
      chatBox.removeChild(typingIndicator);
      if (data.reply) {
        appendMessage("bot", data.reply);
      } else {
        throw new Error("Invalid response from server.");
      }
    })
    .catch((error) => {
      console.error("Fetch Error:", error);
      // Only remove the indicator if it hasn't been removed already
      if (typingIndicator.parentNode === chatBox) {
        chatBox.removeChild(typingIndicator);
      }
      appendMessage("bot", "Error: Could not get a response.");
    })
    .finally(() => {
      // Aktifkan kembali form dan fokus ke input
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();
    });
});

function appendMessage(sender, content) {
  // Create a wrapper for the entire message row
  const messageWrapper = document.createElement("div");
  messageWrapper.classList.add("message-wrapper", `message-wrapper-${sender}`);

  // Create the message bubble itself
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  // Gunakan textContent untuk input pengguna (mencegah XSS)
  // dan innerHTML untuk balasan bot/indikator (agar bisa render HTML)
  if (sender === "user") {
    msg.textContent = content;
  } else {
    msg.innerHTML = content;
  }

  // Append the message bubble to its wrapper, and the wrapper to the chatbox
  messageWrapper.appendChild(msg);
  chatBox.appendChild(messageWrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
  return messageWrapper; // Return the wrapper to be used as the typing indicator
}
