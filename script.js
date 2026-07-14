document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // SLOT MACHINE + DAILY REWARD + LEADERBOARD
  // (your entire existing code stays exactly the same)
  // =========================

  // ... all your current code up to the end of spinBtn.onclick ...

  // =========================
  // BLACKJACK (Dealer hole card hidden)
  // =========================

  const bjBetInput = document.getElementById("bjBet");
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
  let bjBet = 0;
  let dealerHoleCard = "";

  function bjNewDeck() {
    const cards = [];
    const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
    const suits = ["♠","♥","♦","♣"];
    for (let v of values) {
      for (let s of suits) cards.push(v + s);
    }
    return cards.sort(() => Math.random() - 0.5);
  }

  function bjValue(hand) {
    let total = 0;
    let aces = 0;

    for (let c of hand) {
      const v = c.slice(0, -1);
      if (v === "A") { total += 11; aces++; }
      else if (["J","Q","K"].includes(v)) total += 10;
      else total += parseInt(v, 10);
    }

    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }

    return total;
  }

  function bjIsBlackjack(hand) {
    return hand.length === 2 && bjValue(hand) === 21;
  }

  function bjRender(showDealerHole = false) {
    bjPlayer.textContent =
      "Player: " + bjPlayerHand.join(" ") + " (" + bjValue(bjPlayerHand) + ")";

    if (!showDealerHole) {
      bjDealer.textContent =
        "Dealer: " + bjDealerHand[0] + " [HIDDEN]";
    } else {
      bjDealer.textContent =
        "Dealer: " + bjDealerHand.join(" ") + " (" + bjValue(bjDealerHand) + ")";
    }
  }

  bjStart.onclick = () => {
    bjBet = Number(bjBetInput.value.trim());

    if (!Number.isFinite(bjBet) || bjBet < 1) {
      bjStatus.textContent = "Invalid bet.";
      return;
    }

    if (coins < bjBet) {
      bjStatus.textContent = "Not enough coins.";
      return;
    }

    coins -= bjBet;
    localStorage.setItem("coins", coins);
    document.getElementById("coins").textContent = "Coins: " + coins;

    bjActive = true;
    bjStatus.textContent = "Blackjack started!";
    bjDeck = bjNewDeck();

    bjPlayerHand = [bjDeck.pop(), bjDeck.pop()];
    bjDealerHand = [bjDeck.pop(), bjDeck.pop()];
    dealerHoleCard = bjDealerHand[1];

    bjRender(false);

    if (bjIsBlackjack(bjPlayerHand)) {
      bjActive = false;

      if (bjIsBlackjack(bjDealerHand)) {
        bjStatus.textContent = "Both blackjack! Push.";
        coins += bjBet;
      } else {
        bjStatus.textContent = "Blackjack! You win 3:2.";
        coins += Math.round(bjBet * 2.5);
      }

      localStorage.setItem("coins", coins);
      document.getElementById("coins").textContent = "Coins: " + coins;

      bjRender(true);
    }
  };

  bjHit.onclick = () => {
    if (!bjActive) return;

    bjPlayerHand.push(bjDeck.pop());
    bjRender(false);

    if (bjValue(bjPlayerHand) > 21) {
      bjStatus.textContent = "Bust! You lose.";
      bjActive = false;
      bjRender(true);
    }
  };

  bjStand.onclick = () => {
    if (!bjActive) return;

    bjRender(true);

    while (bjValue(bjDealerHand) < 17) {
      bjDealerHand.push(bjDeck.pop());
    }

    bjRender(true);

    const p = bjValue(bjPlayerHand);
    const d = bjValue(bjDealerHand);

    if (d > 21) {
      bjStatus.textContent = "Dealer busts! You win.";
      coins += bjBet * 2;
    } else if (p > d) {
      bjStatus.textContent = "You win!";
      coins += bjBet * 2;
    } else if (p === d) {
      bjStatus.textContent = "Push. Bet refunded.";
      coins += bjBet;
    } else {
      bjStatus.textContent = "Dealer wins.";
    }

    localStorage.setItem("coins", coins);
    document.getElementById("coins").textContent = "Coins: " + coins;

    bjActive = false;
  };

});