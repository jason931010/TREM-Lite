/* eslint-disable prefer-const */
/* eslint-disable no-undef */
const tw_geojson = JSON.parse(fs.readFileSync(path.resolve(app.getAppPath(), "./resource/maps/tw_town.json")).toString());
const tsunami = JSON.parse(fs.readFileSync(path.resolve(app.getAppPath(), "./resource/maps/tw_tsunami_area.json")).toString());

let eew_cache = [];
let tsunami_map = null;
let data_cache = [];

let _location = "";
let _max = -1;
let _list = "";
let _id = "";

let type_list = {
	time      : 0,
	http      : 0,
	websocket : 0,
};

let eew_speech = {
	loc    : "",
	max    : -1,
	text   : "",
	module : "",
};
let eew_speech_clock = false;
let loc_speech_clock = false;

const item_jma_eew = storage.getItem("jma") ?? true;
const item_kma_eew = storage.getItem("kma") ?? true;
const item_nied_eew = storage.getItem("nied") ?? true;
const item_scdzj_eew = storage.getItem("scdzj") ?? true;
const item_cwb_eew = storage.getItem("cwb") ?? true;
const item_trem_eew = storage.getItem("eew_trem") ?? false;
const item_eew_level = storage.getItem("eew-level") ?? -1;
const item_audio_eew = storage.getItem("audio.EEW") ?? true;
const item_audio_update = storage.getItem("audio.update") ?? true;
const item_map_style = storage.getItem("map_style") ?? "1";
const item_audio_eew2 = storage.getItem("audio.EEW2") ?? true;

