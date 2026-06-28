const symbols = ["🍒", "🍋", "⭐", "🍉", "🔔"];

document.getElementById("spin").onclick = () => {
  const r1 = symbols[Math.floor(Math.random() * symbols.length)];
  const r2 = symbols[Math.floor(Math.random() * symbols.length)];
  const r3 = symbols[Math.floor(Math.random() * symbols.length)];

  const reel1 = document.getElementById("reel1");
  const reel2 = document.getElementById("reel2");
  const reel3 = document.getElementById("reel3");

  // Add spin animation
  reel1.classList.add("spin-animation");
  reel2.classList.add("spin-animation");
  reel3.classList.add("spin-animation");

  setTimeout(() => {
    reel1.textContent = r1;
    reel2.textContent = r2;
    reel3.textContent = r3;

    reel1.classList.remove("spin-animation");
    reel2.classList.remove("spin-animation");
    reel3.classList.remove("spin-animation");

    // Check win
    if (r1 === r2 && r2 === r3) {
      document.getElementById("result").textContent = "JACKPOT!";
    } else {
      document.getElementById("result").textContent = "Try again!";
    }
  }, 300);
};