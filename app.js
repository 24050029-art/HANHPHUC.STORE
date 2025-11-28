// ==== DATA DEMO ====
const books = [
  {
    id: 1,
    title: "Dám Bị Ghét",
    author: "Kishimi Ichiro",
    price: 98000,
    image: "images/dambighet.jpg",
    isHot: true,
    isDeal: true,
    category: "selfhelp",
    date: "2025-11-20"
  },
  {
    id: 2,
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    price: 89000,
    image: "images/nhagiakim.jpg",
    isHot: true,
    isDeal: true,
    category: "novel",
    date: "2025-11-18"
  },
  {
    id: 3,
    title: "7 Thói Quen Hiệu Quả",
    author: "Stephen Covey",
    price: 190000,
    image: "images/7thoiquen.jpg",
    isHot: true,
    isDeal: true,
    category: "business",
    date: "2025-11-10"
  },
  {
    id: 4,
    title: "Deep Work",
    author: "Cal Newport",
    price: 175000,
    image: "images/deepwork.jpg",
    isHot: true,
    isDeal: false,
    category: "selfhelp",
    date: "2025-11-05"
  },
  {
    id: 5,
    title: "Clean Code",
    author: "Robert C. Martin",
    price: 320000,
    image: "images/cleancode.jpg",
    isHot: false,
    isDeal: false,
    category: "technology",
    date: "2025-10-28"
  },
  {
    id: 6,
    title: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
    author: "Rosie Nguyễn",
    price: 76000,
    image: "images/tuoitre.jpg",
    isHot: false,
    isDeal: true,
    category: "selfhelp",
    date: "2025-10-25"
  }
];

const hotBooks = books.filter(b => b.isHot);
const dealBooks = books.filter(b => b.isDeal);

// ==== STATE ====
let cart = JSON.parse(localStorage.getItem("cart") || "[]"); // {id,qty}
let orders = JSON.parse(localStorage.getItem("orders") || "[]");
let users = JSON.parse(localStorage.getItem("users") || "[]");
let currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
let checkoutItems = [];
let hotIndex = 0;

// ==== SHORTCUTS ====
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const price = n => n.toLocaleString("vi-VN") + "đ";

// ==== NAVIGATIONS ====
function showSection(id) {
  $$(".section").forEach(sec => sec.classList.remove("active"));
  $("#" + id).classList.add("active");

  $$(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.section === id);
  });
}

$$("[data-section]").forEach(el => {
  el.addEventListener("click", () => {
    const id = el.dataset.section;
    if (id) {
      showSection(id);
      if (window.innerWidth <= 768) $("#navMobile").classList.add("hidden");
    }
  });
});

// logo click => home
$("#logoHome").addEventListener("click", () => showSection("home"));

// mobile menu toggle
$("#mobileMenuToggle").addEventListener("click", () => {
  $("#navMobile").classList.toggle("hidden");
});

// cart icon click
$("#cartBtn").addEventListener("click", () => showSection("cart"));
$("#cartIcon").addEventListener("click", () => showSection("cart"));

// ==== HOT SLIDER ====
function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";
  card.innerHTML = `
    <img src="${book.image}" class="book-cover" alt="${book.title}">
    <div class="book-title">${book.title}</div>
    <div class="book-author">${book.author}</div>
    <div class="book-price">${price(book.price)}</div>
    <div class="book-actions">
      <button class="btn-mini" data-view="${book.id}">Xem</button>
      <button class="btn-mini primary" data-buy="${book.id}">Mua</button>
    </div>
  `;

  card.querySelector("[data-view]").addEventListener("click", () => openDetail(book.id));
  card.querySelector("[data-buy]").addEventListener("click", () => addToCart(book.id));

  return card;
}

function renderHot() {
  const slider = $("#hotSlider");
  slider.innerHTML = "";
  if (!hotBooks.length) return;

  // hiển thị tối đa 3 cuốn
  const visible = Math.min(3, hotBooks.length);
  for (let i = 0; i < visible; i++) {
    const idx = (hotIndex + i) % hotBooks.length;
    slider.appendChild(createBookCard(hotBooks[idx]));
  }
}

$("#hotPrev").addEventListener("click", () => {
  hotIndex = (hotIndex - 1 + hotBooks.length) % hotBooks.length;
  renderHot();
});

$("#hotNext").addEventListener("click", () => {
  hotIndex = (hotIndex + 1) % hotBooks.length;
  renderHot();
});