function get_data(data, type = "websocket") {
	if (data.type != "trem-rts") {
		type_list.time = now_time();
		if (type == "websocket") {
			type_list.websocket = now_time();
		} else if (type == "http") {
			type_list.http = now_time();
		}
		log(`type {${data.type}} from {${type}}`, 1, "event", "get_data");
	}
	if (data.replay_timestamp) {
		if (data_cache.includes(data.replay_timestamp)) {
			return;
		} else {
			data_cache.push(data.replay_timestamp);
		}
	} else if (data.timestamp) {
		if (data_cache.includes(data.timestamp)) {
			return;
		} else {
			data_cache.push(data.timestamp);
		}
		if (Now().getTime() - data.timestamp > 10000) {
			return;
		}
	}
	if (data.id && data.number) {
		if (data_cache.includes(`${data.type}-${data.id}-${data.number}`)) {
			return;
		}
		data_cache.push(`${data.type}-${data.id}-${data.number}`);
	}
	if (data_cache.length > 15) {
		data_cache.splice(0, 1);
	}
	if (data.type == "trem-rts") {
		if (!rts_replay_time) {
			on_rts_data(data.raw);
		}
	} else if (data.type == "replay") {
		if (rts_replay_time) {
			rts_replay_time = data.replay_timestamp;
		}
	} else if (data.type == "report") {
		palert_time = 0;
		let report_scale = data.scale.toString();
		if (report_scale.length == 1) {
			report_scale = report_scale + ".0";
		}
		const loc = data.raw.location.substring(data.raw.location.indexOf("(") + 1, data.raw.location.indexOf(")")).replace("位於", "");
		if (data.location.startsWith("地震資訊")) {
			if (storage.getItem("show_reportInfo") ?? false) {
				show_screen("report");
				let text = `地震資訊，${formatToChineseTime(data.time)}，發生地震，震央位於 ${loc} 附近，震央深度為 ${data.depth}公里，地震規模為 ${data.scale.toFixed(1)}`;
				if (speecd_use) {
					speech.speak({ text: text.replace("2.", "二點").replaceAll(".2", "點二").replaceAll("三地門", "三弟門").replaceAll(".", "點").replaceAll("為", "圍") });
				}
				const notification = new Notification("⚠️ 地震資訊", {
					body : text.replaceAll("，", " "),
					icon : "../TREM.ico",
				});
				notification.addEventListener("click", () => {
					MainWindow.focus();
				});
			} else {
				return;
			}
		} else {
			let max = data.raw.data[0]?.areaIntensity ?? 0;
			const _max_ = int_to_string(max);
			let text = `地震資訊，${formatToChineseTime(data.time)}，發生最大震度 ${_max_} 地震，震央位於 ${loc} 附近，震央深度為 ${data.depth}公里，地震規模為 ${data.scale.toFixed(1)}`;
			const notification = new Notification("⚠️ 地震資訊", {
				body : text.replaceAll("，", " "),
				icon : "../TREM.ico",
			});
			let eq_station_list = {
				9 : [], 8 : [],
				7 : [], 6 : [],
				5 : [], 4 : [],
				3 : [], 2 : [],
				1 : [],
			};
			for (let i = 0; i < data.raw.data.length; i++) {
				const city = data.raw.data[i];
				for (let I = 0; I < city.eqStation.length; I++) {
					const station = city.eqStation[I];
					eq_station_list[station.stationIntensity].push(`${city.areaName}${station.stationName}`);
				}
			}
			// console.log(eq_station_list);
			let count = 0;
			for (let i = 9; i >= 1; i--) {
				if (!eq_station_list[i].length) {
					continue;
				}
				if (count == 0) {
					text += `，這次地震，最大震度 ${int_to_string(i)} 地區 ${eq_station_list[i].join("，")}`;
				} else if (count == 1) {
					text += `，此外，震度 ${int_to_string(i)} 地區 ${eq_station_list[i].join("，")}`;
				} else {
					text += `，震度 ${int_to_string(i)} 地區 ${eq_station_list[i].join("，")}`;
					break;
				}
				count++;
			}
			if (speecd_use) {
				speech.speak({ text: text.replace("2.", "二點").replaceAll(".2", "點二").replaceAll("三地門", "三弟門").replaceAll(".", "點").replaceAll("為", "圍") });
			}
			notification.addEventListener("click", () => {
				MainWindow.focus();
			});
			show_screen("report");
		}
		if (rts_replay_timestamp) {
			return;
		}
		if (storage.getItem("audio.Report") ?? true) {
			TREM.audio.push("Report");
		}
		TREM.report_time = now_time();
		refresh_report_list(false, data);
		screenshot_id = `report_${now_time()}`;
		plugin.emit("trem.report.on-report", data);
	} else if (data.type == "eew-report" || data.type == "eew-cwb") {
		if (Now().getTime() - data.time > 240_000 && !data.replay_timestamp) {
			return;
		}
		if (rts_replay_timestamp && !data.replay_timestamp) {
			return;
		}
		on_eew(data, type);
		screenshot_id = `${data.type}_${now_time()}`;
	} else if (data.type == "tsunami") {
		show_screen("tsunami");
		on_tsunami(data, type);
		screenshot_id = `tsunami_${now_time()}`;
	} else if (data.type == "trem-eew") {
		if (Now().getTime() - data.time > 240_000 && !data.replay_timestamp) {
			return;
		}
		if (rts_replay_timestamp && !data.replay_timestamp) {
			return;
		}
		on_trem(data, type);
		if (speecd_use) {
			eew_speech = {
				loc   : data.location,
				max   : data.max,
				model : data.model,
			};
			eew_speech_clock = true;
		}
	}
}

