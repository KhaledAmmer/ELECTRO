$(`body`).css({
  height: screen.height,
});
class Info {
  static total;
  static finalProductList = [];
  static wishList = [];
  static allProducts;
  static currentUser;
  static catagories;
  static theme = "Light";
}

class LocalStorage {
  static getItem(key) {
    return JSON.parse(window.localStorage.getItem(`${key}`));
  }
  static setItem(key, value) {
    return window.localStorage.setItem(`${key}`, JSON.stringify(value));
  }

  static removeItem(key) {
    window.localStorage.removeItem(key);
    return null;
  }
}

class Cart {
  constructor(user, product) {
    this.user = user;
    this.product = product;
  }
  appendItem(cartDiv, product) {
    this.product = product[1];

    const [exitBtn, plusBtn, minusBtn] = [
      $("<button>❌</button>"),
      $(`<button id = "plus-btn" class="cart-plus-minus">+</button>`),
      $(`<button id = "minus-btn" class="cart-plus-minus">-</button>`),
    ];

    const itemCard = $(`
    <div class = "cart-card">
        <img src="${product[1].imgUrl}"/>

        <div id="card-details-cart">
            <h1>${product[1].name}</h2>
            <div id = "plus-div${product[1].id}" class= "cart-buttons"> 
                <small>Price: ${product[1].price}</small>
             </div>

        <div id = "minus-div${product[1].id}" class= "cart-buttons"> 
            <small>Number Of Items: <span id ="n${product[1].id}">${product[0]}</span></small>
            </div>
            
        </div>
            <div id="exit-btn${product[1].id}" class="exit-btn">
            </div>
     </div>
         `);
    cartDiv.append(itemCard);

    $(`#exit-btn${product[1].id}`).append(exitBtn);
    $(`#minus-div${product[1].id}`).append(minusBtn);
    $(`#plus-div${product[1].id}`).append(plusBtn);

    exitBtn.on("click", () => {
      this.confirmRemovingItem(product, itemCard);
    });
    plusBtn.on("click", () => {
      const cart = new Cart (Info.currentUser,product[1]);
      cart.storItem()
      const itemNumber = $(`#n${product[1].id}`);
      const total = $(`#total`);
      total.text(
        `${
          Number(total.text()) + Number(product[1].price.replace("JOD ", ""))
        }  `
      );

      itemNumber.text(Number(itemNumber.text()) + 1);
      Info.total = total.text();
    });
    minusBtn.on("click", () => {
      const cart = new Cart (Info.currentUser,product[1]);
      cart.removeOneItem(product[1],$(`#content`))
      const itemNumber = $(`#n${product[1].id}`);
      if (itemNumber.text() !== "1") {
        itemNumber.text(Number(itemNumber.text()) - 1);
        const total = $(`#total`);
        total.text(
          `${
            Number(total.text()) - Number(product[1].price.replace("JOD ", ""))
          }  `
        );
        Info.total = total.text();
      }
     
    });

    return cartDiv;
  }
  confirmRemovingItem(product, itemCard, key = "usersCart") {
    const dialog = $(`
    <div id = "whole-dialog">
    <div id ="remove-dialog">
      <h6>You will remove this item,Are you sure ?<h6>
      <div>
      <button id = "yes-btn">Yes</button>
      <button id = "no-btn">No</button>
      </div>
    </div>
    </div>

    `);
    $("body").prepend(dialog);
    $(`#yes-btn`).on("click", () => {
      dialog.remove();
      $("#total").text(
        `${
          Number($("#total").text()) -
          product[1].price.replace("JOD ", "") * product[0]
        }`
      );
      this.removeCartItem(product[1], itemCard, key);

      //* below statement related to receipt screen . remove the item from  Info.finalProductList
      Info.finalProductList.splice(Info.finalProductList.indexOf(product), 1);
      Info.total = $("#total").text();
    });
    $(`#no-btn`).on("click", () => {
      dialog.remove();
    });
  }
  removeCartItem(productObj, itemCard, key = "usersCart") {
    this.user = Info.currentUser;
    this.product = productObj;
    const usersCart = LocalStorage.getItem(key);
    for (let user of usersCart) {
      //* if the user is exist in the local storage  then get his products

      if (Object.keys(user)[0] === `${this.user.id}`) {
        for (let i = 0; i < user[this.user.id].length; i++) {
          if (user[this.user.id][i].id === this.product.id) {
            user[this.user.id].splice(i, 1);
            i--;
          }
        }
      }
    }
    LocalStorage.setItem(key, usersCart);
    itemCard.remove();
  }
  removeOneItem(productObj, itemCard, key = "usersCart") {
    this.user = Info.currentUser;
    this.product = productObj;
    const usersCart = LocalStorage.getItem(key);
    for (let user of usersCart) {
      //* if the user is exist in the local storage  then get his products

      if (Object.keys(user)[0] === `${this.user.id}`) {
        for (let i = 0; i < user[this.user.id].length; i++) {
          if (user[this.user.id][i].id === this.product.id) {
            user[this.user.id].splice(i, 1);
            break;
          }
        }
      }
    }
    LocalStorage.setItem(key, usersCart);
    itemCard.remove();
  }
  getCartItems(key = "usersCart") {
    const usersCart = LocalStorage.getItem(key);

    if (usersCart) {
      for (let user of usersCart) {
        const productIds = {};
        //* if the user is exist in the local storage  then get his products
        if (Object.keys(user)[0] === `${this.user.id}`) {
          user[this.user.id].forEach((product) => {
            //* This condition to sort the identical products and save the how many this product repeat
            if (!Object.keys(productIds).includes(`${product.id}`)) {
              //* 1st Index in the array refers to the number of times the product exists in the user cart. 2nd index refers to the product itself
              productIds[product.id] = [1, product];
            } else {
              productIds[product.id][0] = productIds[product.id][0] + 1;
            }
          });

          return productIds;
        }
      }
    } 
  }
  storItem(key = "usersCart") {
    //* stor the item iin local storage (allUsersCart ---> {id of user ---> [{id.product:product}]})
    const storedObj = {};
    const cartObj = {};

    cartObj[this.product.id] = this.product;
    storedObj[this.user.id] = [this.product];

    //! key has two values (usersCart of wishList)
    const usersCart = LocalStorage.getItem(key);

    let isUserExist = this.isUserExist(usersCart);

    if (usersCart) {
      if (!isUserExist[0]) {
        //* if the user does not exist then add new user
        LocalStorage.setItem(key, [...usersCart, storedObj]);
      } else {
        // * if the user exist add the product to its cart

        usersCart[isUserExist[1]][this.user.id].push(this.product);

        LocalStorage.setItem(key, usersCart);
      }
    } else {
      LocalStorage.setItem(key, [storedObj]);
    }
  }
  isUserExist(allUsers) {
    //* first if statement  for the situation of no user exist

    if (allUsers) {
      for (let index = 0; index < allUsers.length; index++) {
        if (Object.keys(allUsers[index])[0] === `${this.user.id}`) {
          return [true, index];
        }
      }
    }

    return [false];
  }
}

