let intervalId;
let currentIndex = 0;
let startTime;
let isPaused = false; // Track whether the reader is paused

function initializeReader(text) {
  const words = text.split(/\s+/);
  const display = document.getElementById("display");
  const summaryDiv = document.getElementById("summary");
  const wpsInput = document.getElementById("wps");
  const wordCountInput = document.getElementById("word-count");
  const startButton = document.getElementById("start");
  const pauseButton = document.getElementById("pause");

  function resetReader() {
    clearInterval(intervalId);
    intervalId = null;
    currentIndex = 0;
    isPaused = false; // Reset pause state
    display.textContent = "";
    summaryDiv.style.display = "none";
    summaryDiv.textContent = "";
    document
      .querySelectorAll(".firework")
      .forEach((firework) => firework.remove());
  }

  function updateDisplay() {
    const wordCount = parseInt(wordCountInput.value);
    const currentWords = words
      .slice(currentIndex, currentIndex + wordCount)
      .join(" ");
    display.textContent = currentWords || "End of text";
    display.style.opacity = 0;
    setTimeout(() => {
      display.style.opacity = 1;
    }, 100);
    currentIndex += wordCount;

    if (currentIndex >= words.length) {
      clearInterval(intervalId);
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      showSummary(duration, words.length);
    }
  }

  function showSummary(duration, wordCount) {
    fetch("/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration, word_count: wordCount }),
    })
      .then((response) => response.json())
      .then((data) => {
        summaryDiv.textContent = data.message;
        summaryDiv.style.display = "block";
        createFireworks();
      });
  }

  function createFireworks() {
    for (let i = 0; i < 20; i++) {
      const firework = document.createElement("div");
      firework.classList.add("firework");
      firework.style.top = `${Math.random() * 100}vh`;
      firework.style.left = `${Math.random() * 100}vw`;
      document.body.appendChild(firework);
      setTimeout(() => firework.remove(), 2000); // Extended duration
    }
  }

  startButton.addEventListener("click", () => {
    if (!intervalId) {
      resetReader();
      startTime = Date.now();
      const wps = parseFloat(wpsInput.value);
      const interval = 1000 / wps;
      intervalId = setInterval(updateDisplay, interval);
    }
  });

  pauseButton.addEventListener("click", () => {
    if (isPaused) {
      // Resume reading
      const wps = parseFloat(wpsInput.value);
      const interval = 1000 / wps;
      intervalId = setInterval(updateDisplay, interval);
      isPaused = false;
      pauseButton.textContent = "Pause"; // Update button text
    } else {
      // Pause reading
      clearInterval(intervalId);
      intervalId = null;
      isPaused = true;
      pauseButton.textContent = "Resume"; // Update button text
    }
  });
}