function on_eew(data, type) {
	// console.log(data)
	TREM.eew = true;
	let skip = false;
	if (item_eew_level != -1) {
		if (item_eew_level > intensity_float_to_int(eew_location_info(data).i)) {
			skip = true;
		}
	}
	if (TREM.report_time) {
		report_off();
	}
	data._time = data.time;
	const _eq_list = Object.keys(TREM.EQ_list);
	if (!_eq_list.length) {
		document.getElementById("detection_location_1").innerHTML = "";
		document.getElementById("detection_location_2").innerHTML = "";
	}
	const unit = (data.type == "eew-jma") ? "気象庁(JMA)" : (data.type == "eew-nied") ? "防災科学技術研究所" : (data.type == "eew-kma") ? "기상청(KMA)" : (data.type == "eew-scdzj") ? "四川省地震局" : (data.type == "eew-cwb") ? "交通部中央氣象署" : "TREM";
	if (!TREM.EQ_list[data.id]) {
		if (!skip) {
			show_screen("eew");
		}
		TREM.EQ_list[data.id] = {
			data,
			eew   : 0,
			alert : false,
		};
		if (!eew_cache.includes(data.id + data.serial)) {
			eew_cache.push(data.id + data.serial);
			if (!skip && item_audio_eew) {
				TREM.audio.push("EEW");
			}
		}
		const eew = eew_location_intensity(data, data.depth);
		data.max = intensity_float_to_int(eew.max_i);
		TREM.EQ_list[data.id].loc = eew;
		plugin.emit("trem.eew.on-eew-create", data);
	} else {
		if (!data.eq.loc) {
			data.eq.loc = TREM.EQ_list[data.id].data.eq.loc;
		}
		if (!data.eq.lat) {
			data.eq.lat = TREM.EQ_list[data.id].data.eq.lat;
		}
		if (!data.eq.lon) {
			data.eq.lon = TREM.EQ_list[data.id].data.eq.lon;
		}
		TREM.EQ_list[data.id].data = data;
		if (data.cancel) {
			TREM.EQ_list[data.id].eew = 0;
			TREM.EQ_list[data.id].data._time = Now().getTime() - 225_000;
			if (TREM.EQ_list[data.id].p_wave) {
				TREM.EQ_list[data.id].p_wave.remove();
			}
			if (TREM.EQ_list[data.id].s_wave) {
				TREM.EQ_list[data.id].s_wave.remove();
			}
			if (TREM.EQ_list[data.id].progress) {
				TREM.EQ_list[data.id].progress.remove();
			}
		} else {
			if (TREM.EQ_list[data.id].p_wave) {
				TREM.EQ_list[data.id].p_wave.setLatLng([data.eq.lat, data.eq.lon]);
			}
			if (TREM.EQ_list[data.id].s_wave) {
				TREM.EQ_list[data.id].s_wave.setLatLng([data.eq.lat, data.eq.lon]);
			}
			if (TREM.EQ_list[data.id].s_wave_back) {
				TREM.EQ_list[data.id].s_wave_back.setLatLng([data.eq.lat, data.eq.lon]);
			}
		}
		if (item_audio_update) {
			TREM.audio.push("update");
		}
		const eew = eew_location_intensity(data, data.eq.depth);
		data.max = intensity_float_to_int(eew.max_i);
		TREM.EQ_list[data.id].loc = eew;
		TREM.EQ_list[data.id].eew = intensity_float_to_int(TREM.EQ_list[data.id].loc.max_i);
		plugin.emit("trem.eew.on-eew-update", data);
	}
	TREM.EQ_list[data.id].eew = data.max;
	plugin.emit("trem.eew.on-eew", data);
	if (data.type == "eew-trem" && TREM.EQ_list[data.id].trem) {
		if (!skip && item_audio_eew) {
			TREM.audio.push("EEW");
		}
		delete TREM.EQ_list[data.id].trem;
		TREM.EQ_list[data.id].epicenterIcon.remove();
		delete TREM.EQ_list[data.id].epicenterIcon;
	}
	if (data.type == "eew-cwb" && data.eq.loc.includes("海") && Number(data.eq.depth) <= 35) {
		if (Number(data.eq.mag) >= 7) {
			if (!TREM.EQ_list[data.id].alert_tsunami) {
				TREM.EQ_list[data.id].alert_tsunami = true;
				if (!skip && speecd_use) {
					setTimeout(() => speech.speak({ text: "震源位置及規模表明，可能發生海嘯，沿岸地區應慎防海水位突變，並留意中央氣象署是否發布，海嘯警報" }), 15000);
				}
				add_info("fa-solid fa-house-tsunami fa-2x info_icon", "#0072E3", "注意海嘯", "#FF5809", "震源位置及規模表明<br>可能發生海嘯<br>沿岸地區應慎防海水位突變<br>並留意 中央氣象署(CWA)<br>是否發布 [ 海嘯警報 ]");
			}
		} else if (Number(data.eq.mag) >= 6) {
			if (!TREM.EQ_list[data.id].alert_sea) {
				TREM.EQ_list[data.id].alert_sea = true;
				if (!skip && speecd_use) {
					setTimeout(() => speech.speak({ text: "震源位置及規模表明，海水位可能突變，沿岸地區應慎防海水位突變" }), 15000);
				}
				add_info("fa-solid fa-water fa-2x info_icon", "#00EC00", "水位突變", "#FF0080", "震源位置及規模表明<br>海水位可能突變<br>沿岸地區應慎防海水位突變");
			}
		}
	}
	if (!data.replay_timestamp) {
		const notification = new Notification(`🚨 地震預警 第${data.serial}報 | ${unit}`, {
			body : `${time_to_string((data.eq.time) ? data.eq.time : data.time)}\n${data.eq.loc} ${(data.status == 2) ? "取消" : `發生 M${data.eq.mag.toFixed(1)} 地震`}`,
			icon : "../TREM.ico",
		});
		notification.addEventListener("click", () => MainWindow.focus());
		if (_id != data.id) {
			_id = data.id;
			_list = "";
			_max = -1;
			_location = "";
		}
	}
	if (data.status == 2) {
		if (!skip && speecd_use) {
			loc_speech_clock = false;
			eew_speech_clock = false;
			speech.speak({ text: `${data.eq.loc}，取消` });
		}
		plugin.emit("trem.eew.on-eew-cancel", data);
	} else if (!skip && speecd_use) {
		eew_speech = {
			loc : data.eq.loc,
			max : data.eq.max,
		};
		eew_speech_clock = true;
	}

	eew_timestamp = 0;

	let epicenterIcon;
	const eq_list = [];
	for (const key of _eq_list) {
		if (!TREM.EQ_list[key].trem) {
			eq_list.push(key);
		}
	}
	if (eq_list.length > 1) {
		for (let i = 0; i < eq_list.length; i++) {
			const num = i + 1;
			const _data = TREM.EQ_list[eq_list[i]].data;
			epicenterIcon = L.icon({
				iconUrl   : `../resource/images/cross${num}.png`,
				iconSize  : [40 + TREM.size * 3, 40 + TREM.size * 3],
				className : "flash",
			});
			let offsetX = 0;
			let offsetY = 0;
			if (num == 1) {
				offsetY = 0.03;
			} else if (num == 2) {
				offsetX = 0.03;
			} else if (num == 3) {
				offsetY = -0.03;
			} else if (num == 4) {
				offsetX = -0.03;
			}
			if (TREM.EQ_list[_data.id].epicenterIcon) {
				TREM.EQ_list[_data.id].epicenterIcon.setIcon(epicenterIcon);
				TREM.EQ_list[_data.id].epicenterIcon.setLatLng([_data.eq.lat + offsetY, _data.eq.lon + offsetX]);
			} else {
				TREM.EQ_list[_data.id].epicenterIcon = L.marker([_data.eq.lat + offsetY, _data.eq.lon + offsetX], { icon: epicenterIcon, zIndexOffset: 6000 }).addTo(TREM.Maps.main);
			}
		}
	} else if (TREM.EQ_list[data.id].epicenterIcon) {
		TREM.EQ_list[data.id].epicenterIcon.setLatLng([data.eq.lat, data.eq.lon]);
	} else {
		epicenterIcon = L.icon({
			iconUrl   : "../resource/images/cross.png",
			iconSize  : [40 + TREM.size * 3, 40 + TREM.size * 3],
			className : "flash",
		});
		TREM.EQ_list[data.id].epicenterIcon = L.marker([data.eq.lat, data.eq.lon], { icon: epicenterIcon, zIndexOffset: 6000 })
			.addTo(TREM.Maps.main);
	}
	const _loc_list = TREM.EQ_list[data.id].loc;
	let loc_list = "";
	for (const loc of Object.keys(_loc_list)) {
		if (loc == "max_i") {
			continue;
		}
		if (intensity_float_to_int(_loc_list[loc].i) >= 4) {
			const city = loc.split(" ")[0];
			if (!loc_list.includes(city)) {
				loc_list += `${city}，`;
			}
		}
	}
	if (!skip && speecd_use && loc_list != "") {
		eew_speech.text = `強震即時警報，${loc_list}慎防強烈搖晃`;
		loc_speech_clock = true;
	}
	plugin.emit("eew", data, _loc_list);
	draw_intensity(skip);
}