// auto slide
setInterval(() => {
  if ($("#home").classList.contains("active")) {
    hotIndex = (hotIndex + 1) % hotBooks.length;
    renderHot();
  }
}, 5000);

// ==== DEALS ====
function renderDeals() {
  const list = $("#dealList");
  list.innerHTML = "";
  dealBooks.forEach(b => list.appendChild(createBookCard(b)));
}

// ==== SHOP ====
function applyFilters() {
  let list = [...books];
  const kw = $("#searchInput").value.trim().toLowerCase();
  const priceFilter = $("#priceFilter").value;
  const catFilter = $("#categoryFilter").value;

  if (kw) {
    list = list.filter(b => b.title.toLowerCase().includes(kw));
  }

  if (priceFilter !== "all") {
    list = list.filter(b => {
      if (priceFilter === "lt100") return b.price < 100000;
      if (priceFilter === "100to200") return b.price >= 100000 && b.price <= 200000;
      if (priceFilter === "gt200") return b.price > 200000;
    });
  }

  if (catFilter !== "all") {
    list = list.filter(b => b.category === catFilter);
  }

  const container = $("#productList");
  container.innerHTML = "";
  list.forEach(book => container.appendChild(createBookCard(book)));
}

["#searchInput", "#priceFilter", "#categoryFilter"].forEach(sel => {
  $(sel).addEventListener("input", applyFilters);
  $(sel).addEventListener("change", applyFilters);
});

// ==== DETAIL MODAL ====
function openDetail(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  $("#detailImg").src = book.image;
  $("#detailTitle").textContent = book.title;
  $("#detailAuthor").textContent = "Tác giả: " + book.author;
  $("#detailDesc").textContent = "Mô tả: " + (book.description || "Đang cập nhật.");
  $("#detailPrice").textContent = "Giá: " + price(book.price);

  $("#detailBuy").onclick = () => {
    addToCart(book.id);
    $("#bookDetailModal").classList.add("hidden");
  };

  $("#bookDetailModal").classList.remove("hidden");
}

$("#closeDetail").addEventListener("click", () => {
  $("#bookDetailModal").classList.add("hidden");
});

// ==== CART ====
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  $("#cartCount").textContent = total;
}

function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  updateCartCount();
}

function renderCart() {
  const wrap = $("#cartContent");
  if (!cart.length) {
    wrap.innerHTML = "<p class='cart-empty'>Giỏ hàng đang trống.</p>";
    updateCartCount();
    return;
  }

  let total = 0;
  let html = "";

  cart.forEach((item, index) => {
    const book = books.find(b => b.id === item.id);
    if (!book) return;
    const line = book.price * item.qty;
    total += line;

    html += `
      <div class="cart-row">
        <div>${book.title}</div>
        <input type="number" min="1" value="${item.qty}" data-index="${index}">
        <div>${price(line)}</div>
      </div>
    `;
  });

  html += `
    <div class="cart-row">
      <div><strong>Tạm tính</strong></div>
      <div></div>
      <div><strong>${price(total)}</strong></div>
    </div>
    <div style="margin-top:.6rem;display:flex;gap:.4rem;justify-content:flex-end;">
      <button class="btn-mini" id="clearCart">Xóa giỏ</button>
      <button class="btn-mini primary" id="goCheckout">Thanh toán</button>
    </div>
  `;

  wrap.innerHTML = html;

  // events
  wrap.querySelectorAll("input[type='number']").forEach(inp => {
    inp.addEventListener("change", () => {
      const idx = Number(inp.dataset.index);
      let val = parseInt(inp.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      cart[idx].qty = val;
      saveCart();
      renderCart();
    });
  });

  $("#clearCart").addEventListener("click", () => {
    cart = [];
    saveCart();
    renderCart();
  });

  $("#goCheckout").addEventListener("click", () => {
    if (!cart.length) return;
    checkoutItems = cart.map(i => ({ ...i }));
    renderCheckout();
    showSection("checkout");
  });
}

// ==== CHECKOUT ====
function renderCheckout() {
  const wrap = $("#checkoutItems");
  wrap.innerHTML = "";
  let total = 0;

  checkoutItems.forEach(item => {
    const book = books.find(b => b.id === item.id);
    if (!book) return;
    const line = book.price * item.qty;
    total += line;
    const div = document.createElement("div");
    div.className = "checkout-item";
    div.innerHTML = `<span>${book.title} x${item.qty}</span><span>${price(line)}</span>`;
    wrap.appendChild(div);
  });

  $("#checkoutTotal").textContent = price(total);
}

$("#checkoutForm").addEventListener("submit", e => {
  e.preventDefault();
  if (!checkoutItems.length) {
    $("#checkoutMessage").textContent = "Không có sản phẩm để thanh toán.";
    return;
  }

  const info = {
    fullname: $("#fullname").value.trim(),
    phone: $("#phone").value.trim(),
    email: $("#email").value.trim(),
    address: $("#address").value.trim()
  };

  if (!info.fullname || !info.phone || !info.email || !info.address) {
    $("#checkoutMessage").textContent = "Hãy điền đầy đủ thông tin.";
    return;
  }

  const total = checkoutItems.reduce((sum, item) => {
    const b = books.find(bb => bb.id === item.id);
    return sum + (b ? b.price * item.qty : 0);
  }, 0);

  const order = {
    id: Date.now(),
    items: checkoutItems.map(i => ({ ...i })),
    info,
    total,
    date: new Date().toISOString()
  };

  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));

  // clear cart
  cart = [];
  saveCart();
  renderCart();
  updateCartCount();

  checkoutItems = [];
  renderCheckout();
  $("#checkoutForm").reset();
  $("#checkoutMessage").textContent = "Đặt hàng thành công!";

  setTimeout(() => {
    $("#checkoutMessage").textContent = "";
    showSection("orders");
    renderOrders();
  }, 800);
});

