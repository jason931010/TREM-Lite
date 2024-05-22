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
const SettingBtn = document.querySelector("#nav-settings-panel");
const Back = document.querySelector(".back_to_home");
const ResetBtn = document.querySelector(".setting-reset-btn");
const ResetConfirmWrapper = document.querySelector(".reset-confirm-wrapper");
const ResetCancel = document.querySelector(".reset-cancel");
const ResetSure = document.querySelector(".reset-sure");

const LocationWrapper = document.querySelector(".usr-location");
const Location = LocationWrapper.querySelector(".location");
const LocationSelectWrapper = LocationWrapper.querySelector(".select-wrapper");
const localItems = LocationSelectWrapper.querySelector(".local");
const CitySelect = LocationSelectWrapper.querySelector(".current-city");
const CityItems = LocationSelectWrapper.querySelector(".city");
const TownSelect = LocationSelectWrapper.querySelector(".current-town");
const TownItems = LocationSelectWrapper.querySelector(".town");

// 重置按鈕點擊事件
ResetBtn.addEventListener("click", () => {
  ResetConfirmWrapper.style.bottom = "0";
});

document.addEventListener("click", (event) => {
  const target = event.target;
  const resetWrapper = document.querySelector(".reset-confirm-wrapper");
  const isClickInsideResetWrapper = resetWrapper.contains(target);
  const isResetBtn = target === ResetBtn || ResetBtn.contains(target);
  if (!isClickInsideResetWrapper && !isResetBtn)
    resetWrapper.style.bottom = "-100%";
});

// 確定重置按鈕點擊事件
ResetSure.addEventListener("click", () => {
  ResetConfirmWrapper.style.bottom = "-100%";
});

