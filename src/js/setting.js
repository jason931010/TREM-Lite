/* eslint-disable no-undef */

// 版本號、UUID
document.getElementById("version").textContent = "2.0.0";
document.getElementById("uuid").textContent = "undefined";

// 左側選單按鈕點擊
document.querySelectorAll(".setting-buttons .button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".setting-options-page").forEach(page => page.classList.remove("active"));
    document.querySelector(`.${button.getAttribute("for")}`).classList.add("active");

    document.querySelectorAll(".setting-buttons .button").forEach(btn => btn.classList.remove("on"));
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
const LoginBtn = document.querySelector(".login-btn");

const LocationWrapper = document.querySelector(".usr-location");
const Location = LocationWrapper.querySelector(".location");
const LocationSelectWrapper = LocationWrapper.querySelector(".select-wrapper");
const localItems = LocationSelectWrapper.querySelector(".local");
const CitySelect = LocationSelectWrapper.querySelector(".current-city");
const CityItems = LocationSelectWrapper.querySelector(".city");
const TownSelect = LocationSelectWrapper.querySelector(".current-town");
const TownItems = LocationSelectWrapper.querySelector(".town");

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

// 重置按鈕點擊事件
ResetBtn.addEventListener("click", () => {
  ResetConfirmWrapper.style.bottom = "0";
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!ResetConfirmWrapper.contains(target) && !ResetBtn.contains(target))
    ResetConfirmWrapper.style.bottom = "-100%";

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


// 下拉選單點擊事件
Location.addEventListener("click", function() {
  const ArrowSpan = this.querySelector(".selected-btn");
  ArrowSpan.textContent = ArrowSpan.textContent.trim() === "keyboard_arrow_up" ? "keyboard_arrow_down" : "keyboard_arrow_up";
  LocationSelectWrapper.classList.toggle("select-show");
});

// 點擊選項事件
const addLocationSelectEvent = (itemsContainer, selectElement) => {
  itemsContainer.addEventListener("click", (event) => {
    const closestDiv = event.target.closest(".usr-location .select-items > div");
    if (closestDiv) {
      selectElement.textContent = closestDiv.textContent;

      itemsContainer.querySelectorAll("div").forEach(div => div.classList.remove("select-option-selected"));
      closestDiv.classList.add("select-option-selected");
    }
  });
};

// 更新目前選項的 city、town
const updateLocationSelectItems = (itemsContainer, items) => {
  itemsContainer.innerHTML = "";
  items.forEach(item => {
    const div = document.createElement("div");
    div.textContent = item;
    itemsContainer.appendChild(div);
  });
};

// 將 town 推入 city 數組
Object.keys(constant.REGION).forEach(city => {
  cityToTowns[city] = Object.keys(constant.REGION[city]);
});

// local 選單點擊事件
localItems.addEventListener("click", (event) => {
  const closestDiv = event.target.closest(".usr-location .select-items > div");
  if (closestDiv) {
    updateLocationSelectItems(CityItems, localArr[closestDiv.textContent]);
    updateLocationSelectItems(TownItems, []);
    saveSelectionToLocalStorage("", "", "");
  }
});

// city 選單點擊事件
CityItems.addEventListener("click", (event) => {
  const closestDiv = event.target.closest(".usr-location .select-items > div");
  if (closestDiv) {
    CitySelect.textContent = closestDiv.textContent;
    updateLocationSelectItems(TownItems, cityToTowns[closestDiv.textContent] || []);
    TownSelect.textContent = "town";
    saveSelectionToLocalStorage(closestDiv.textContent, "", "");
  }
});

// town 選單點擊事件
TownItems.addEventListener("click", (event) => {
  const closestDiv = event.target.closest(".usr-location .select-items > div");
  if (closestDiv) {
    TownSelect.textContent = closestDiv.textContent;
    document.querySelector(".current-city").textContent = CitySelect.textContent;
    document.querySelector(".current-town").textContent = closestDiv.textContent;
    saveSelectionToLocalStorage(CitySelect.textContent, closestDiv.textContent, "");
  }
});

addLocationSelectEvent(CityItems, CitySelect);
addLocationSelectEvent(TownItems, TownSelect);

// 設定頁面背景透明度滑塊
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

    newLeft = Math.max(0, Math.min(newLeft, containerRect.width));

    const percentage = (newLeft / containerRect.width) * 100;
    const blurValue = (newLeft / containerRect.width) * 20;

    sliderThumb.style.left = `${percentage}%`;
    sliderTrack.style.width = `${percentage}%`;
    SettingWrapper.style.backdropFilter = `blur(${blurValue}px)`;
  }
});

// 儲存 user 選擇的 city 和 town 到 storage
const saveSelectionToLocalStorage = (city, town, station) => {
  localStorage.setItem("current-city", city);
  localStorage.setItem("current-town", town);
  localStorage.setItem("current-station", station);
};

// 從 storage 取得 user 之前保存的選項
const getSelectionFromLocalStorage = () => ({
  city    : localStorage.getItem("current-city"),
  town    : localStorage.getItem("current-town"),
  station : localStorage.getItem("current-station"),
});

// 渲染 user 之前保存的選項到頁面
const renderSelectionFromLocalStorage = () => {
  const { city, town, station } = getSelectionFromLocalStorage();
  document.querySelector(".current-city").textContent = city;
  document.querySelector(".current-town").textContent = town;

  if (station) {
    const current_station = document.querySelector(".current-station");
    const stationData = JSON.parse(localStorage.getItem("current-station"));
    current_station.textContent = `${stationData.net} ${stationData.code}-${stationData.name} ${stationData.loc}`;
  }
};