class WishList extends Cart {
  constructor(user, product) {
    super(user, product);
  }

  //* Override
  appendItem(cartDiv, product) {
    this.product = product[1];
    const exitBtn = $("<button>❌</button>");
    const itemCard = $(`
    <div class = "cart-card">
        <img src="${product[1].imgUrl}"/>
        <div id="card-details-cart">
            <h1>${product[1].name}</h2>
            <div id = "plus-div${product[1].id}" class= "cart-buttons"> 
              <small>Price: ${product[1].price}</small>
        </div>
        </div>
        <div id="exit-btn${product[1].id}"  class="exit-btn">
         </div>
     </div>
         `);
    cartDiv.append(itemCard);

    $(`#exit-btn${product[1].id}`).append(exitBtn);

    exitBtn.on("click", () => {
      super.confirmRemovingItem(product, itemCard, "usersWishList");
    });

    return cartDiv;
  }

  //* Override
  storItem() {
    super.storItem("usersWishList");
  }
  //* Override
  getCartItems() {
    const usersWish = LocalStorage.getItem("usersWishList");
    const productIds = {};
    if (usersWish) {
      for (let user of usersWish) {
        if (Object.keys(user)[0] === `${this.user.id}`) {
          user[this.user.id].forEach((product) => {
            productIds[product.id] = [1, product];
          });
        }
      }
      return productIds;
    }
  }
}
class User {
  constructor(userName, password, id) {
    this.id = id;
    this.userName = userName;
    this.email = null;
    this.password = password;
  }
  createUser(inputForm) {
    this.userName = inputForm.UserName.val();
    this.email = inputForm.Email.val();
    this.password = inputForm.Password.val();
    this.addUserToLocalStorage();
  }
  addUserToLocalStorage() {
    //* The next lines is to identify local storage variable that related to creation of  an user
    const isFirstUser = LocalStorage.getItem("isFirstUser");

    if (!isFirstUser) {
      this.id = 1;
      LocalStorage.setItem("users", [this]);
      LocalStorage.setItem("isFirstUser", true);
    } else {
      const users = LocalStorage.getItem("users");
      if (!this.isUserExist(users)) {
        this.id = users.length + 1;
        LocalStorage.removeItem("users");
        LocalStorage.setItem("users", [...users, this]);
      }
    }
  }
  isUserExist(users) {
    let isExist = false;
    for (let user of users) {
      if (user.email === this.email) {
        isExist = true;
        break;
      }
    }
    return isExist;
  }
  logInUser(inputForm) {
    this.email = inputForm.Email.val();
    this.password = inputForm.Password.val();
    const users = LocalStorage.getItem("users");
    if (users) {
      for (let user of users) {
        if (user.email === this.email && this.password === user.password) {
          Info.currentUser = user;
          LocalStorage.setItem("isUserLogin", [true, user]);
          $("#registration-div").css({ display: "none" });
          $("#nav-bar").css({ display: "flex" });
          $("#content").css({ display: "grid" });
        }
      }
    }
  }
}

class Product {
  constructor() {
    this.id = null;
    this.imgUrl = null;
    this.name = null;
    this.details = null;
    this.category = null;
  }

  createProduct(jsonObj, category) {
    this.id = jsonObj.id;
    this.imgUrl = jsonObj.img;
    this.name = jsonObj.name;
    this.details = jsonObj.details;
    this.price = jsonObj.price;
    this.category = category;
  }

