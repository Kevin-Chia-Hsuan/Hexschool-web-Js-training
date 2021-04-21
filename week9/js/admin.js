// 後臺訂單
const OrderUrl = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${apiPath}/orders`;

// 訂單相關
let orderData = [];

// DOM
const orderList = document.querySelector(".orderPage-table-body");
// console.log(orderList);
const discardAllBtn = document.querySelector(".discardAllBtn");
// console.log(discardAllBtn);

// 資料初始化
function init() {
  getOrderList();
}

// C3 圖表LV1
function renderC3(data) {
  // console.log(orderData);
  // 物件資料蒐集
  let total = {};
  data.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (total[productItem.category] == undefined) {
        total[productItem.category] = productItem.price * productItem.quantity;
      } else {
        total[productItem.category] += productItem.price * productItem.quantity;
      }
    });
  });
  // console.log(total);
  // 做出資料關聯
  let categoryAry = Object.keys(total);
  // console.log(categoryAry);
  let newData = [];
  categoryAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);
  });
  // console.log(newData);
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: newData,
      colors: {
        窗簾: "#DACBFF",
        收納: "#9D7FEA",
        床架: "#5434A7",
        // "其他": "#301E5F",
      },
    },
  });
}

// C3 圖表LV2
function renderC3LV2(data) {
  // 物件資料蒐集
  let obj = {};
  data.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (obj[productItem.title] === undefined) {
        obj[productItem.title] = productItem.price * productItem.quantity;
      } else {
        obj[productItem.title] += productItem.price * productItem.quantity;
      }
    });
  });
  // console.log(total);

  // 做出資料關聯
  let originAry = Object.keys(obj);
  // console.log(categoryAry);
  let rankSortAry = [];
  originAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(obj[item]);
    rankSortAry.push(ary);
  });
  // console.log(rankSortAry);

  // 比大小，降冪排序(目的：取營收前三高的產品當作主色塊，其他剩餘品項加總成一個色塊顯示)
  rankSortAry.sort(function (a, b) {
    // a[1]、b[1] 是因為要取陣列的第2筆資料，也就是金額來作為排序比較的值，由大到小，所以是b[1] - a[1]
    return b[1] - a[1];
  });
  // console.log(rankSortAry);
  // 如果超過4筆以上，就統整為其他區塊
  let len = rankSortAry.length;
  // 因為陣列是從0開始，超過4筆就是>3
  if (len > 3) {
    let otherTotal = 0;
    rankSortAry.forEach(function (item, index) {
      // 第3筆資料開始，就把每一筆資料的金額加總
      if (index > 2) {
        otherTotal += rankSortAry[index][1];
      }
    });
    // 從第4筆資料開始移除
    rankSortAry.splice(3, len - 1);
    // 新增一個其他資料，並把加總金額也一同push進去
    rankSortAry.push(["其他", otherTotal]);
  }

  // C3程式碼
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: rankSortAry,
    },
    color: {
      pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"],
    },
  });
}

// 取得訂單列表
function getOrderList() {
  axios.get(OrderUrl, token).then(function (response) {
    orderData = response.data.orders;
    // 不可在此處重新排序，應該要在渲染時重新排序才對
    // 將orderData按照createdAt值重新依序排序
    // orderData = orderData.sort(function (a, b) {
    //   return a.createdAt > b.createdAt ? 1 : -1;
    // });
    // console.log(orderData);
    renderOrderList(orderData);
  });
}

// 資料渲染
function renderOrderList(data) {
  // 將orderData按照createdAt值重新依序排序
  orderData = orderData.sort(function (a, b) {
    return a.createdAt > b.createdAt ? 1 : -1;
  });
  let str = "";
  let status = "";
  data.forEach(function (item) {
    // 組時間字串
    // *1000 是因為要正確轉換需要完整13碼
    const timeStamp = new Date(item.createdAt * 1000);
    const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1
      }/${timeStamp.getDate()}`;
    // console.log(timeStamp);
    // console.log(orderTime);

    // 組產品字串
    let productDetail = "";
    item.products.forEach(function (productItem) {
      productDetail += `<p>${productItem.title}X${productItem.quantity}</p>`;
    });
    // 判斷訂單處理狀態
    // if (item.paid == false) {
    //   status = "未確認";
    // } else {
    //   status = "已確認";
    // }
    // 改為三元運算子寫法
    status = !item.paid ? "未確認" : "已確認";

    // 組訂單字串
    str += `<tr>
      <td>${item.id}</td>
      <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
      </td>
      <td>${item.user.address}</td>
      <td>${item.user.email}</td>
      <td>
          ${productDetail}
      </td>
      <td>${orderTime}</td>
      <td class="orderStatus">
          <a href="#" class="confirmOrderBtn" data-id="${item.id}" data-paid="${item.paid}">${status}</a>
      </td>
      <td>
          <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
      </td>
    </tr>`;
  });
  orderList.innerHTML = str;
  // renderC3(orderData);
  renderC3LV2(orderData);
}

