const STORAGE_KEY = "be-fabulous-orders";
const STATUSES = ["Новая заявка", "В работе", "Примерка", "Готово", "Выдано"];

const repairServices = [
  {
    title: "Брюки и джинсы",
    items: [
      ["Подшить брюки", "от 800 ₺"],
      ["Укоротить джинсы", "от 800 ₺"],
      ["Ушить брюки по бокам", "от 900 ₺"],
      ["Ушить брюки по талии", "от 900 ₺"],
      ["Замена молнии в брюках", "от 700 ₺"],
      ["Ремонт / замена карманов", "от 600 ₺"],
      ["Ремонт / замена пояса", "от 700 ₺"],
    ],
  },
  {
    title: "Юбки",
    items: [
      ["Подшить юбку", "от 800 ₺"],
      ["Ушить юбку", "от 900 ₺"],
      ["Замена молнии в юбке", "от 700 ₺"],
    ],
  },
  {
    title: "Платья",
    items: [
      ["Подшить платье", "от 1 000 ₺"],
      ["Ушить платье", "от 1 200 ₺"],
      ["Посадка платья по фигуре", "от 1 500 ₺"],
      ["Замена молнии в платье", "от 900 ₺"],
    ],
  },
  {
    title: "Верхняя одежда",
    items: [
      ["Подшить / укоротить рукава", "от 700 ₺"],
      ["Подшить пиджак", "от 1 200 ₺"],
      ["Ушить пиджак", "от 1 500 ₺"],
      ["Подшить пальто", "от 1 500 ₺"],
      ["Ушить пальто", "от 1 800 ₺"],
      ["Замена молнии в куртке", "от 900 ₺"],
    ],
  },
  {
    title: "Ремонт деталей",
    items: [
      ["Ремонт подкладки", "от 800 ₺"],
      ["Ремонт разрывов и швов", "от 500 ₺"],
      ["Пришить пуговицу", "от 250 ₺"],
      ["Изготовление петли", "от 300 ₺"],
      ["Замена кнопки", "от 250 ₺"],
    ],
  },
];

const sewingServices = [
  ["Топ / корсет", "от 4 000 ₺"],
  ["Юбка", "от 4 500 ₺"],
  ["Брюки", "от 5 500 ₺"],
  ["Рубашка / блуза", "от 5 500 ₺"],
  ["Платье простого кроя", "от 7 500 ₺"],
  ["Платье сложного кроя", "от 10 000 ₺"],
  ["Вечернее платье", "от 14 000 ₺"],
  ["Вечернее платье сложной конструкции", "от 18 000 ₺"],
  ["Жакет", "от 8 500 ₺"],
  ["Жакет + юбка", "от 13 000 ₺"],
  ["Брючный костюм", "от 14 000 ₺"],
  ["Пальто", "от 13 000 ₺"],
  ["Тренч", "от 15 000 ₺"],
  ["Изделие из меха", "от 20 000 ₺"],
  ["Свадебное платье", "от 25 000 ₺"],
  ["Сложное свадебное платье", "от 35 000 ₺"],
];

const includedItems = [
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
];

const excludedItems = [
  "Основная ткань",
  "Подкладочная ткань",
  "Молнии",
  "Пуговицы и кнопки",
  "Кружево",
  "Стразы и декоративные элементы",
  "Вышивка и ручной декор",
  "Другие необходимые материалы и фурнитура",
];

const extras = [
  ["Срочный заказ", "+30%"],
  ["Сложный декор / ручная работа", "от 2 000 ₺"],
  ["Индивидуальное моделирование", "от 2 500 ₺"],
];

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

function allServices() {
  return [...repairServices.flatMap((group) => group.items), ...sewingServices];
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
  select.innerHTML = allServices()
    .map(([name]) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    .join("");
}

function renderPriceContent() {
  const repairRoot = document.querySelector("#repairServices");
  if (repairRoot) {
    repairRoot.innerHTML = repairServices.map((group) => `
      <article class="price-card">
        <h3>${escapeHtml(group.title)}</h3>
        <ul>
          ${group.items.map(([name, price]) => `
            <li><span>${escapeHtml(name)}</span><strong>${escapeHtml(price)}</strong></li>
          `).join("")}
        </ul>
      </article>
    `).join("");
  }

  const sewingRoot = document.querySelector("#sewingServices");
  if (sewingRoot) {
    sewingRoot.innerHTML = sewingServices.map(([name, price]) => `
      <div class="sewing-row"><span>${escapeHtml(name)}</span><strong>${escapeHtml(price)}</strong></div>
    `).join("");
  }

  const includedRoot = document.querySelector("#includedItems");
  if (includedRoot) {
    includedRoot.innerHTML = includedItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  const excludedRoot = document.querySelector("#excludedItems");
  if (excludedRoot) {
    excludedRoot.innerHTML = excludedItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  const extrasRoot = document.querySelector("#extras");
  if (extrasRoot) {
    extrasRoot.innerHTML = extras.map(([name, price]) => `
      <div><span>${escapeHtml(name)}</span><strong>${escapeHtml(price)}</strong></div>
    `).join("");
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
      service: "Консультация",
      date: "",
      comment: String(form.get("comment") || "").trim(),
      status: "Новая заявка",
      createdAt,
      history: [`${createdAt}: запрос на консультацию создан через сайт`],
    };

    showBookingMessage("success", "Отправляем запрос...");
    submitButton.disabled = true;

    let telegramAccepted = false;

    try {
      const response = await fetch("/api/send-telegram", {
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

  fillServiceSelect(document.querySelector("#adminServiceSelect"));

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
      service: form.get("service"),
      date: form.get("date"),
      comment: form.get("comment"),
      status: "Новая заявка",
      createdAt,
      history: [`${createdAt}: заказ добавлен в админке`],
    };
    saveOrders([order, ...getOrders()]);
    event.currentTarget.reset();
    fillServiceSelect(document.querySelector("#adminServiceSelect"));
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

renderPriceContent();
initHomePage();
initAdminPage();
initRevealAnimations();