  createProductCard() {
    const card = $(`
    <div class ="card">
    </div>`);

    //* to control click event in the card and buttons for that define them in separate  variables then append them  in the card variable
    const buttonsDiv = $(`<div class = "card-btn"> </div>`);
    const cartBtn = $(`<button id ="cart-btn">Add to Cart &#x1F6D2</button>`);
    const wishBtn = $(
      `<button id = "wish-btn">Add To WishList &#129505</button>`
    );
    buttonsDiv.append(cartBtn);
    buttonsDiv.append(wishBtn);
    const cardContent = $(`<div id = "div${this.id}" class ="card1">
    <small>${this.name}</small>
    <img src = "${this.imgUrl}" />
    <h4>${this.price}</h4>
    </div>`);
    card.append(cardContent);
    card.append(buttonsDiv);

    cardContent.on("click", () => {
      this.showCardDetails();
    });
    card.on("mouseover", () => {
      this.cardHover(card);
    });
    card.on("mouseleave", () => {
      this.removeCardHover(card);
    });

    cartBtn.on(`click`, () => {
      //* add to cart
      alertMessage("Item is added successfully ✅", "green", "white", 4000);
      const cart = new Cart(Info.currentUser, this);
      cart.storItem();
    });
    wishBtn.on(`click`, () => {
      alertMessage("Item is added successfully 🧡", "brown", "white", 4000, [
        "12%",
        "none",
        "5%",
        "none",
      ]);

      //* add to wishlist
      const cart = new WishList(Info.currentUser, this);
      cart.storItem();
    });

    return card;
  }

  cardHover(card) {
    $(`#div${this.id}`).css({
      opacity: "0.6",
    });
  }
  removeCardHover(card) {
    $(`#div${this.id}`).css({
      opacity: "1",
    });
  }
  showCardDetails() {
    //* remove the exist ing one before reCreate to avoid overwrite the element inside the card
    $(`#show-card-details`).remove();
    //* create the div that will contain the details of the card
    const cardDetailsDiv = $(`<div id="show-card-details"></div>`);
    //* show the div in the body
    $("body").append(cardDetailsDiv);

    const card = $(`
    <img src="${this.imgUrl}"/>
    <div id="card-details">
    <h1>${this.name}</h2>
    
    <h6>Short Description</h6>
      <p>${this.details}</p>
      
      <small>${this.price}</small>
     
    </div>
    `);
    const input = $('<input placeholder ="How Many" type="number" min="1"/>');
    const cartBtn = $(
      `<button class = "details-btn">Add to Cart &#x1F6D2</button>`
    );
    const wishBtn = $(
      `<button class = "details-btn">Add To WishList &#129505</button>`
    );
    const btnsDiv = $(`<div id ="details-add-btns"> </div>`);
    btnsDiv.append(cartBtn);
    btnsDiv.append(wishBtn);
    card.append(input);
    card.append(btnsDiv);

    cartBtn.on("click", () => {
      const cart = new Cart(Info.currentUser, this);
      if (input.val() >= 1) {
        let end = Number(input.val());
        for (let i = 1; i <= end; i++) {
          cart.storItem();
        }
        alertMessage("Item is added successfully", "green", "white", 4000);
      } else {
        alertMessage(
          "Please specify how many items you need",
          "red",
          "white",
          5000
        );
      }
      //cart.storItem();
    });
    wishBtn.on("click", () => {
      alertMessage("Item is added successfully 🧡", "brown", "white", 4000, [
        "12%",
        "none",
        "5%",
        "none",
      ]);

      //* add to wishlist
      const cart = new WishList(Info.currentUser, this);
      cart.storItem();
    });

    //* hide the contents  and search results when click on the card
    showCurrentDiv("#show-card-details");
    $("#show-card-details").css({
      display: "flex",
    });
    cardDetailsDiv.append(card);
  }
  createSearchCard() {
    const card = $(`
    <div class = "search-card">
   <img src="${this.imgUrl}"/>
    <div id="card-details-search">
    <h1>${this.name}</h2>      
      <small>Price: ${this.price}</small>
      </div>
    </div>
    </div>
    `);
    card.on("click", () => {
      this.showCardDetails();
    });
    card.on("mouseover", () => {
      this.hoverSearchCard(card);
    });
    card.on("mouseleave", () => {
      this.removeHoverSearchCard(card);
    });
    return card;
  }
  hoverSearchCard(card) {
    card.css({
      "background-color": "black",
      color: "white",
    });
  }
  removeHoverSearchCard(card) {
    card.css({
      "background-color": "white",
      color: "black",
    });
  }
}

const showCurrentDiv = (currentDiv) => {
  const siteDivs = [
    "#show-card-details",
    "#search-results",
    "#cart-div",
    "#content",
    "#menu",
    "#receipt-div",
    "#alert-dia",
    "#navigation-menu-div",
    "#wish-div",
  ];
  siteDivs.forEach((div) => {
    if (div !== currentDiv) {
      $(`${div}`).hide();
    } else {
      $(`${div}`).show();
    }
  });
};

