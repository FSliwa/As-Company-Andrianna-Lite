/**
 * Angielskie teksty danych z src/lib/site.js – TYLKO teksty, w tej samej strukturze
 * (listy po indeksie; `undefined` / pusta pozycja = zostaje wartość polska).
 * Ceny, liczby, id i href zostają w site.js i NIE są tu powtarzane – pola `price`
 * zamienia automatycznie localizePriceString (src/i18n/format.js) w getSite().
 * Nazwy własne (techniki, produkty, Babushkina Academy) bez tłumaczenia.
 * Wiersze harmonogramu: [, 'tekst'] – pierwsza pozycja (godzina) zostaje z site.js.
 */
const site = {
  BRAND: {
    claim: 'Professional PMU products, education and expertise created by practitioners.',
    city: 'Warsaw',
  },
  FOUNDER: {
    signature: 'Creator of the Super Natural Brows technique',
  },
  CONTACT: {
    city: 'Warsaw',
    venueNote: 'A detached building with private parking for clients',
    hours: [{ day: 'Visits and training', value: 'By appointment' }],
  },
  NAV_MAIN: [{ label: 'Products' }, { label: 'Training' }, { label: 'Treatments' }, { label: 'About' }, { label: 'Contact' }],
  NAV_ALL: [
    {
      title: 'Products',
      links: [{ label: 'AS OPIUM pigments' }, { label: 'AS PRINCESS & AS HERO machines' }, { label: 'Certificates & REACH compliance' }],
    },
    {
      title: 'Education',
      links: [{ label: 'Training' }, { label: 'Super Natural Brows' }, { label: 'Foundation course' }],
    },
    {
      title: 'Studio',
      links: [{ label: 'Treatments & prices' }, { label: 'Treatment journey' }, { label: 'About us & the studio' }, { label: 'Contact' }],
    },
  ],
  ACHIEVEMENTS: [
    { label: 'First and second places at the World Championships' },
    { label: 'Students trained in hair strokes in the past year' },
    { label: 'Students in our international network' },
    { value: '10 years', label: 'Running studios – Katowice and Warsaw' },
  ],
  PRICING_PMU: {
    title: 'PMU price list',
    subtitle: 'Brows · Lips · Lash line enhancement',
    items: [
      {},
      {},
      {},
      {},
      { name: 'Touch-up within 3 months', note: 'Regardless of the pigmented area' },
    ],
    footnote:
      'A touch-up is done at the client’s request, or is mandatory when working on skin that is oily, porous, has remnants of old permanent makeup, or after removal.',
  },
  PRICING_REFRESH: {
    title: 'Refresh',
    subtitle: 'A refresh for my clients',
    items: [
      { name: 'Refresh within 1.5 years', note: 'Regardless of the pigmented area' },
      { name: 'Refresh within 3 years', note: 'Regardless of the pigmented area' },
      { name: 'Refresh after 3 years', note: 'Regardless of the pigmented area' },
    ],
  },
  PRICING_REMOVAL: {
    title: 'Removal',
    subtitle: 'Laser / remover',
    items: [
      { name: 'Brow PMU removal', note: 'Laser / remover' },
      { name: 'Lip PMU removal', note: 'Laser / remover' },
      { name: 'Eyeliner tail removal', note: 'Laser / remover' },
      { name: 'Brow removal for my clients' },
      { name: 'Small tattoo removal' },
      { name: 'Medium tattoo removal' },
      { name: 'Large tattoo removal', note: 'Individual quote' },
    ],
  },
  COURSES: [
    {
      kicker: 'Machine hair strokes',
      priceNote: 'net',
      format: '14 days online + 2 days in person',
      lead: 'The most demanding, modern and exclusive technique – one that will bring many clients looking for a premium-standard service to your studio.',
      program: [
        {
          label: '14 days of online preparation',
          detail:
            'Tutorial videos with lifetime access. You will receive a workbook with theory and exercises, a notebook and the accessories you need to learn effectively 2 weeks before the course.',
        },
        { label: '2 days of in-person practice', detail: 'Theory exam, practice on training skins, a demonstration, practice on models.' },
        { label: '2 demonstration models', detail: 'A video of the full treatment online and a live demonstration.' },
        { label: '2 practice models', detail: 'With different skin types and patterns.' },
        { label: '2 ways to a quick pre-drawing' },
        { label: '3 patterns', detail: 'Hair-stroke layouts and learning to create patterns.' },
      ],
    },
    {
      title: 'Super Natural Brows – Foundation course',
      kicker: 'From zero to your first clients',
      priceNote: 'net',
      format: '16 days online + 4 days in person',
      lead: 'A complete programme for those starting out in PMU. After the foundation course, you will start working with clients.',
      program: [
        {
          label: '16 days of online preparation',
          detail:
            '40–60 minutes a day. You practise whenever suits you, working through the workbook and watching tutorial videos. We will send you a parcel with the theory workbook, an exercise book, practice accessories and a machine.',
        },
        {
          label: '4 days of in-person practice',
          detail:
            'Before the practical part begins, we check your homework and you pass the theory exam; then intensive practice on training skins and models.',
        },
        { label: '2 demonstration models', detail: '1 online + 1 live.' },
        { label: '4 practice models', detail: 'With different skin types and hair-stroke layouts.' },
        { label: 'A perfect pre-drawing', detail: 'You will learn to do it quickly and efficiently.' },
        { label: 'Correct movement and beautiful healed results', detail: 'You will start working with clients right after the foundation course.' },
      ],
    },
  ],
  COURSE_BENEFITS: [
    'A learning system anyone can follow – you don’t need to know how to paint to learn my technique',
    'Learning to take attractive photos, and marketing',
    'Treatment pricing and its effect on clients',
    'Improving your hand position and a beautiful powder movement',
    'The chance to keep developing at the “Lami effect” Master Class and Workshops – open only to my students',
    'Lifetime guidance and a support group',
    'The option to buy essential PMU products on site and to test the AS Princess machine',
    'Lunch, drinks and snacks included',
  ],
  COURSE_SCHEDULE: [
    {
      day: 'In-person day 1',
      rows: [
        [, 'Students meet: coffee, introductions, payment'],
        [, 'Theory exam, checking and correcting homework, answers to questions, introduction to the training'],
        [, 'Practice on training skins'],
        [, 'Lunch'],
        [, 'Practice on training skins'],
        [, 'Live demonstration on a model'],
        [, 'Answers to questions and end of day one'],
      ],
    },
    {
      day: 'In-person day 2',
      rows: [
        [, 'Practice on training skins'],
        [, 'Lunch'],
        [, 'Practical exam on training skins'],
        [, 'A model for each student’s practice'],
        [, 'Answers to questions and end of day two'],
      ],
    },
    {
      day: 'In-person day 3',
      rows: [
        [, 'Practice on training skins'],
        [, 'A model for each student’s practice'],
        [, 'Lunch'],
        [, 'A model for each student’s practice'],
        [, 'Answers to questions and end of day three'],
      ],
    },
    {
      day: 'In-person day 4',
      rows: [
        [, 'Practice on training skins'],
        [, 'A model for each student’s practice'],
        [, 'Answers to questions'],
        [, 'Lunch with champagne and certificates'],
        [, 'Photo editing and marketing'],
        [, 'Shopping, shopping lists'],
        [, 'End of the training, photos and joining the support groups'],
      ],
    },
  ],
  PRODUCT_LINES: [
    {
      title: 'Pigments',
      desc: 'Carefully developed formulas, intense colours and predictable healing.',
      cta: 'See pigments',
    },
    {
      title: 'Equipment',
      desc: 'Reliable PMU machines designed for precision, comfort and maximum control over your work.',
      cta: 'See equipment',
    },
    {
      title: 'Certificates & quality',
      desc: 'EU REACH compliance, product sheets and the documentation a professional studio requires.',
      cta: 'See certificates',
    },
  ],
  PILLARS: [
    { title: 'Products', desc: 'Professional tools and pigments created by practitioners for practitioners.' },
    { title: 'Training', desc: 'Advanced techniques and support from experts with many years of experience.' },
    { title: 'Practice', desc: 'Everything we do is based on real work and real results.' },
  ],
  TRAINING_PILLARS: [
    { title: 'Technique', desc: 'Modern methods and advanced procedures, step by step.' },
    { title: 'Experience', desc: 'Knowledge built on years of practice and work with thousands of clients.' },
    { title: 'Support', desc: 'An individual approach and help even after the training ends.' },
  ],
};

export default site;
