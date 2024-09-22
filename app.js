const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    "x-cg-demo-api-key": "CG-WogY5GLVLdLgP5zUPE6sitLV",
  },
};

const loader = document.querySelector("#loader-container");
let coinsData = [];
let currentPage = 1;

const baseUrl = `https://api.coingecko.com/api`;
const tableBody = document.querySelector("#crypto-table tbody");
const prevBtn = document.querySelector("#prev-button");
const nextBtn = document.querySelector("#next-button");
const searchBox = document.getElementById("search-box");
const sortPriceAsc = document.getElementById("sort-price-asc");
const sortPriceDsc = document.getElementById("sort-price-dsc");
const sortVolumeAsc = document.getElementById("sort-volume-asc");
const sortVolumeDsc = document.getElementById("sort-volume-dsc");
const sortMarketAsc = document.getElementById("sort-market-asc");
const sortMarketDsc = document.getElementById("sort-market-dsc");

const showLoader = () => {
  loader.style.display = "block";
};

const hideLoader = () => {
  loader.style.display = "none";
};
const fetchCoins = async (page = 1) => {
  try {
    showLoader();
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&per_page=10&page=${page}`,
      options
    );
    const data = await response.json();
    console.log(data);
    coinsData = data;
    return data;
  } catch (error) {
    console.log(error);
  } finally {
    hideLoader();
  }
};

const toggleFavorite = (coinId) => {
  let favCoins = JSON.parse(localStorage.getItem("favCoins")) || [];
  if (favCoins.includes(coinId)) {
    favCoins = favCoins.filter((id) => id !== coinId);
  } else {
    favCoins.push(coinId);
  }
  return favCoins;
};

const renderCoins = (coins, page) => {
  const start = (page - 1) * 10 + 1;
  let favCoins = JSON.parse(localStorage.getItem("favCoins")) || [];
  tableBody.textContent = "";
  coins.forEach((coin, index) => {
    const row = document.createElement("tr");
    const isFav = favCoins.includes(coin.id);
    row.innerHTML = `
    <td>${start + index}</td>
    <td><img src=${coin.image} ></td>
    <td>$${coin.name}</td>
    <td>$${coin.current_price?.toLocaleString()}</td>
    <td>$${coin.total_volume?.toLocaleString()}</td>
    <td>${coin.market_cap.toLocaleString()}</td>
    <td><i id="favorite-icon" class="fa-solid fa-star ${
      isFav ? "favorite" : ""
    }"></i></i></td>
    `;
    row.addEventListener("click", (e) => {
      window.location.href = `./coin/coin.html?id=${coin.id}`;
    });
    const favoriteBtn = row.querySelector("#favorite-icon");
    favoriteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const favCoins = toggleFavorite(coin.id);
      localStorage.setItem("favCoins", JSON.stringify(favCoins));
      renderCoins(coins, currentPage);
    });
    tableBody.appendChild(row);
  });
};

const handlePrevBtnClick = async (e) => {
  e.preventDefault();
  if (currentPage > 1) {
    currentPage--;
    const coins = await fetchCoins(currentPage);
    coinsData = coins;
    renderCoins(coins, currentPage);
  }
  updatePaginationControls();
};
const handleNextBtnClick = async (e) => {
  if (currentPage < 8) {
    e.preventDefault();

    currentPage++;
    console.log(currentPage);
    const coins = await fetchCoins(currentPage);
    coinsData = coins;
    renderCoins(coins, currentPage);
  }
  updatePaginationControls();
};

const updatePaginationControls = () => {
  if (currentPage == 1) {
    prevBtn.disabled = true;
    prevBtn.classList.add("disabled");
  } else {
    prevBtn.disabled = false;
    prevBtn.classList.remove("disabled");
  }
  if (currentPage == 8) {
    nextBtn.disabled = true;
    nextBtn.classList.add("disabled");
  } else {
    nextBtn.disabled = false;
    nextBtn.classList.remove("disabled");
  }
};
prevBtn.addEventListener("click", handlePrevBtnClick);
nextBtn.addEventListener("click", handleNextBtnClick);

document.addEventListener("DOMContentLoaded", async () => {
  console.log(currentPage);
  const coins = await fetchCoins(currentPage);
  renderCoins(coins, currentPage);
  updatePaginationControls();
  prevBtn.style.display = "block";
  nextBtn.style.display = "block";
});

searchBox.addEventListener("keyup", async (e) => {
  let searchQuery = e.target.value;
  if (searchQuery.trim().length > 1) {
    try {
      showLoader();
      const response = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${searchQuery}`,
        options
      );
      const data = await response.json();
      const allIds = data.coins.map((coin) => coin.id);

      const response2 = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&ids=${allIds.join(
          "%2C"
        )}`,
        options
      );
      const coins = await response2.json();
      coinsData = coins;
      renderCoins(coins, 1);
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    } catch (err) {
      console.log(err);
    } finally {
      hideLoader();
    }
  }
});

const sortVolume = (order) => {
  coinsData.sort((a, b) =>
    order == "asc"
      ? a.total_volume - b.total_volume
      : b.total_volume - a.total_volume
  );
  renderCoins(coinsData, currentPage);
};
const sortPrice = (order) => {
  coinsData.sort((a, b) =>
    order == "asc"
      ? a.current_price - b.current_price
      : b.current_price - a.current_price
  );
  renderCoins(coinsData, currentPage);
};

const sortMarketCap = (order) => {
  coinsData.sort((a, b) =>
    order == "asc" ? a.market_cap - b.market_cap : b.market_cap - a.market_cap
  );
  renderCoins(coinsData, currentPage);
};

sortVolumeAsc.addEventListener("click", () => {
  sortVolume("asc");
});
sortVolumeDsc.addEventListener("click", () => {
  sortVolume("dsc");
});
sortPriceAsc.addEventListener("click", () => {
  sortPrice("asc");
});
sortPriceDsc.addEventListener("click", () => {
  sortPrice("dsc");
});
sortMarketAsc.addEventListener("click", () => {
  sortMarketCap("asc");
});
sortMarketDsc.addEventListener("click", () => {
  sortMarketCap("dsc");
});