//! Those functions related to products screen
const getJsonDate = async () => {
  // const jsonData= require('./assets/API/ProductData.json');
  // return jsonData;

  return {
    Labtop: [
      {
        id: 0,
        name: "ASUS TUF Dash F15 FX516PE (2021)",
        img: "https://citycenter.jo/image/cachewebp/catalog/32021/dash-1200x1200.webp",
        price: "JOD 859",
        details:
          "ASUS TUF Dash F15 FX516PE-HN004T 11Gen Intel Core i5 up to 4.4GHz 8M Cash 4-Cores , 8GB RAM DDR4 , 512GB M.2 NVMe™ PCIe® 3.0 SSD , 15.6 IPS Full HD sRGB 62.5% Adobe 47.34% 144Hz , Nvidia RTX 3050 TI 4GB DDR6 , Wireless , Bluetooth , Backlit RGB Arabic / English Keyboard , Windows 10 Home",
      },
      {
        id: 1,
        name: "Predator Helios 300",
        img: "https://d1rlzxa98cyc61.cloudfront.net/catalog/product/cache/1801c418208f9607a371e61f8d9184d9/1/7/173484_2020_2.jpg",
        price: "JOD 1149",
        details:
          "Predator Helios 300 11Gen Intel Core i7 8-Core up to 4.6GHz 24M Cashe , 16GB DDR4 RAM ,  1TB SSD M.2 2280 PCIe NVMe + 1TB HDD ,  Nvidia RTX 3060 6GB GDDR6,   15.6 Full HD IPS ComfyView 144Hz , Camera , Wireless , Bluetooth , RGB Backlit Arabic / English , Dos",
      },
      {
        id: 6,
        name: "HP ENVY 15 15-ep1000ne (2021)",
        img: "https://citycenter.jo/image/cachewebp/catalog/042022/envi95-550x400.webp",
        price: "JOD 1799",
        details:
          "HP ENVY 15 15-ep1000ne 11Gen Core i9 up to 4.9GHz 24M Cash 8-Cores , 32GB RAM DDR4 , 1 TB PCIe® NVMe™ TLC M.2 SSD , 15.6 IPS Full HD Edge-to-Edge Glass, Micro-Edge, 400 nits 100% sRGB Multi Touch Screen , NVIDIA® GeForce RTX™ 3060 Laptop GPU (6 GB GDDR6 dedicated) , Wireless , Bluetooth , Backlit Arabic / English Keyboard , Windows 10 Home",
      },
      {
        id: 7,
        name: "ASUS TUF F15 FX506HCB (2021)",
        img: "https://citycenter.jo/image/cachewebp/catalog/92021/fxx506-550x400.webp",
        price: "JOD 819",
        details:
          "ASUS TUF F15 FX506HCB-HN200W 11Gen Core i5 6-Core up to 4.5GHz 12M Cashe , 16GB DDR4 RAM ,  512GB M.2 NVMe™ PCIe® 3.0 SSD ,  Nvidia GeForce RTX 3050 4GB DDR6 ,  15.6 Full HD IPS Anti-glare 144Hz 62.5% sRGB , Camera , Wireless ,Bluetooth , RGB Backlit English Keyboard , Windows 11 Home",
      },
    ],

    Desktop: [
      {
        id: 2,
        name: "Acer Veriton VES2740G",
        img: "https://citycenter.jo/image/cachewebp/catalog/32022/00vert-1200x1200.webp",
        price: "JOD 500",
        details:
          "Acer Veriton VES2740G Desktop 10Gen Core i5-10400 up to 4.3GHz 6-Cores 12MB Cashe ,  4GB DDR4 RAM (Upgradable)  , Optional M.2 SSD + 1000GB HDD , DVD RW , Keyboard + Mouse USB , Free Dos",
      },
      {
        id: 3,
        name: "Lenovo All-in-One V50a-24IMB",
        img: "https://citycenter.jo/image/cachewebp/catalog/122020/V243-1200x1200.webp",
        price: "JOD 899.00",
        details:
          "Lenovo All-in-One V50a-24IMB 10Gen Core i7 up to 4.5GHz 16M 8-Cores , 8GB RAM DDR4 , 512GB SSD M.2 2242 PCIe NVMe , 24 IPS FHD Touch Screen Antiglare Monitor, DVD RW, Intel UHD Graphics 630 Graphic Card , Camera  , Wireless  , Bluetooth , USB Keyboard Arabic / English , USB Mouse, Dos.",
      },
    ],

    Tablet: [
      {
        id: 4,
        name: "Huawei MatePad 11 (2021) ",
        img: "https://citycenter.jo/image/cachewebp/catalog/22022/00mat-1200x1200.webp",
        price: "JOD 360",
        details:
          "Octa-core (1x2.84 GHz Kryo 585 & 3x2.42 GHz Kryo 585 & 4x1.8 GHz Kryo 585) , 6GB RAM , 128GB Storage , 11.0 IPS 2K ( 2560X1600 ) 120hZ (~276 ppi density) Display , Adreno 650 Graphic  , 13 MP Rear & 8 MP Camera , WIFI  , Bluetooth 5.1 , Li-Po 7250 mAh Battery , HarmonyOS 2.0",
      },
      {
        id: 5,
        name: "Lenovo Tab M8 HD (2nd Gen)",
        img: "https://citycenter.jo/image/cachewebp/catalog/22022/M888-1200x1200.webp",
        price: "JOD 109",
        details:
          "MediaTek Helio A22 2.0Ghz (4C, 4x A53)  , 3GB Soldered LPDDR3 , 32GB Storage , 8.0 IPS HD (1280 x 800) pixels 350nits Display , 5 MP Rear & 2 MP Front Camera , Integrated IMG PowerVR GE-class GPU Graphics , WIFI + 4 GB SIM Card , Bluetooth 5.0 , Li-Po 5100 mAh Battery , Andriod 10",
      },
    ],
  };
};

const changeTheme = () => {
  const setProperty = (key, value) => {
    return document.documentElement.style.setProperty(key, value);
  };
  Info.theme = Info.theme === "Dark" ? "Light" : "Dark";
  if (Info.theme === "Dark") {
    setProperty("--text-color", "white");
    setProperty("--main1-bg-color", "black");
    setProperty("--main-bg-color", "black");
    setProperty("--title-color", "black");
    setProperty("--total-bg-color", "white");
    $(`body`).css({
      "background-color": "black",
      height: screen.height,
    });
  } else {
    setProperty("--text-color", "black");
    setProperty("--main-bg-color", "rgb(247, 243, 236)");
    setProperty("--main1-bg-color", "white");
    setProperty("--title-color", "rgb(238, 205, 144)");
    setProperty("--total-bg-color", "red");
    $(`body`).css({
      "background-color": "white",
      height: screen.height,
    });
  }
};

