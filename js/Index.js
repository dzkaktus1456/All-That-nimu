/* ===================================
   CÁC BIẾN & HẰNG CỐ ĐỊNH
=================================== */
const bodyEl      = document.body;
const themeToggle = document.getElementById("themeToggle");
const themeSelect = document.getElementById("themeSelect");
const toTopBtn    = document.getElementById("toTopBtn");

const tabs        = document.querySelectorAll(".tabs button");
const cards       = document.querySelectorAll(".anime-card");
const searchInput = document.getElementById("search");
const sortBtn     = document.getElementById("sortBtn");

const VARIANTS    = ["default", "miku", "asuka", "mamimi", "kanade"];
const MODE_KEY    = "themeMode";
const VAR_KEY     = "themeVariant";

/* ===================================
   1.  ÁP DỤNG LIGHT / DARK + VARIANT
=================================== */
function applyTheme(mode = "light", variant = "default") {
  /* xoá mọi class cũ rồi thêm mới */
  bodyEl.classList.remove("light", "dark", ...VARIANTS);
  bodyEl.classList.add(mode, variant);

  /* xoá mọi inline-style (nếu có) để CSS-var làm việc */
  themeToggle.removeAttribute("style");
  toTopBtn.removeAttribute("style");

  /* cập nhật nội dung nút toggle */
  themeToggle.textContent = mode === "light" ? "🌙 Dark" : "☀️ Light";

  /* lưu lại */
  localStorage.setItem(MODE_KEY, mode);
  localStorage.setItem(VAR_KEY,  variant);

  /* cập nhật dropdown */
  if (themeSelect) themeSelect.value = variant;
}

/* khởi tạo */
applyTheme(
  localStorage.getItem(MODE_KEY) || "light",
  localStorage.getItem(VAR_KEY)  || "default"
);

/* toggle Light ↔ Dark */
themeToggle.addEventListener("click", () => {
  const nextMode   = bodyEl.classList.contains("light") ? "dark" : "light";
  const curVariant = VARIANTS.find(v => bodyEl.classList.contains(v)) || "default";
  applyTheme(nextMode, curVariant);
});

/* chọn variant */
if (themeSelect) {
  themeSelect.addEventListener("change", () => {
    const mode = bodyEl.classList.contains("light") ? "light" : "dark";
    applyTheme(mode, themeSelect.value);
  });
}

/* ===================================
   2.  TAB + NSFW
=================================== */
function showCategory(cat) {
  tabs.forEach(b => b.classList.toggle("active", b.dataset.category === cat));
  cards.forEach(c => {
    c.style.display =
      (cat === "All" || c.dataset.category === cat) ? "block" : "none";
  });
  localStorage.setItem("selectedTab", cat);
}

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    const cat = btn.dataset.category;
    if (cat === "NSFW" && !localStorage.getItem("agreedToNSFW")) {
      if (!confirm("⚠️ Nội dung NSFW\nBạn chắc chắn muốn tiếp tục?")) return;
      localStorage.setItem("agreedToNSFW", "true");
    }
    showCategory(cat);
  });
});

showCategory(localStorage.getItem("selectedTab") || "TV Series");

/* ===================================
   3.  SEARCH
=================================== */
searchInput.addEventListener("input", () => {
  const term      = searchInput.value.trim().toLowerCase();
  const activeCat = document.querySelector(".tabs button.active").dataset.category;

  cards.forEach(card => {
    const text = (
      card.querySelector(".anime-title").textContent +
      " " +
      (card.querySelector(".anime-subtitle")?.textContent || "")
    ).toLowerCase();

    const matched = term
      ? text.includes(term)
      : card.dataset.category === activeCat;

    card.style.display = matched ? "block" : "none";
  });
});

/* ===================================
   4.  SẮP XẾP A → Z
=================================== */
let isSorted = false;
let originalOrder = [];

function toggleSort() {
  const list    = document.getElementById("animeList");
  const all     = Array.from(list.children);
  const visible = all.filter(c => c.style.display !== "none");

  if (!originalOrder.length) originalOrder = all.slice();

  if (!isSorted) {
    visible
      .sort((a, b) =>
        a.querySelector(".anime-title").textContent
         .localeCompare(b.querySelector(".anime-title").textContent, "vi", { numeric: true })
      )
      .forEach(c => list.appendChild(c));

    sortBtn.textContent = "Bỏ sắp xếp";
  } else {
    originalOrder.forEach(c => list.appendChild(c));
    sortBtn.textContent = "Sắp xếp A → Z";
  }
  isSorted = !isSorted;
}
sortBtn.addEventListener("click", toggleSort);

/* ===================================
   5.  ĐẾM SỐ LƯỢNG
=================================== */
(function updateCounts() {
  const counts = {};
  cards.forEach(c => {
    const cat = c.dataset.category;
    counts[cat] = (counts[cat] || 0) + 1;
  });
  document.getElementById("anime-counts").textContent =
    Object.entries(counts).map(([c, n]) => `${c}: ${n}`).join(" | ");
})();

/* ===================================
   6.  BACK TO TOP
=================================== */
window.addEventListener("scroll", () => {
  toTopBtn.style.display = window.scrollY > 300 ? "block" : "none";
});
toTopBtn.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" })
);
