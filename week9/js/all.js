// console.log(api_path);
// console.log(token);

// 前台產品列表
const productUrl = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/products`;
// 前台購物車列表
const cartListUrl = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`;
// 前台增加訂單列表
const addOrderUrl = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/orders`;
// 後臺訂單
const OrderUrl = `https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/orders`;

// 購物車相關
let productData = [];
let cartListData = [];
// 訂單相關
let orderData = [];

// 產品相關DOM
// 產品列表ul
const productList = document.querySelector(".productWrap");
// 產品篩選下拉框select
const productSelect = document.querySelector(".productSelect");
// console.log(productList);
// 購物車列表table
const cartList = document.querySelector(".shoppingCart-table");
// 刪除全部購物車按鈕a，沒辦法使用，因為渲染出來的結構沒辦法直接掛監聽，所以改為使用父元素做判斷，229行~231行
// const discardAllBtn = document.querySelector('.discardAllBtn');

// 程式初始化
function init() {
  // 取得產品列表
  getProductList();
  getCartList();
}

// 取得產品列表函式
function getProductList() {
  axios.get(productUrl).then(function (response) {
    // console.log(response.data);
    productData = response.data.products;
    renderProductList(productData);
  }).catch(function (error) {
    console.log(error);
  })
}

// 產品資料渲染
function renderProductList(data) {
  let str = "";
  data.forEach(function (item) {
    str += `<li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${item.images}"
                    alt="">
                <a href="#" id="addCardBtn" class="js-addCart" data-id="${item.id
      }">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${toThousands(
        item.origin_price
      )}</del>
                <p class="nowPrice">NT$${toThousands(item.price)}</p>
                </li>`;
  });
  productList.innerHTML = str;
}

// 產品列表篩選
productSelect.addEventListener("change", function (e) {
  // 抓取目前下拉選單選到的value值
  let category = e.target.value;
  let newProductData = [];
  // console.log(category);
  // 如果下拉選單選到的value值是全部，則渲染全部產品列表
  if (category == "全部") {
    newProductData = productData;
  }
  // 篩選渲染
  productData.forEach(function (item) {
    // 如果下拉選單選到的value值是床架、窗簾、收納，則渲染對應的產品列表
    if (item.category == category) {
      newProductData.push(item);
    }
  });
  renderProductList(newProductData);
});

// 取得購物車列表
function getCartList() {
  axios.get(cartListUrl).then(function (response) {
    cartListData = response.data.carts;
    // console.log(cartListData);
    RenderCartList(cartListData);
  })
    .then(function () {
      // 取得每個品項的減號
      const removeItem = document.querySelectorAll('.removeItem');
      removeItem.forEach(function (item) {
        item.addEventListener('click', function (e) {
          updateCartNum('remove', e);
        });
      })
      // 取得每個品項的加號
      const addItem = document.querySelectorAll('.addItem');
      addItem.forEach(function (item) {
        item.addEventListener('click', function (e) {
          updateCartNum('add', e);
        });
      })
    }).catch(function (error) {
      console.log(error);
    })
}

// 將渲染購物車列表獨立一個function
function RenderCartList(data) {
  // console.log(data.length);
  let dataLen = data.length;
  let str = "";
  // 預設總金額為0
  let totalPrice = 0;
  if (dataLen == 0) {
    str = `<h2>目前購物車中無任何品項</h2>`;
    cartList.innerHTML = str;
  } else {
    data.forEach(function (item) {
      str += `
            <tr>
                <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
                </td>
                <td>NT$${toThousands(item.product.price)}</td>
                <td>${item.quantity === 1
          ? `<button type="button" class="btn removeItem" data-id="${item.id}" disabled>-</button>`
          : `<button type="button" class="btn removeItem" data-id="${item.id}">-</button>`
        }
                <input type="text" class="inputQuantity" id="${item.id
        }" value="${item.quantity}" disabled>
                <button type="button" class="btn addItem" data-id="${item.id
        }">+</button></td>
                <td>${toThousands(item.product.price * item.quantity)}</td>
                <td class="discardBtn">
                    <a href="#" class="material-icons removeCartItem" data-id="${item.id
        }">
                        clear
                    </a>
                </td>
            </tr>`;
      // 加總總金額
      totalPrice += item.product.price * item.quantity;
    });
    cartList.innerHTML = `<tr>
                <th width="40%">品項</th>
                    <th width="15%">單價</th>
                    <th width="15%">數量</th>
                    <th width="15%">金額</th>
                    <th width="15%"></th>
                </tr>
                ${str}
                <tr>
                    <td>
                        <a href="#" class="discardAllBtn">刪除所有品項</a>
                    </td>
                    <td></td>
                    <td></td>
                    <td>
                        <p>總金額</p>
                    </td>
                    <td>NT$${toThousands(totalPrice)}</td>
            </tr>
        `;
  }
}

// 監聽產品列表加入購物車
productList.addEventListener("click", function (e) {
  e.preventDefault();
  // console.log(e.target.getAttribute("data-id"));
  let addCartClass = e.target.getAttribute("class");
  // 如果沒點擊到按鈕就return，不執行任何程式
  if (addCartClass !== "js-addCart") {
    // alert("沒點擊到按鈕唷");
    return;
  }
  // 點擊按鈕後，取得該列data-id的產品id編號
  let productId = e.target.getAttribute("data-id");
  // console.log(productId);
  addCartItem(productId);
});

// 加入購物車
function addCartItem(id) {
  // 因為預設送出的數量是 1，+=1的條件是購物車中有對應的資料，才會 +=1
  let numCheck = 1;
  cartListData.forEach(function (item) {
    if (item.product.id === id) {
      numCheck = item.quantity += 1;
    }
  });
  axios
    .post(cartListUrl, {
      data: {
        productId: id,
        quantity: numCheck,
      },
    })
    .then(function (response) {
      // alert("加入購物車成功");
      swal("成功!", "加入購物車成功", "success");
      // 取得購物車列表
      getCartList();
    }).catch(function (error) {
      console.log(error);
    })
}

function updateCartNum(status, e) {
  // console.log(status);
  // 取得點擊該按鈕的產品id
  const id = e.target.getAttribute("data-id");
  // console.log(id);
  // 取得 input 的 value
  // 這個選擇器寫法對於id是數字開頭的會有問題
  // let num = Number(document.querySelector(`#${id}`).value);
  // 或使用這種宣告寫法
  let num = Number(document.querySelector(`[id='${id}']`).value);
  // console.log(num);
  if (status === 'add') {
    num += 1;
  } else {
    if (num > 1) {
      num -= 1;
    }
  }
  const data = {
    data: {
      id,
      quantity: num
    }
  }
  axios.patch(cartListUrl, data)
    .then(function (response) {
      // console.log(response);
      // 取得購物車列表
      getCartList();
    })
    .catch(function (error) {
      console.log(error);
    })
}

