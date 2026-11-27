/* InHome: окно товара и корзина с оформлением заказа.
   Заказ уходит в Telegram через Google Apps Script (sites/tools/telegram-orders). ORDER_URL пустой — демо, заказ никуда не уходит.
   Сейчас стоит общий скрипт заказов Рафа: в Telegram придёт «Новый заказ … — InHome». Для салона — свой скрипт и его ссылка здесь. */
(function () {
  "use strict";

  const ORDER_URL = "https://script.google.com/macros/s/AKfycbwX_hnR4S_zoaq3AMSY7Li9M0As1VLHs4c9VOz8c8T-zonEeh7iJ6Cakz0NeNDx6GDFkw/exec";
  const PHONE = "077 72 75 02";
  const STORE_KEY = "inhome-cart";
  const MAX_QTY = 20;
  const lang = window.INHOME_LANG || "hy";

  // товары: фото карточки, фото для окна товара, названия и описания (по подписям салона в Instagram)
  const P = {
    "sofa-set": { img: "DgPLLgmiF8F_2", gal: ["DgPLLgmiF8F_2", "DgPLLgmiF8F_1", "DgPLLgmiF8F_3"],
      hy: ["Բազմոց երկու բազկաթոռով", "Բազմոց և երկու բազկաթոռ մեկ հավաքածուում՝ կաթնագույն գործվածքով։ Կարող ենք պատրաստել ձեր չափերով և գույնով։"],
      ru: ["Диван с двумя креслами", "Диван и два кресла одним комплектом, ткань молочного цвета. Можем сделать в ваших размерах и цвете."],
      en: ["Sofa with two armchairs", "A sofa and two armchairs as one set, in a cream fabric. We can make it to your sizes and colour."] },
    "corner-sofa": { img: "DfmTWAFCBzY_3", gal: ["DfmTWAFCBzY_3", "DfmTWAFCBzY_1", "DfmTWAFCBzY_2"],
      hy: ["Անկյունային բազմոց", "Մոդուլային կառուցվածքով բազմոց InHome-ի ամենավաճառվող մոդելներից։"],
      ru: ["Угловой диван", "Модульный диван из самых продаваемых моделей InHome."],
      en: ["Corner sofa", "A modular sofa from InHome's best-selling models."] },
    "tv-set": { img: "DgAGabtiKJs_1", gal: ["DgAGabtiKJs_1", "DgAGabtiKJs_5", "DgAGabtiKJs_2", "DgAGabtiKJs_3", "DgAGabtiKJs_4"],
      hy: ["TV հավաքածու", "TV տումբա և երկու ապակե ցուցապահարան՝ սպիտակ երանգով և ոսկեգույն դետալներով։"],
      ru: ["ТВ-гарнитур", "ТВ-тумба и две стеклянные витрины: белый цвет и золотистые детали."],
      en: ["TV unit", "A TV stand and two glass cabinets in white with gold details."] },
    "armchair": { img: "DgPLLgmiF8F_3", gal: ["DgPLLgmiF8F_3", "DgPLLgmiF8F_1"],
      hy: ["Կաթնագույն բազկաթոռ", "Բազկաթոռ փայտե ոտքերով՝ նույն հավաքածուից, ինչ կաթնագույն բազմոցը։"],
      ru: ["Кресло молочного цвета", "Кресло на деревянных ножках из того же комплекта, что и диван молочного цвета."],
      en: ["Cream armchair", "An armchair on wooden legs from the same set as the cream sofa."] },
    "bed-velvet": { img: "Dfy2Y57CFBk_5", gal: ["Dfy2Y57CFBk_5", "Dfy2Y57CFBk_1", "Dfy2Y57CFBk_2", "Dfy2Y57CFBk_3", "Dfy2Y57CFBk_4"],
      hy: ["Ննջասենյակ թավշյա գլխատախտակով", "Մահճակալ, չորսդռնանի պահարան, դիմահարդարման սեղան և գիշերային սեղաններ։ Չափերը և գույնը՝ ձեր ընտրությամբ։"],
      ru: ["Спальня с бархатным изголовьем", "Кровать, четырёхстворчатый шкаф, туалетный столик и тумбы. Размеры и цвет — на ваш выбор."],
      en: ["Bedroom with a velvet headboard", "A bed, a four-door wardrobe, a dressing table and nightstands. Sizes and colour are your choice."] },
    "bed-oak": { img: "DfrKy8tCKaB_6", gal: ["DfrKy8tCKaB_6", "DfrKy8tCKaB_2", "DfrKy8tCKaB_3", "DfrKy8tCKaB_4", "DfrKy8tCKaB_5"],
      hy: ["Ննջասենյակ բաց կաղնու երանգով", "Նուրբ փայտային երանգ և մինիմալիստական դիզայն՝ մահճակալ, հայելիով պահարան և գիշերային սեղաններ։"],
      ru: ["Спальня в светлом дубе", "Мягкий древесный оттенок и минималистичный дизайн: кровать, шкаф с зеркалом и тумбы."],
      en: ["Bedroom in light oak", "A soft wood tone and a plain design: a bed, a mirrored wardrobe and nightstands."] },
    "bed-grey": { img: "Df39jgTiDd1_6", gal: ["Df39jgTiDd1_6", "Df39jgTiDd1_1", "Df39jgTiDd1_2", "Df39jgTiDd1_3", "Df39jgTiDd1_4", "Df39jgTiDd1_5"],
      hy: ["Ննջասենյակ՝ մոխրագույն և կաղնի", "Մոխրագույնի և կաղնու համադրություն, մաքուր գծեր՝ մահճակալ, հայելիով պահարան, կոմոդ և գիշերային սեղաններ։"],
      ru: ["Спальня, серый и дуб", "Серый с дубом и чистые линии: кровать, шкаф с зеркалом, комод и тумбы."],
      en: ["Bedroom in grey and oak", "Grey with oak and clean lines: a bed, a mirrored wardrobe, a chest of drawers and nightstands."] },
    "dressing": { img: "Dfy2Y57CFBk_3", gal: ["Dfy2Y57CFBk_3", "Dfy2Y57CFBk_4"],
      hy: ["Դիմահարդարման սեղան հայելիով", "Ոսկեգույն օղակաձև բռնակներով՝ թավշյա գլխատախտակով ննջասենյակի հավաքածուից։"],
      ru: ["Туалетный столик с зеркалом", "С золотыми ручками-кольцами, из комплекта спальни с бархатным изголовьем."],
      en: ["Dressing table with mirror", "With gold ring handles, from the bedroom set with the velvet headboard."] }
  };

  const T = {
    hy: { cart: "Զամբյուղ", close: "Փակել", add: "Ավելացնել զամբյուղ", total: "Ընդամենը",
      empty: "Զամբյուղը դատարկ է։ Ընտրեք մոդելը կատալոգից։",
      priceNote: "Գինը և առաքման օրը կհաստատենք զանգով՝ ըստ չափերի և գույնի։",
      fName: "Անուն", fPhone: "Հեռախոս", fAddr: "Առաքման հասցե (քաղաք կամ գյուղ, փողոց)", fPay: "Վճարում",
      fNote: "Մեկնաբանություն (ըստ ցանկության)", "pay.cash": "Կանխիկ", "pay.card": "Քարտով", "pay.credit": "Ապառիկ",
      cta: "Պատվիրել կահույք", eName: "Գրեք ձեր անունը։", ePhone: "Գրեք հեռախոսահամարը, օրինակ՝ 077 12 34 56։",
      eAddr: "Գրեք առաքման հասցեն։", eCart: "Ավելացրեք գոնե մեկ մոդել։", errors: n => `Ստուգեք ${n} դաշտ։`,
      sending: "Ուղարկում ենք…", eSend: `Չհաջողվեց ուղարկել։ Զանգահարեք՝ ${PHONE}։`,
      orderNo: "Պատվեր №", sent: "Պատվերը ստացանք։ Կզանգահարենք՝ գինը և առաքման օրը հաստատելու համար։",
      demo: "Սա ցուցադրական տարբերակ է՝ պատվերը ոչ մի տեղ չի ուղարկվում։", back: "Շարունակել ընտրությունը",
      minus: "Պակասեցնել", plus: "Ավելացնել", remove: "Հեռացնել", photo: (i, n) => `Լուսանկար ${i}՝ ${n}-ից`,
      count: n => `Զամբյուղ, ${n} ապրանք`, pay: { cash: "Наличными", card: "Картой", credit: "Рассрочка" } },
    ru: { cart: "Корзина", close: "Закрыть", add: "В корзину", total: "Итого",
      empty: "Корзина пуста. Выберите модель в каталоге.",
      priceNote: "Цену и день доставки подтвердим по телефону — по размерам и цвету.",
      fName: "Имя", fPhone: "Телефон", fAddr: "Адрес доставки (город или село, улица)", fPay: "Оплата",
      fNote: "Комментарий (по желанию)", "pay.cash": "Наличными", "pay.card": "Картой", "pay.credit": "Рассрочка",
      cta: "Заказать мебель", eName: "Напишите ваше имя.", ePhone: "Напишите номер телефона, например 077 12 34 56.",
      eAddr: "Напишите адрес доставки.", eCart: "Добавьте хотя бы одну модель.", errors: n => `Проверьте полей: ${n}.`,
      sending: "Отправляем…", eSend: `Не удалось отправить. Позвоните: ${PHONE}.`,
      orderNo: "Заказ №", sent: "Заказ получили. Мы позвоним, чтобы подтвердить цену и день доставки.",
      demo: "Это демо-версия: заказ никуда не отправляется.", back: "Продолжить выбор",
      minus: "Меньше", plus: "Больше", remove: "Удалить", photo: (i, n) => `Фото ${i} из ${n}`,
      count: n => `Корзина, товаров: ${n}` },
    en: { cart: "Cart", close: "Close", add: "Add to cart", total: "Total",
      empty: "Your cart is empty. Choose a piece from the catalogue.",
      priceNote: "We confirm the price and the delivery day by phone, by size and colour.",
      fName: "Name", fPhone: "Phone", fAddr: "Delivery address (town or village, street)", fPay: "Payment",
      fNote: "Comment (optional)", "pay.cash": "Cash", "pay.card": "Card", "pay.credit": "Instalments",
      cta: "Order furniture", eName: "Write your name.", ePhone: "Write a phone number, like 077 12 34 56.",
      eAddr: "Write the delivery address.", eCart: "Add at least one piece.", errors: n => `Check ${n} field${n > 1 ? "s" : ""}.`,
      sending: "Sending…", eSend: `The order did not go through. Please call ${PHONE}.`,
      orderNo: "Order no.", sent: "We have your order. We will call to confirm the price and the delivery day.",
      demo: "This is a demo: the order is not sent anywhere.", back: "Keep browsing",
      minus: "Fewer", plus: "More", remove: "Remove", photo: (i, n) => `Photo ${i} of ${n}`,
      count: n => `Cart, ${n} item${n === 1 ? "" : "s"}` }
  };
  const t = T[lang];
  const name = id => P[id][lang][0];
  const imgSrc = n => `img/g-${n}.jpg`;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- корзина в localStorage
  let items = [];
  try { items = JSON.parse(localStorage.getItem(STORE_KEY) || "[]").filter(x => P[x.id] && x.q > 0); } catch (e) { items = []; }
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(items)); } catch (e) { /* приватный режим: корзина живёт до перезагрузки */ } };
  const countAll = () => items.reduce((s, x) => s + x.q, 0);

  function updateCount() {
    const n = countAll();
    document.querySelectorAll("[data-cart-count]").forEach(el => { el.textContent = n ? String(n) : ""; });
    document.querySelectorAll("[data-cart-open]").forEach(el => el.setAttribute("aria-label", t.count(n)));
  }

  function add(id) {
    const it = items.find(x => x.id === id);
    if (it) it.q = Math.min(MAX_QTY, it.q + 1); else items.push({ id, q: 1 });
    save();
    updateCount();
  }

  // ---------- панель (dialog) создаётся из шаблона при первом открытии
  let dlg = null, opener = null;
  function drawer() {
    if (dlg) return dlg;
    const tpl = document.getElementById("drawer-tpl");
    dlg = tpl.content.firstElementChild.cloneNode(true);
    dlg.querySelectorAll("[data-t]").forEach(el => { el.textContent = t[el.dataset.t] || ""; });
    dlg.querySelectorAll("[data-close]").forEach(b => {
      if (!b.textContent.trim()) b.setAttribute("aria-label", t.close);
      b.addEventListener("click", () => dlg.close());
    });
    dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });   // клик по затемнению
    dlg.addEventListener("close", () => { document.documentElement.style.overflow = ""; if (opener) opener.focus(); });
    dlg.querySelector("[data-cart-form]").addEventListener("submit", onSubmit);
    document.body.appendChild(dlg);
    return dlg;
  }

  function show(view, title) {
    const d = drawer();
    d.querySelectorAll("[data-view]").forEach(v => { v.hidden = v.dataset.view !== view; });
    d.querySelector("#drawer-title").textContent = title;
    if (!d.open) {
      opener = document.activeElement;
      document.documentElement.style.overflow = "hidden";
      d.showModal();
    }
    d.querySelector(".drawer__body").scrollTop = 0;
  }

  // ---------- окно товара: фото гарнитура, описание, «в корзину»
  function openProduct(id) {
    const p = P[id];
    const d = drawer();
    const main = d.querySelector("[data-qv-img]");
    const thumbs = d.querySelector("[data-qv-thumbs]");
    const pick = i => {
      main.src = imgSrc(p.gal[i]);
      main.alt = name(id);
      thumbs.querySelectorAll("button").forEach((b, k) => b.setAttribute("aria-current", k === i ? "true" : "false"));
    };
    thumbs.replaceChildren(...p.gal.map((g, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", t.photo(i + 1, p.gal.length));
      const im = document.createElement("img");
      im.src = imgSrc(g); im.alt = ""; im.loading = "lazy";
      b.appendChild(im);
      b.addEventListener("click", () => pick(i));
      return b;
    }));
    pick(0);
    d.querySelector("[data-qv-name]").textContent = name(id);
    d.querySelector("[data-qv-desc]").textContent = p[lang][1];
    const addBtn = d.querySelector("[data-qv-add]");
    addBtn.textContent = t.add;
    addBtn.onclick = () => { add(id); openCart(); };
    show("product", name(id));
  }

  // ---------- корзина
  function renderCart() {
    const d = drawer();
    const list = d.querySelector("[data-cart-list]");
    list.replaceChildren(...items.map(x => {
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `<img alt="" width="72" height="72"><div><p class="cart-item__name"></p><p class="cart-item__price">… ֏</p></div>
        <div class="qty"><button type="button" data-d="-1">−</button><output></output><button type="button" data-d="1">+</button></div>
        <button class="cart-item__rm" type="button"></button>`;
      li.querySelector("img").src = imgSrc(P[x.id].img);
      li.querySelector(".cart-item__name").textContent = name(x.id);
      li.querySelector("output").textContent = x.q;
      li.querySelector('[data-d="-1"]').setAttribute("aria-label", `${t.minus}: ${name(x.id)}`);
      li.querySelector('[data-d="1"]').setAttribute("aria-label", `${t.plus}: ${name(x.id)}`);
      const rm = li.querySelector(".cart-item__rm");
      rm.textContent = t.remove;
      rm.addEventListener("click", () => { items = items.filter(y => y !== x); save(); updateCount(); renderCart(); });
      li.querySelectorAll("[data-d]").forEach(b => b.addEventListener("click", () => {
        x.q = Math.max(1, Math.min(MAX_QTY, x.q + Number(b.dataset.d)));
        save(); updateCount(); renderCart();
      }));
      return li;
    }));
    const empty = !items.length;
    d.querySelector("[data-cart-empty]").textContent = empty ? t.empty : "";
    d.querySelector("[data-cart-empty]").hidden = !empty;
    d.querySelector("[data-cart-total-row]").hidden = empty;
  }

  function openCart() {
    renderCart();
    show("cart", t.cart);
  }

  // ---------- оформление
  function orderId() {
    const n = new Date(), p = v => String(v).padStart(2, "0");
    return "H" + p(n.getMonth() + 1) + p(n.getDate()) + "-" + (100 + Math.floor(Math.random() * 900));
  }

  function setError(input, msg) {
    const err = document.getElementById(input.getAttribute("aria-describedby"));
    err.textContent = msg || "";
    err.hidden = !msg;
    if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
    return !msg;
  }

  function onSubmit(e) {
    e.preventDefault();
    const f = e.currentTarget;
    const status = f.querySelector("[data-form-status]");
    const nameIn = f.elements.name, phoneIn = f.elements.phone, addrIn = f.elements.addr;
    const checks = [
      setError(nameIn, nameIn.value.trim() ? "" : t.eName),
      setError(phoneIn, phoneIn.value.replace(/\D/g, "").length >= 8 ? "" : t.ePhone),
      setError(addrIn, addrIn.value.trim() ? "" : t.eAddr)
    ];
    const bad = checks.filter(ok => !ok).length;
    if (!items.length) { status.textContent = t.eCart; return; }
    if (bad) {
      status.textContent = t.errors(bad);
      [nameIn, phoneIn, addrIn].find(i => i.getAttribute("aria-invalid"))?.focus();
      return;
    }
    const btn = f.querySelector('[type="submit"]');
    const id = orderId();
    btn.disabled = true;
    const slow = setTimeout(() => { status.textContent = t.sending; }, 300);
    const finish = ok => {
      clearTimeout(slow);
      btn.disabled = false;
      if (!ok) { status.textContent = t.eSend; return; }   // поля и корзина остаются как были
      status.textContent = "";
      drawer().querySelector("[data-done-no]").textContent = `${t.orderNo} ${id}`;
      drawer().querySelector('[data-view="done"] [data-t="sent"]').textContent = ORDER_URL ? t.sent : t.demo;
      items = [];
      save(); updateCount(); f.reset();
      show("done", t.cart);
    };
    if (!ORDER_URL) { setTimeout(() => finish(true), reduceMotion ? 0 : 600); return; }
    // салону всё приходит по-русски, независимо от языка сайта
    const data = {
      shop: "InHome", id, lang,
      name: nameIn.value.trim(), phone: phoneIn.value.trim(), addr: addrIn.value.trim(),
      pay: T.hy.pay[f.elements.pay.value] || "", note: f.elements.note.value.trim(),
      items: items.map(x => ({ name: P[x.id].ru[0], qty: x.q, price: 0, priceText: "цена уточняется" })),
      hp: f.elements.website.value
    };
    // text/plain и no-cors: Google Apps Script принимает такой запрос без лишних проверок браузера
    fetch(ORDER_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) })
      .then(() => finish(true), () => finish(false));
  }

  // ---------- кнопки страницы
  document.addEventListener("click", e => {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) { e.preventDefault(); add(addBtn.dataset.add); openCart(); return; }
    const open = e.target.closest("[data-open]");
    if (open && P[open.dataset.open]) { e.preventDefault(); openProduct(open.dataset.open); return; }
    if (e.target.closest("[data-cart-open]")) { e.preventDefault(); openCart(); }
  });

  updateCount();
})();
