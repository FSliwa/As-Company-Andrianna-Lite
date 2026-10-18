/**
 * Sklep /sklep (src/views/Shop.jsx) – PL = źródło, en/ru – tłumaczenia w tej samej strukturze.
 *
 *  - shopDict – teksty strony (hero, kategorie, produkty, zamówienie, pas zamykający) i wiersza
 *    produktu (src/components/shop/ShopRow.jsx). Klocki katalogu z src/components/pigments mają
 *    w wersji Lite teksty wpisane w komponentach (po polsku).
 *
 * Nazwy kategorii – słowa klientki z 18.10.2026 („W sklepie: Pigmenty, Maszynki, Kartridże,
 * Akcesoria do rysunku, Akcesoria do ćwiczeń, Środki zabiegowe, Lampy, Lasery”); nagłówek
 * strony – zdanie filaru „Produkty” ze strony głównej (PILLARS[0].desc w site.js), bez nowych treści.
 * Nazwy i opisy produktów – z danych sklepu (src/data/shop.json, tylko po polsku).
 */

import { plural } from '@/i18n/format';

const NBSP = ' ';

const plProducts = (n) => plural('pl', n, { one: 'produkt', few: 'produkty', many: 'produktów' });
const enProducts = (n) => plural('en', n, { one: 'product', other: 'products' });
const ruProducts = (n) => plural('ru', n, { one: 'товар', few: 'товара', many: 'товаров' });