setInterval(() => {
	if (loc_speech_clock) {
		_speech_loc();
		loc_speech_clock = false;
	}
	if (eew_speech_clock) {
		_speech_eew();
		eew_speech_clock = false;
	}
}, 3000);

function _speech_loc() {
	if (eew_speech.text != _list) {
		speech.speak({ text: eew_speech.text });
		_list = eew_speech.text;
	}
}

function _speech_eew() {
	if (_location != eew_speech.loc) {
		let max = (eew_speech.max == 5) ? "5弱" : (eew_speech.max == 6) ? "5強" : (eew_speech.max == 7) ? "6弱" : (eew_speech.max == 8) ? "6強" : (eew_speech.max == 9) ? "7級" : `${eew_speech.max}級`;
		if (eew_speech.model == "nsspe" && !eew_speech.max) {
			max = "不明";
		}
		speech.speak({ text: `${eew_speech.loc}發生地震${(max == "0級") ? "" : `，預估最大震度${max}`}` });
		_location = eew_speech.loc;
		_max = eew_speech.max;
	} else if (_max != eew_speech.max) {
		let max = (eew_speech.max == 5) ? "5弱" : (eew_speech.max == 6) ? "5強" : (eew_speech.max == 7) ? "6弱" : (eew_speech.max == 8) ? "6強" : (eew_speech.max == 9) ? "7級" : `${eew_speech.max}級`;
		if (eew_speech.model == "nsspe" && !eew_speech.max) {
			max = "不明";
		}
		speech.speak({ text: `預估最大震度${max}` });
		_max = eew_speech.max;
	}
}

