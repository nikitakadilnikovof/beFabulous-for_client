const STORAGE_KEY = "be-fabulous-orders";
const STATUSES = ["Новая заявка", "В работе", "Примерка", "Готово", "Выдано"];
const TELEGRAM_WORKER_URL = "https://be-fabulous-send-message-to-tg.nikitakadilnikovof.workers.dev/";
const SERVICES_URL = "public/data/services.json";

const fallbackServices = {
  repairServices: [
    {
      title: "Брюки и джинсы",
      items: [
        { name: "Подшить брюки", price: "от 800 ₺" },
        { name: "Укоротить джинсы", price: "от 800 ₺" },
        { name: "Ушить брюки по бокам", price: "от 900 ₺" },
        { name: "Ушить брюки по талии", price: "от 900 ₺" },
        { name: "Замена молнии в брюках", price: "от 700 ₺" },
        { name: "Ремонт / замена карманов", price: "от 600 ₺" },
        { name: "Ремонт / замена пояса", price: "от 700 ₺" },
      ],
    },
    {
      title: "Юбки",
      items: [
        { name: "Подшить юбку", price: "от 800 ₺" },
        { name: "Ушить юбку", price: "от 900 ₺" },
        { name: "Замена молнии в юбке", price: "от 700 ₺" },
      ],
    },
    {
      title: "Платья",
      items: [
        { name: "Подшить платье", price: "от 1 000 ₺" },
        { name: "Ушить платье", price: "от 1 200 ₺" },
        { name: "Посадка платья по фигуре", price: "от 1 500 ₺" },
        { name: "Замена молнии в платье", price: "от 900 ₺" },
      ],
    },
    {
      title: "Верхняя одежда",
      items: [
        { name: "Подшить / укоротить рукава", price: "от 700 ₺" },
        { name: "Подшить пиджак", price: "от 1 200 ₺" },
        { name: "Ушить пиджак", price: "от 1 500 ₺" },
        { name: "Подшить пальто", price: "от 1 500 ₺" },
        { name: "Ушить пальто", price: "от 1 800 ₺" },
        { name: "Замена молнии в куртке", price: "от 900 ₺" },
      ],
    },
    {
      title: "Ремонт деталей",
      items: [
        { name: "Ремонт подкладки", price: "от 800 ₺" },
        { name: "Ремонт разрывов и швов", price: "от 500 ₺" },
        { name: "Пришить пуговицу", price: "от 250 ₺" },
        { name: "Изготовление петли", price: "от 300 ₺" },
        { name: "Замена кнопки", price: "от 250 ₺" },
      ],
    },
  ],
  sewingServices: [
    { name: "Топ / корсет", price: "от 4 000 ₺" },
    { name: "Юбка", price: "от 4 500 ₺" },
    { name: "Брюки", price: "от 5 500 ₺" },
    { name: "Рубашка / блуза", price: "от 5 500 ₺" },
    { name: "Платье простого кроя", price: "от 7 500 ₺" },
    { name: "Платье сложного кроя", price: "от 10 000 ₺" },
    { name: "Вечернее платье", price: "от 14 000 ₺" },
    { name: "Вечернее платье сложной конструкции", price: "от 18 000 ₺" },
    { name: "Жакет", price: "от 8 500 ₺" },
    { name: "Жакет + юбка", price: "от 13 000 ₺" },
    { name: "Брючный костюм", price: "от 14 000 ₺" },
    { name: "Пальто", price: "от 13 000 ₺" },
    { name: "Тренч", price: "от 15 000 ₺" },
    { name: "Изделие из меха", price: "от 20 000 ₺" },
    { name: "Свадебное платье", price: "от 25 000 ₺" },
    { name: "Сложное свадебное платье", price: "от 35 000 ₺" },
  ],
  includedItems: [
    "Консультация и обсуждение модели",
    "Снятие мерок",
    "Разработка модели / корректировка модели",
    "Построение и подготовка лекал",
    "Раскрой изделия",
    "Пошив изделия",
    "ВТО - влажно-тепловая обработка",
    "Примерки и необходимые корректировки по фигуре",
    "Финальная обработка",
    "Контроль качества изделия",
  ],
  excludedItems: [
    "Основная ткань",
    "Подкладочная ткань",
    "Молнии",
    "Пуговицы и кнопки",
    "Кружево",
    "Стразы и декоративные элементы",
    "Вышивка и ручной декор",
    "Другие необходимые материалы и фурнитура",
  ],
  extras: [
    { name: "Срочный заказ", price: "+30%" },
    { name: "Сложный декор / ручная работа", price: "от 2 000 ₺" },
    { name: "Индивидуальное моделирование", price: "от 2 500 ₺" },
  ],
};

