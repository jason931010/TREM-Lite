/* eslint-disable no-undef */

// 版本號
const version = document.getElementById("version");
version.textContent = "2.0.0";

// UUID
const uuid = document.getElementById("uuid");
uuid.textContent = "undefined";

// 左側選單按鈕點擊
document.querySelectorAll(".setting-buttons .button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".setting-options-page").forEach(page => {
      page.classList.remove("active");
    });

    const targetPage = button.getAttribute("for");
    document.querySelector(`.${targetPage}`).classList.add("active");


    document.querySelectorAll(".setting-buttons .button").forEach(btn => {
      btn.classList.remove("on");
    });

    button.classList.add("on");
  });
});

const SettingWrapper = document.querySelector(".setting-wrapper");
const SelectWrapper = document.querySelector(".select-wrapper");
const SettingBtn = document.querySelector("#nav-settings-panel");
const Back = document.querySelector(".back_to_home");

const ResetBtn = document.querySelector(".setting-reset-btn");
const ResetConfirmWrapper = document.querySelector(".reset-confirm-wrapper");
const ResetCancel = document.querySelector(".reset-cancel");
const ResetSure = document.querySelector(".reset-sure");

const LocationWrapper = document.querySelector(".location");
const localSelect = SelectWrapper.querySelector(".current-local");
const localItems = SelectWrapper.querySelector(".local");
const CitySelect = SelectWrapper.querySelector(".current-city");
const CityItems = SelectWrapper.querySelector(".city");
const TownSelect = SelectWrapper.querySelector(".current-town");
const TownItems = SelectWrapper.querySelector(".town");

// 重置按鈕點擊事件
ResetBtn.addEventListener("click", () => {
  ResetConfirmWrapper.style.display = "block";
  requestAnimationFrame(() => {
    ResetConfirmWrapper.style.opacity = "1";
  });
});

document.addEventListener("click", (event) => {
  const target = event.target;
  const resetWrapper = document.querySelector(".reset-confirm-wrapper");
  const isClickInsideResetWrapper = resetWrapper.contains(target);
  const isResetBtn = target === ResetBtn || ResetBtn.contains(target);
  if (!isClickInsideResetWrapper && !isResetBtn)
    resetWrapper.style.display = "none";

});

// 確定重置按鈕點擊事件
ResetSure.addEventListener("click", () => {
  ResetConfirmWrapper.style.display = "none";
});

// 取消重置按鈕點擊事件
ResetCancel.addEventListener("click", () => {
  ResetConfirmWrapper.style.display = "none";
});

// 設定按鈕點擊事件
SettingBtn.addEventListener("click", () => {
  SettingWrapper.style.display = "block";
  requestAnimationFrame(() => {
    SettingWrapper.style.opacity = "1";
  });
});

// 返回按鈕點擊事件
Back.addEventListener("click", () => {
  SettingWrapper.style.display = "none";
  requestAnimationFrame(() => {
    SettingWrapper.style.opacity = "0";
  });
});

const localArr = {
  "北部" : ["臺北市", "新北市", "基隆市", "新竹市", "桃園市", "新竹縣", "宜蘭縣"],
  "中部" : ["臺中市", "苗栗縣", "彰化縣", "南投縣", "雲林縣"],
  "南部" : ["高雄市", "臺南市", "嘉義市", "嘉義縣", "屏東縣", "澎湖縣"],
  "東部" : ["花蓮縣", "臺東縣"],
  "外島" : ["金門縣", "連江縣"],
  "南韓" : ["南楊州市"],
  "中國" : ["重慶市"],
};

const cityToTowns = {
  "南楊州市" : ["和道邑"],
  "重慶市"  : ["北碚區"],
};

// 下拉選單點擊事件
LocationWrapper.addEventListener("click", function() {
  const ArrowSpan = this.querySelector(".selected-btn");
  if (ArrowSpan.textContent.trim() === "keyboard_arrow_up")
    ArrowSpan.textContent = "keyboard_arrow_down";
  else
    ArrowSpan.textContent = "keyboard_arrow_up";
  SelectWrapper.classList.toggle("select-show");
});


// 通用點擊選擇事件
const addSelectEvent = (itemsContainer, selectElement) => {
  itemsContainer.addEventListener("click", (event) => {
    const closestDiv = event.target.closest(".select-items > div");
    if (closestDiv) {
      const selectedText = closestDiv.textContent;
      selectElement.textContent = selectedText;

      itemsContainer.querySelectorAll("div").forEach(div => div.classList.remove("select-option-selected"));
      closestDiv.classList.add("select-option-selected");
    }
  });
};

// 更新目前選擇的city、town
const updateSelectItems = (itemsContainer, items) => {
  itemsContainer.innerHTML = "";
  items.forEach(item => {
    const div = document.createElement("div");
    div.textContent = item;
    itemsContainer.appendChild(div);
  });
};

// 將town推入city數組
for (const city in constant.REGION) {
  const districts = constant.REGION[city];
  cityToTowns[city] = Object.keys(districts);
}

// local選單點擊事件
localItems.addEventListener("click", (event) => {
  const closestDiv = event.target.closest(".select-items > div");
  if (closestDiv) {
    const selectedLocal = closestDiv.textContent;
    localSelect.textContent = selectedLocal;
    updateSelectItems(CityItems, localArr[selectedLocal]);
    updateSelectItems(TownItems, []);
    saveSelectionToLocalStorage("", "");
  }
});

// city選單點擊事件
CityItems.addEventListener("click", (event) => {
  const closestDiv = event.target.closest(".select-items > div");
  if (closestDiv) {
    const selectedCity = closestDiv.textContent;
    CitySelect.textContent = selectedCity;
    updateSelectItems(TownItems, cityToTowns[selectedCity] || []);
    TownSelect.textContent = "town";
    saveSelectionToLocalStorage(selectedCity, "");
  }
});

// town選單點擊事件
TownItems.addEventListener("click", (event) => {
  const closestDiv = event.target.closest(".select-items > div");
  if (closestDiv) {
    const selectedTown = closestDiv.textContent;
    TownSelect.textContent = selectedTown;
    document.querySelector(".current-city").textContent = CitySelect.textContent;
    document.querySelector(".current-town").textContent = selectedTown;
    saveSelectionToLocalStorage(CitySelect.textContent, selectedTown);
  }
});

addSelectEvent(localItems, localSelect);
addSelectEvent(CityItems, CitySelect);
addSelectEvent(TownItems, TownSelect);

// 儲存user選擇的城市和城鎮到storage儲存
const saveSelectionToLocalStorage = (city, town) => {
  localStorage.setItem("current-city", city);
  localStorage.setItem("current-town", town);
};

// 從storage儲存中取得user之前保存的選擇
const getSelectionFromLocalStorage = () => {
  const city = localStorage.getItem("current-city");
  const town = localStorage.getItem("current-town");
  return { city, town };
};

// 渲染user之前保存的選擇到頁面
const renderSelectionFromLocalStorage = () => {
  const { city, town } = getSelectionFromLocalStorage();
  if (town) {
    TownSelect.textContent = town;
    document.querySelector(".current-city").textContent = city;
    document.querySelector(".current-town").textContent = town;
  }
};

// 渲染user之前保存的選擇
window.addEventListener("DOMContentLoaded", renderSelectionFromLocalStorage);