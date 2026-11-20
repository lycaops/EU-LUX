export const LANGS = [
  { code: "en", label: "English", short: "EN", locale: "en-GB", dir: "ltr" },
  { code: "it", label: "Italiano", short: "IT", locale: "it-IT", dir: "ltr" },
  { code: "fr", label: "Français", short: "FR", locale: "fr-FR", dir: "ltr" },
  { code: "es", label: "Español", short: "ES", locale: "es-ES", dir: "ltr" },
  { code: "de", label: "Deutsch", short: "DE", locale: "de-DE", dir: "ltr" },
  { code: "ar", label: "العربية", short: "AR", locale: "ar-AE", dir: "rtl" },
];

export const DEFAULT_LANG = "en";

export function detectLang(navLang) {
  const base = (navLang || "").toLowerCase().slice(0, 2);
  return LANGS.some((l) => l.code === base) ? base : DEFAULT_LANG;
}

export function formatDate(value, lang, opts = { dateStyle: "full" }) {
  if (!value) return "";
  const l = LANGS.find((x) => x.code === lang)?.locale || "en-GB";
  return new Intl.DateTimeFormat(l, opts).format(new Date(value));
}

export function formatTime(value, lang) {
  if (!value) return "";
  const l = LANGS.find((x) => x.code === lang)?.locale || "en-GB";
  return new Intl.DateTimeFormat(l, { timeStyle: "short" }).format(new Date(value));
}

export function formatMoney(amount, lang, currency = "EUR") {
  const l = LANGS.find((x) => x.code === lang)?.locale || "en-GB";
  return new Intl.NumberFormat(l, { style: "currency", currency }).format(amount);
}