// 取消重置按鈕點擊事件
ResetCancel.addEventListener("click", () => {
  ResetConfirmWrapper.style.bottom = "-100%";
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
Location.addEventListener("click", function() {
  const ArrowSpan = this.querySelector(".selected-btn");
  if (ArrowSpan.textContent.trim() === "keyboard_arrow_up")
    ArrowSpan.textContent = "keyboard_arrow_down";
  else
    ArrowSpan.textContent = "keyboard_arrow_up";
  LocationSelectWrapper.classList.toggle("select-show");
});


// 點擊選項事件
const addLocationSelectEvent = (itemsContainer, selectElement) => {
  itemsContainer.addEventListener("click", (event) => {
    const closestDiv = event.target.closest(".usr-location .select-items > div");
    if (closestDiv) {
      const selectedText = closestDiv.textContent;
      selectElement.textContent = selectedText;

      itemsContainer.querySelectorAll("div").forEach(div => div.classList.remove("select-option-selected"));
      closestDiv.classList.add("select-option-selected");
    }
  });
};

// 更新目前選項的city、town
const updateLocationSelectItems = (itemsContainer, items) => {
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
  const closestDiv = event.target.closest(".usr-location .select-items > div");
  if (closestDiv) {
    const selectedLocal = closestDiv.textContent;
    updateLocationSelectItems(CityItems, localArr[selectedLocal]);
    updateLocationSelectItems(TownItems, []);
    saveSelectionToLocalStorage("", "", "");
  }
});

// city選單點擊事件
CityItems.addEventListener("click", (event) => {
  const closestDiv = event.target.closest(".usr-location .select-items > div");
  if (closestDiv) {
    const selectedCity = closestDiv.textContent;
    CitySelect.textContent = selectedCity;
    updateLocationSelectItems(TownItems, cityToTowns[selectedCity] || []);
    TownSelect.textContent = "town";
    saveSelectionToLocalStorage(selectedCity, "", "");
  }
});

// town選單點擊事件
TownItems.addEventListener("click", (event) => {
  const closestDiv = event.target.closest(".usr-location .select-items > div");
  if (closestDiv) {
    const selectedTown = closestDiv.textContent;
    TownSelect.textContent = selectedTown;
    document.querySelector(".current-city").textContent = CitySelect.textContent;
    document.querySelector(".current-town").textContent = selectedTown;
    saveSelectionToLocalStorage(CitySelect.textContent, selectedTown, "");
  }
});

addLocationSelectEvent(CityItems, CitySelect);
addLocationSelectEvent(TownItems, TownSelect);

// 設定頁面背景透明度滑塊
const settingWrapper = document.querySelector(".setting-wrapper");
const sliderContainer = document.querySelector(".slider-container");
const sliderTrack = document.querySelector(".slider-track");
const sliderThumb = document.querySelector(".slider-thumb");

let isDragging = false;

sliderThumb.addEventListener("mousedown", () => {
  isDragging = true;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.addEventListener("mousemove", (event) => {
  if (isDragging) {
    const containerRect = sliderContainer.getBoundingClientRect();
    let newLeft = event.clientX - containerRect.left;

    if (newLeft < 0) newLeft = 0;
    else if (newLeft > containerRect.width) newLeft = containerRect.width;

    const percentage = (newLeft / containerRect.width) * 100;
    const blurValue = (newLeft / containerRect.width) * 20;

    sliderThumb.style.left = `${percentage}%`;
    sliderTrack.style.width = `${percentage}%`;
    settingWrapper.style.backdropFilter = `blur(${blurValue}px)`;
  }
});

// 儲存user選擇的city和town到storage
const saveSelectionToLocalStorage = (city, town, station) => {
  localStorage.setItem("current-city", city);
  localStorage.setItem("current-town", town);
  localStorage.setItem("current-station", station);
};

// 從storage儲存中取得user之前保存的選項
const getSelectionFromLocalStorage = () => {
  const city = localStorage.getItem("current-city");
  const town = localStorage.getItem("current-town");
  const station = localStorage.getItem("current-station");
  return { city, town, station };
};

// 渲染user之前保存的選項到頁面
const renderSelectionFromLocalStorage = () => {
  const { city, town, station } = getSelectionFromLocalStorage();
  document.querySelector(".current-city").textContent = city;
  document.querySelector(".current-town").textContent = town;

  if (station) {
    const current_station = document.querySelector(".current-station");
    const station_Json = JSON.parse(localStorage.getItem("current-station"));
    current_station.textContent = `${station_Json.net} ${station_Json.code}-${station_Json.name} ${station_Json.loc}`;
  }
};

// 渲染user之前保存的選項
window.addEventListener("DOMContentLoaded", renderSelectionFromLocalStorage);

const StationWrapper = document.querySelector(".realtime-station");
const StationLocation = StationWrapper.querySelector(".location");
const StationSelectWrapper = StationWrapper.querySelector(".select-wrapper");
const StationLocalItems = StationSelectWrapper.querySelector(".local");
const StationSelect = StationSelectWrapper.querySelector(".current-station");
const StationItems = StationSelectWrapper.querySelector(".station");
const StationList = [];
const StationRegion = [];

// 取得即時測站
async function realtime_station() {
  try {
    const res = await fetchData(`${API_url()}v1/trem/station`);
    const data = await res.json();

    if (data) {
      StationItems.innerHTML = "";
      const stationsArray = Object.keys(data).map(station => {
        const info = data[station].info[data[station].info.length - 1];
        let loc = region_code_to_string(constant.REGION, info.code);

        if (loc && !StationRegion.includes(loc.city))
          StationRegion.push(loc.city);


        if (!loc)
          if (station === "13379360")
            loc = "重慶市北碚區";
          else if (station === "7735548")
            loc = "南陽州市和道邑";
          else
            loc = "未知區域";
        else
          loc = `${loc.city}${loc.town}`;

        const StationInfo = {
          name : station,
          net  : data[station].net,
          loc  : loc,
          code : info.code,
        };

        StationList.push(StationInfo);
        return StationInfo;
      });

      RenderStationRegion();
    }
  } catch (err) {
    logger.error(`[Fetch] ${err}`);
  }
}
realtime_station();

// 渲染縣市元素
function RenderStationRegion() {
  StationLocalItems.innerHTML = "";

  const sortedRegion = StationRegion.sort();

  sortedRegion.forEach(city => {
    const truncatedCity = city.slice(0, -1);

    const cityDiv = document.createElement("div");
    cityDiv.textContent = truncatedCity;
    StationLocalItems.appendChild(cityDiv);
  });
}

// 即時測站-點擊縣市選項事件
StationLocalItems.addEventListener("click", (event) => {
  const target = event.target;
  if (target.tagName === "DIV") {
    StationLocalItems.querySelectorAll("div").forEach(div => div.classList.remove("select-option-selected"));

    target.classList.add("select-option-selected");

    const selectedCity = target.textContent;
    const filteredStations = StationList.filter(station => station.loc.includes(selectedCity));
    renderFilteredStations(filteredStations);
  }
});

// 即時測站-篩選對應縣市測站並排序後渲染
function renderFilteredStations(stations) {
  stations.sort((a, b) => a.loc.localeCompare(b.loc));

  StationItems.innerHTML = "";

  stations.forEach(station => {
    const stationDiv = document.createElement("div");
    stationDiv.setAttribute("data-net", station.net);
    stationDiv.setAttribute("data-code", station.code);
    stationDiv.setAttribute("data-name", station.name);
    stationDiv.setAttribute("data-loc", station.loc);

    const netSpan = document.createElement("span");
    netSpan.textContent = station.net;
    netSpan.classList.add(station.net);

    const infoSpan = document.createElement("span");
    infoSpan.textContent = `${station.code}-${station.name} ${station.loc}`;

    stationDiv.appendChild(netSpan);
    stationDiv.appendChild(infoSpan);

    StationItems.appendChild(stationDiv);
  });
}

// 即時測站-下拉選單點擊事件
StationLocation.addEventListener("click", function() {
  const ArrowSpan = this.querySelector(".selected-btn");
  if (ArrowSpan.textContent.trim() === "keyboard_arrow_up")
    ArrowSpan.textContent = "keyboard_arrow_down";
  else
    ArrowSpan.textContent = "keyboard_arrow_up";
  StationSelectWrapper.classList.toggle("select-show-big");
});

// 即時測站-點擊測站選項事件
const addStationSelectEvent = (itemsContainer) => {
  itemsContainer.addEventListener("click", (event) => {
    const closestDiv = event.target.closest(".realtime-station .select-items > div");
    if (closestDiv) {
      const selectedStation = closestDiv.textContent;

      itemsContainer.querySelectorAll("div").forEach(div => div.classList.remove("select-option-selected"));
      closestDiv.classList.add("select-option-selected");

      const regex = /^(MS-Net|SE-Net)(\d+-\d+.*)$/;
      const match = selectedStation.match(regex);
      if (match) {
        StationSelect.textContent = `${match[1]} ${match[2]}`;
        document.querySelector(".current-station").textContent = `${match[1]} ${match[2]}`;

        const stationData = {
          net  : closestDiv.getAttribute("data-net"),
          code : closestDiv.getAttribute("data-code"),
          name : closestDiv.getAttribute("data-name"),
          loc  : closestDiv.getAttribute("data-loc"),
        };

        localStorage.setItem("current-station", JSON.stringify(stationData));
      }
    }
  });
};

addStationSelectEvent(StationItems);