const alertMessage = (text, backgroundColor, color, time, positions) => {
  $(`#alert-dia`).remove();
  $(`body`).append($(`<div id="alert-dia"></div>`));
  const msg = $(`<small>${text}</small>`);
  const alertDiv = $(`#alert-dia`);
  alertDiv.append(msg);
  alertDiv.css({
    display: "block",
    "background-color": backgroundColor,
    color: color,
    top: positions !== undefined ? `${positions[0]}` : "12%",
    right: positions !== undefined ? `${positions[1]}` : "5%",
    left: positions !== undefined ? `${positions[2]}` : "none",
    bottom: positions !== undefined ? `${positions[3]}` : "none",
  });

  const timer1 = setInterval(() => {
    alertDiv.css({
      opacity: `${alertDiv.css("opacity") - 1000 / time}`,
    });
  }, 1000);
  const timer2 = setTimeout(() => {
    clearInterval(timer1);
    clearInterval(timer2);
    $(`#alert-dia small`).remove();
    alertDiv.css({
      display: "none",
      opacity: "1",
    });
  }, time);
};

const createNavbarButtons = () => {
  for (let i = 1; i <= 3; i++) {
    let btn = null;
    if (i === 3) {
      btn = $(`<button id='nav-cart' class = "nav-btns">
      <img class = "nav-buttons-img" src='./assets/images/cart.svg'/>
     </button>`);

      btn.on("click", () => {
        $("#total-h1").remove();
        $("#cart-div div").remove();
        showCurrentDiv("#cart-div");
        if(Info.theme !== "Dark"){
          $('body').css({
            "background-color":`white`
          })
        }else{
          $('body').css({
            "background-color":`black`
          })
        }
        
        let total = 0;
        const cart = new Cart(Info.currentUser, null);
        const items = cart.getCartItems();
        if (!(Object.keys(items).length === 0)) {
          Info.finalProductList = [];

          for (let itemId in items) {
            cart.appendItem($("#cart-div"), items[itemId]);
            Info.finalProductList.push(items[itemId]);
            total =
              total +
              items[itemId][0] * items[itemId][1].price.replace("JOD ", "");
          }
          Info.total = total;
          $("#cart-div").append(
            `
          <div id = "buy-div">
          <h1 id = "total-h1">Total : 
          <span id = "total">${total}</span></h1>
          <button id = "buy-btn">Buy Now</button>
          </div>
          `
          );
          $("#buy-btn").on("click", () => {
            showCurrentDiv("#receipt-div");
            createReceipt();
          });
        } 
      });
      $("#nav-buttons-div").append(btn);
    } else if (i === 2) {
      btn = $(`<button id = "Navigation-menu"  class = "nav-btns">
      <img src="./assets/images/menu.png" /> 
    </button>`);
      $("#nav-bar").prepend(btn);

      btn.on("click", createNavigationMenu);
    }
  }
};

const createNavigationMenu = () => {
  $("#navigation-menu-div").remove();
  const buildMenuItems = (text) => {
    return $(`<button>${text}</button>`);
  };

  const menuItems = {
    wishList: buildMenuItems("Wish List"),
    theme: buildMenuItems("Change Theme"),
    signOut: buildMenuItems("Sign Out"),
  };
  const menu = $(`
  <div id="navigation-menu-div">
    <div  id = "user-info-div">
    <img src="https://d29fhpw069ctt2.cloudfront.net/icon/image/37746/preview.svg"/>
          <h4>${Info.currentUser.userName}</h4>
          
    </div>
  </div>`);
  for (let key in menuItems) {
    menu.append(menuItems[key]);
  }
  $(`body`).append(menu);

  menuItems.signOut.on("click", () => {
    LocalStorage.setItem("isUserLogin", [false, null]);
    showCurrentDiv();
    $("#navigation-menu-div").remove();
    $(`#registration-div`).show();
    $(`#nav-bar`).hide();
    buildSignUpForm(false);
  });

  menuItems.wishList.on("click", () => {
    $("#wish-div").remove();
    const div = $(`<div id="wish-div"></div>`);
    $("body").append(div);
    const cart = new WishList(Info.currentUser, null);
    const items = cart.getCartItems();
    Info.wishList = [];
    showCurrentDiv("#wish-div");
    for (let itemId in items) {
      cart.appendItem($("#wish-div"), items[itemId]);
      Info.wishList.push(items[itemId]);
    }
  });
  menuItems.theme.on("click", () => {
    changeTheme();
    $(`#Navigation-menu img`).attr(
      "src",
      `./assets/images/${Info.theme === "Dark" ? "dark-menu.png" : "menu.png"}`
    );
    showCurrentDiv("#content");
  });
};