function draw_intensity(skip) {
	const location_intensity = {};
	const eq_list = Object.keys(TREM.EQ_list);
	for (const _key of eq_list) {
		if (TREM.EQ_list[_key].data.cancel || TREM.EQ_list[_key].trem) {
			continue;
		}
		for (let d = 0; d < 1000; d++) {
			const _dist = Math.sqrt(pow(d) + pow(TREM.EQ_list[_key].data.depth));
			if ((1.657 * Math.pow(Math.E, (1.533 * TREM.EQ_list[_key].data.scale)) * Math.pow(_dist, -1.607)) > 0.8) {
				if (d > TREM.dist) {
					TREM.dist = d;
				}
			} else {
				break;
			}
		}
		for (const key of Object.keys(TREM.EQ_list[_key].loc)) {
			if (key != "max_i") {
				const intensity = intensity_float_to_int(TREM.EQ_list[_key].loc[key].i);
				if ((location_intensity[key] ?? 0) < intensity) {
					location_intensity[key] = intensity;
				}
				if (intensity > 0 && TREM.dist < TREM.EQ_list[_key].loc[key].dist) {
					TREM.dist = TREM.EQ_list[_key].loc[key].dist;
				}
			}
		}
		if (TREM.EQ_list[_key].eew > 4) {
			TREM.EQ_list[_key].alert = true;
			if (!TREM.alert) {
				TREM.alert = true;
				if (!skip && item_audio_eew2) {
					TREM.audio.push("EEW2");
				}
				add_info("fa-solid fa-bell fa-2x info_icon", "#FF0080", "注意強震", "#00EC00", "此地震可能造成災害");
			}
		}
		show_icon(true);
	}
	if (TREM.geojson) {
		TREM.geojson.remove();
	}
	if (item_map_style == "3" || item_map_style == "4") {
		return;
	}
	if (!(eq_list.length == 1 && TREM.EQ_list[eq_list[0]].data.cancel)) {
		TREM.geojson = geoJsonMap(tw_geojson, {
			minZoom   : 4,
			maxZoom   : 12,
			tolerance : 20,
			buffer    : 256,
			debug     : 0,
			zIndex    : 5,
			style     : (args) => {
				if (args.properties) {
					args = args.properties;
				}
				const name = args.COUNTYNAME + " " + args.TOWNNAME;
				const intensity = location_intensity[name];
				const color = (!intensity) ? "#3F4045" : int_to_color(intensity);
				return {
					color       : (intensity == 4 || intensity == 5 || intensity == 6) ? "grey" : "white",
					weight      : 0.4,
					fillColor   : color,
					fillOpacity : 1,
				};
			},
		}, TREM.Maps.main);
	}
}