// 監聽確認訂單狀態按鈕
orderList.addEventListener("click", function (e) {
  e.preventDefault();
  let confirmOrderBtn = e.target.getAttribute("class");
  let deleteOrderBtn = e.target.getAttribute("class");
  // console.log(confirmOrderBtn);
  // console.log(deleteOrderBtn);
  if (
    confirmOrderBtn !== "confirmOrderBtn" &&
    deleteOrderBtn !== "delSingleOrder-Btn"
  ) {
    // alert("沒點擊到按鈕唷");
    return;
  }
  // 點擊確認訂單狀態按鈕後，取得該列data-id的產品id編號
  let orderId = e.target.getAttribute("data-id");
  let paidStatus = e.target.getAttribute("data-paid");
  // console.log(orderId);
  // console.log(paidStatus);
  // if (confirmOrderBtn === "confirmOrderBtn" && paidStatus == "false") {
  //   // alert("狀態目前為未確認");
  //   // console.log("狀態目前為未確認");
  //   editConfirmOrderList(orderId);
  // }
  // if (confirmOrderBtn === "confirmOrderBtn" && paidStatus == "true") {
  //   // alert("狀態目前為已確認");
  //   // console.log("狀態目前為已確認");
  //   editOrderList(orderId);
  // }
  // if (deleteOrderBtn === "delSingleOrder-Btn") {
  //   // console.log(orderId);
  //   // alert("點擊到刪除訂單按鈕");
  //   deleteOrderItem(orderId);
  // }
  if (confirmOrderBtn === "confirmOrderBtn" && paidStatus == "false") {
    // alert("狀態目前為未確認");
    // console.log("狀態目前為未確認");
    editConfirmOrderList(orderId);
    return;
  } else if (confirmOrderBtn === "confirmOrderBtn" && paidStatus == "true") {
    // alert("狀態目前為已確認");
    // console.log("狀態目前為已確認");
    editOrderList(orderId);
    return;
  }
  // console.log(orderId);
  // alert("點擊到刪除訂單按鈕");
  deleteOrderItem(orderId);
});

// 修改訂單狀態(已確認)
function editConfirmOrderList(orderId) {
  axios
    .put(
      OrderUrl,
      {
        data: {
          id: orderId,
          paid: true,
        },
      },
      token
    )
    .then(function (response) {
      // alert("訂單確認成功");
      swal("成功!", "訂單確認成功", "success");
      orderData = response.data.orders;
      // console.log(orderData);
      // 執行函式
      renderOrderList(orderData);
    });
}

// 修改訂單狀態(未確認)
function editOrderList(orderId) {
  axios
    .put(
      OrderUrl,
      {
        data: {
          id: orderId,
          paid: false,
        },
      },
      token
    )
    .then(function (response) {
      // alert("訂單取消確認成功");
      swal("成功!", "訂單取消確認成功", "success");
      orderData = response.data.orders;
      // console.log(orderData);
      // 執行函式
      renderOrderList(orderData);
    });
}

// 刪除特定訂單
function deleteOrderItem(orderId) {
  axios.delete(`${OrderUrl}/${orderId}`, token).then(function (response) {
    // alert("刪除特定訂單成功");
    swal("成功!", "刪除特定訂單成功", "success");
    // console.log(orderData);
    // 執行函式
    getOrderList();
  });
}

// 監聽刪除全部訂單
discardAllBtn.addEventListener("click", function (e) {
  // alert("點擊到刪除全部訂單按鈕");
  deleteAllOrder();
});

// 刪除全部訂單
function deleteAllOrder() {
  axios.delete(OrderUrl, token).then(function (response) {
    // alert("刪除全部訂單成功");
    swal("成功!", "刪除全部訂單成功", "success");
    orderData = response.data.orders;
    // console.log(orderData);
    // 執行函式
    renderOrderList(orderData);
    // getOrderList();
  });
}

init();