const createProducts = async (isFirsCreation) => {
  $("#content").remove();
  $("#cart-no-item").remove();
  $("total-h1").remove();

  const content = $(`<div id="content"></div>`);
  const productsObj = await getJsonDate();
  Info.catagories = [];
  Info.allProducts = [];
  for (category in productsObj) {
    Info.catagories.push(`${category}`);
    productsObj[category].forEach((productObj) => {
      const product = new Product();
      product.createProduct(productObj, category);
      const card = product.createProductCard();
      content.append(card);
      Info.allProducts.push(product);
    });
  }

  $(`body`).append(content);
  if (isFirsCreation === 1) {
    showCurrentDiv("#content");
    content.css({ display: "grid" });
  }

  if (isUserLoginBefore()) {
    $("#registration-div").css({ display: "none" });
    $("#nav-bar").css({ display: "flex" });
    $("#content").css({ display: "grid" });
  }
  Info.catagories.push("All Categories");
};

const showCategoriesMenu = () => {
  const menu = $(`<div id="menu"></div>`);
  $(`#drop-down-menu`).append(menu);
  Info.catagories.forEach((categoryTitle) => {
    const categoryButton = $(`
      <button>${categoryTitle}</button>
    `);
    categoryButton.on("click", () => {
      setCategory(categoryButton);
      return "";
    });
    menu.append(categoryButton);
  });
};

const setCategory = async (categoryButton) => {
  $("#cart-no-item").remove();
  $(`#content`).remove();
  $(`#menu`).remove();

  const content = $(`<div id="content"></div>`);
  content.css({
    height: `${screen.height}px`,
  });
  const productsObj = await getJsonDate();

  for (category in productsObj) {
    if (
      category === categoryButton.text() ||
      categoryButton.text() === "All Categories"
    ) {
      productsObj[category].forEach((productObj) => {
        const product = new Product();
        product.createProduct(productObj, category);
        const card = product.createProductCard();
        content.append(card);
      });
    }
  }

  $("#category-text").text(`${categoryButton.text()}`);

  //* Those statement to make sure that the background color fill all the screen
  const currentBackGroundColor = `${getComputedStyle(document.documentElement).getPropertyValue("--main-bg-color")}`;

  $('body').css({
    "background-color":`${currentBackGroundColor}`
  })
  content.css({ 
    display: "grid",
    height:"fit-content"
  });
  $(`body`).append(content);
  showCurrentDiv("#content");
};
const getSearchResults = async (inputText) => {
  //* remove the precious results
  $("#search-results").remove();
  //* re create the div that will contains the results
  const resultsDiv = $(`<div id = "search-results">
 </div>`);
  //*show the div that at the searching point
  $("#search-btn-div").append(resultsDiv);

  //* search for a product that have the same text in the input text
  Info.allProducts.forEach((product) => {
    if (
      product.name.toLowerCase().includes(inputText.target.value.toLowerCase())
    ) {
      const productCard = product.createSearchCard();
      resultsDiv.append(productCard);
    }
  });
  if (inputText.target.value.toLowerCase() === "") {
    $("#search-results").remove();
  }
};

//! Those functions related to signup, login forms
const signupInputBuilder = (label) => {
  const form = $(`
  <div class="input-forms" id = "div${label.toLowerCase().replaceAll(" ", "")}">
  <input type= "${
    label.toLowerCase().includes("password") ? "password" : "text"
  }" placeholder ="${label}" id = ${label.toLowerCase().replaceAll(" ", "")} />
  </div>
  `);
  return form;
};
const buildSignUpForm = (isLogin = false) => {
  $(".registration-form").remove();
  const forms = [
    signupInputBuilder("Enter User Name"),
    signupInputBuilder("Enter Email"),
    signupInputBuilder("Enter Password"),
    signupInputBuilder("Confirm Password"),
  ];

  const form = $(`
  <div class="registration-form" >
  <div id = "switch-buttons">
  <button id = "switch-signup">Sign Up</button>
  <button id = "switch-login">Log In</button>
  </div>
  </div>
  `);
  // * this condition to display login form or sign up form depending on the switch buttons
  if (!isLogin) {
    forms.forEach((div) => {
      form.append(div);
    });
  } else {
    //* the id of the div is related to the id of the input element inside it

    forms.forEach((div) => {
      if (
        div.attr("id") === "diventeremail" ||
        div.attr("id") === "diventerpassword"
      ) {
        form.append(div);
      }
    });
  }
  form.append(
    $(`
  <div id ="errors-div">
    <ul id ="error-list"></ul>
  </div>`)
  );
  form.append($(`<button id ="register-btn"></button>`));

  //display the whole form inside the div  (registration-div)
  $(`#registration-div`).append(form);
  $(`#registration-div`).css({
    height: `${screen.height}`,
  });

  const registrationBtn = $("#register-btn");
  if (!isLogin) {
    registrationBtn.text("Sign Up");
  } else {
    registrationBtn.text("Log In");
  }

  //* click to switch from sign up to login or via vers
  setDefaultSwitchButtons(isLogin);
  /* Default design of signup and login buttons*/

  setRegistrationButtonsListener(isLogin);
};
const setDefaultSwitchButtons = (isLogin) => {
  //* This Function to change the style of switch buttons in registration form (login - sign up))
  const signup = $("#switch-signup");
  const login = $("#switch-login");
  if (!isLogin) {
    login.css({
      "background-color": "transparent",
      border: "2px solid black",
      "border-left": "0px solid black",
      "border-bottom-right-radius": "10px",
      "border-top-right-radius": "10px",
      "box-shadow": "0px 0px 0px 0px black",
    });
    signup.css({
      "background-color": "orange",
      border: "0px solid black",
      "border-right": "0px solid black",
      "border-bottom-left-radius": "10px",
      "border-top-left-radius": "10px",
      "box-shadow": "0px 0px 0px 1px black",
    });
  } else {
    login.css({
      "background-color": "orange",
      border: "0px solid black",
      "border-left": "0px solid black",
      "border-bottom-right-radius": "10px",
      "border-top-right-radius": "10px",
      "box-shadow": "0px 0px 0px 1px black",
    });
    signup.css({
      "background-color": "transparent",
      border: "2px solid black",
      "border-right": "0px solid black",
      "border-bottom-left-radius": "10px",
      "border-top-left-radius": "10px",
      "box-shadow": "0px 0px 0px 0px black",
    });
  }
};