function report_off() {
	if (TREM.report_epicenterIcon) {
		TREM.report_epicenterIcon.remove();
	}
	if (TREM.report_epicenterIcon_trem) {
		TREM.report_epicenterIcon_trem.remove();
	}
	if (TREM.report_circle_trem) {
		TREM.report_circle_trem.remove();
	}
	if (TREM.report_circle_cwb) {
		TREM.report_circle_cwb.remove();
	}
	delete TREM.report_epicenterIcon;
	delete TREM.report_epicenterIcon_trem;
	for (const key of Object.keys(TREM.report_icon_list)) {
		TREM.report_icon_list[key].remove();
	}
	TREM.report_icon_list = {};
	TREM.report_bounds = L.latLngBounds();
	for (const item of document.getElementsByClassName("report_box")) {
		item.style.display = "none";
	}
	for (const item of document.getElementsByClassName("eew_box")) {
		item.style.display = "inline";
	}
	show_icon(false);
	TREM.Maps.main.setView([23.6, 120.4], 7.8);
	TREM.report_time = 0;
}

function on_tsunami(data, type) {
	if (TREM.report_time) {
		report_off();
	}
	if (!data.cancel) {
		if (tsunami_map == null) {
			TREM.audio.push("Water");
			if (speecd_use) {
				speech.speak({ text: "海嘯警報已發布，請迅速疏散至避難場所" });
			}
		}
		document.getElementById("tsunami_box").style.display = "flex";
		document.getElementById("tsunami_warn").style.display = "";
		const tsunami_level = {};
		for (let i = 0; i < data.area.length; i++) {
			if (!data.area[i].arrivalTime) {
				continue;
			}
			document.getElementById(`tsunami_${i}`).textContent = `${data.area[i].areaName} ${tsunami_time(data.area[i].arrivalTime)}`;
			tsunami_level[data.area[i].areaName] = tsunami_color(data.area[i].waveHeight);
		}
		if (tsunami_map) {
			tsunami_map.remove();
		}
		tsunami_map = geoJsonMap(tsunami, {
			minZoom   : 4,
			maxZoom   : 12,
			tolerance : 20,
			buffer    : 256,
			debug     : 0,
			zIndex    : 5,
			style     : (args) => {
				if (args.properties) {
					args = args.properties;
				}
				return {
					color       : tsunami_level[args.AREANAME],
					weight      : 3,
					fillColor   : "transparent",
					fillOpacity : 0,
				};
			},
		}, TREM.Maps.main);
		plugin.emit("trem.tsunami.on-tsunami", data);
	} else {
		plugin.emit("trem.tsunami.on-tsunami-cancel", data);
		if (speecd_use) {
			speech.speak({ text: "海嘯警報已解除" });
		}
		if (tsunami_map) {
			tsunami_map.remove();
		}
		tsunami_map = null;
		document.getElementById("tsunami_box").style.display = "none";
		document.getElementById("tsunami_warn").style.display = "none";
	}
}