export const dict = {
  en: {
    nav: { home: "Home", fleet: "Fleet", interior: "Interior", services: "Services", account: "My Account", book: "Book Now" },
    lang: { suggest: "View this site in English?", yes: "Yes", no: "No thanks" },
    s1: { eyebrow: "EU Luxury Tours & Travels", title: "Your Journey. Our Privilege.", body: "Exceptional chauffeur experiences. Wherever life takes you.", cta1: "Book your journey", cta2: "Discover our experience" },
    s2: { eyebrow: "The Arrival", title: "Arrive in Distinction.", body: "Mercedes-Benz V-Class V250, presented at the door of Italy's finest addresses." },
    s3: { eyebrow: "The Exterior", title: "Designed for Excellence.", body: "Refined lines, deep black lacquer and quiet authority on every road." },
    s4: { eyebrow: "The Journey", title: "Every Mile, Exceptional.", body: "From Tuscan vineyards to the shores of Lake Como, the road becomes part of the experience." },
    s5: { eyebrow: "The Interior", title: "Travel Beyond Expectations.", body: "Spacious cabin, premium leather seating and absolute passenger comfort." },
    s6: { eyebrow: "The Experience", title: "Your Time. Your Comfort. Your Journey.", body: "Your chauffeur opens the door. The rest is taken care of." },
    s7: { eyebrow: "The Booking", title: "Your Journey Starts Here.", body: "" },
    details: {
      luggage: "Luggage",
      cabinFeatures: ["Roomy rear lounge", "Comfort-focused climate", "Space for your belongings"],
      servicesTitle: "Chauffeur services",
      services: [
        { title: "Airport Transfer", body: "Door-to-door pick-ups and drop-offs, timed around your flight." },
        { title: "City Transfer", body: "Private, punctual journeys across the city." },
        { title: "Corporate Travel", body: "Executive transport for meetings and business schedules." },
        { title: "Private Tour", body: "Explore Italy at your own pace with your chauffeur." },
        { title: "Hourly Chauffeur", body: "A dedicated vehicle and chauffeur, available by the hour." },
        { title: "Weddings & Events", body: "Considered chauffeur service for your special occasion." },
      ],
    },
    booking: { pickup: "Pick-up", dropoff: "Drop-off", date: "Date", time: "Time", pax: "Passengers", cta: "Book now", preview: "Your pick-up", pickupPh: "Address, airport or hotel", dropoffPh: "Destination" },
    bookPage: { title: "Your journey request", note: "Full booking, pricing and payment arrive in the next release. Your details:" },
    footer: { about: "Premium chauffeur service (NCC) across Italy and Europe.", contact: "Contact", legal: "Legal", vat: "VAT Number", rights: "All rights reserved.", privacy: "Privacy Policy", terms: "Terms & Conditions" },
  },
  it: {
    nav: { home: "Home", fleet: "Flotta", interior: "Interni", services: "Servizi", account: "Area Cliente", book: "Prenota" },
    lang: { suggest: "Visualizzare il sito in italiano?", yes: "Sì", no: "No, grazie" },
    s1: { eyebrow: "EU Luxury Tours & Travels", title: "Il Tuo Viaggio. Il Nostro Privilegio.", body: "Esperienze con autista di livello eccezionale. Ovunque la vita ti porti.", cta1: "Prenota il tuo viaggio", cta2: "Scopri la nostra esperienza" },
    s2: { eyebrow: "L'Arrivo", title: "Arriva con Distinzione.", body: "Mercedes-Benz Classe V V250, davanti ai più prestigiosi indirizzi d'Italia." },
    s3: { eyebrow: "L'Esterno", title: "Progettata per l'Eccellenza.", body: "Linee raffinate, nero profondo e discreta autorevolezza su ogni strada." },
    s4: { eyebrow: "Il Viaggio", title: "Ogni Chilometro, Straordinario.", body: "Dai vigneti toscani alle rive del Lago di Como, la strada diventa parte dell'esperienza." },
    s5: { eyebrow: "L'Interno", title: "Viaggia Oltre le Aspettative.", body: "Abitacolo spazioso, sedili in pelle pregiata e massimo comfort per i passeggeri." },
    s6: { eyebrow: "L'Esperienza", title: "Il Tuo Tempo. Il Tuo Comfort. Il Tuo Viaggio.", body: "Il tuo autista apre la porta. Al resto pensiamo noi." },
    s7: { eyebrow: "La Prenotazione", title: "Il Tuo Viaggio Inizia Qui.", body: "" },
    details: {
      luggage: "Bagagli",
      cabinFeatures: ["Ampia zona posteriore", "Climatizzazione confortevole", "Spazio per i tuoi bagagli"],
      servicesTitle: "Servizi con autista",
      services: [
        { title: "Trasferimenti aeroportuali", body: "Servizio porta a porta, organizzato in base al tuo volo." },
        { title: "Trasferimenti in città", body: "Spostamenti privati e puntuali in città." },
        { title: "Viaggi aziendali", body: "Trasporto executive per riunioni e impegni di lavoro." },
        { title: "Tour privati", body: "Scopri l'Italia al tuo ritmo con il tuo autista." },
        { title: "Autista a ore", body: "Veicolo e autista dedicati, disponibili a ore." },
        { title: "Matrimoni ed eventi", body: "Servizio con autista per le tue occasioni speciali." },
      ],
    },
    booking: { pickup: "Partenza", dropoff: "Destinazione", date: "Data", time: "Ora", pax: "Passeggeri", cta: "Prenota ora", preview: "Il tuo ritiro", pickupPh: "Indirizzo, aeroporto o hotel", dropoffPh: "Destinazione" },
    bookPage: { title: "La tua richiesta di viaggio", note: "Prenotazione completa, tariffe e pagamento arriveranno nella prossima versione. I tuoi dati:" },
    footer: { about: "Servizio NCC di alta gamma in Italia e in Europa.", contact: "Contatti", legal: "Informazioni legali", vat: "Partita IVA", rights: "Tutti i diritti riservati.", privacy: "Informativa sulla Privacy", terms: "Termini e Condizioni" },
  },
  fr: {
    nav: { home: "Accueil", fleet: "Flotte", interior: "Intérieur", services: "Services", account: "Mon Espace", book: "Réserver" },
    lang: { suggest: "Afficher le site en français ?", yes: "Oui", no: "Non merci" },
    s1: { eyebrow: "EU Luxury Tours & Travels", title: "Votre Voyage. Notre Privilège.", body: "Des expériences avec chauffeur d'exception. Où que la vie vous mène.", cta1: "Réserver votre voyage", cta2: "Découvrir notre expérience" },
    s2: { eyebrow: "L'Arrivée", title: "Arrivez avec Distinction.", body: "Mercedes-Benz Classe V V250, à la porte des plus belles adresses d'Italie." },
    s3: { eyebrow: "L'Extérieur", title: "Conçue pour l'Excellence.", body: "Des lignes raffinées, un noir profond et une autorité discrète sur chaque route." },
    s4: { eyebrow: "Le Voyage", title: "Chaque Kilomètre, Exceptionnel.", body: "Des vignobles toscans aux rives du lac de Côme, la route fait partie de l'expérience." },
    s5: { eyebrow: "L'Intérieur", title: "Voyagez au-delà des Attentes.", body: "Habitacle spacieux, sellerie cuir haut de gamme et confort absolu pour les passagers." },
    s6: { eyebrow: "L'Expérience", title: "Votre Temps. Votre Confort. Votre Voyage.", body: "Votre chauffeur ouvre la porte. Nous nous occupons du reste." },
    s7: { eyebrow: "La Réservation", title: "Votre Voyage Commence Ici.", body: "" },
    details: {
      luggage: "Bagages",
      cabinFeatures: ["Espace arrière généreux", "Climatisation confortable", "Place pour vos effets personnels"],
      servicesTitle: "Services avec chauffeur",
      services: [
        { title: "Transferts aéroport", body: "Prise en charge porte-à-porte, adaptée à votre vol." },
        { title: "Transferts urbains", body: "Des trajets privés et ponctuels en ville." },
        { title: "Déplacements professionnels", body: "Un transport exécutif pour vos réunions et rendez-vous." },
        { title: "Visites privées", body: "Découvrez l'Italie à votre rythme avec votre chauffeur." },
        { title: "Chauffeur à l'heure", body: "Un véhicule et un chauffeur dédiés, disponibles à l'heure." },
        { title: "Mariages et événements", body: "Un service avec chauffeur pour vos moments importants." },
      ],
    },
    booking: { pickup: "Prise en charge", dropoff: "Destination", date: "Date", time: "Heure", pax: "Passagers", cta: "Réserver", preview: "Votre prise en charge", pickupPh: "Adresse, aéroport ou hôtel", dropoffPh: "Destination" },
    bookPage: { title: "Votre demande de trajet", note: "La réservation complète, les tarifs et le paiement arrivent dans la prochaine version. Vos informations :" },
    footer: { about: "Service de chauffeur privé (NCC) haut de gamme en Italie et en Europe.", contact: "Contact", legal: "Mentions légales", vat: "Numéro de TVA", rights: "Tous droits réservés.", privacy: "Politique de confidentialité", terms: "Conditions générales" },
  },
  es: {
    nav: { home: "Inicio", fleet: "Flota", interior: "Interior", services: "Servicios", account: "Mi Cuenta", book: "Reservar" },
    lang: { suggest: "¿Ver el sitio en español?", yes: "Sí", no: "No, gracias" },
    s1: { eyebrow: "EU Luxury Tours & Travels", title: "Su Viaje. Nuestro Privilegio.", body: "Experiencias excepcionales con chófer. Dondequiera que la vida le lleve.", cta1: "Reserve su viaje", cta2: "Descubra nuestra experiencia" },
    s2: { eyebrow: "La Llegada", title: "Llegue con Distinción.", body: "Mercedes-Benz Clase V V250, a la puerta de las mejores direcciones de Italia." },
    s3: { eyebrow: "El Exterior", title: "Diseñada para la Excelencia.", body: "Líneas refinadas, negro profundo y discreta autoridad en cada carretera." },
    s4: { eyebrow: "El Viaje", title: "Cada Kilómetro, Excepcional.", body: "De los viñedos toscanos a las orillas del lago de Como, el camino forma parte de la experiencia." },
    s5: { eyebrow: "El Interior", title: "Viaje más Allá de lo Esperado.", body: "Habitáculo espacioso, asientos de piel de primera y máximo confort para los pasajeros." },
    s6: { eyebrow: "La Experiencia", title: "Su Tiempo. Su Confort. Su Viaje.", body: "Su chófer le abre la puerta. De lo demás nos ocupamos nosotros." },
    s7: { eyebrow: "La Reserva", title: "Su Viaje Comienza Aquí.", body: "" },
    details: {
      luggage: "Equipaje",
      cabinFeatures: ["Amplia zona trasera", "Climatización confortable", "Espacio para sus pertenencias"],
      servicesTitle: "Servicios con chófer",
      services: [
        { title: "Traslados al aeropuerto", body: "Recogida puerta a puerta según el horario de su vuelo." },
        { title: "Traslados urbanos", body: "Trayectos privados y puntuales por la ciudad." },
        { title: "Viajes corporativos", body: "Transporte ejecutivo para reuniones y compromisos de trabajo." },
        { title: "Tour privado", body: "Descubra Italia a su ritmo con su chófer." },
        { title: "Chófer por horas", body: "Vehículo y chófer exclusivos disponibles por horas." },
        { title: "Bodas y eventos", body: "Servicio de chófer para sus ocasiones especiales." },
      ],
    },
    booking: { pickup: "Recogida", dropoff: "Destino", date: "Fecha", time: "Hora", pax: "Pasajeros", cta: "Reservar ahora", preview: "Su recogida", pickupPh: "Dirección, aeropuerto u hotel", dropoffPh: "Destino" },
    bookPage: { title: "Su solicitud de viaje", note: "La reserva completa, las tarifas y el pago llegarán en la próxima versión. Sus datos:" },
    footer: { about: "Servicio de chófer privado (NCC) de lujo en Italia y Europa.", contact: "Contacto", legal: "Aviso legal", vat: "NIF/IVA", rights: "Todos los derechos reservados.", privacy: "Política de privacidad", terms: "Términos y condiciones" },
  },
  de: {
    nav: { home: "Startseite", fleet: "Flotte", interior: "Innenraum", services: "Services", account: "Mein Konto", book: "Jetzt buchen" },
    lang: { suggest: "Diese Website auf Deutsch anzeigen?", yes: "Ja", no: "Nein, danke" },
    s1: { eyebrow: "EU Luxury Tours & Travels", title: "Ihre Reise. Unser Privileg.", body: "Außergewöhnliche Chauffeur-Erlebnisse. Wohin das Leben Sie auch führt.", cta1: "Reise buchen", cta2: "Unser Erlebnis entdecken" },
    s2: { eyebrow: "Die Ankunft", title: "Mit Stil ankommen.", body: "Mercedes-Benz V-Klasse V250, vorgefahren an Italiens erlesensten Adressen." },
    s3: { eyebrow: "Das Exterieur", title: "Für Exzellenz gestaltet.", body: "Edle Linien, tiefschwarzer Lack und stille Souveränität auf jeder Straße." },
    s4: { eyebrow: "Die Reise", title: "Jeder Kilometer, außergewöhnlich.", body: "Von toskanischen Weinbergen bis zum Comer See – die Fahrt wird Teil des Erlebnisses." },
    s5: { eyebrow: "Das Interieur", title: "Reisen über alle Erwartungen hinaus.", body: "Großzügiger Innenraum, hochwertige Ledersitze und höchster Komfort für alle Fahrgäste." },
    s6: { eyebrow: "Das Erlebnis", title: "Ihre Zeit. Ihr Komfort. Ihre Reise.", body: "Ihr Chauffeur öffnet die Tür. Alles Weitere übernehmen wir." },
    s7: { eyebrow: "Die Buchung", title: "Hier beginnt Ihre Reise.", body: "" },
    details: {
      luggage: "Gepäck",
      cabinFeatures: ["Großzügiger Fond", "Angenehme Klimatisierung", "Platz für Ihr Gepäck"],
      servicesTitle: "Chauffeur-Services",
      services: [
        { title: "Flughafentransfer", body: "Abholung von Tür zu Tür, abgestimmt auf Ihren Flug." },
        { title: "Stadttransfers", body: "Private, pünktliche Fahrten innerhalb der Stadt." },
        { title: "Geschäftsreisen", body: "Exklusiver Transport für Meetings und Geschäftstermine." },
        { title: "Private Tour", body: "Entdecken Sie Italien in Ihrem Tempo mit Ihrem Chauffeur." },
        { title: "Chauffeur stundenweise", body: "Ein eigenes Fahrzeug mit Chauffeur, stundenweise verfügbar." },
        { title: "Hochzeiten und Events", body: "Chauffeurservice für besondere Anlässe." },
      ],
    },
    booking: { pickup: "Abholung", dropoff: "Ziel", date: "Datum", time: "Uhrzeit", pax: "Fahrgäste", cta: "Jetzt buchen", preview: "Ihre Abholung", pickupPh: "Adresse, Flughafen oder Hotel", dropoffPh: "Zielort" },
    bookPage: { title: "Ihre Fahrtanfrage", note: "Vollständige Buchung, Preise und Zahlung folgen in der nächsten Version. Ihre Angaben:" },
    footer: { about: "Hochwertiger Chauffeurservice (NCC) in Italien und Europa.", contact: "Kontakt", legal: "Rechtliches", vat: "USt-IdNr.", rights: "Alle Rechte vorbehalten.", privacy: "Datenschutzerklärung", terms: "Allgemeine Geschäftsbedingungen" },
  },
  ar: {
    nav: { home: "الرئيسية", fleet: "الأسطول", interior: "المقصورة", services: "الخدمات", account: "حسابي", book: "احجز الآن" },
    lang: { suggest: "هل تريد عرض الموقع بالعربية؟", yes: "نعم", no: "لا، شكرًا" },
    s1: { eyebrow: "EU Luxury Tours & Travels", title: "رحلتك. شرفنا.", body: "تجارب سائق خاص استثنائية. أينما تأخذك الحياة.", cta1: "احجز رحلتك", cta2: "اكتشف تجربتنا" },
    s2: { eyebrow: "الوصول", title: "صِل بتميّز.", body: "مرسيدس-بنز الفئة V طراز V250، أمام أرقى العناوين في إيطاليا." },
    s3: { eyebrow: "المظهر الخارجي", title: "صُمّمت للتميّز.", body: "خطوط أنيقة وطلاء أسود عميق وحضور هادئ على كل طريق." },
    s4: { eyebrow: "الرحلة", title: "كل كيلومتر استثنائي.", body: "من كروم توسكانا إلى ضفاف بحيرة كومو، يصبح الطريق جزءًا من التجربة." },
    s5: { eyebrow: "المقصورة", title: "سافر بما يفوق التوقعات.", body: "مقصورة رحبة ومقاعد جلدية فاخرة وراحة مطلقة للركاب." },
    s6: { eyebrow: "التجربة", title: "وقتك. راحتك. رحلتك.", body: "سائقك يفتح لك الباب، ونتولى نحن كل ما تبقّى." },
    s7: { eyebrow: "الحجز", title: "رحلتك تبدأ من هنا.", body: "" },
    details: {
      luggage: "الأمتعة",
      cabinFeatures: ["مساحة خلفية رحبة", "تحكم مريح بالمناخ", "مساحة لأمتعتك الشخصية"],
      servicesTitle: "خدمات السائق الخاص",
      services: [
        { title: "النقل من وإلى المطار", body: "استقبال وتوصيل من الباب إلى الباب وفق موعد رحلتك." },
        { title: "التنقل داخل المدينة", body: "رحلات خاصة ودقيقة في أنحاء المدينة." },
        { title: "تنقلات الشركات", body: "نقل تنفيذي للاجتماعات ومواعيد العمل." },
        { title: "جولات خاصة", body: "اكتشف إيطاليا على راحتك مع سائقك الخاص." },
        { title: "سائق بالساعة", body: "مركبة وسائق مخصصان متاحان بالساعة." },
        { title: "حفلات الزفاف والمناسبات", body: "خدمة سائق خاص لمناسباتك المميزة." },
      ],
    },
    booking: { pickup: "مكان الاستلام", dropoff: "الوجهة", date: "التاريخ", time: "الوقت", pax: "عدد الركاب", cta: "احجز الآن", preview: "موعد الاستلام", pickupPh: "العنوان أو المطار أو الفندق", dropoffPh: "الوجهة" },
    bookPage: { title: "طلب رحلتك", note: "سيتوفر الحجز الكامل والأسعار والدفع في الإصدار القادم. بياناتك:" },
    footer: { about: "خدمة سائق خاص (NCC) فاخرة في إيطاليا وأوروبا.", contact: "اتصل بنا", legal: "معلومات قانونية", vat: "الرقم الضريبي", rights: "جميع الحقوق محفوظة.", privacy: "سياسة الخصوصية", terms: "الشروط والأحكام" },
  },
};