//* This variable will filled with registration error
let errors = [];
//*  ********************************
const isUserLoginBefore = () => {
  let isLogin, user;
  if (LocalStorage.getItem("isUserLogin")) {
    [isLogin, user] = LocalStorage.getItem("isUserLogin");
  }
  if (isLogin) {
    Info.currentUser = user;
    return true;
  }

  return false;
};
const setRegistrationButtonsListener = (isLogin) => {
  const signup = $("#switch-signup");
  const login = $("#switch-login");
  const registrationBtn = $("#register-btn");
  errors = [];
  signup.on("click", () => {
    //*  ********* Change Design after Click****************
    login.css({
      "background-color": "transparent",
      border: "2px solid black",
      "border-left": "0px solid black",
      "border-bottom-right-radius": "10px",
      "border-top-right-radius": "10px",
      "box-shadow": "0px 0px 0px 0px black",
    });
    signup.css({
      "background-color": "orange",
      border: "0px solid black",
      "border-right": "0px solid black",
      "border-bottom-left-radius": "10px",
      "border-top-left-radius": "10px",
      "box-shadow": "0px 0px 0px 1px black",
    });
    //*  **** Activate an  event after Click***********
    buildSignUpForm(false);
  });

  login.on("click", () => {
    login.css({
      "background-color": "orange",
      border: "0px solid black",
      "border-left": "0px solid black",
      "border-bottom-right-radius": "10px",
      "border-top-right-radius": "10px",
      "box-shadow": "0px 0px 0px 1px black",
    });
    signup.css({
      "background-color": "transparent",
      border: "2px solid black",
      "border-right": "0px solid black",
      "border-bottom-left-radius": "10px",
      "border-top-left-radius": "10px",
      "box-shadow": "0px 0px 0px 0px black",
    });

    //*  **** Activate an  event after Click***********
    buildSignUpForm(true);
    // * after change to Login form change the justify content to make the form readable
    $(".registration-form").css({
      "justify-content": "center",
      gap: "14px",
      height: "fit-content",
    });
  });

  // * *************** Create User *****************
  registrationBtn.on("click", () => {
    createUser(isLogin);
  });
};
const showErrors = (errors) => {
  $(`#error-list li`).remove();
  errors.forEach((error) => {
    $(`#error-list`).append($(`<li>${error}</li>`));
  });
};
const removeError = (error) => {
  if (errors.includes(error)) {
    errors.splice(errors.indexOf(error), 1);
  }
  $(`#error-list li`).remove();
  showErrors(errors);
};

