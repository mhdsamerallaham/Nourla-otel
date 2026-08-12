export const SUSTAINABILITY_METRICS = [
  { value: "%80", label: { tr: "Güneş Enerjisi", en: "Solar Powered", de: "Solarenergie", ru: "Солнечная Энергия" }, desc: { tr: "Mikro GES panelleri", en: "On-site micro solar grid", de: "Solarenergie auf dem Dach", ru: "Солнечные панели" } },
  { value: "%0", label: { tr: "Plastik Kullanımı", en: "Single-Use Plastic", de: "Einwegplastik", ru: "Одноразовый Пластик" }, desc: { tr: "Doldurulabilir seramik kaplar", en: "Refillable ceramic vessels", de: "Wiederbefüllbare Keramik", ru: "Заправляемая керамика" } },
  { value: "%100", label: { tr: "Organik Ege Serası", en: "Organic Garden", de: "Bio-Garten", ru: "Органический Сад" }, desc: { tr: "Tarladan sofraya lezzetler", en: "Farm-to-table produce", de: "Vom Feld auf den Tisch", ru: "От фермы к столу" } },
  { value: "%65", label: { tr: "Kadın Liderliği", en: "Female Leadership", de: "Frauenführung", ru: "Женщины-Руководители" }, desc: { tr: "Yönetim & kooperatif ortağı", en: "Executive & local partners", de: "Führung & Kooperativen", ru: "Руководители и партнеры" } }
];

export const SUSTAINABILITY_SECTIONS = [
  {
    id: "env-policy",
    slug: "environmental-policy",
    title: {
      tr: "Çevre Politikamız & Sıfır Atık Doktrini",
      en: "Environmental Policy & Zero Waste Doctrine",
      de: "Umweltpolitik & Zero-Waste-Doktrin",
      ru: "Экологическая Политика и Ноль Отходов"
    },
    subtitle: {
      tr: "Ege'nin biyoçeşitliliğini koruyan plastik-siz sürdürülebilir lüks.",
      en: "Preserving Aegean biodiversity with zero single-use plastics.",
      de: "Schutz der ägäischen Artenvielfalt ohne Einwegplastik.",
      ru: "Защита биоразнообразия Эгейского моря без пластика."
    },
    image: "/nourla/dış cephe/WhatsApp Image 2026-07-23 at 18.42.47 (7).jpeg",
    icon: "Leaf",
    content: {
      tr: "Nourla Boutique Hotel olarak, tek kullanımlık plastik kullanımını tamamen kaldırdık. Banyo ürünlerimizde organik Urla zeytinyağı bazı ve özel yapım el seramiği kaplar tercih ediyoruz. Mutfak ve bahçe atıklarımız otel içi kompost tesisimizde dönüşerek botanik zeytin bahçemizi beslemektedir.",
      en: "At Nourla Boutique Hotel, single-use plastics are strictly banned. BESPKE ceramic vessels house our organic olive oil amenities, while kitchen organic waste is transformed into nutrient compost for our botanical olive grove.",
      de: "Einwegplastik ist vollständig eliminiert. Keramikgefäße und Kompostierung prägen unser Handeln.",
      ru: "Одноразовый пластик полностью запрещен. Органика компостируется для оливкового сада."
    }
  },
  {
    id: "energy",
    slug: "energy-efficiency",
    title: {
      tr: "Yenilenebilir Güneş Enerjisi & Akıllı İklimlendirme",
      en: "Renewable Solar Energy & Smart Climate Control",
      de: "Solarenergie & Intelligente Klimatisierung",
      ru: "Солнечная Энергия и Умный Климат-Контроль"
    },
    subtitle: {
      tr: "Otelimizin enerjisinin %80'ini mikro güneş tarlamızdan karşılıyoruz.",
      en: "Generating 80% of our hotel electricity via on-site solar installation.",
      de: "80 % unseres Strombedarfs wird durch Solarenergie erzeugt.",
      ru: "80% энергии отеля генерируется солнечными панелями."
    },
    image: "/nourla/dış cephe/WhatsApp Image 2026-07-23 at 18.42.48 (1).jpeg",
    icon: "Sun",
    content: {
      tr: "Çatı ve arazi tipi entegre mikro güneş panellerimiz ile otelimizin elektrik ve sıcak su ihtiyacını doğadan alıyoruz. Tüm süitlerimizde A+++ enerji verimlilik sınıfına sahip inverter ısı pompaları ve akıllı varlık sensörlü LED aydınlatmalar kullanılmaktadır.",
      en: "Our integrated solar panels generate electric power and hot water naturally. A+++ inverter heat pumps and smart occupancy sensors optimize climate comfort while minimizing energy consumption.",
      de: "Integrierte Solaranlagen erzeugen Strom und Warmwasser. A+++ Inverter-Wärmepumpen sparen Energie.",
      ru: "Солнечные панели обеспечивают электричество и горячую воду. Инверторные насосы A+++ экономят ресурсы."
    }
  },
  {
    id: "child-rights",
    slug: "child-rights",
    title: {
      tr: "Çocuk Hakları & Yerel Eğitim Fonu",
      en: "Child Rights & Local Education Fund",
      de: "Kinderrechte & Lokaler Bildungsfonds",
      ru: "Права Ребенка и Образовательный Фонд"
    },
    subtitle: {
      tr: "Urla'daki çocukların nitelikli eğitime erişimi ve sanat desteği.",
      en: "Funding educational and artistic access for local children in Urla.",
      de: "Förderung von Bildung und Kunst für Kinder in Urla.",
      ru: "Поддержка доступа к образованию для детей Урлы."
    },
    image: "/nourla/lobi/WhatsApp Image 2026-07-23 at 18.43.58.jpeg",
    icon: "HeartHandshake",
    content: {
      tr: "Çocuk hakları koruma ilkelerine sıkı sıkıya bağlıyız. Her yıl konaklama gelirlerimizin %2'sini Urla köy okullarının kütüphane, çevre ve seramik atölyesi ihtiyaçlarına doğrudan fon olarak aktarıyoruz.",
      en: "We maintain strict child protection standards. Annually, 2% of room revenues fund libraries, environmental workshops, and art ateliers across local village schools in Urla.",
      de: "Wir spenden 2 % unserer Einnahmen an lokale Schul- und Kunstprojekte in Urla.",
      ru: "Отель отчисляет 2% дохода от номеров на поддержку школьных библиотек и арт-мастерских Урлы."
    }
  },
  {
    id: "gender-equality",
    slug: "gender-equality",
    title: {
      tr: "Toplumsal Cinsiyet Eşitliği & Kadın Kooperatifleri",
      en: "Gender Equality & Female Artisan Cooperatives",
      de: "Gleichberechtigung & Frauenkooperativen",
      ru: "Гендерное Равенство и Кооперативы Женщин"
    },
    subtitle: {
      tr: "Yönetim ekibimizin %65'i kadın liderlerden oluşmaktadır.",
      en: "65% female leadership across management and executive roles.",
      de: "65 % weibliche Führungskräfte im Management.",
      ru: "65% руководящих позиций отеля занимают женщины."
    },
    image: "/nourla/lobi/WhatsApp Image 2026-07-23 at 18.43.57 (4).jpeg",
    icon: "Users",
    content: {
      tr: "Nourla'da eşit işe eşit ücret ilkesi esastır. Urla Kadın Kooperatifleri ile ortaklaşa çalışarak süitlerimizdeki el dokuması ketenleri, reçelleri ve seramik servis takımlarını yerel kadın üreticilerden doğrudan temin ediyoruz.",
      en: "Equal pay for equal work defines our culture. Partnering with Urla Women Cooperatives, we source hand-woven linens, organic preserves, and ceramics directly from local female artisans.",
      de: "Gleicher Lohn für gleiche Arbeit und Kooperationen mit Urla Frauenkooperativen zeichnen uns aus.",
      ru: "Равная оплата труда и закупка текстиля и джемов у Женского Кооператива Урлы."
    }
  }
];

