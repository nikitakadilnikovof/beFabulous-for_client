"use client";

import { FormEvent, useMemo, useState } from "react";
import { repairServices, sewingServices, includedItems, excludedItems, extras } from "./siteData";

type Booking = {
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

function readOrders(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function writeOrders(orders: Booking[]) {
  localStorage.setItem(storageKey, JSON.stringify(orders));
}

export default function Home() {
  const [sent, setSent] = useState(false);
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

  function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const createdAt = new Date().toLocaleString("ru-RU");
    const booking: Booking = {
      id: crypto.randomUUID(),
      ...form,
      status: "Новая заявка",
      createdAt,
      history: [`${createdAt}: заявка создана через сайт`],
    };
    writeOrders([booking, ...readOrders()]);
    setSent(true);
    setForm({ name: "", phone: "", service: "Подшить брюки", date: "", comment: "" });
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="BE FABULOUS">
          <img src="/be-fabulous-logo.png" alt="BE FABULOUS atelier" />
        </a>
        <nav aria-label="Основная навигация">
          <a href="#prices">Прайс</a>
          <a href="#booking">Запись</a>
          <a href="/admin">Админка</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Antalya</p>
          <h1>BE FABULOUS</h1>
          <p className="lead">Ателье, ремонт одежды и индивидуальный пошив с аккуратной посадкой по фигуре.</p>
          <div className="hero-actions">
            <a className="button primary" href="#booking">Записаться</a>
            <a className="button secondary" href="#prices">Посмотреть прайс</a>
          </div>
        </div>
        <div className="hero-panel" aria-label="Ключевые услуги">
          <span>Ремонт</span>
          <span>Подгонка</span>
          <span>Пошив</span>
        </div>
      </section>

      <section className="section intro">
        <div>
          <p className="eyebrow">АТЕЛЬЕ • РЕМОНТ • ИНДИВИДУАЛЬНЫЙ ПОШИВ</p>
          <h2>Прайс собран так, чтобы клиент быстро нашел нужную услугу.</h2>
        </div>
        <p>
          Все цены указаны «от». Итоговая стоимость определяется после оценки изделия и зависит от сложности модели,
          конструкции, количества примерок и объема работы.
        </p>
      </section>

      <section className="section" id="prices">
        <div className="section-title">
          <p className="eyebrow">Ремонт и подгонка</p>
          <h2>Базовые услуги</h2>
        </div>
        <div className="price-grid">
          {repairServices.map((group) => (
            <article className="price-card" key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item.name}>
                    <span>{item.name}</span>
                    <strong>{item.price}</strong>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section sewing-band">
        <div className="section-title">
          <p className="eyebrow">Индивидуальный пошив</p>
          <h2>Изделия на заказ</h2>
        </div>
        <div className="sewing-list">
          {sewingServices.map((item) => (
            <div className="sewing-row" key={item.name}>
              <span>{item.name}</span>
              <strong>{item.price}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section details">
        <article>
          <h2>В стоимость пошива входит</h2>
          <ul className="check-list">
            {includedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Не входит в стоимость</h2>
          <p>Ткань и все материалы оплачиваются отдельно.</p>
          <ul className="check-list muted">
            {excludedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="section extras">
        {extras.map((item) => (
          <div key={item.name}>
            <span>{item.name}</span>
            <strong>{item.price}</strong>
          </div>
        ))}
      </section>

      <section className="section booking" id="booking">
        <div className="booking-copy">
          <p className="eyebrow">Онлайн-запись</p>
          <h2>Оставьте заявку на ремонт или пошив</h2>
          <p>
            После отправки заявка сохранится в админской части. Клиентская история будет доступна по имени и телефону.
          </p>
        </div>
        <form onSubmit={submitBooking} className="booking-form">
          <label>
            Имя
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Ваше имя"
            />
          </label>
          <label>
            Телефон
            <input
              required
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="+90 ..."
            />
          </label>
          <label>
            Услуга
            <select value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}>
              {allServices.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Желаемая дата
            <input value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} type="date" />
          </label>
          <label className="wide">
            Комментарий
            <textarea
              value={form.comment}
              onChange={(event) => setForm({ ...form, comment: event.target.value })}
              placeholder="Опишите изделие, срочность или пожелания"
            />
          </label>
          <button className="button primary wide" type="submit">Отправить заявку</button>
          {sent ? <p className="success wide">Заявка сохранена. Мы свяжемся с вами для уточнения деталей.</p> : null}
        </form>
      </section>
    </main>
  );
}