const isUserExist = (value) => {
  //* check if the email that entered  exist or not
  const users = LocalStorage.getItem("users");
  if (users) {
    for (let user of users) {
      if (user.email === value) {
        return [true, user.password];
      }
    }
  }
  return [false, ""];
};
const createUser = (isLogin) => {
  //* inputForm contains all input element in registration form
  const inputForm = {
    UserName: $(`#enterusername`),
    Email: $(`#enteremail`),
    Password: $(`#enterpassword`),
    CPassword: $(`#confirmpassword`),
  };

  //* Those for loop and conditions to make sure that the inputs is entered correctly
  for (let key in inputForm) {
    if (!isLogin) {
      if (key === "UserName") {
        const value = inputForm[key].val();
        if (value === "") {
          if (!errors.includes("Invalid user name")) {
            errors.push("Invalid user name");
          }
        } else if (value.length > 15) {
          if (!errors.includes("User name must be less than 16 Characters")) {
            errors.push("User name must be less than 16 Characters");
          }
        } else if (value.length < 6) {
          if (!errors.includes("User name must be more than 5 Characters")) {
            errors.push("User name must be more than 5 Characters");
          }
        }
      }

      if (key === "Email") {
        const value = inputForm[key].val();
        if (!value.includes("@") || !value.includes(".com")) {
          if (!errors.includes("Invalid email")) {
            errors.push("Invalid email");
          }
        } else {
          if (isUserExist(value)[0]) {
            if (!errors.includes("This email was taken")) {
              errors.push("This email was taken");
            }
          }
        }
      }
      if (key === "Password") {
        const value = inputForm[key].val();

        if (value === "") {
          if (!errors.includes("Invalid password")) {
            errors.push("Invalid password");
          }
        } else if (value.length > 30) {
          if (!errors.includes("Password must be less than 30 Characters")) {
            errors.push("Password must be less than 30 Characters");
          }
        } else if (value.length < 10) {
          if (!errors.includes("Password must be more than 9 Characters")) {
            errors.push("Password must be more than 9 Characters");
          }
        }
      }

      if (key === "CPassword") {
        if (inputForm[key].val() !== inputForm["Password"].val()) {
          if (!errors.includes("Password not match")) {
            errors.push("Password not match");
          }
        }
      }
    } else {
      if (key === "Email") {
        const value = inputForm[key].val();
        if (!value.includes("@") || !value.includes(".com")) {
          if (!errors.includes("Invalid email")) {
            errors.push("Invalid email");
          }
        } else {
          const [isExist, password] = isUserExist(value);
          if (!isExist) {
            if (!errors.includes("Please sign up first")) {
              removeError("Wrong password");
              errors.push("Please sign up first");
            }
          } else if (password !== inputForm["Password"].val()) {
            if (!errors.includes("Wrong password")) {
              errors.push("Wrong password");
            }
          }
        }
      }
    }
  }
  showErrors(errors);

  if (!isLogin) {
    inputForm["UserName"].on("input", (text) => {
      const value = text.target.value;

      if (value !== "") {
        removeError("Invalid user name");
      }
      if (value.length >= 6) {
        removeError("User name must be more than 5 Characters");
      }
      if (value.length <= 15) {
        removeError("User name must be less than 16 Characters");
      }
    });

    inputForm["Email"].on("input", (text) => {
      const value = text.target.value;
      if (value.includes("@") && value.includes(".com")) {
        removeError("Invalid email");
      }
      if (!isUserExist(value)[0]) {
        removeError("This email was taken");
      }
    });

    inputForm["Password"].on("input", (text) => {
      const value = text.target.value;
      if (value !== "") {
        removeError("Invalid password");
      }
      if (value.length <= 30) {
        removeError("Password must be less than 30 Characters");
      }
      if (value.length >= 10) {
        removeError("Password must be more than 9 Characters");
      }
      if (value === inputForm["CPassword"].val()) {
        removeError("Password not match");
      }
    });

    inputForm["CPassword"].on("input", (text) => {
      const value = text.target.value;
      if (value === inputForm["Password"].val()) {
        removeError("Password not match");
      }
    });
  } else {
    inputForm["Email"].on("input", (text) => {
      const value = text.target.value;
      const [isExist, password] = isUserExist(value);
      if (value.includes("@") && value.includes(".com")) {
        removeError("Invalid email");
      }
      if (isExist) {
        removeError("Please sign up first");
      }
      if (password === inputForm["Password"].val()) {
        removeError("Wrong password");
      }
    });
  }
  const user = new User();
  if (!isLogin) {
    if (errors.length === 0) {
      user.createUser(inputForm);
      for (let key in inputForm) {
        inputForm[key].val("");
      }
      alertMessage("User was added Successfully", "green", "white", 6000, [
        "30px",
        "25%",
        "none",
        "none",
      ]);
    }
  } else {
    user.logInUser(inputForm);
  }
};
//! *******************ReceiptFunction ***************
const createReceipt = () => {
  $(".receipt-info").remove();
  $(`#receipt-div`).css({
    height: screen.height,
    display: "flex",
  });
  Info.finalProductList.forEach((product) => {
    const itemInfo = $(`
    <div class ="receipt-info">
      <small>${product[1].name}</small>
      <small>${product[1].price}</small>
      <small>${product[0]}</small>
    </div>
    `);

    $("#receipt-details-div").append(itemInfo);
  });

  $("#receipt-details-div").append(
    $(
      `<h3 class ="receipt-info" id ="receipt-title-small">Total: ${Info.total}</h3>`
    )
  );
  // * ******************User-Info-Div ******************
  const buildInput = (hint) => {
    return $(
      `<input class ="receipt-info" id ="${hint.replaceAll(
        " ",
        ""
      )}"placeholder ="${hint}">`
    );
  };
  const userInfo = {
    name: buildInput("Full Name"),
    phoneNumber: buildInput("Phone Number"),
    location: buildInput("Your Location"),
  };
  for (let key in userInfo) {
    $(`#receipt-user-info-div`).append(userInfo[key]);
  }
  // Choose your payment method
  const methodBtn = $(` <button>
  Choose your payment method    ▼
  </button>`);
  const methodDiv = $(`
  <div class ="receipt-info" id ="payment-method-div1">
  <div id ="payment-method-div">
  </div>
  </div>
 
  `);
  $(`#receipt-user-info-div`).append(methodDiv);
  $(`#payment-method-div`).append(methodBtn);

  const paymentBtns = {
    payPal: $(`<button>PayPal</button>`),
    cash: $(`<button>Cash</button>`),
  };

  methodBtn.on("click", () => {
    $(`#payment-method-div`).append(
      $(`
    <div id = "payment-menu">
    </div>
    `)
    );
    for (let key in paymentBtns) {
      $(`#payment-menu`).append(paymentBtns[key]);
      paymentBtns[key].on("click", () => {
        const btn = $(`#payment-method-div button`);
        btn[0].innerText = paymentBtns[key].text();
        $(`#payment-menu`).remove();
      });
    }
  });

  // set Order
  const orderBtn = $(
    `<button class ="receipt-info" id ="confirm-btn">Confirm your order</button>`
  );
  $(`#receipt-user-info-div`).append(orderBtn);

  //* For design
  const height = $(`#receipt-details-div`).css("height");
  $(`#receipt-user-info-div`).css({
    height: `${height}`,
  });
};

//! ------------------------Variables------------------

$("#title").on("click", () => {
  createProducts(1);
});
createNavbarButtons();

// *  get information from async function
(async () => {
  // [categories, Info.allProducts] = await createProducts();
  await createProducts();
})();

//* get category button in the nav bar
const categoryBtn = $("#category-btn");
categoryBtn.on("click", showCategoriesMenu);

//* When write in the input area search for what was written
$(`#search-input`).on("input", getSearchResults);
// * build sign up form
buildSignUpForm(false);