// 監聽產品列表刪除購物車
cartList.addEventListener("click", function (e) {
  e.preventDefault();
  // console.log(e.target);
  let removeCartItem = e.target.getAttribute("class");
  // 沒點擊到按鈕，不會取得material-icons removeCartItem的class名稱內容，則中斷
  if (removeCartItem !== "material-icons removeCartItem") {
    // console.log(cartId);
    return;
  }
  // 點擊到X按鈕，取得data-id
  if (removeCartItem === "material-icons removeCartItem") {
    // console.log(removeCartItem);
    let cartId = e.target.getAttribute("data-id");
    // console.log(cartId);
    deleteCartItem(cartId);
  }
});

// 刪除購物車內特定產品
function deleteCartItem(cartId) {
  axios.delete(`${cartListUrl}/${cartId}`).then(function (response) {
    // console.log(response);
    // alert("刪除購物車成功");
    swal("成功!", "刪除購物車成功", "success");
    // 取得購物車列表
    // 直接使用response的資訊帶參數執行渲染購物車列表的function，減少 request
    cartListData = response.data.carts;
    // console.log(cartListData);
    RenderCartList(cartListData);
  }).catch(function (error) {
    console.log(error);
  })
}

// 監聽刪除全部購物車按鈕
cartList.addEventListener("click", function (e) {
  e.preventDefault();
  let discardAllBtn = e.target.getAttribute("class");
  if (discardAllBtn === "discardAllBtn") {
    // console.log(discardAllBtn);
    deleteAllCartList();
    return;
  }
  // console.log("沒點擊到刪除所有品項按鈕");
});

