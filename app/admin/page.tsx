"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { repairServices, sewingServices } from "../siteData";

type Order = {
  id: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  comment: string;
  status: string;
  createdAt: string;
  history: string[];
};

const storageKey = "be-fabulous-orders";
const statuses = ["Новая заявка", "В работе", "Примерка", "Готово", "Выдано"];

function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  localStorage.setItem(storageKey, JSON.stringify(orders));
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [note, setNote] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: "Подшить брюки",
    date: "",
    comment: "",
  });

  const allServices = useMemo(
    () => [...repairServices.flatMap((group) => group.items), ...sewingServices],
    [],
  );

  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  const filteredOrders = orders.filter((order) => {
    const haystack = `${order.name} ${order.phone} ${order.service} ${order.status}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const clients = useMemo(() => {
    const map = new Map<string, Order[]>();
    orders.forEach((order) => {
      const key = `${order.name.trim()}|${order.phone.trim()}`;
      map.set(key, [...(map.get(key) || []), order]);
    });
    return Array.from(map.entries()).map(([key, items]) => {
      const [name, phone] = key.split("|");
      return { name, phone, count: items.length, last: items[0]?.createdAt || "" };
    });
  }, [orders]);

  function updateOrders(nextOrders: Order[]) {
    setOrders(nextOrders);
    saveOrders(nextOrders);
  }

  function addOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const createdAt = new Date().toLocaleString("ru-RU");
    updateOrders([
      {
        id: crypto.randomUUID(),
        ...form,
        status: "Новая заявка",
        createdAt,
        history: [`${createdAt}: заказ добавлен в админке`],
      },
      ...orders,
    ]);
    setForm({ name: "", phone: "", service: "Подшить брюки", date: "", comment: "" });
  }

  function changeStatus(id: string, status: string) {
    const stamp = new Date().toLocaleString("ru-RU");
    updateOrders(
      orders.map((order) =>
        order.id === id
          ? { ...order, status, history: [`${stamp}: статус изменен на "${status}"`, ...order.history] }
          : order,
      ),
    );
  }

  function addNote(id: string) {
    const value = note[id]?.trim();
    if (!value) return;
    const stamp = new Date().toLocaleString("ru-RU");
    updateOrders(
      orders.map((order) =>
        order.id === id ? { ...order, history: [`${stamp}: ${value}`, ...order.history] } : order,
      ),
    );
    setNote({ ...note, [id]: "" });
  }

  if (!unlocked) {
    return (
      <main className="admin-login">
        <section className="login-box">
          <img src="/be-fabulous-logo.png" alt="BE FABULOUS" />
          <h1>Админская часть</h1>
          <p>Введите PIN для доступа к клиентам и заказам.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (pin === "2026") setUnlocked(true);
            }}
          >
            <input value={pin} onChange={(event) => setPin(event.target.value)} placeholder="PIN" type="password" />
            <button className="button primary" type="submit">Войти</button>
          </form>
          <a href="/">Вернуться на сайт</a>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <img src="/be-fabulous-logo.png" alt="BE FABULOUS" />
        <a href="/">Главная</a>
        <a href="#orders">Заказы</a>
        <a href="#clients">Клиенты</a>
        <button onClick={() => setUnlocked(false)} type="button">Выйти</button>
      </aside>

      <section className="admin-content">
        <div className="admin-top">
          <div>
            <p className="eyebrow">BE FABULOUS</p>
            <h1>Клиенты и история заказов</h1>
          </div>
          <div className="admin-stats">
            <span>{orders.length} заказов</span>
            <span>{clients.length} клиентов</span>
          </div>
        </div>

        <form className="admin-form" onSubmit={addOrder}>
          <h2>Добавить заказ</h2>
          <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Имя" />
          <input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Телефон" />
          <select value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}>
            {allServices.map((item) => (
              <option key={item.name} value={item.name}>{item.name}</option>
            ))}
          </select>
          <input value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} type="date" />
          <textarea value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} placeholder="Комментарий" />
          <button className="button primary" type="submit">Сохранить</button>
        </form>

        <section className="admin-section" id="orders">
          <div className="admin-section-head">
            <h2>Заказы</h2>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по имени, телефону, услуге" />
          </div>
          <div className="order-list">
            {filteredOrders.map((order) => (
              <article className="order-card" key={order.id}>
                <div className="order-head">
                  <div>
                    <h3>{order.name}</h3>
                    <p>{order.phone}</p>
                  </div>
                  <select value={order.status} onChange={(event) => changeStatus(order.id, event.target.value)}>
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <dl>
                  <div><dt>Услуга</dt><dd>{order.service}</dd></div>
                  <div><dt>Дата</dt><dd>{order.date || "Не указана"}</dd></div>
                  <div><dt>Создано</dt><dd>{order.createdAt}</dd></div>
                </dl>
                {order.comment ? <p className="order-comment">{order.comment}</p> : null}
                <div className="note-row">
                  <input
                    value={note[order.id] || ""}
                    onChange={(event) => setNote({ ...note, [order.id]: event.target.value })}
                    placeholder="Добавить заметку"
                  />
                  <button type="button" onClick={() => addNote(order.id)}>Добавить</button>
                </div>
                <details>
                  <summary>История заказа</summary>
                  <ul>
                    {order.history.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </details>
              </article>
            ))}
            {filteredOrders.length === 0 ? <p className="empty">Пока нет заказов.</p> : null}
          </div>
        </section>

        <section className="admin-section" id="clients">
          <h2>Клиенты</h2>
          <div className="client-grid">
            {clients.map((client) => (
              <div className="client-card" key={`${client.name}-${client.phone}`}>
                <strong>{client.name}</strong>
                <span>{client.phone}</span>
                <small>{client.count} заказ(ов), последнее: {client.last}</small>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