export const SURVEY_QUESTIONS = [
  {
    id: 1,
    question: {
      tr: "Konaklamanız sırasında oda çarşaflarının değişim sıklığı tercihinizi seçiniz:",
      en: "Select your preferred linen change frequency during your stay:",
      de: "Wählen Sie die bevorzugte Wechselfrequenz für Bettwäsche:",
      ru: "Выберите предпочтительную частоту смены белья:"
    },
    options: [
      { text: { tr: "Her 3 günde bir (Su & Enerji Tasarrufu)", en: "Every 3 days (Water & Energy Saving)", de: "Alle 3 Tage (Wasser- & Energiesparen)", ru: "Раз в 3 дня (Экономия воды)" }, score: 15 },
      { text: { tr: "Sadece talep ettiğimde", en: "Only upon request", de: "Nur auf Anfrage", ru: "Только по запросу" }, score: 15 },
      { text: { tr: "Her gün", en: "Daily", de: "Täglich", ru: "Каждый день" }, score: 5 }
    ]
  },
  {
    id: 2,
    question: {
      tr: "Otelimizdeki plastik ambalajsız ve refill seramik banyo ürünleri deneyiminiz nasıl?",
      en: "How was your experience with our plastic-free refillable bath products?",
      de: "Wie bewerten Sie unsere nachfüllbaren plastikfreien Pflegeprodukte?",
      ru: "Как вы оцениваете наши заправляемые средства гигиены без пластика?"
    },
    options: [
      { text: { tr: "Mükemmel, çok memnun kaldım", en: "Excellent, loved it", de: "Ausgezeichnet, sehr zufrieden", ru: "Отлично, очень понравилось" }, score: 15 },
      { text: { tr: "İyi", en: "Good", de: "Gut", ru: "Хорошо" }, score: 10 },
      { text: { tr: "Geleneksel ambalajları tercih ederim", en: "Prefer conventional packaging", de: "Bevorzuge traditionelle Verpackung", ru: "Предпочитаю традиционную упаковку" }, score: 5 }
    ]
  },
  {
    id: 3,
    question: {
      tr: "Urla Bağ Yolu ve yerel üretici eko-turlarına katılmak ister misiniz?",
      en: "Would you participate in Urla Wine Route & local artisan eco-tours?",
      de: "Möchten Sie an Urla-Weinstraßen-Ökotouren teilnehmen?",
      ru: "Хотели бы вы принять участие в эко-турах по винодельням Урлы?"
    },
    options: [
      { text: { tr: "Kesinlikle evet", en: "Definitely yes", de: "Auf jeden Fall", ru: "Определенно да" }, score: 15 },
      { text: { tr: "Belki", en: "Maybe", de: "Vielleicht", ru: "Возможно" }, score: 10 },
      { text: { tr: "İlgilenmiyorum", en: "Not interested", de: "Nicht interessiert", ru: "Не интересует" }, score: 5 }
    ]
  }
];