// 刪除全部購物車內容
function deleteAllCartList() {
  axios
    .delete(cartListUrl)
    .then(function (response) {
      // alert("刪除全部購物車成功");
      swal("成功!", "刪除全部購物車成功", "success");
      // 取得購物車列表
      // 直接使用response的資訊帶參數執行渲染購物車列表的function，減少 request
      cartListData = response.data.carts;
      // console.log(cartListData);
      RenderCartList(cartListData);
    })
    // 購物車沒內容時，使用catch捕捉錯誤
    .catch(function (error) {
      console.log(error);
    })
}

// form表單
const form = document.querySelector(".orderInfo-form");
// 監聽送出訂單按鈕
const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault();
  // alert("點擊到按鈕了");
  let cartLength = cartListData.length;
  // console.log(cartLength);

  // 送出訂單DOM
  // 在全域宣告的畫會取到空字串，因為在全域取值的話，代表一進來就會執行，因此當時會是空的 value，取到空字串賦予給變數，那變數就是空字串
  // 若要在全域宣告的話要將const customerName = document.querySelector("#customerName")寫在全域，監聽內寫customerName.value即可
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const tradeWay = document.querySelector("#tradeWay").value;
  //   console.log(customerName);
  if (cartLength == 0) {
    // alert("請加入至少一個購物車品項");
    swal("出錯了!", "請加入至少一個購物車品項", "error");
    return;
  }
  if (
    customerName == "" ||
    customerPhone == "" ||
    customerEmail == "" ||
    customerAddress == ""
  ) {
    // alert("請輸入完整訂單資訊");
    swal("出錯了!", "請輸入完整訂單資訊", "error");
    return;
  }
  // 驗證室內電話、手機號碼、電子信箱規則
  // 室內電話格式: 0X-XXXXXXXX，X為任意數字
  const rePhone = /^(0\d+)-(\d{8})(?:(?:#)(\d+))?$/;
  // 手機號格式: 09XXXXXXXX，X為任意數字
  const reCellPhone = /^[09]{2}[0-9]{8}$/;
  // 電子信箱格式: 需要含有@及.即可
  const reMail = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if (!rePhone.test(customerPhone) && !reCellPhone.test(customerPhone) && !reMail.test(customerEmail)) {
    document.querySelector(`[data-message="電話"]`).textContent =
      "電話格式不正確，0X-XXXXXXXX 或 09XXXXXXXX";
    document.querySelector(`[data-message="Email"]`).textContent =
      "格式不正確，電子郵件地址必須包括 ( @ 和 . )";
    return;
  }
  if (!rePhone.test(customerPhone) && !reCellPhone.test(customerPhone)) {
    // alert("市內電話或手機號碼格式不正確，請重新輸入");
    document.querySelector(`[data-message="電話"]`).textContent =
      "電話格式不正確，0X-XXXXXXXX 或 09XXXXXXXX";
    document.querySelector(`[data-message="Email"]`).textContent =
      "正確";
    return;
  }
  if (!reMail.test(customerEmail)) {
    // alert("格式不正確，電子郵件地址必須包括 ( @ 和 . )");
    document.querySelector(`[data-message="Email"]`).textContent =
      "格式不正確，電子郵件地址必須包括 ( @ 和 . )";
    document.querySelector(`[data-message="電話"]`).textContent =
      "正確";
    return;
  }
  //   alert("訂單送出成功");
  //   form.reset();
  // 訂單相關
  orderData = {
    name: customerName,
    tel: customerPhone,
    Email: customerEmail,
    address: customerAddress,
    payment: tradeWay,
  };
  creatOrderList(orderData);
});

// 送出購買訂單
function creatOrderList(item) {
  axios
    .post(OrderUrl, {
      data: {
        user: {
          name: item.name,
          tel: item.tel,
          email: item.Email,
          address: item.address,
          payment: item.payment,
        },
      },
    })
    .then(function (response) {
      // alert("訂單建立成功");
      swal("成功!", "訂單建立成功", "success");
      // 取得購物車列表
      getCartList();
      // 一鍵清除
      form.reset();
      // 電話、Email恢復必填資訊
      document.querySelector(`[data-message="電話"]`).textContent = "必填";
      document.querySelector(`[data-message="Email"]`).textContent = "必填";
    }).catch(function (error) {
      console.log(error);
    })
}

// 執行初始化
init();
