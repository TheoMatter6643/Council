document.addEventListener("DOMContentLoaded", () => {
  const DAILY_REWARD = 400;
  const COST_PER_SPIN = 10;

  const BIN_ID = "6a46bcb9f5f4af5e2955efa1";
  const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

  let coins = parseInt(localStorage.getItem("coins"));
  if (isNaN(coins)) coins = 100;

  let jackpots = parseInt(localStorage.getItem("jackpots")) || 0;
  let personalBestJackpots = parseInt(localStorage.getItem("personalBestJackpots")) || 0;
  let lastRewardDate = localStorage.getItem("lastRewardDate") || "";

  const coinsEl = document.getElementById("coins");
  const moneyBtn = document.getElementById("Money");
  const dailyMsgEl = document.getElementById("dailyRewardMessage");
  const leaderboardEl = document.getElementById("leaderboard");
  const spinBtn = document.getElementById("spin");
  const resultEl = document.getElementById("result");
  const reel1 = document.getElementById("reel1");
  const reel2 = document.getElementById("reel2");
  const reel3 = document.getElementById("reel3");

  coinsEl.textContent = "Coins: " + coins;

  moneyBtn.onclick = () => {
    coins += 10000;
    localStorage.setItem("coins", coins);
    coinsEl.textContent = "Coins: " + coins;
  };

  function giveDailyReward() {
    const today = new Date().toISOString().split("T")[0];

    if (lastRewardDate !== today) {
      coins += DAILY_REWARD;
      localStorage.setItem("coins", coins);
      localStorage.setItem("lastRewardDate", today);
      lastRewardDate = today;
      dailyMsgEl.textContent = "Daily Bonus: +" + DAILY_REWARD + " coins!";
    } else {
      dailyMsgEl.textContent = "";
    }

    coinsEl.textContent = "Coins: " + coins;
  }

  giveDailyReward();

  async function getLeaderboard() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      return data.record.leaderboard || [];
    } catch {
      return [];
    }
  }

  async function saveLeaderboard(board) {
    await fetch(API_URL, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leaderboard: board })
    });
  }

  function displayLeaderboard(board) {
    leaderboardEl.innerHTML = "";
    board.forEach((entry, index) => {
      const row = document.createElement("div");
      row.textContent = `${index + 1}. ${entry.player} — ${entry.score} jackpots`;
      leaderboardEl.appendChild(row);
    });
  }

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

  (async () => {
    const board = await getLeaderboard();
    displayLeaderboard(board);
  })();

  const symbols = ["🍒", "🍋", "🍉", "⭐", "🔔"];

  spinBtn.onclick = () => {
    if (coins < COST_PER_SPIN) {
      resultEl.textContent = "Not enough coins!";
      return;
    }

    coins -= COST_PER_SPIN;
    localStorage.setItem("coins", coins);
    coinsEl.textContent = "Coins: " + coins;

    const r1 = symbols[Math.floor(Math.random() * symbols.length)];
    const r2 = symbols[Math.floor(Math.random() * symbols.length)];
    const r3 = symbols[Math.floor(Math.random() * symbols.length)];

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

      if (r1 === "⭐" && r2 === "⭐" && r3 === "⭐") {
        reward = 100;
        isJackpot = true;
      } else if (fruits.includes(r1) && r1 === r2 && r2 === r3) {
        reward = 50;
        isJackpot = true;
      } else if (r1 === "🔔" && r2 === "🔔" && r3 === "🔔") {
        reward = 50;
        isJackpot = true;
      } else if (r1 === r2 && r2 === r3) {
        reward = 50;
        isJackpot = true;
      } else if (
        fruits.includes(r1) &&
        fruits.includes(r2) &&
        fruits.includes(r3) &&
        r1 !== r2 &&
        r1 !== r3 &&
        r2 !== r3
      ) {
        reward = 20;
      }

      coins += reward;
      localStorage.setItem("coins", coins);
      coinsEl.textContent = "Coins: " + coins;

      if (isJackpot) {
        jackpots++;
        localStorage.setItem("jackpots", jackpots);
        resultEl.textContent = `JACKPOT! +${reward} coins!`;
      } else {
        resultEl.textContent =
          reward > 0 ? `You win +${reward} coins!` : "Try again!";
      }

      if (jackpots > personalBestJackpots) {
        personalBestJackpots = jackpots;
        localStorage.setItem("personalBestJackpots", personalBestJackpots);
        updateLeaderboard(jackpots);
      }
    }, 300);
  };
});
// =========================
// BLACKJACK
// =========================

const bjStart = document.getElementById("bjStart");
const bjHit = document.getElementById("bjHit");
const bjStand = document.getElementById("bjStand");

const bjStatus = document.getElementById("bjStatus");
const bjPlayer = document.getElementById("bjPlayer");
const bjDealer = document.getElementById("bjDealer");

let bjDeck = [];
let bjPlayerHand = [];
let bjDealerHand = [];
let bjActive = false;

function bjNewDeck() {
  const cards = [];
  const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const suits = ["♠","♥","♦","♣"];
  for (let v of values) {
    for (let s of suits) {
      cards.push(v + s);
    }
  }
  return cards.sort(() => Math.random() - 0.5);
}

function bjValue(hand) {
  let total = 0;
  let aces = 0;

  for (let c of hand) {
    let v = c.slice(0, -1);
    if (v === "A") {
      total += 11;
      aces++;
    } else if (["J","Q","K"].includes(v)) {
      total += 10;
    } else {
      total += parseInt(v);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

function bjRender() {
  bjPlayer.textContent = "Player: " + bjPlayerHand.join(" ") + " (" + bjValue(bjPlayerHand) + ")";
  bjDealer.textContent = "Dealer: " + bjDealerHand.join(" ") + " (" + bjValue(bjDealerHand) + ")";
}

bjStart.onclick = () => {
  if (coins < 10) {
    bjStatus.textContent = "Not enough coins.";
    return;
  }

  coins -= 10;
  localStorage.setItem("coins", coins);
  document.getElementById("coins").textContent = "Coins: " + coins;

  bjActive = true;
  bjStatus.textContent = "Blackjack started!";
  bjDeck = bjNewDeck();
  bjPlayerHand = [bjDeck.pop(), bjDeck.pop()];
  bjDealerHand = [bjDeck.pop(), bjDeck.pop()];

  bjRender();
};

bjHit.onclick = () => {
  if (!bjActive) return;

  bjPlayerHand.push(bjDeck.pop());
  bjRender();

  if (bjValue(bjPlayerHand) > 21) {
    bjStatus.textContent = "Bust! You lose.";
    bjActive = false;
  }
};

bjStand.onclick = () => {
  if (!bjActive) return;

  while (bjValue(bjDealerHand) < 17) {
    bjDealerHand.push(bjDeck.pop());
  }

  bjRender();

  const p = bjValue(bjPlayerHand);
  const d = bjValue(bjDealerHand);

  if (d > 21 || p > d) {
    bjStatus.textContent = "You win +20 coins!";
    coins += 20;
  } else if (p === d) {
    bjStatus.textContent = "Push. +10 coins refunded.";
    coins += 10;
  } else {
    bjStatus.textContent = "Dealer wins.";
  }

  localStorage.setItem("coins", coins);
  document.getElementById("coins").textContent = "Coins: " + coins;

  bjActive = false;
};