// 渲染 user 之前保存的選項
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
      StationList.length = 0;
      StationRegion.length = 0;

      Object.keys(data).forEach(station => {
        const info = data[station].info[data[station].info.length - 1];
        let loc = region_code_to_string(constant.REGION, info.code);

        if (loc && !StationRegion.includes(loc.city))
          StationRegion.push(loc.city);


        if (!loc)
          loc = getFallbackLocation(station);
        else
          loc = `${loc.city}${loc.town}`;


        const StationInfo = {
          name : station,
          net  : data[station].net,
          loc  : loc,
          code : info.code,
        };

        StationList.push(StationInfo);
      });

      RenderStationRegion();
    }
  } catch (err) {
    logger.error(`[Fetch] ${err}`);
  }
}
realtime_station();

function getFallbackLocation(station) {
  switch (station) {
    case "13379360":
      return "重慶市北碚區";
    case "7735548":
      return "南陽州市和道邑";
    default:
      return "未知區域";
  }
}

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
  ArrowSpan.textContent = ArrowSpan.textContent.trim() === "keyboard_arrow_up" ? "keyboard_arrow_down" : "keyboard_arrow_up";
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

// 登入相關
const LoginFormContent = document.querySelector(".login-forms-content");
const AccountInfoContent = document.querySelector(".usr-account-info-content");
const act = document.querySelector(".account");
const vip = document.querySelector(".vip");
const LogoutBtn = document.querySelector(".logout-btn");
const LoginBack = document.querySelector(".login-back");

const FormLogin = document.querySelector("#form-login");
const FormEmail = document.querySelector("#email");
const FormPassword = document.querySelector("#password");
const LoginMsg = document.querySelector(".login_msg");
const url = "https://api.exptech.com.tw/api/v3/et/";

// 跳轉到登入表單
LoginBtn.addEventListener("click", () => {
  LoginFormContent.style.display = "grid";
  requestAnimationFrame(() => {
    LoginFormContent.classList.add("show-login-form");
    AccountInfoContent.classList.remove("show-account-info");
  });

  AccountInfoContent.style.display = "none";

  AccountInfoContent.addEventListener("transitionend", function onTransitionEnd() {
    if (AccountInfoContent.classList.contains("hide-account-info"))
      AccountInfoContent.removeEventListener("transitionend", onTransitionEnd);

  });
});

// 返回登入首頁/帳號資訊
LoginBack.addEventListener("click", () => {
  AccountInfoContent.style.display = "block";
  requestAnimationFrame(() => {
    AccountInfoContent.classList.add("show-account-info");
    LoginFormContent.classList.remove("show-login-form");
  });

  LoginFormContent.style.display = "none";

  LoginFormContent.addEventListener("transitionend", function onTransitionEnd() {
    if (!LoginFormContent.classList.contains("show-login-form"))
      LoginFormContent.removeEventListener("transitionend", onTransitionEnd);


  });
});

// 登入
FormLogin.addEventListener("click", async () => {
  const email = FormEmail.value;
  const password = FormPassword.value;
  await login(email, password);
});

// 登出
LogoutBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("user-token");
  await logout(token);
});

async function login(email, password) {

  const requestBody = {
    email : email,
    pass  : password,
    name  : "admin",
  };

  try {
    const response = await fetch(`${url}login`, {
      method  : "POST",
      headers : {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    LoginMsg.classList.remove("error");
    LoginMsg.classList.remove("success");


    switch (true) {
      case response.status >= 200 && response.status <= 299: {
        const data = await response.text();
        LoginMsg.classList.add("success");
        LoginMsg.textContent = "登入成功！";
        LoginSuccess(await getUserInfo(data), data);
        break;
      }
      case response.status === 400 || response.status === 401:
        LoginMsg.classList.add("error");
        LoginMsg.textContent = "帳號或密碼錯誤！";
        break;
      default:
        LoginMsg.classList.add("error");
        LoginMsg.textContent = `伺服器異常(error ${response.status})`;
        break;
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

async function logout(token) {
  try {
    const response = await fetch(`${url}logout`, {
      method  : "DELETE",
      headers : {
        "Content-Type"  : "application/json",
        "Authorization" : `Basic ${token}`,
      },
    });

    switch (true) {
      case response.status >= 200 && response.status <= 299: {
        const data = await response.text();
        LoginMsg.classList.add("success");
        LoginMsg.textContent = "登出成功！";
        LogoutSuccess();
        break;
      }
      default:
        LoginMsg.classList.add("error");
        LoginMsg.textContent = `伺服器異常(error ${response.status})`;
        break;
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

async function getUserInfo(data) {
  console.log(data);
  try {
    const response = await fetch(`${url}info`, {
      method  : "GET",
      headers : {
        "Content-Type"  : "application/json",
        "Authorization" : `Basic ${data}`,
      },
    });

    if (response.ok) {
      const userInfo = await response.json();
      return userInfo;
    } else
      throw new Error(`伺服器異常(error ${response.status})`);

  } catch (error) {
    console.error("error:", error);
    return {};
  }
}

// 登入成功畫面
function LoginSuccess(msg, token) {
  LoginBtn.style.display = "none";
  LogoutBtn.style.display = "flex";
  act.textContent = "Welcome";
  vip.textContent = `VIP-${msg.vip}`;
  localStorage.setItem("user-token", token);
  LoginBack.dispatchEvent(clickEvent);
}

// 登出成功畫面
function LogoutSuccess() {
  LoginBtn.style.display = "flex";
  LogoutBtn.style.display = "none";
  act.textContent = "尚未登入";
  vip.textContent = "";
  localStorage.removeItem("user-token", "");
  LoginBtn.dispatchEvent(clickEvent);
}

const clickEvent = new MouseEvent("click", {
  bubbles    : true,
  cancelable : true,
  view       : window,
});
