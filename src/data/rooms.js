/**
 * NOURLA BOUTIQUE HOTEL - ROOM DEFINITIONS
 *
 * SÜİT ODA KATEGORİLERİ
 * - 3219: Standart Oda (STD)
 * - 3220: Tasarım Oda (TSR)
 * - 3221: Superior Tasarım Oda (STSR)
 * - 3222: Süit Oda (SUIT)
 * - 3223: Loft Villa (LOFT)
 */

export const ROOMS_DATA = [
  {
    id: "standart-room",
    elektraRoomTypeId: 3219,
    elektraCode: "STD",
    name: {
      tr: "Standart Oda",
      en: "Standard Room",
      de: "Standard Zimmer",
      ru: "Стандартный Номер"
    },
    price: 320,
    size: "38 m²",
    capacity: "2 Misafir / Guests",
    maxAdults: 2,
    view: {
      tr: "Botanik Bahçe & İç Avlu Manzarası",
      en: "Botanical Garden & Courtyard View",
      de: "Botanischer Garten & Innenhofblick",
      ru: "Вид на ботанический сад и внутренний дворик"
    },
    image: "/nourla/odalar/oda 4/1.jpeg",
    gallery: [
      "/nourla/odalar/oda 4/WhatsApp Image 2026-07-23 at 18.42.42.jpeg",
      "/nourla/odalar/oda 4/WhatsApp Image 2026-07-23 at 18.42.42 (1).jpeg",
      "/nourla/odalar/oda 4/WhatsApp Image 2026-07-23 at 18.42.42 (2).jpeg"
    ],
    features: ["Free WiFi", "AC", "Breakfast", "Private bathroom", "Balcony", "Smart TV", "Mini bar"],
    description: {
      tr: "Doğal güneş ışığını gün boyu içine alan, ahşap tavan detayları ve huzurlu terasıyla samimi Akdeniz odası.",
      en: "Bathed in natural daylight, featuring exposed wooden ceiling beams and a quiet garden terrace.",
      de: "Lichtdurchflutetes Zimmer mit hölzernen Deckenbalken und ruhiger Gartenterrasse.",
      ru: "Уютный номер, наполненный естественным светом, с деревянными балками на потолке и террасой."
    }
  },
  {
    id: "tasarim-room",
    elektraRoomTypeId: 3220,
    elektraCode: "TSR",
    name: {
      tr: "Tasarım Oda",
      en: "Design Room",
      de: "Design Zimmer",
      ru: "Дизайнерский Номер"
    },
    price: 380,
    size: "44 m²",
    capacity: "2 Misafir / Guests",
    maxAdults: 2,
    view: {
      tr: "Portakal Ağaçlı Sessiz İç Avlu",
      en: "Secluded Orange-Tree Courtyard",
      de: "Ruhiger Innenhof mit Orangenbäumen",
      ru: "Уединенный дворик с апельсиновыми деревьями"
    },
    image: "/nourla/odalar/oda 6/1.jpeg",
    gallery: [
      "/nourla/odalar/oda 6/WhatsApp Image 2026-07-23 at 18.42.45.jpeg",
      "/nourla/odalar/oda 6/WhatsApp Image 2026-07-23 at 18.42.44 (3).jpeg",
      "/nourla/odalar/oda 6/WhatsApp Image 2026-07-23 at 18.42.44 (4).jpeg"
    ],
    features: ["Free WiFi", "AC", "Breakfast", "Private bathroom", "Balcony", "Smart TV", "Mini bar"],
    description: {
      tr: "Özel tasarım mobilyalar ve doğal taş dokusu ile döşenmiş, mahremiyeti yüksek Akdeniz odası.",
      en: "Furnished with custom designer pieces and natural stone textures, offering maximal privacy and quiet.",
      de: "Blick auf einen schattigen Innenhof voller Zitrusdüfte mit maximaler Privatsphäre.",
      ru: "Номер с видом на тихий внутренний дворик с цитрусовыми деревьями ve высочайшим уровнем приватности."
    }
  },
  {
    id: "superior-tasarim-room",
    elektraRoomTypeId: 3221,
    elektraCode: "STSR",
    name: {
      tr: "Superior Tasarım Oda",
      en: "Superior Design Room",
      de: "Superior Design Zimmer",
      ru: "Супериор Дизайнерский Номер"
    },
    price: 450,
    size: "52 m²",
    capacity: "2 Misafir / Guests",
    maxAdults: 2,
    view: {
      tr: "Panoramik Zeytin Bahçesi & Havuz Manzarası",
      en: "Panoramic Olive Grove & Pool View",
      de: "Panoramablick auf Olivenhain & Pool",
      ru: "Панорамный вид на оливковую рощу и бассейн"
    },
    image: "/nourla/odalar/oda 1/1.jpeg",
    gallery: [
      "/nourla/odalar/oda 1/WhatsApp Image 2026-07-23 at 18.42.34.jpeg",
      "/nourla/odalar/oda 1/WhatsApp Image 2026-07-23 at 18.42.34 (1).jpeg",
      "/nourla/odalar/oda 1/WhatsApp Image 2026-07-23 at 18.42.34 (2).jpeg"
    ],
    features: ["Free WiFi", "AC", "Breakfast", "Private bathroom", "Balcony", "Smart TV", "Mini bar"],
    description: {
      tr: "Yüzyıllık zeytin ağaçlarının gölgesinde, özel taş verandaya açılan ferah ve rafine bir Akdeniz süiti.",
      en: "A spacious and refined Mediterranean room opening onto a private stone patio under century-old olive trees.",
      de: "Eine geräumige und raffinierte mediterrane Suite mit Blick auf eine private Steinpatio.",
      ru: "Просторный и изысканный эгейский номер с выходом на частную каменную террасу."
    }
  },
  {
    id: "suit-room",
    elektraRoomTypeId: 3222,
    elektraCode: "SUIT",
    name: {
      tr: "Süit Oda",
      en: "Suite Room",
      de: "Suite Zimmer",
      ru: "Люкс Номер"
    },
    price: 550,
    size: "60 m²",
    capacity: "3 Misafir / Guests",
    maxAdults: 3,
    view: {
      tr: "Kesintisiz Ege Denizi & Ufuk Çizgisi",
      en: "Uninterrupted Aegean Sea & Sunset View",
      de: "Unverbauter Ägäis- & Sonnenuntergangsblick",
      ru: "Завораживающий вид на Эгейское море и закат"
    },
    image: "/nourla/odalar/oda 2/1.jpeg",
    gallery: [
      "/nourla/odalar/oda 2/WhatsApp Image 2026-07-23 at 18.42.37.jpeg",
      "/nourla/odalar/oda 2/WhatsApp Image 2026-07-23 at 18.42.37 (1).jpeg",
      "/nourla/odalar/oda 2/WhatsApp Image 2026-07-23 at 18.42.37 (2).jpeg"
    ],
    features: ["Free WiFi", "AC", "Breakfast", "Private bathroom", "Balcony", "Smart TV", "Mini bar"],
    description: {
      tr: "Geniş oturma alanı, küvetli mermer banyosu ve Urla körfezinin büyüleyici gün batımlarını kucaklayan terası olan lüks süit.",
      en: "Luxury suite featuring an expansive lounge area, marble bath with tub, and a private sunset deck.",
      de: "Auf der oberen Etage gelegen mit herrlichem Blick auf die Sonnenuntergänge der Bucht von Urla.",
      ru: "Люкс s просторной гостиной зоной, мраморной ванной и балконом s видом на закаты."
    }
  },
  {
    id: "loft-villa",
    elektraRoomTypeId: 3223,
    elektraCode: "LOFT",
    name: {
      tr: "Loft Villa",
      en: "Loft Villa",
      de: "Loft Villa",
      ru: "Лофт Вилла"
    },
    price: 750,
    size: "85 m²",
    capacity: "3 Misafir / Guests",
    maxAdults: 3,
    view: {
      tr: "Müstakil Bahçeli & Asma Katlı Özel Villa",
      en: "Private Garden & Mezzanine Loft Domain",
      de: "Eigener Garten & Mezzanin Loft",
      ru: "Частный сад и мезонин-лофт"
    },
    image: "/nourla/odalar/oda 7/1.jpeg",
    gallery: [
      "/nourla/odalar/oda 7/WhatsApp Image 2026-07-23 at 18.42.46.jpeg",
      "/nourla/odalar/oda 7/WhatsApp Image 2026-07-23 at 18.42.45 (3).jpeg",
      "/nourla/odalar/oda 7/WhatsApp Image 2026-07-23 at 18.42.45 (4).jpeg"
    ],
    features: ["Free WiFi", "AC", "Breakfast", "Private bathroom", "Balcony", "Smart TV", "Mini bar"],
    description: {
      tr: "Yüksek asma katlı mimarisi, müstakil bahçesi ve lüks detaylarıyla Nourla'nın en prestijli villa konaklama birimi.",
      en: "Nourla's flagship accommodation featuring high vaulted mezzanine ceilings, private garden patio, and luxury amenities.",
      de: "Das Flaggschiff von Nourla mit hohe Decken, privatem Garten und exklusivem Service.",
      ru: "Флагманский вариант проживания s высоким мезонином, собственным садом ve персональным сервисом."
    }
  }
];