export const shopDict = {
  pl: {
    hero: {
      label: 'Sklep',
      title: 'Profesjonalne narzędzia i pigmenty',
      titleAccent: 'tworzone przez praktyków dla praktyków.',
      lead: 'Pigmenty, maszynki, kartridże, akcesoria do rysunku i ćwiczeń, środki zabiegowe, lampy i lasery. Wybierz produkty i wyślij zapytanie.',
      browse: 'Przeglądaj sklep',
      how: 'Jak zamówić',
    },
    categories: {
      label: 'Kategorie',
      title: 'W sklepie.',
      count: (n) => `${n} ${plProducts(n)}`,
      shades: (n) => `${n} ${plural('pl', n, { one: 'odcień', few: 'odcienie', many: 'odcieni' })}`,
      machine: 'Maszynka AS PRINCESS',
      onRequest: 'Na zapytanie',
      navLabel: 'Kategorie sklepu',
    },
    products: {
      label: 'Produkty',
      title: 'Produkty.',
      lead: 'Dodane produkty trafiają na listę „Twoje zamówienie” – tę samą co pigmenty – którą wysyłasz jako zapytanie.',
      listLabel: (name) => `Produkty: ${name}`,
      showAll: (n) => `Pokaż wszystkie (${n})`,
      showLess: 'Pokaż mniej',
      satelliteAlt: 'Kartridże SATELLITE – opakowanie',
      empty: 'Zapytaj o dostępne modele – odpowiemy z ofertą.',
      ask: 'Zapytaj o dostępność',
      pricesAsOf: (date) => `Ceny standardowe na ${date}, bez kosztów dostawy.`,
      pricesStale: (date) => `Ceny z${NBSP}${date} mogą być nieaktualne – potwierdzimy je w odpowiedzi na zapytanie.`,
    },
    how: {
      label: 'Zamówienie',
      title: 'Jak zamówić.',
      lead: 'Zamówienie to zapytanie o listę produktów – odpowiadamy z dostępnością i łączną kwotą.',
      steps: [
        {
          number: '01',
          title: 'Wybierz produkty',
          text: 'Dodaj produkty do listy „Twoje zamówienie”. Przy kartridżach wybierz sztukę albo opakowanie – ilość zmienisz na liście.',
        },
        /* tekst kroku 02 – kanał, który naprawdę działa (jak na /pigmenty): sendForm / sendInstagram */
        { number: '02', title: 'Wyślij zapytanie' },
        {
          number: '03',
          title: 'Potwierdzimy szczegóły',
          text: 'Odpiszemy z informacją o dostępności, łączną kwotą oraz sposobem dostawy i płatności.',
        },
      ],
    },
    send: {
      form: 'Podaj imię i telefon lub e-mail, a potem wyślij listę.',
      instagram: (handle) => `Skopiuj listę i wyślij ją na Instagramie – ${handle}.`,
      notPurchase: 'To zapytanie – na tym etapie nic nie kupujesz ani nie płacisz.',
    },
    order: {
      yourOrder: 'Twoje zamówienie',
      yourOrderCount: (n) => `Twoje zamówienie (${n})`,
      added: (what) => `Dodano do zamówienia: ${what}.`,
      inOrder: (n) => `W zamówieniu: ${n}`,
    },
    cell: {
      add: 'Dodaj',
      addTo: (what) => `Dodaj do zamówienia: ${what}`,
      details: 'szczegóły',
      out: 'Brak w magazynie',
    },
    closing: {
      label: 'Zamówienie',
      title: 'Twoja lista',
      titleAccent: 'produktów.',
      leadForm: 'Wyślij listę jako zapytanie',
      leadInstagram: (handle) => `Skopiuj listę i wyślij ją na Instagramie (${handle})`,
      leadRest: ' – potwierdzimy dostępność, łączną kwotę oraz sposób dostawy i płatności.',
      contact: 'Napisz do nas',
    },
  },

  en: {
    hero: {
      label: 'Shop',
      title: 'Professional tools and pigments',
      titleAccent: 'made by practitioners for practitioners.',
      lead: 'Pigments, machines, cartridges, drawing and practice accessories, treatment products, lamps and lasers. Choose your products and send an enquiry.',
      browse: 'Browse the shop',
      how: 'How to order',
    },
    categories: {
      label: 'Categories',
      title: 'In the shop.',
      count: (n) => `${n} ${enProducts(n)}`,
      shades: (n) => `${n} ${plural('en', n, { one: 'shade', other: 'shades' })}`,
      machine: 'AS PRINCESS machine',
      onRequest: 'On request',
      navLabel: 'Shop categories',
    },
    products: {
      label: 'Products',
      title: 'Products.',
      lead: 'The products you add go to the “Your order” list – the same one as for pigments – which you send as an enquiry.',
      listLabel: (name) => `Products: ${name}`,
      showAll: (n) => `Show all (${n})`,
      showLess: 'Show fewer',
      satelliteAlt: 'SATELLITE cartridges – packaging',
      empty: 'Ask about the models available – we’ll reply with an offer.',
      ask: 'Ask about availability',
      pricesAsOf: (date) => `Standard prices as of ${date}, excluding delivery.`,
      pricesStale: (date) => `Prices as of ${date} may be out of date – we’ll confirm them in our reply to your enquiry.`,
    },
    how: {
      label: 'Ordering',
      title: 'How to order.',
      lead: 'An order is an enquiry about a list of products – we reply with availability and the total amount.',
      steps: [
        {
          title: 'Choose your products',
          text: 'Add products to the “Your order” list. For cartridges, choose a single piece or a box – you can change the quantity on the list.',
        },
        { title: 'Send an enquiry' },
        {
          title: 'We’ll confirm the details',
          text: 'We’ll reply with availability, the total amount and the delivery and payment options.',
        },
      ],
    },
    send: {
      form: 'Enter your name and a phone number or email, then send the list.',
      instagram: (handle) => `Copy the list and send it on Instagram – ${handle}.`,
      notPurchase: 'This is an enquiry – at this stage you aren’t buying or paying for anything.',
    },
    order: {
      yourOrder: 'Your order',
      yourOrderCount: (n) => `Your order (${n})`,
      added: (what) => `Added to your order: ${what}.`,
      inOrder: (n) => `In your order: ${n}`,
    },
    cell: {
      add: 'Add',
      addTo: (what) => `Add to order: ${what}`,
      details: 'details',
      out: 'Out of stock',
    },
    closing: {
      label: 'Ordering',
      title: 'Your list',
      titleAccent: 'of products.',
      leadForm: 'Send the list as an enquiry',
      leadInstagram: (handle) => `Copy the list and send it on Instagram (${handle})`,
      leadRest: ' – we’ll confirm availability, the total amount and the delivery and payment options.',
      contact: 'Write to us',
    },
  },

  ru: {
    hero: {
      label: 'Магазин',
      title: 'Профессиональные инструменты и пигменты,',
      titleAccent: 'созданные практиками для практиков.',
      lead: 'Пигменты, машинки, картриджи, аксессуары для эскиза и тренировки, средства для процедур, лампы и лазеры. Выберите товары и отправьте запрос.',
      browse: 'Смотреть магазин',
      how: 'Как заказать',
    },
    categories: {
      label: 'Категории',
      title: 'В магазине.',
      count: (n) => `${n} ${ruProducts(n)}`,
      shades: (n) => `${n} ${plural('ru', n, { one: 'оттенок', few: 'оттенка', many: 'оттенков' })}`,
      machine: 'Машинка AS PRINCESS',
      onRequest: 'По запросу',
      navLabel: 'Категории магазина',
    },
    products: {
      label: 'Товары',
      title: 'Товары.',
      lead: 'Добавленные товары попадают в список «Ваш заказ» – тот же, что и для пигментов, – который вы отправляете как запрос.',
      listLabel: (name) => `Товары: ${name}`,
      showAll: (n) => `Показать все (${n})`,
      showLess: 'Свернуть',
      satelliteAlt: 'Картриджи SATELLITE – упаковка',
      empty: 'Спросите о доступных моделях – мы ответим с предложением.',
      ask: 'Спросить о наличии',
      pricesAsOf: (date) => `Стандартные цены на ${date}, без стоимости доставки.`,
      pricesStale: (date) => `Цены на ${date} могут быть неактуальны – мы подтвердим их в ответе на запрос.`,
    },
    how: {
      label: 'Заказ',
      title: 'Как заказать.',
      lead: 'Заказ – это запрос по списку товаров: в ответ мы сообщим о наличии и общей сумме.',
      steps: [
        {
          title: 'Выберите товары',
          text: 'Добавьте товары в список «Ваш заказ». Для картриджей выберите штуку или упаковку – количество можно изменить в списке.',
        },
        { title: 'Отправьте запрос' },
        {
          title: 'Мы подтвердим детали',
          text: 'В ответе сообщим о наличии, общей сумме, а также о способе доставки и оплаты.',
        },
      ],
    },
    send: {
      form: 'Укажите имя и телефон или e-mail, затем отправьте список.',
      instagram: (handle) => `Скопируйте список и отправьте его в Instagram – ${handle}.`,
      notPurchase: 'Это запрос – на этом этапе вы ничего не покупаете и не оплачиваете.',
    },
    order: {
      yourOrder: 'Ваш заказ',
      yourOrderCount: (n) => `Ваш заказ (${n})`,
      added: (what) => `Добавлено в заказ: ${what}.`,
      inOrder: (n) => `В заказе: ${n}${NBSP}шт.`,
    },
    cell: {
      add: 'В заказ',
      addTo: (what) => `Добавить в заказ: ${what}`,
      details: 'подробнее',
      out: 'Нет в наличии',
    },
    closing: {
      label: 'Заказ',
      title: 'Ваш список',
      titleAccent: 'товаров.',
      leadForm: 'Отправьте список как запрос',
      leadInstagram: (handle) => `Скопируйте список и отправьте его в Instagram (${handle})`,
      leadRest: ' – мы подтвердим наличие, общую сумму, а также способ доставки и оплаты.',
      contact: 'Написать нам',
    },
  },
};