// ==== ORDERS ====
function renderOrders() {
  const wrap = $("#ordersList");
  if (!orders.length) {
    wrap.innerHTML = "<p class='cart-empty'>Bạn chưa có đơn hàng nào.</p>";
    return;
  }

  wrap.innerHTML = orders
    .slice()
    .sort((a,b)=>new Date(b.date)-new Date(a.date))
    .map(o => {
      const dateText = new Date(o.date).toLocaleString("vi-VN");
      const titles = o.items.map(i => {
        const b = books.find(bb => bb.id === i.id);
        return `${b ? b.title : "Sách"} (x${i.qty})`;
      }).join(", ");
      return `
        <div class="order-item">
          <div><strong>Mã đơn:</strong> #${o.id}</div>
          <div><strong>Sách:</strong> ${titles}</div>
          <div><strong>Tổng:</strong> ${price(o.total)}</div>
          <div><strong>Thời gian:</strong> ${dateText}</div>
        </div>
      `;
    }).join("");
}

// ==== AUTH (đơn giản) ====
$("#loginBtn").addEventListener("click", () => {
  $("#authModal").classList.remove("hidden");
});
$("#closeAuth").addEventListener("click", () => {
  $("#authModal").classList.add("hidden");
});

$("#registerForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("#regName").value.trim();
  const email = $("#regEmail").value.trim();
  const pass = $("#regPass").value.trim();

  if (!name || !email || !pass) {
    $("#regMsg").textContent = "Hãy nhập đầy đủ thông tin.";
    return;
  }
  if (users.find(u => u.email === email)) {
    $("#regMsg").textContent = "Email đã tồn tại.";
    return;
  }

  const user = { id: Date.now(), name, email, pass };
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
  $("#regMsg").textContent = "Đăng ký thành công, hãy đăng nhập.";
  $("#registerForm").reset();
});

$("#loginForm").addEventListener("submit", e => {
  e.preventDefault();
  const email = $("#loginEmail").value.trim();
  const pass = $("#loginPass").value.trim();

  const user = users.find(u => u.email === email && u.pass === pass);
  if (!user) {
    $("#loginMsg").textContent = "Sai email hoặc mật khẩu.";
    return;
  }
  currentUser = { id: user.id, name: user.name, email: user.email };
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  $("#loginMsg").textContent = "Đăng nhập thành công!";
  setTimeout(() => {
    $("#authModal").classList.add("hidden");
    $("#loginForm").reset();
    $("#loginMsg").textContent = "";
    $("#regMsg").textContent = "";
  }, 800);
});

// close modals when click outside
window.addEventListener("click", e => {
  if (e.target === $("#authModal")) $("#authModal").classList.add("hidden");
  if (e.target === $("#bookDetailModal")) $("#bookDetailModal").classList.add("hidden");
});
// ==== AUTH TAB SWITCH ====
$$(".auth-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    $$(".auth-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const target = tab.dataset.auth;

    $$(".auth-panel").forEach(p => p.classList.remove("active"));
    $("#" + target).classList.add("active");
  });
});

// ==== INIT ====
function init() {
  renderHot();
  renderDeals();
  applyFilters();
  renderCart();
  renderOrders();
  updateCartCount();
}
document.addEventListener("DOMContentLoaded", init);
