// 資料來源
// https://raw.githubusercontent.com/hexschool/js-training/main/travelApi.json

// DOM
// ul列表
const list = document.querySelector('.ticketCard-area');
// 列出本次搜尋筆數
const record = document.querySelector('#searchResult-text');
// 下拉選單
const stationFilter = document.querySelector(".regionSearch");
// 新增旅遊套票輸入框
const name = document.querySelector("#ticketName");
const imgurl = document.querySelector("#ticketImgUrl");
const area = document.querySelector("#ticketRegion");
const description = document.querySelector("#ticketDescription");
const group = document.querySelector("#ticketNum");
const price = document.querySelector("#ticketPrice");
const rate = document.querySelector("#ticketRate");
const addBtn = document.querySelector(".addTicket-btn");
const form = document.querySelector(".addTicket-form");

let travelData = [];
let url = "https://raw.githubusercontent.com/hexschool/js-training/main/travelApi.json";
//資料初始化
function init() {
  axios.get(url)
    .then(function (response) {
      travelData = response.data.data;
      // 執行函式
      renderData(travelData);
      renderC3(travelData);
    });
}

// 用函式包裝起來
function renderData(travelData) {
  // console.log(travelData);
  let str = "";
  let dataLen = travelData.length;
  // console.log(dataLen);
  travelData.forEach(function (item, index) {
    str += `<li class="ticketCard">
        <div class="ticketCard-img">
            <a href="#">
                <img src="${item.imgUrl}" alt="">
            </a>
            <div class="ticketCard-region">${item.area}</div>
            <div class="ticketCard-rank">${item.rate}</div>
        </div>
        <div class="ticketCard-content">
            <div>
                <h3>
                    <a href="#" class="ticketCard-name">${item.name}</a>
                </h3>
                <p class="ticketCard-description">
                ${item.description}
                </p>
            </div>
            <div class="ticketCard-info">
                <p class="ticketCard-num">
                    <span><i class="fas fa-exclamation-circle"></i></span>
                    剩下最後 <span id="ticketCard-num"> ${item.group} </span> 組
                </p>
                <p class="ticketCard-price">
                    TWD <span id="ticketCard-price">$${item.price}</span>
                </p>
            </div>
        </div>
    </li>`;
  });
  list.innerHTML = str;
  record.innerHTML = `本次搜尋共 ${dataLen} 筆資料`;
}

// 使用change做為下拉觸發選擇，如同click點擊的模式
stationFilter.addEventListener("change", renderDataChange);

function renderDataChange(e) {
  let filterArray = travelData.filter(function (item) {
    if (e.target.value == item.area) {
      return item;
    } else if (e.target.value == "") {
      return item;
    }
  });
  renderData(filterArray);
  renderC3(filterArray);
  // record.innerHTML = `本次搜尋共 ${recordNum} 筆資料`;
}

// 用函式包裝起來
function renderC3(travelData) {
  // console.log(data);
  // 篩選地區：台北、台中、高雄數量
  let totalObj = {};
  travelData.forEach((item) => {
    if (totalObj[item.area] == undefined) {
      totalObj[item.area] = 1;
    } else {
      totalObj[item.area] += 1;
    }
  });
  //   console.log(totalObj);

  // newData = [["高雄", 1], ["台中", 1], ["台北", 1]]
  let newData = [];
  let area = Object.keys(totalObj);
  // console.log(area);
  area.forEach((item) => {
    // console.log(item);
    let areaAry = [];
    areaAry.push(item);
    areaAry.push(totalObj[item]);
    newData.push(areaAry);
    // console.log(areaAry);
  });

  // 將 newData 丟入 c3 產生器
  const chart = c3.generate({
    // bindto對應 html中的id為chart的標籤
    size: {
      height: 180,
      width: 180,
    },
    bindto: "#chart",
    data: {
      //columns: [
      //          ['data1', 30, 200, 100, 400, 150, 250],
      //          ['data2', 50, 20, 10, 40, 15, 25]
      //         ]
      columns: newData,
      // type為圖形類型，donut為甜甜圈圖
      type: "donut",
      colors: {
        '台北': '#26C0C7',
        '台中': '#5151D3',
        '高雄': '#E68618'
      },
    },
    donut: {
      title: "旅遊地區",
      width: 15,
    },
    //定義顏色
    // color: {
    //   pattern: ["#E68618", "#26C0C7", "#5151D3"],
    // },
  });
}

//顯示套票星級只能輸入1~10的數字
rate.addEventListener("blur", function () {
  rate.style = "";
  if (!isPositiveInt(rate.value) || rate.value > 10) {
    rate.value = "";
    rate.setAttribute("placeholder", "請輸入1~10間的數值");
    rate.style = "border-color:red;border-width:3px;";
  }
});
//若套票金額輸入負數則顯示請輸入正整數
price.addEventListener("blur", function () {
  price.style = "";
  if (!isPositiveInt(price.value)) {
    price.value = "";
    price.setAttribute("placeholder", "請輸入正整數");
    price.style = "border-color:red;border-width:3px;";
  }
});
//若套票組數輸入負數則顯示請輸入正整數
group.addEventListener("blur", function () {
  group.style = "";
  if (!isPositiveInt(group.value)) {
    group.value = "";
    group.setAttribute("placeholder", "請輸入正整數");
    group.style = "border-color:red;border-width:3px;";
  }
});

//正規表達式
//https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Guide/Regular_Expressions
//https://www.itread01.com/content/1548111441.html
//http://www1.nttu.edu.tw/klou/course/921/js/09-regular.htm
function isPositiveInt(num) {
  return /^[0-9]*[1-9][0-9]*$/.test(num);
}

//新增旅遊地區資料
addBtn.addEventListener("click", addCard);

function addCard(e) {
  let obj = {
    id: Date.now(),
    name: name.value,
    imgUrl: imgurl.value,
    area: area.value,
    description: description.value,
    group: Number(group.value),
    price: Number(price.value),
    rate: Number(rate.value),
  };
  //因為使用的input button 的 type 是 submit，submit 有預設行為，會將資料送出，所以要取消預設行為
  e.preventDefault();
  if (
    name.value == "" ||
    imgurl.value == "" ||
    area.value == "" ||
    description.value == "" ||
    group.value == "" ||
    price.value == "" ||
    rate.value == ""
  ) {
    alert(`請輸入完整套票資訊`);
  } else {
    travelData.push(obj);
    //一鍵清除
    form.reset();
  }
  // console.log(travelData);
  renderData(travelData);
  renderC3(travelData);
}

init();

