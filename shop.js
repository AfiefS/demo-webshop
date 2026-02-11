const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Lemon", emoji: "🍋" },
  orange: { name: "Orange", emoji: "🍊" },
};

function getBasket() {
  try {
    const basket = localStorage.getItem("basket");
    if (!basket) return [];
    const parsed = JSON.parse(basket);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Error parsing basket from localStorage:", error);
    return [];
  }
}

function addToBasket(product) {
  const basket = getBasket();
  basket.push(product);
  localStorage.setItem("basket", JSON.stringify(basket));
}

function clearBasket() {
  localStorage.removeItem("basket");
}

function renderBasket() {
  const basket = getBasket();
  const basketList = document.getElementById("basketList");
  const cartButtonsRow = document.querySelector(".cart-buttons-row");
  if (!basketList) return;
  basketList.innerHTML = "";
  if (basket.length === 0) {
    basketList.innerHTML = "<li>No products in basket.</li>";
    if (cartButtonsRow) cartButtonsRow.style.display = "none";
    return;
  }
  // Render purchased items
  basket.forEach((product) => {
    const item = PRODUCTS[product];
    if (item) {
      const li = document.createElement("li");
      li.innerHTML = `<span class='basket-emoji'>${item.emoji}</span> <span>${item.name}</span>`;
      basketList.appendChild(li);
    }
  });

  // Compute freebies: 1 free orange for every 4 apples
  const appleCount = basket.filter((p) => p === "apple").length;
  const freeOranges = Math.floor(appleCount / 4);
  for (let i = 0; i < freeOranges; i++) {
    const orange = PRODUCTS["orange"];
    if (orange) {
      const li = document.createElement("li");
      li.innerHTML = `<span class='basket-emoji'>${orange.emoji}</span> <span>${orange.name} <strong>(free)</strong></span>`;
      li.classList.add("freebie");
      basketList.appendChild(li);
    }
  }
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
}

function renderBasketIndicator() {
  const basket = getBasket();
  let indicator = document.querySelector(".basket-indicator");
  if (!indicator) {
    const basketLink = document.querySelector(".basket-link");
    if (!basketLink) return;
    indicator = document.createElement("span");
    indicator.className = "basket-indicator";
    basketLink.appendChild(indicator);
  }
  // Include freebies in the indicator count
  const appleCount = basket.filter((p) => p === "apple").length;
  const freeOranges = Math.floor(appleCount / 4);
  const totalCount = basket.length + freeOranges;
  if (totalCount > 0) {
    indicator.textContent = totalCount;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
  renderBasket();
} else {
  document.addEventListener("DOMContentLoaded", function () {
    renderBasketIndicator();
    renderBasket();
  });
}

// Patch basket functions to update indicator
const origAddToBasket = window.addToBasket;
window.addToBasket = function (product) {
  origAddToBasket(product);
  renderBasket();
  renderBasketIndicator();
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasket();
  renderBasketIndicator();
};
