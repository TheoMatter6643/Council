const DAILY_REWARD = 200;
const COST_PER_SPIN = 10;
const JACKPOT_REWARD = 50;

const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

let coins = parseInt(localStorage.getItem("coins")) || 100;
let lastRewardDate = localStorage.getItem("lastRewardDate");

document.getElementById("coins").textContent = "Coins: " + coins;

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

async function getLeaderboard() {
  const res = await fetch(API_URL);
  const data = await res.json();
  return data.record.leaderboard;
}

async function saveLeaderboard(board) {
  await fetch(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ leaderboard: board })
  });
}

async function updateLeaderboard(newScore) {
  let board = await getLeaderboard();
  const name = document.getElementById("playerName").value.trim() || "Anonymous";

  const existing = board.find(entry => entry.player === name);

  if (existing && existing.score >= newScore) {
    displayLeaderboard(board);
    return;
  }

  if (existing) {
    existing.score = newScore;
    existing.date = new Date().toLocaleDateString();
  } else {
    board.push({
      player: name,
      score: newScore,
      date: new Date().toLocaleDateString()
    });
  }

  board.sort((a, b) => b.score - a.score);
  board = board.slice(0, 10);

  await saveLeaderboard(board);
  displayLeaderboard(board);
}

function displayLeaderboard(board) {
  const lb = document.getElementById("leaderboard");
  lb.innerHTML = "";

  board.forEach((entry, index) => {
    const row = document.createElement("div");
    row.textContent = `${index + 1}. ${entry.player} — ${entry.score} coins`;
    lb.appendChild(row);
  });
}

(async () => {
  const board = await getLeaderboard();
  displayLeaderboard(board);
})();

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

    updateLeaderboard(coins);
  }, 300);
};