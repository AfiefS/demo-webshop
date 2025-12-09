const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Lemon", emoji: "🍋" },
};

function getBasket() {
  try {
    const basket = localStorage.getItem("basket");
    if (!basket) return [];
    const parsed = JSON.parse(basket);
    if (!Array.isArray(parsed)) return [];

    // Migrate old format (array of strings) to new format (array of objects with quantity)
    if (parsed.length > 0 && typeof parsed[0] === "string") {
      // Old format: ["apple", "apple", "banana"]
      // Convert to new format: [{product: "apple", quantity: 2}, {product: "banana", quantity: 1}]
      const counts = parsed.reduce((acc, product) => {
        acc[product] = (acc[product] || 0) + 1;
        return acc;
      }, {});
      return Object.keys(counts).map((product) => ({
        product: product,
        quantity: counts[product],
      }));
    }

    return parsed;
  } catch (error) {
    console.warn("Error parsing basket from localStorage:", error);
    return [];
  }
}

function addToBasket(product) {
  const basket = getBasket();
  const existingIndex = basket.findIndex((item) => item.product === product);

  if (existingIndex >= 0) {
    // Product already exists, increment quantity
    const updatedBasket = [...basket];
    updatedBasket[existingIndex] = {
      ...updatedBasket[existingIndex],
      quantity: updatedBasket[existingIndex].quantity + 1,
    };
    localStorage.setItem("basket", JSON.stringify(updatedBasket));
  } else {
    // New product, add with quantity 1
    const updatedBasket = [...basket, { product: product, quantity: 1 }];
    localStorage.setItem("basket", JSON.stringify(updatedBasket));
  }
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
  basket.forEach((basketItem) => {
    const item = PRODUCTS[basketItem.product];
    if (item) {
      const li = document.createElement("li");
      li.innerHTML = `<span class='basket-emoji'>${item.emoji}</span> <span>${basketItem.quantity}x ${item.name}</span>`;
      basketList.appendChild(li);
    }
  });
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
}

function renderBasketIndicator() {
  const basket = getBasket();
  const existingIndicator = document.querySelector(".basket-indicator");
  const indicator =
    existingIndicator ||
    (() => {
      const basketLink = document.querySelector(".basket-link");
      if (!basketLink) return null;
      const newIndicator = document.createElement("span");
      newIndicator.className = "basket-indicator";
      basketLink.appendChild(newIndicator);
      return newIndicator;
    })();

  if (!indicator) return;

  const totalItems = basket.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );
  if (totalItems > 0) {
    indicator.textContent = totalItems;
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
