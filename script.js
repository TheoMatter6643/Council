const DAILY_REWARD = 200;
const COST_PER_SPIN = 10;

// IMPORTANT: Use /latest so PATCH updates the JSON instead of replacing metadata
const API_URL = `https://api.jsonbin.io/v3/b/${"6a46bcb9f5f4af5e2955efa1"}/latest`;

// Load coins safely
let coins = parseInt(localStorage.getItem("coins"));
if (isNaN(coins)) coins = 100;

let jackpots = parseInt(localStorage.getItem("jackpots")) || 0;
let personalBestJackpots = parseInt(localStorage.getItem("personalBestJackpots")) || 0;

// Load last reward date
let lastRewardDate = localStorage.getItem("lastRewardDate") || "";

document.getElementById("coins").textContent = "Coins: " + coins;

// SECRET MONEY BUTTON
document.getElementById("Money").onclick = () => {
  coins += 10000;
  localStorage.setItem("coins", coins);
  document.getElementById("coins").textContent = "Coins: " + coins;
};

// DAILY BONUS (fixed)
function giveDailyReward() {
  const today = new Date().toISOString().split("T")[0];

  if (lastRewardDate !== today) {
    coins += DAILY_REWARD;
    localStorage.setItem("coins", coins);
    localStorage.setItem("lastRewardDate", today);
    lastRewardDate = today;

    document.getElementById("dailyRewardMessage").textContent =
      "Daily Bonus: +" + DAILY_REWARD + " coins!";
  } else {
    document.getElementById("dailyRewardMessage").textContent = "";
  }

  document.getElementById("coins").textContent = "Coins: " + coins;
}

giveDailyReward();

// GET LEADERBOARD
async function getLeaderboard() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    return data.record.leaderboard || [];
  } catch {
    return [];
  }
}

// SAVE LEADERBOARD (PATCH so it does NOT replace entire bin)
async function saveLeaderboard(board) {
  await fetch(API_URL, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leaderboard: board })
  });
}

// UPDATE LEADERBOARD
async function updateLeaderboard(newJackpotCount) {
  let board = await getLeaderboard();
  const name = document.getElementById("playerName").value.trim() || "Anonymous";

  let existing = board.find(entry => entry.player === name);

  if (existing) {
    if (existing.score >= newJackpotCount) {
      displayLeaderboard(board);
      return;
    }
    existing.score = newJackpotCount;
    existing.date = new Date().toLocaleDateString();
  } else {
    board.push({
      player: name,
      score: newJackpotCount,
      date: new Date().toLocaleDateString()
    });
  }

  board.sort((a, b) => b.score - a.score);
  board = board.slice(0, 10);

  await saveLeaderboard(board);
  displayLeaderboard(board);
}

// DISPLAY LEADERBOARD
function displayLeaderboard(board) {
  const lb = document.getElementById("leaderboard");
  lb.innerHTML = "";

  board.forEach((entry, index) => {
    const row = document.createElement("div");
    row.textContent = `${index + 1}. ${entry.player} — ${entry.score} jackpots`;
    lb.appendChild(row);
  });
}

// LOAD LEADERBOARD ON START
(async () => {
  const board = await getLeaderboard();
  displayLeaderboard(board);
})();

// SLOT MACHINE SYMBOLS
const symbols = ["🍒", "🍋", "🍉", "⭐", "🔔"];

// SPIN BUTTON
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

    let reward = 0;
    let isJackpot = false;

    const fruits = ["🍒", "🍋", "🍉"];

    // 3 stars = 100 jackpot
    if (r1 === "⭐" && r2 === "⭐" && r3 === "⭐") {
      reward = 100;
      isJackpot = true;
    }

    // 3 same fruit = 50 jackpot
    else if (fruits.includes(r1) && r1 === r2 && r2 === r3) {
      reward = 50;
      isJackpot = true;
    }

    // 3 bells = 50 jackpot
    else if (r1 === "🔔" && r2 === "🔔" && r3 === "🔔") {
      reward = 50;
      isJackpot = true;
    }

    // 3 of anything else = 50 jackpot
    else if (r1 === r2 && r2 === r3) {
      reward = 50;
      isJackpot = true;
    }

    // 3 different fruits = 20
    else if (
      fruits.includes(r1) &&
      fruits.includes(r2) &&
      fruits.includes(r3) &&
      r1 !== r2 &&
      r1 !== r3 &&
      r2 !== r3
    ) {
      reward = 20;
    }

    // Apply reward
    coins += reward;
    localStorage.setItem("coins", coins);
    document.getElementById("coins").textContent = "Coins: " + coins;

    // Jackpot handling
    if (isJackpot) {
      jackpots++;
      localStorage.setItem("jackpots", jackpots);
      document.getElementById("result").textContent =
        `JACKPOT! +${reward} coins!`;
    } else {
      document.getElementById("result").textContent =
        reward > 0 ? `You win +${reward} coins!` : "Try again!";
    }
    
    if (jackpots > personalBestJackpots) {
      personalBestJackpots = jackpots;
      localStorage.setItem("personalBestJackpots", personalBestJackpots);
      updateLeaderboard(jackpots);
    }
  }, 300);
};
