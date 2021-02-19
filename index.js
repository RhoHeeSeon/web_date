async function setRenderBackground(){
    const result = await axios.get("https://picsum.photos/1280/720", {
        responseType: "blob"
    });
    // console.log(result.data);
    const data = URL.createObjectURL(result.data);
    // console.log(data);
    document.querySelector("body").style.backgroundImage = `url(${data})`;

}

function setTime(){
    const timer = document.querySelector(".timer");
    const timerContent = document.querySelector(".timer-content")
    setInterval(() => {
        const date = new Date();
        const hour = date.getHours() < 10 ? "0"+date.getHours() : date.getHours();
        const minute = date.getMinutes() < 10 ? "0"+date.getMinutes() : date.getMinutes();
        const second = date.getSeconds() < 10 ? "0"+date.getSeconds() : date.getSeconds();
        timer.textContent = `${hour}:${minute}:${second}`;
        // console.log(typeof(second), second < 12);
        if(hour<12) timerContent.textContent = "Good Morning Hee Seon";
        else timerContent.textContent = "Good Evening Hee Seon";
    }, 1000);

}

// 메모 불러오기
function getMemo(){
    const memo = document.querySelector(".memo");
    const memoValue = localStorage.getItem("todo");
    memo.textContent = memoValue;
}

// 메모 저장
function setMemo(){
    const memoInput = document.querySelector(".memo-input");
    memoInput.addEventListener("keyup",(e)=>{
        if(e.code === 'Enter' && e.target.value){
            localStorage.setItem("todo", e.target.value);
            getMemo();
            memoInput.value = '';
        }
    })
}

// 메모 삭제
function deleteMemo(){
    document.addEventListener("click", (e)=>{
        // console.log(e.target);
        if (e.target.classList.contains("memo")){
            // localStorage item 삭제
            localStorage.removeItem("todo");
            // memo html 바꿔주기
            e.target.textContent = '';
        }
    })
}

function memos(){
    setMemo();
    getMemo();
    deleteMemo();
}

// 위도 경도 가져오기 -> Promise화
function getPosition(option){
    return new Promise(function(resolve, reject){
        navigator.geolocation.getCurrentPosition(resolve, reject, option);
    })
}

// 날씨 가져오기
async function getWeather(latitude, longitude){
    // 위도와 경도가 있는 경우
    if(latitude && longitude){
        const data = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=3a4a9e882e892720703507a38413887b`);
        return data;
    }
    // 위도와 경도가 없는 경우
    const data = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=Seoul&appid=3a4a9e882e892720703507a38413887b`);
    return data;
}
// getWeather().then(li => console.log(li.data));
// 3a4a9e882e892720703507a38413887b

function matchIcon(weatherData){
    if (weatherData === "Clear") return './images/039-sun.png';
    if (weatherData === "Clouds") return './images/001-cloud.png';
    if (weatherData === "Rain") return './images/003-rainy.png';
    if (weatherData === "Snow") return './images/006-snowy.png';
    if (weatherData === "Thunderstorm") return './images/008-storm.png';
    if (weatherData === "Drizzle") return './images/031-snowflake.png';
    if (weatherData === "Atmosphere") return './images/033-hurricane.png';
}

function weatherWrapperComponent(li){
    // console.log(li);
    const changeToCelsius = (temp) => (temp - 273.15).toFixed(1);

    return `
    <div class="card shadow-sm bg-transparent mb-3 m-2 flex-grow-1">
    <div class="card-header text-white text-center">
        ${li.dt_txt.split(" ")[0]}
    </div>

    <div class="card-body d-flex">
        <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
            <h5 class="card-title">
                ${li.weather[0].main}
            </h5>
            <img src="${matchIcon(li.weather[0].main)}" width="60px" height="60px" alt="날씨 이미지">
            <p class="card-text">${changeToCelsius(li.main.temp)}</p>
        </div>
    </div>
    </div>
    `
}

function getNextHour(){
    const hour = new Date().getHours();
    // console.log(hour);
    if(hour < 9) return "09:00:00";
    if(hour < 12) return "12:00:00";
    if(hour < 15) return "15:00:00";
    if(hour < 18) return "18:00:00";
    return "21:00:00";
}

// 위도와 경도를 받아서 데이터를 받아오기
async function renderWeather(){
    let latitude='';
    let longitude='';
    try{
        const position = await getPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
    } catch(error){
        console.log(error);
    } finally{
        const weatherResponse = await getWeather(latitude, longitude);
        const weatherData = weatherResponse.data;
        console.log(weatherData.list);

        // 다음 시간
        const nextHour = getNextHour();
        // 5일간의 날씨
        const weatherLIst = weatherData.list.reduce((acc, cur)=>{
            if(cur.dt_txt.indexOf(nextHour) > 0){
                acc.push(cur);
            }
            return acc;
        },[]);

        const modalBody = document.querySelector(".modal-body");
        modalBody.innerHTML = weatherLIst.map(li => {
            return weatherWrapperComponent(li);
        }).join("");

        // 현재 날씨
        const modalButton = document.querySelector(".modal-button");
        modalButton.style.backgroundImage = `url(${matchIcon(weatherLIst[0].weather[0].main)})`;
        console.log(matchIcon(weatherLIst[0].weather[0].main));
        console.log(weatherLIst[0].weather[0].main);
    }
}

(function () {
    setRenderBackground();
    setInterval(()=>{
        setRenderBackground();
    }, 5000)
    setTime();
    memos();
    renderWeather();
})();