let servicesCatalog = fallbackServices;
let servicesLoadedFromFallback = false;

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function normalizeServiceItem(item) {
  if (Array.isArray(item)) {
    return { name: String(item[0] || "").trim(), price: String(item[1] || "").trim() };
  }

  return {
    name: String(item?.name || "").trim(),
    price: String(item?.price || "").trim(),
  };
}

function normalizeServicesCatalog(data) {
  const repairServices = Array.isArray(data?.repairServices) ? data.repairServices : [];
  const sewingServices = Array.isArray(data?.sewingServices) ? data.sewingServices : [];
  const includedItems = Array.isArray(data?.includedItems) ? data.includedItems : [];
  const excludedItems = Array.isArray(data?.excludedItems) ? data.excludedItems : [];
  const extras = Array.isArray(data?.extras) ? data.extras : [];

  const normalized = {
    repairServices: repairServices.map((group) => ({
      title: String(group?.title || "").trim(),
      items: (Array.isArray(group?.items) ? group.items : []).map(normalizeServiceItem).filter((item) => item.name && item.price),
    })).filter((group) => group.title && group.items.length),
    sewingServices: sewingServices.map(normalizeServiceItem).filter((item) => item.name && item.price),
    includedItems: includedItems.map((item) => String(item || "").trim()).filter(Boolean),
    excludedItems: excludedItems.map((item) => String(item || "").trim()).filter(Boolean),
    extras: extras.map(normalizeServiceItem).filter((item) => item.name && item.price),
  };

  if (!normalized.repairServices.length && !normalized.sewingServices.length) {
    throw new Error("services.json не содержит услуг");
  }

  return normalized;
}