function tsunami_time(time) {
	const now = new Date(time.replace("T", " ").replace("+08:00", ""));
	return (now.getMonth() + 1) +
		"/" + now.getDate() +
		" " + now.getHours() +
		":" + now.getMinutes();
}

function tsunami_color(color) {
	return (color == "大於6公尺") ? "#B131FF" : (color == "3至6公尺") ? "red" : (color == "1至3公尺") ? "#FFEF29" : "#5CEE18";
}

function on_trem(data, type) {
	if (TREM.report_time) {
		report_off();
	}
	if (!TREM.EQ_list[data.id]) {
		show_screen("trem");
		TREM.EQ_list[data.id] = {
			data,
			eew  : data.max,
			trem : true,
		};
		if (!eew_cache.includes(data.id + data.number)) {
			eew_cache.push(data.id + data.number);
			TREM.audio.push("Note");
			show_icon(true);
			add_info("fa-solid fa-flask fa-2x info_icon", "#FF8000", "TREM EEW", "#0072E3", "僅供參考(實驗性)", 30000);
		}
	} else {
		TREM.EQ_list[data.id].data = data;
		TREM.EQ_list[data.id].eew = data.max;
		if (item_audio_update) {
			TREM.audio.push("update");
		}
	}
	if (TREM.EQ_list[data.id].eew > 4 && !TREM.alert) {
		TREM.alert = true;
		TREM.EQ_list[data.id].alert = true;
		TREM.audio.push("EEW2");
		add_info("fa-solid fa-bell fa-2x info_icon", "#FF0080", "注意強震", "#00EC00", "此地震可能造成災害");
	}
	const epicenterIcon = L.divIcon({
		html      : "<span></span>",
		iconSize  : [10 + TREM.size, 10 + TREM.size],
		className : `nsspe_dot flash intensity_${data.max}`,
	});
	if (TREM.EQ_list[data.id].epicenterIcon) {
		TREM.EQ_list[data.id].epicenterIcon.setIcon(epicenterIcon);
		TREM.EQ_list[data.id].epicenterIcon.setLatLng([data.lat, data.lon]);
	} else {
		TREM.EQ_list[data.id].epicenterIcon = L.marker([data.lat, data.lon], { icon: epicenterIcon, zIndexOffset: 6000 }).addTo(TREM.Maps.main);
	}
	eew_timestamp = 0;
	if (data.cancel) {
		TREM.EQ_list[data.id].data.timestamp = Now().getTime() - 75_000;
	}
	const intensity_list = Object.keys(data.intensity);
	if (intensity_list.length) {
		const location_intensity = {};
		for (const Int of intensity_list) {
			for (let I = 0; I < data.intensity[Int].length; I++) {
				const loc = code_to_town(data.intensity[Int][I]);
				if (!loc) {
					continue;
				}
				location_intensity[`${loc.city} ${loc.town}`] = Int;
			}
		}
		if (item_map_style == "3" || item_map_style == "4") {
			return;
		}
		if (TREM.geojson) {
			TREM.geojson.remove();
		}
		TREM.geojson = geoJsonMap(tw_geojson, {
			minZoom   : 4,
			maxZoom   : 12,
			tolerance : 20,
			buffer    : 256,
			debug     : 0,
			zIndex    : 5,
			style     : (args) => {
				if (args.properties) {
					args = args.properties;
				}
				const name = `${args.COUNTYNAME} ${args.TOWNNAME}`;
				const intensity = location_intensity[name];
				const color = (!intensity) ? "#3F4045" : int_to_color(intensity);
				return {
					color       : (intensity == 4 || intensity == 5 || intensity == 6) ? "grey" : "white",
					weight      : 0.4,
					fillColor   : color,
					fillOpacity : 1,
				};
			},
		}, TREM.Maps.main);
	}
}