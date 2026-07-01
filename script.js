const DAILY_REWARD = 200;
const COST_PER_SPIN = 10;
const JACKPOT_REWARD = 50;

// Load coins or set default
let coins = parseInt(localStorage.getItem("coins")) || 100;

// Load last reward date
let lastRewardDate = localStorage.getItem("lastRewardDate");

// Display coins
document.getElementById("coins").textContent = "Coins: " + coins;

// ---------------------------
// Daily Reward Logic
// ---------------------------

function giveDailyReward() {
  const today = new Date().toDateString();

  if (lastRewardDate !== today) {
    coins += DAILY_REWARD;
    localStorage.setItem("coins", coins);
    localStorage.setItem("lastRewardDate", today);

    document.getElementById("dailyRewardMessage").textContent =
      "Daily Bonus: +" + DAILY_REWARD + " coins!";
  } else {
    document.getElementById("dailyRewardMessage").textContent =
      "Daily Bonus already claimed today.";
  }

  document.getElementById("coins").textContent = "Coins: " + coins;
}

giveDailyReward();

// ---------------------------
// Slot Machine Logic
// ---------------------------

const symbols = ["🍒", "🍋", "⭐", "🍉", "🔔"];

document.getElementById("spin").onclick = () => {
  if (coins < COST_PER_SPIN) {
    document.getElementById("result").textContent = "Not enough coins!";
    return;
  }

  coins -= COST_PER_SPIN;
  localStorage.setItem("coins", coins);
  document.getElementById("coins").textContent = "Coins: " + coins;

  const r1 = symbols[Math.floor(Math.random() * symbols.length)];
  const r2 = symbols[Math.floor(Math.random() * symbols.length)];
  const r3 = symbols[Math.floor(Math.random() * symbols.length)];

  const reel1 = document.getElementById("reel1");
  const reel2 = document.getElementById("reel2");
  const reel3 = document.getElementById("reel3");

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

    if (r1 === r2 && r2 === r3) {
      coins += JACKPOT_REWARD;
      document.getElementById("result").textContent =
        "JACKPOT! +" + JACKPOT_REWARD + " coins!";
    } else {
      document.getElementById("result").textContent = "Try again!";
    }

    localStorage.setItem("coins", coins);
    document.getElementById("coins").textContent = "Coins: " + coins;
  }, 300);
};