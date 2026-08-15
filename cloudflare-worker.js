const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}

function buildTelegramMessage(order) {
  return [
    "<b>Новая заявка с сайта BE FABULOUS</b>",
    "",
    `<b>Имя:</b> ${escapeHtml(order.name)}`,
    `<b>Телефон:</b> ${escapeHtml(order.phone)}`,
    `<b>Услуга:</b> ${escapeHtml(order.service || "Консультация")}`,
    `<b>Комментарий:</b> ${escapeHtml(order.comment || "Не указан")}`,
    `<b>Страница:</b> ${escapeHtml(order.page || "Не указана")}`,
    `<b>Дата:</b> ${escapeHtml(order.createdAt || new Date().toLocaleString("ru-RU"))}`,
  ].join("\n");
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
    }

    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return jsonResponse({ ok: false, error: "Telegram secrets are not configured" }, 500);
    }

    let order;
    try {
      order = await request.json();
    } catch {
      return jsonResponse({ ok: false, error: "Invalid JSON" }, 400);
    }

    if (!order.name || !order.phone) {
      return jsonResponse({ ok: false, error: "Name and phone are required" }, 400);
    }

    const telegramResponse = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: buildTelegramMessage(order),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!telegramResponse.ok) {
      const details = await telegramResponse.text();
      return jsonResponse({ ok: false, error: "Telegram API error", details }, 502);
    }

    return jsonResponse({ ok: true });
  },
};