async function loadServicesCatalog() {
  try {
    const response = await fetch(SERVICES_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    servicesCatalog = normalizeServicesCatalog(await response.json());
  } catch (error) {
    servicesCatalog = fallbackServices;
    servicesLoadedFromFallback = true;
    console.warn("Не удалось загрузить services.json, используется резервный прайс.", error);
  }
}

function allServices() {
  return [
    ...servicesCatalog.repairServices.flatMap((group) => group.items),
    ...servicesCatalog.sewingServices,
  ];
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}

function fillServiceSelect(select) {
  if (!select) return;
  select.innerHTML = [
    `<option value="">Консультация / уточнить услугу</option>`,
    ...allServices().map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`),
  ].join("");
}

function fillServiceSelects() {
  document.querySelectorAll("[data-service-select], #adminServiceSelect").forEach(fillServiceSelect);
}

function renderPriceStatus() {
  if (!servicesLoadedFromFallback || !document.querySelector(".price-page")) return;

  const hero = document.querySelector(".price-hero");
  if (!hero || hero.querySelector(".price-data-message")) return;

  const message = document.createElement("p");
  message.className = "price-data-message";
  message.textContent = "Прайс временно показан из резервного списка. Если цена важна, уточните ее при консультации.";
  hero.append(message);
}

function renderServiceRows(items, className) {
  return items.map((item) => `
    <div${className ? ` class="${className}"` : ""}>
      <span>${escapeHtml(item.name)}</span><strong>${escapeHtml(item.price)}</strong>
    </div>
  `).join("");
}

function renderPriceContent() {
  renderPriceStatus();

  const repairRoot = document.querySelector("#repairServices");
  if (repairRoot) {
    repairRoot.innerHTML = servicesCatalog.repairServices.map((group) => `
      <article class="price-card">
        <h3>${escapeHtml(group.title)}</h3>
        <ul>
          ${group.items.map((item) => `
            <li><span>${escapeHtml(item.name)}</span><strong>${escapeHtml(item.price)}</strong></li>
          `).join("")}
        </ul>
      </article>
    `).join("");
  }

  const sewingRoot = document.querySelector("#sewingServices");
  if (sewingRoot) {
    sewingRoot.innerHTML = renderServiceRows(servicesCatalog.sewingServices, "sewing-row");
  }

  const includedRoot = document.querySelector("#includedItems");
  if (includedRoot) {
    includedRoot.innerHTML = servicesCatalog.includedItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  const excludedRoot = document.querySelector("#excludedItems");
  if (excludedRoot) {
    excludedRoot.innerHTML = servicesCatalog.excludedItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  const extrasRoot = document.querySelector("#extras");
  if (extrasRoot) {
    extrasRoot.innerHTML = renderServiceRows(servicesCatalog.extras, "");
  }
}

function initHomePage() {
  const bookingForm = document.querySelector("#bookingForm");
  if (!bookingForm) return;
  const bookingMessage = document.querySelector("#bookingSuccess");
  const submitButton = bookingForm.querySelector("button[type='submit']");

  function showBookingMessage(type, text) {
    if (!bookingMessage) return;
    bookingMessage.hidden = false;
    bookingMessage.textContent = text;
    bookingMessage.classList.toggle("error", type === "error");
    bookingMessage.classList.toggle("success", type === "success");
  }

  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const createdAt = new Date().toLocaleString("ru-RU");
    const order = {
      id: crypto.randomUUID(),
      name: String(form.get("name") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      service: String(form.get("service") || "Консультация").trim(),
      date: "",
      comment: String(form.get("comment") || "").trim(),
      page: window.location.href,
      status: "Новая заявка",
      createdAt,
      history: [`${createdAt}: запрос на консультацию создан через сайт`],
    };

    showBookingMessage("success", "Отправляем запрос...");
    submitButton.disabled = true;

    let telegramAccepted = false;

    try {
      if (!TELEGRAM_WORKER_URL.startsWith("https://")) {
        throw new Error("не указан адрес Cloudflare Worker");
      }

      const response = await fetch(TELEGRAM_WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.ok === false) {
        throw new Error(result.error || "Telegram не принял сообщение");
      }

      telegramAccepted = true;

      try {
        saveOrders([order, ...getOrders()]);
      } catch (storageError) {
        console.warn("Заявка отправлена в Telegram, но не сохранена в браузере.", storageError);
      }

      event.currentTarget.reset();
      fillServiceSelects();
      showBookingMessage("success", "Запрос отправлен. Мы свяжемся с вами для консультации.");
    } catch (error) {
      if (telegramAccepted) {
        showBookingMessage("success", "Запрос отправлен. Мы свяжемся с вами для консультации.");
        return;
      }

      showBookingMessage(
        "error",
        `Не удалось отправить запрос: ${error.message}. Напишите нам в Telegram/WhatsApp.`,
      );
      console.error(error);
    } finally {
      submitButton.disabled = false;
    }
  });
}

function initAdminPage() {
  const loginForm = document.querySelector("#loginForm");
  if (!loginForm) return;

  const loginScreen = document.querySelector("#loginScreen");
  const adminScreen = document.querySelector("#adminScreen");
  const orderList = document.querySelector("#orderList");
  const clientGrid = document.querySelector("#clientGrid");
  const search = document.querySelector("#orderSearch");

  fillServiceSelects();

  function openAdmin() {
    loginScreen.hidden = true;
    adminScreen.hidden = false;
    renderAdmin();
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (document.querySelector("#pinInput").value === "2026") openAdmin();
  });

  document.querySelector("#logoutButton").addEventListener("click", () => {
    adminScreen.hidden = true;
    loginScreen.hidden = false;
  });

  document.querySelector("#adminOrderForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const createdAt = new Date().toLocaleString("ru-RU");
    const order = {
      id: crypto.randomUUID(),
      name: form.get("name"),
      phone: form.get("phone"),
      service: form.get("service") || "Консультация",
      date: form.get("date"),
      comment: form.get("comment"),
      status: "Новая заявка",
      createdAt,
      history: [`${createdAt}: заказ добавлен в админке`],
    };
    saveOrders([order, ...getOrders()]);
    event.currentTarget.reset();
    fillServiceSelects();
    renderAdmin();
  });

  search.addEventListener("input", renderAdmin);

  orderList.addEventListener("change", (event) => {
    if (!event.target.matches("[data-status]")) return;
    const orders = getOrders();
    const order = orders.find((item) => item.id === event.target.dataset.status);
    if (!order) return;
    const stamp = new Date().toLocaleString("ru-RU");
    order.status = event.target.value;
    order.history.unshift(`${stamp}: статус изменен на "${event.target.value}"`);
    saveOrders(orders);
    renderAdmin();
  });

  orderList.addEventListener("click", (event) => {
    if (!event.target.matches("[data-note-button]")) return;
    const id = event.target.dataset.noteButton;
    const input = document.querySelector(`[data-note-input="${id}"]`);
    const value = input.value.trim();
    if (!value) return;
    const orders = getOrders();
    const order = orders.find((item) => item.id === id);
    if (!order) return;
    order.history.unshift(`${new Date().toLocaleString("ru-RU")}: ${value}`);
    saveOrders(orders);
    renderAdmin();
  });

  function renderAdmin() {
    const query = search.value.toLowerCase();
    const orders = getOrders();
    const filtered = orders.filter((order) =>
      `${order.name} ${order.phone} ${order.service} ${order.status}`.toLowerCase().includes(query),
    );

    document.querySelector("#ordersCount").textContent = `${orders.length} заказов`;

    const clients = new Map();
    orders.forEach((order) => {
      const key = `${order.name}|${order.phone}`;
      if (!clients.has(key)) clients.set(key, []);
      clients.get(key).push(order);
    });
    document.querySelector("#clientsCount").textContent = `${clients.size} клиентов`;

    orderList.innerHTML = filtered.length ? filtered.map((order) => `
      <article class="order-card">
        <div class="order-head">
          <div>
            <h3>${escapeHtml(order.name)}</h3>
            <p>${escapeHtml(order.phone)}</p>
          </div>
          <select data-status="${escapeHtml(order.id)}">
            ${STATUSES.map((status) => `
              <option value="${escapeHtml(status)}" ${status === order.status ? "selected" : ""}>
                ${escapeHtml(status)}
              </option>
            `).join("")}
          </select>
        </div>
        <dl>
          <div><dt>Услуга</dt><dd>${escapeHtml(order.service)}</dd></div>
          <div><dt>Дата</dt><dd>${escapeHtml(order.date || "Не указана")}</dd></div>
          <div><dt>Создано</dt><dd>${escapeHtml(order.createdAt)}</dd></div>
        </dl>
        ${order.comment ? `<p class="order-comment">${escapeHtml(order.comment)}</p>` : ""}
        <div class="note-row">
          <input data-note-input="${escapeHtml(order.id)}" placeholder="Добавить заметку" />
          <button type="button" data-note-button="${escapeHtml(order.id)}">Добавить</button>
        </div>
        <details>
          <summary>История заказа</summary>
          <ul>${order.history.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </details>
      </article>
    `).join("") : `<p class="empty">Пока нет заказов.</p>`;

    clientGrid.innerHTML = Array.from(clients.entries()).map(([key, items]) => {
      const [name, phone] = key.split("|");
      return `
        <div class="client-card">
          <strong>${escapeHtml(name)}</strong>
          <span>${escapeHtml(phone)}</span>
          <small>${items.length} заказ(ов), последнее: ${escapeHtml(items[0].createdAt)}</small>
        </div>
      `;
    }).join("");
  }
}

function initRevealAnimations() {
  const selectors = [
    ".site-header",
    ".hero-copy > *",
    ".hero-signature",
    ".intro > *",
    ".section-title",
    ".feature-grid article",
    ".price-cta > *",
    ".price-hero > *",
    ".rule-grid article",
    ".price-card",
    ".sewing-row",
    ".details article",
    ".extras > div",
    ".price-footer-cta > *",
    ".booking-copy > *",
    ".booking-form > *",
    ".site-footer > *",
    ".admin-login > *",
    ".admin-top > *",
    ".admin-form > *",
    ".admin-section",
  ];

  const elements = Array.from(document.querySelectorAll(selectors.join(",")));
  if (!elements.length) return;

  elements.forEach((element, index) => {
    element.classList.add("reveal-target");
    element.style.setProperty("--reveal-delay", `${Math.min((index % 5) * 0.08, 0.32)}s`);
  });

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: "0px 0px -8% 0px",
    threshold: 0.12,
  });

  elements.forEach((element) => observer.observe(element));
}

function disablePageZoom() {
  const isTouchViewport = () => window.matchMedia("(hover: none) and (pointer: coarse), (max-width: 1024px)").matches;

  window.addEventListener("wheel", (event) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
  }, { passive: false });

  window.addEventListener("keydown", (event) => {
    if (!event.ctrlKey && !event.metaKey) return;
    if (!["+", "=", "-", "_", "0"].includes(event.key)) return;
    event.preventDefault();
  });

  ["gesturestart", "gesturechange", "gestureend"].forEach((eventName) => {
    window.addEventListener(eventName, (event) => {
      if (!isTouchViewport()) return;
      event.preventDefault();
    });
  });

  window.addEventListener("touchmove", (event) => {
    if (!isTouchViewport() || event.touches.length < 2) return;
    event.preventDefault();
  }, { passive: false });

  let lastTouchEnd = 0;
  window.addEventListener("touchend", (event) => {
    if (!isTouchViewport()) return;

    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
}

async function initSite() {
  disablePageZoom();
  await loadServicesCatalog();
  renderPriceContent();
  fillServiceSelects();
  initHomePage();
  initAdminPage();
  initRevealAnimations();
}

initSite();
