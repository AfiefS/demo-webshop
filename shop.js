const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Lemon", emoji: "🍋" },
  skewers: { name: "Wooden Skewers (5-pack)", emoji: "🥢", isFreeItem: true },
};

const FRUITS_PER_SKEWER_PACK = 3;

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

function getFruitCount(basket) {
  return basket.filter((item) => item !== "skewers").length;
}

function getRequiredSkewerPacks(fruitCount) {
  return Math.floor(fruitCount / FRUITS_PER_SKEWER_PACK);
}

function updateSkewersInBasket() {
  const basket = getBasket();
  const fruitCount = getFruitCount(basket);
  const requiredSkewers = getRequiredSkewerPacks(fruitCount);
  const currentSkewers = basket.filter((item) => item === "skewers").length;

  if (requiredSkewers === currentSkewers) return;

  const basketWithoutSkewers = basket.filter((item) => item !== "skewers");
  const newSkewers = Array(requiredSkewers).fill("skewers");
  const newBasket = [...basketWithoutSkewers, ...newSkewers];

  localStorage.setItem("basket", JSON.stringify(newBasket));
}

function addToBasket(product) {
  const basket = getBasket();
  basket.push(product);
  localStorage.setItem("basket", JSON.stringify(basket));
  updateSkewersInBasket();
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
  basket.forEach((product) => {
    const item = PRODUCTS[product];
    if (item) {
      const li = document.createElement("li");
      const freeLabel = item.isFreeItem ? " <span class='free-label'>FREE</span>" : "";
      li.innerHTML = `<span class='basket-emoji'>${item.emoji}</span> <span>${item.name}${freeLabel}</span>`;
      basketList.appendChild(li);
    }
  });
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
}

function getOrCreateIndicator() {
  const existingIndicator = document.querySelector(".basket-indicator");
  if (existingIndicator) return existingIndicator;

  const basketLink = document.querySelector(".basket-link");
  if (!basketLink) return null;

  const indicator = document.createElement("span");
  indicator.className = "basket-indicator";
  basketLink.appendChild(indicator);
  return indicator;
}

function renderBasketIndicator() {
  const basket = getBasket();
  const indicator = getOrCreateIndicator();
  if (!indicator) return;

  if (basket.length > 0) {
    indicator.textContent = basket.length;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
} else {
  document.addEventListener("DOMContentLoaded", renderBasketIndicator);
}

// Patch basket functions to update indicator
const origAddToBasket = window.addToBasket;
window.addToBasket = function (product) {
  origAddToBasket(product);
  renderBasketIndicator();
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
};
