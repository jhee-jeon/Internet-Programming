var formResult = window.location.href;
console.log(formResult);

let coords;
navigator.geolocation.getCurrentPosition((position) => {
  coords = [position.coords.latitude, position.coords.longitude];
});

// http://127.0.0.1:5502/client/result.html?region=Asia&score=75&lang=n&sort=toefl
// http://127.0.0.1:5502/result.html?region=North+America&score=90&lang=y
var resultList = formResult.split("?")[1].split("&");
console.log(resultList);
var region = resultList[0].split("=")[1];
var score = resultList[1].split("=")[1];
var lang = resultList[2].split("=")[1];
var sort = resultList[3].split("=")[1];

let result;

$.ajax({
  url: `http://127.0.0.1:3000/univ?continent=${region}&toefl=${score}&is_english=${lang}&order_by=${sort}`,
  success: function (data) {
    console.log(data);
    result = data;
    data.forEach((item, idx) =>
      $("#results2").append(`
      <li onclick="showPopup(${idx})">
        <div>${item["University/Institution"]}</div>
        <div>${item["Country"]}</div>
        <div>${item["ToeflIBT"]}</div>
      </li>`)
    );
  },
});

let basicData;
$.ajax({
  url: `http://127.0.0.1:3000/basic`,
  async: true,
  type: "POST",
  success: function (data) {
    basicData = data;
    console.log(data[0]);
  },
});

let coronaData;
$.ajax({
  url: `http://127.0.0.1:3000/corona`,
  async: true,
  type: "POST",
  success: function (data) {
    coronaData = data;
    console.log(data[1]["defCnt"]);
  },
});

function formatWeather(weather) {
  return ["Clear", "Clouds", "Rain", "Snow"].includes(weather)
    ? weather
    : "Clear";
}

function moreData(countryName) {
  var cnt;
  for (var i = 0; i < coronaData.length; i++) {
    if (countryName == coronaData[i]["countryEnName"]) {
      cnt = i;
      break;
    }
  }
  var def = coronaData[cnt]["defCnt"];

  var cnt2;
  for (var i = 0; i < basicData.length; i++) {
    if (countryName == basicData[i]["countryEnName"]) {
      cnt2 = i;
      break;
    }
  }
  var imgUrl = basicData[cnt2]["imgUrl"];
  var basicinfo = basicData[cnt2]["basic"];

  $(".left").html(`
      <div class="row">
        <img src='${imgUrl}'>
      </div>
      <div id="basic">
        <div> ㅇ 코로나 확진자 수 : ${def / 10000} 만명</div>
        ${basicinfo}
      </div>
  `);
}

async function showPopup(idx) {
  var popup = document.querySelector(".popUp");
  popup.style.display = "block";
  console.dir(result[idx]);
  const country = result[idx].Country;

  const university = result[idx]["University/Institution"];
  const univLongitude = result[idx]["Longitude"];
  const univLatitude = result[idx]["Latitude"];

  const myCoords = coords || [37.5740321, 127.0078127];

  const [myTemperature, myForecast, myLocation] = await getWeatherAndInfo(
    myCoords[0],
    myCoords[1]
  );

  const hereTime = new Date();
  const universityTimeDate = await getworldTimeDate(
    univLatitude,
    univLongitude
  );

  const [universityTemperature, universitryForecast] = await getWeatherAndInfo(
    univLatitude,
    univLongitude
  );

  $("#popUp_content").html(`
      <p class="country">${country}</p>
      <p class="university">${university}</p>
      <div class="popup_container">
          <div class="left">
          </div>
          <div class="right">
              <img src="/client/images/${formatWeather(
                myForecast
              )}.png" width="100" height="100"/>
              <p>현재 나의 위치는 ${myLocation}입니다.</p>
              <p>현재 기온은 ${myTemperature}이며, 현재 시각은 ${getTimeString(
    hereTime
  )}입니다.</p>
              <p>지금 날씨는 ${formatWeather(myForecast)}입니다.</p>
              <br/>
              <img src="/client/images/${formatWeather(
                universitryForecast
              )}.png" width="100" height="100"/>
              <p>${university}의 현재 기온은 ${universityTemperature}이며, 시각은 ${getTimeString(
    universityTimeDate
  )}입니다.</p>
              <p>지금 날씨는 ${formatWeather(universitryForecast)}입니다.</p>
              </div>
      </div>
    `);
  moreData(country);
}

function removePopup() {
  var popup = document.querySelector(".popUp");
  popup.style.display = "none";
}

const API_KEY = "6519d56da7a6abf8c4805abf0bfbd55c";

async function getWeatherAndInfo(lat, lng) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`
  );
  const json = await response.json();

  const temperature = json.main.temp;
  const forecast = json.weather[0].main;

  return [temperature.toFixed(1), forecast, json.name];
}

async function getworldTimeDate(lat, lng) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`
  );
  const json = await response.json();
  let rawOffset = json.timezone;
  return new Date(Date.now() + (rawOffset - 32400) * 1000);
}

function getTimeString(date) {
  const minutes = date.getMinutes();
  const hours = date.getHours();
  return `${hours < 10 ? `0${hours}` : hours}:${
    minutes < 10 ? `0${minutes}` : minutes
  }`;
}

function capture() {
  // 캡쳐 라이브러리를 통해서 canvas 오브젝트를 받고 이미지 파일로 리턴한다.
  html2canvas(document.querySelector("#popUp_content")).then((canvas) => {
    saveAs(canvas.toDataURL("image/png"), "capture.png");
  });
}

function saveAs(uri, filename) {
  // 캡쳐된 파일을 이미지 파일로 내보낸다.
  var link = document.createElement("a");
  if (typeof link.download === "string") {
    link.href = uri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    window.open(uri);
  }
}
