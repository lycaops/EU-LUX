// Legal content for EU Luxury Tours & Travels.
// Provided in English and Italian; other site languages fall back to English.

const COMPANY = {
  name: "EU Luxury Tours & Travels",
  address: "Via Penghe, Selvazzano Dentro, Italy",
  addressIt: "Via Penghe, Selvazzano Dentro, Italia",
  vat: "05599350286",
  email: "eu.luxury.tours@gmail.com",
  phone: "+39 324 6879 934",
};

const en = {
  eyebrow: "Legal",
  labels: { updated: "Last updated", back: "Back to home" },
  banner: {
    title: "We value your privacy",
    body: "We use essential cookies so the website works. With your consent we also use optional cookies to understand how the site is used. You can accept all cookies or refuse the non-essential ones — refusing will not affect your experience.",
    accept: "Accept all",
    reject: "Refuse non-essential",
    settings: "Cookie settings",
    policy: "Privacy Policy",
  },
  privacy: {
    title: "Privacy Policy",
    updated: "25 November 2026",
    sections: [
      {
        heading: "1. Who we are (Data Controller)",
        body: [
          `“EU Luxury Tours & Travels” is a chauffeur service operator (NCC – Noleggio con conducente) based in Italy. We are the data controller responsible for the personal data described in this policy.`,
          `Business details: ${COMPANY.address} · VAT ${COMPANY.vat} · Email: ${COMPANY.email} · Phone: ${COMPANY.phone}.`,
          `This policy explains what personal data we collect, why we collect it, how we use and protect it, and the rights you have under the EU General Data Protection Regulation (Regulation (EU) 2016/679, “GDPR”) and applicable Italian data-protection law.`,
        ],
      },
      {
        heading: "2. Personal data we collect",
        body: ["We collect the following categories of personal data:"],
        list: [
          "Identity and contact data – your name, email address and telephone number.",
          "Booking data – pick-up and drop-off addresses, date and time of travel, number of passengers, flight or train details and any special requests.",
          "Account data – the credentials you use to access the customer area, if you create an account.",
          "Payment and billing data – invoicing details and transaction information. Card data is handled by our payment provider; we do not store full card numbers.",
          "Technical and usage data – IP address, browser and device type and the pages you visit, collected through cookies and similar technologies.",
          "Communications – the content of the messages you send us by email, phone or through the website.",
        ],
      },
      {
        heading: "3. Why we use your data and the legal bases",
        body: ["We process your personal data only where a valid legal basis exists under Article 6 GDPR:"],
        list: [
          "To provide the transport service, confirm and manage your booking and carry out the journey – performance of a contract (Art. 6(1)(b)).",
          "To create and administer your customer account – performance of a contract (Art. 6(1)(b)).",
          "To answer your questions and provide customer support – performance of a contract and our legitimate interest in assisting customers (Art. 6(1)(b) and (f)).",
          "To issue invoices and comply with tax, accounting and other legal obligations – compliance with a legal obligation (Art. 6(1)(c)).",
          "To keep our website and services secure, prevent fraud and misuse and improve our services – our legitimate interests (Art. 6(1)(f)).",
          "To use optional cookies such as analytics and, where applicable, to send marketing communications – your consent (Art. 6(1)(a)), which you may withdraw at any time.",
        ],
      },
      {
        heading: "4. Who we share your data with",
        body: [
          "We do not sell your personal data. We share it only where necessary and only with parties that process it on our behalf or under a legal obligation:",
        ],
        list: [
          "IT, hosting, database and authentication providers that operate our website and customer area.",
          "Payment service providers that process your payments.",
          "Professional drivers or partner chauffeur companies, to the extent needed to carry out your journey.",
          "Email and communication service providers.",
          "Accountants, auditors and legal advisers, and public authorities where required by law.",
        ],
        body2: [
          "Where our providers act as data processors, they are bound by a data-processing agreement and may use your data only on our instructions.",
        ],
      },
      {
        heading: "5. Transfers outside the EEA",
        body: [
          "Some of our service providers may process your data outside the European Economic Area. Where this happens, we put appropriate safeguards in place under Chapter V GDPR, such as an adequacy decision of the European Commission or Standard Contractual Clauses together with any supplementary measures required.",
        ],
      },
      {
        heading: "6. How long we keep your data",
        body: ["We retain personal data only for as long as necessary for the purposes described above:"],
        list: [
          "Booking, invoicing and accounting records – for the period required by Italian tax and accounting law (generally up to 10 years).",
          "Customer account data – until you delete your account or ask us to erase it, unless we are required to keep it for legal reasons.",
          "Marketing and consent records – until you withdraw your consent.",
          "Technical and cookie data – as described in the cookie section below.",
        ],
      },
      {
        heading: "7. Your rights",
        body: ["Under the GDPR you have the right to:"],
        list: [
          "access your personal data and obtain a copy of it (Art. 15);",
          "ask us to rectify inaccurate or incomplete data (Art. 16);",
          "ask us to erase your data (Art. 17);",
          "ask us to restrict the processing of your data (Art. 18);",
          "receive your data in a portable format or have it transmitted to another controller (Art. 20);",
          "object to processing based on our legitimate interests and to direct marketing (Art. 21);",
          "withdraw any consent you have given at any time, without affecting the lawfulness of processing carried out before withdrawal (Art. 7).",
        ],
        body2: [
          `To exercise any of these rights, contact us at ${COMPANY.email}. We will respond within one month. You also have the right to lodge a complaint with the Italian supervisory authority, the Garante per la protezione dei dati personali (www.garanteprivacy.it), or with the supervisory authority in your country of residence.`,
        ],
      },
      {
        id: "cookies",
        heading: "8. Cookies and similar technologies",
        body: [
          "We use cookies and similar technologies so the website works and, with your consent, to understand how it is used. Cookies fall into the following categories:",
        ],
        list: [
          "Strictly necessary – required for core functions such as security, session handling and remembering your language preference. These do not require consent.",
          "Functional – remember the choices you make to improve your experience.",
          "Analytics – help us understand how visitors use the website (only with your consent).",
          "Marketing – used to show relevant messages on other platforms (only with your consent).",
        ],
        body2: [
          "On your first visit a banner lets you accept all cookies or refuse the non-essential ones. You can change your choice at any time using the “Cookie settings” link in the footer of the website, or by managing cookies in your browser. Refusing non-essential cookies does not prevent you from using the website.",
        ],
      },
      {
        heading: "9. Security",
        body: [
          "We apply appropriate technical and organisational measures to protect your personal data against accidental or unlawful destruction, loss, alteration and unauthorised disclosure or access, including encryption in transit and access controls. No method of transmission over the internet is completely secure, but we continually review our safeguards.",
        ],
      },
      {
        heading: "10. Children",
        body: [
          "Our services are intended for adults. We do not knowingly collect personal data from children under 18. Passenger details for minors are provided by the adult who makes the booking.",
        ],
      },
      {
        heading: "11. Changes to this policy",
        body: [
          "We may update this policy from time to time, for example to reflect changes in our services or in the law. The date shown at the top indicates the last revision. Material changes will be highlighted on the website.",
        ],
      },
      {
        heading: "12. Contact",
        body: [
          `For any question about this policy or how we handle your personal data, contact us at ${COMPANY.email} or by phone on ${COMPANY.phone}, or write to us at ${COMPANY.address}.`,
        ],
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    updated: "25 November 2026",
    sections: [
      {
        heading: "1. Introduction and acceptance",
        body: [
          `These Terms & Conditions (“Terms”) govern your use of the ${COMPANY.name} website and the chauffeur services we provide. They form a binding agreement between you (“Customer”, “you”) and ${COMPANY.name} (“we”, “us”).`,
          "By making a booking you confirm that you have read, understood and accepted these Terms. If you do not accept them, please do not use the website or our services.",
        ],
      },
      {
        heading: "2. Definitions",
        list: [
          "“Service” – the private chauffeur transport (NCC – Noleggio con conducente) provided by us.",
          "“Booking” – a request for a Service submitted through the website or another channel.",
          "“Confirmation” – our written acceptance of your Booking.",
          "“Vehicle” – the chauffeur-driven vehicle assigned to your journey.",
        ],
      },
      {
        heading: "3. The service",
        body: [
          "We provide a licensed NCC (Noleggio con conducente) service under Italian law, with professional drivers and licensed vehicles. The Service consists of the journeys agreed in your Confirmation.",
          "Our Service is not a taxi or public-transport service. Journeys must be booked in advance, and the route and timing are agreed at the time of booking.",
          "We may, where necessary, use a partner chauffeur company or a substitute vehicle of equivalent class to deliver the Service.",
        ],
      },
      {
        heading: "4. Bookings and confirmation",
        body: [
          "A Booking becomes binding only when we issue a Confirmation. Until then, availability and prices are not guaranteed.",
          "You are responsible for providing accurate and complete information, including pick-up and drop-off addresses, date, time, passenger numbers and contact details. We are not responsible for problems caused by incorrect information.",
          "We may contact you to verify details or to request additional information before confirming a Booking.",
        ],
      },
      {
        heading: "5. Prices and payment",
        body: [
          "All prices are shown in euros (EUR). Unless stated otherwise, prices exclude tolls, parking, airport fees, waiting time beyond the included allowance and any extras.",
          "Where applicable, VAT and legally required charges are shown in your Confirmation.",
          "We may require full or partial payment in advance to confirm a Booking. Accepted payment methods are shown during the booking process.",
          "If a price was clearly misstated or a Booking was made in error, we may cancel the Booking and refund any amount already paid.",
        ],
      },
      {
        heading: "6. Changes and cancellations by you",
        body: [
          `You may change or cancel a Booking by contacting us at ${COMPANY.email} or ${COMPANY.phone}. Unless your Confirmation states otherwise, the following terms apply:`,
        ],
        list: [
          "More than 24 hours before the scheduled pick-up: free cancellation.",
          "Between 24 and 3 hours before the scheduled pick-up: up to 50% of the fare may be charged.",
          "Less than 3 hours before the scheduled pick-up, or a no-show: the full fare may be charged.",
          "Where a Booking has been prepaid and is cancelled within the free-cancellation period, we refund the amount paid within a reasonable time.",
        ],
      },
      {
        heading: "7. Changes and cancellations by us",
        body: [
          "We may cancel or modify a Booking for reasons of safety, vehicle availability, weather, road conditions or events beyond our reasonable control (force majeure).",
          "Where we cancel for a reason within our control, you will receive a full refund of any amount paid. Where possible, we will offer a reasonable alternative.",
        ],
      },
      {
        heading: "8. Waiting time and delays",
        body: [
          "For airport or port pick-ups, a reasonable waiting period is included, unless your Confirmation states otherwise (typically 45 minutes for intercontinental flights and 30 minutes for other flights, counted from the actual landing time).",
          "For other pick-ups, a short grace period of about 15 minutes is included.",
          "Waiting time beyond the included allowance may be charged at our applicable hourly rate. Please ensure your contact details are correct so our driver can reach you.",
        ],
      },
      {
        heading: "9. No-show",
        body: [
          "If you are not present at the agreed pick-up point within the applicable waiting period, the Booking may be treated as a no-show, the driver may leave and the fare may be charged in full.",
        ],
      },
      {
        heading: "10. Your obligations",
        body: [
          "You agree to provide accurate information; to be ready at the agreed time and place; to respect the driver and the Vehicle; to wear seat belts as required by law; and not to carry illegal or dangerous items or to exceed the agreed number of passengers or the capacity of the Vehicle.",
          "Smoking, vaping and eating are not permitted in the Vehicle. You may be charged for cleaning or for damage caused during your journey.",
          "We and our drivers may refuse or terminate a journey if your behaviour is unsafe, unlawful or affects the comfort or safety of others, without refund where the law allows.",
        ],
      },
      {
        heading: "11. Luggage",
        body: [
          "Luggage capacity is limited and is agreed at the time of booking. We are not obliged to carry items that exceed the agreed capacity or that are unsuitable for the Vehicle. Please tell us in advance about oversized items, wheelchairs or other special requirements.",
        ],
      },
      {
        heading: "12. Liability",
        body: [
          "We are liable for direct damages caused by our fault in accordance with Italian law. We are not liable for delays or failures caused by traffic, weather, accidents or other events beyond our reasonable control; for personal belongings left in the Vehicle; or for indirect or consequential losses.",
          "Where permitted by law, our total liability is limited to the price of the Service. Nothing in these Terms limits any liability that cannot be excluded by law, including liability for death or personal injury caused by our negligence.",
          "Vehicles are insured in accordance with the requirements applicable to NCC operators. Passengers are advised to have suitable travel and personal insurance.",
        ],
      },
      {
        heading: "13. Intellectual property",
        body: [
          "The content of this website, including the name, logo, text and images, is owned by or licensed to us and may not be copied or used without our prior written consent.",
        ],
      },
      {
        heading: "14. Complaints",
        body: [
          `If something goes wrong, please contact us within 14 days of your journey at ${COMPANY.email} so that we can investigate and respond promptly.`,
        ],
      },
      {
        heading: "15. Governing law and jurisdiction",
        body: [
          "These Terms are governed by Italian law. Any dispute will be subject to the competent court of Padova, Italy. Nothing in these Terms affects the right of consumers to bring proceedings in the courts of their country of residence within the European Union.",
        ],
      },
      {
        heading: "16. Changes to these Terms",
        body: [
          "We may update these Terms from time to time. The version in force at the time of your Booking applies to that Booking. The date shown at the top indicates the last revision.",
        ],
      },
      {
        heading: "17. Contact",
        body: [
          `${COMPANY.name} · ${COMPANY.address} · VAT ${COMPANY.vat} · ${COMPANY.email} · ${COMPANY.phone}.`,
        ],
      },
    ],
  },
};

const it = {
  eyebrow: "Note legali",
  labels: { updated: "Ultimo aggiornamento", back: "Torna alla home" },
  banner: {
    title: "Teniamo alla tua privacy",
    body: "Utilizziamo cookie essenziali per il funzionamento del sito. Con il tuo consenso utilizziamo anche cookie facoltativi per capire come viene utilizzato il sito. Puoi accettare tutti i cookie o rifiutare quelli non necessari: rifiutarli non compromette la tua esperienza.",
    accept: "Accetta tutti",
    reject: "Rifiuta i non necessari",
    settings: "Impostazioni cookie",
    policy: "Informativa sulla Privacy",
  },
  privacy: {
    title: "Informativa sulla Privacy",
    updated: "25 novembre 2026",
    sections: [
      {
        heading: "1. Chi siamo (Titolare del trattamento)",
        body: [
          `“EU Luxury Tours & Travels” è un'impresa di servizio con conducente (NCC – Noleggio con conducente) con sede in Italia. Siamo il titolare del trattamento dei dati personali descritti nella presente informativa.`,
          `Dati dell'impresa: ${COMPANY.addressIt} · Partita IVA ${COMPANY.vat} · Email: ${COMPANY.email} · Telefono: ${COMPANY.phone}.`,
          `La presente informativa spiega quali dati personali raccogliamo, perché li raccogliamo, come li utilizziamo e li proteggiamo e quali diritti hai ai sensi del Regolamento generale sulla protezione dei dati (Regolamento UE 2016/679, «GDPR») e della normativa italiana applicabile in materia di protezione dei dati.`,
        ],
      },
      {
        heading: "2. Dati personali che raccogliamo",
        body: ["Raccogliamo le seguenti categorie di dati personali:"],
        list: [
          "Dati identificativi e di contatto – nome, indirizzo email e numero di telefono.",
          "Dati di prenotazione – indirizzi di partenza e di destinazione, data e ora del viaggio, numero di passeggeri, dettagli del volo o del treno ed eventuali richieste particolari.",
          "Dati dell'account – le credenziali utilizzate per accedere all'area clienti, se crei un account.",
          "Dati di pagamento e di fatturazione – dati per la fatturazione e informazioni sulle transazioni. I dati della carta sono gestiti dal nostro fornitore di pagamenti; non conserviamo i numeri completi delle carte.",
          "Dati tecnici e di utilizzo – indirizzo IP, tipo di browser e dispositivo e pagine visitate, raccolti tramite cookie e tecnologie simili.",
          "Comunicazioni – il contenuto dei messaggi che ci invii via email, telefono o tramite il sito web.",
        ],
      },
      {
        heading: "3. Perché utilizziamo i tuoi dati e basi giuridiche",
        body: ["Trattiamo i tuoi dati personali solo quando sussiste una base giuridica valida ai sensi dell'articolo 6 del GDPR:"],
        list: [
          "Per fornire il servizio di trasporto, confermare e gestire la prenotazione ed effettuare la corsa – esecuzione di un contratto (art. 6, par. 1, lett. b).",
          "Per creare e gestire il tuo account clienti – esecuzione di un contratto (art. 6, par. 1, lett. b).",
          "Per rispondere alle tue domande e fornire assistenza – esecuzione di un contratto e nostro legittimo interesse ad assistere i clienti (art. 6, par. 1, lett. b e f).",
          "Per emettere fatture e adempiere agli obblighi fiscali, contabili e di legge – adempimento di un obbligo legale (art. 6, par. 1, lett. c).",
          "Per mantenere sicuri il nostro sito e i nostri servizi, prevenire frodi e abusi e migliorare i servizi – nostri legittimi interessi (art. 6, par. 1, lett. f).",
          "Per utilizzare cookie facoltativi, come quelli analitici, e, ove applicabile, per inviare comunicazioni di marketing – tuo consenso (art. 6, par. 1, lett. a), che puoi revocare in qualsiasi momento.",
        ],
      },
      {
        heading: "4. Con chi condividiamo i tuoi dati",
        body: [
          "Non vendiamo i tuoi dati personali. Li condividiamo solo quando necessario e unicamente con soggetti che li trattano per nostro conto o in adempimento di un obbligo di legge:",
        ],
        list: [
          "Fornitori di servizi IT, hosting, database e autenticazione che gestiscono il sito web e l'area clienti.",
          "Fornitori di servizi di pagamento che elaborano i tuoi pagamenti.",
          "Autisti professionisti o imprese di NCC partner, nella misura necessaria per effettuare il tuo viaggio.",
          "Fornitori di servizi di posta elettronica e comunicazione.",
          "Commercialisti, revisori e consulenti legali, e autorità pubbliche ove richiesto dalla legge.",
        ],
        body2: [
          "Quando i nostri fornitori agiscono come responsabili del trattamento, sono vincolati da un accordo sul trattamento dei dati e possono utilizzare i tuoi dati solo su nostra istruzione.",
        ],
      },
      {
        heading: "5. Trasferimenti al di fuori del SEE",
        body: [
          "Alcuni dei nostri fornitori di servizi possono trattare i tuoi dati al di fuori dello Spazio economico europeo. In tal caso adottiamo garanzie adeguate ai sensi del Capo V del GDPR, come una decisione di adeguatezza della Commissione europea o le clausole contrattuali tipo, insieme alle eventuali misure supplementari necessarie.",
        ],
      },
      {
        heading: "6. Per quanto tempo conserviamo i tuoi dati",
        body: ["Conserviamo i dati personali solo per il tempo necessario alle finalità sopra descritte:"],
        list: [
          "Dati di prenotazione, fatturazione e contabilità – per il periodo richiesto dalla normativa fiscale e contabile italiana (in genere fino a 10 anni).",
          "Dati dell'account clienti – fino alla cancellazione dell'account o alla tua richiesta di cancellazione, salvo obblighi di legge che ne impongano la conservazione.",
          "Registrazioni di marketing e consenso – fino alla revoca del consenso.",
          "Dati tecnici e cookie – come descritto nella sezione sui cookie di seguito.",
        ],
      },
      {
        heading: "7. I tuoi diritti",
        body: ["Ai sensi del GDPR hai il diritto di:"],
        list: [
          "accedere ai tuoi dati personali e ottenerne copia (art. 15);",
          "chiedere la rettifica dei dati inesatti o incompleti (art. 16);",
          "chiedere la cancellazione dei tuoi dati (art. 17);",
          "chiedere la limitazione del trattamento dei tuoi dati (art. 18);",
          "ricevere i tuoi dati in un formato portabile o farli trasmettere a un altro titolare (art. 20);",
          "opporti al trattamento basato sui nostri legittimi interessi e al marketing diretto (art. 21);",
          "revocare in qualsiasi momento il consenso prestato, senza pregiudicare la liceità del trattamento effettuato prima della revoca (art. 7).",
        ],
        body2: [
          `Per esercitare questi diritti, contattaci all'indirizzo ${COMPANY.email}. Risponderemo entro un mese. Hai inoltre il diritto di proporre reclamo all'autorità di controllo italiana, il Garante per la protezione dei dati personali (www.garanteprivacy.it), o all'autorità di controllo del tuo Paese di residenza.`,
        ],
      },
      {
        id: "cookies",
        heading: "8. Cookie e tecnologie simili",
        body: [
          "Utilizziamo cookie e tecnologie simili per il funzionamento del sito e, con il tuo consenso, per capire come viene utilizzato. I cookie si suddividono nelle seguenti categorie:",
        ],
        list: [
          "Strettamente necessari – richiesti per funzioni essenziali come la sicurezza, la gestione della sessione e la memorizzazione della lingua preferita. Non richiedono consenso.",
          "Funzionali – memorizzano le scelte che effettui per migliorare la tua esperienza.",
          "Analitici – ci aiutano a capire come i visitatori utilizzano il sito (solo con il tuo consenso).",
          "Di marketing – utilizzati per mostrare messaggi pertinenti su altre piattaforme (solo con il tuo consenso).",
        ],
        body2: [
          "Alla prima visita un banner ti consente di accettare tutti i cookie o di rifiutare quelli non necessari. Puoi modificare la tua scelta in qualsiasi momento tramite il link «Impostazioni cookie» nel footer del sito, oppure gestendo i cookie nelle impostazioni del browser. Rifiutare i cookie non necessari non ti impedisce di utilizzare il sito.",
        ],
      },
      {
        heading: "9. Sicurezza",
        body: [
          "Applichiamo misure tecniche e organizzative adeguate per proteggere i tuoi dati personali da distruzione, perdita, alterazione e divulgazione o accesso non autorizzati, accidentali o illeciti, incluse la cifratura in transito e i controlli di accesso. Nessun metodo di trasmissione su Internet è completamente sicuro, ma rivediamo costantemente le nostre misure di protezione.",
        ],
      },
      {
        heading: "10. Minori",
        body: [
          "I nostri servizi sono destinati agli adulti. Non raccogliamo consapevolmente dati personali di minori di 18 anni. I dati dei passeggeri minorenni sono forniti dall'adulto che effettua la prenotazione.",
        ],
      },
      {
        heading: "11. Modifiche alla presente informativa",
        body: [
          "Possiamo aggiornare la presente informativa di tanto in tanto, ad esempio per riflettere cambiamenti nei nostri servizi o nella legge. La data indicata in alto indica l'ultima revisione. Le modifiche sostanziali saranno evidenziate sul sito web.",
        ],
      },
      {
        heading: "12. Contatti",
        body: [
          `Per qualsiasi domanda sulla presente informativa o su come trattiamo i tuoi dati personali, contattaci all'indirizzo ${COMPANY.email} o al telefono ${COMPANY.phone}, oppure scrivici a ${COMPANY.addressIt}.`,
        ],
      },
    ],
  },
  terms: {
    title: "Termini e Condizioni",
    updated: "25 novembre 2026",
    sections: [
      {
        heading: "1. Introduzione e accettazione",
        body: [
          `I presenti Termini e Condizioni («Termini») disciplinano l'uso del sito web di ${COMPANY.name} e i servizi con conducente che forniamo. Costituiscono un accordo vincolante tra te («Cliente», «tu») e ${COMPANY.name} («noi»).`,
          "Effettuando una prenotazione confermi di aver letto, compreso e accettato i presenti Termini. Se non li accetti, ti preghiamo di non utilizzare il sito web o i nostri servizi.",
        ],
      },
      {
        heading: "2. Definizioni",
        list: [
          "«Servizio» – il trasporto privato con conducente (NCC – Noleggio con conducente) fornito da noi.",
          "«Prenotazione» – una richiesta di Servizio inviata tramite il sito web o altro canale.",
          "«Conferma» – la nostra accettazione scritta della tua Prenotazione.",
          "«Veicolo» – il veicolo con conducente assegnato al tuo viaggio.",
        ],
      },
      {
        heading: "3. Il servizio",
        body: [
          "Forniamo un servizio NCC (Noleggio con conducente) autorizzato ai sensi della legge italiana, con conducenti professionisti e veicoli autorizzati. Il Servizio consiste nei viaggi concordati nella tua Conferma.",
          "Il nostro Servizio non è un servizio di taxi o di trasporto pubblico. I viaggi devono essere prenotati in anticipo e il percorso e gli orari sono concordati al momento della prenotazione.",
          "Ove necessario, possiamo avvalerci di un'impresa di NCC partner o di un veicolo sostitutivo di classe equivalente per erogare il Servizio.",
        ],
      },
      {
        heading: "4. Prenotazioni e conferma",
        body: [
          "Una Prenotazione diventa vincolante solo quando emettiamo una Conferma. Fino a quel momento, disponibilità e prezzi non sono garantiti.",
          "Sei responsabile di fornire informazioni accurate e complete, inclusi indirizzi di partenza e destinazione, data, ora, numero di passeggeri e recapiti. Non siamo responsabili di problemi causati da informazioni errate.",
          "Prima di confermare una Prenotazione possiamo contattarti per verificare i dettagli o richiedere ulteriori informazioni.",
        ],
      },
      {
        heading: "5. Prezzi e pagamento",
        body: [
          "Tutti i prezzi sono indicati in euro (EUR). Salvo diversa indicazione, i prezzi non includono pedaggi, parcheggi, tasse aeroportuali, tempo di attesa oltre la franchigia inclusa ed eventuali supplementi.",
          "Ove applicabili, l'IVA e gli oneri previsti dalla legge sono indicati nella tua Conferma.",
          "Possiamo richiedere il pagamento totale o parziale in anticipo per confermare una Prenotazione. I metodi di pagamento accettati sono indicati durante la prenotazione.",
          "Se un prezzo è stato chiaramente indicato in modo errato o una Prenotazione è stata effettuata per errore, possiamo annullare la Prenotazione e rimborsare quanto già versato.",
        ],
      },
      {
        heading: "6. Modifiche e cancellazioni da parte tua",
        body: [
          `Puoi modificare o annullare una Prenotazione contattandoci all'indirizzo ${COMPANY.email} o al numero ${COMPANY.phone}. Salvo quanto diversamente indicato nella tua Conferma, si applicano le seguenti condizioni:`,
        ],
        list: [
          "Più di 24 ore prima dell'orario di partenza previsto: cancellazione gratuita.",
          "Tra 24 e 3 ore prima dell'orario di partenza previsto: può essere addebitato fino al 50% della tariffa.",
          "Meno di 3 ore prima dell'orario di partenza previsto, o mancata presentazione: può essere addebitata l'intera tariffa.",
          "Se una Prenotazione è stata pagata in anticipo ed è annullata entro il periodo di cancellazione gratuita, rimborsiamo l'importo versato entro un tempo ragionevole.",
        ],
      },
      {
        heading: "7. Modifiche e cancellazioni da parte nostra",
        body: [
          "Possiamo annullare o modificare una Prenotazione per motivi di sicurezza, disponibilità dei veicoli, condizioni meteorologiche, condizioni della viabilità o eventi al di fuori del nostro ragionevole controllo (forza maggiore).",
          "Se annulliamo per un motivo a noi riconducibile, riceverai il rimborso completo di quanto versato. Ove possibile, offriremo una valida alternativa.",
        ],
      },
      {
        heading: "8. Tempo di attesa e ritardi",
        body: [
          "Per le partenze da aeroporti o porti è incluso un ragionevole periodo di attesa, salvo diversa indicazione nella tua Conferma (in genere 45 minuti per i voli intercontinentali e 30 minuti per gli altri voli, calcolati dall'effettivo atterraggio).",
          "Per le altre partenze è incluso un breve tempo di tolleranza di circa 15 minuti.",
          "Il tempo di attesa oltre la franchigia inclusa può essere addebitato alla nostra tariffa oraria applicabile. Ti preghiamo di assicurarti che i tuoi recapiti siano corretti, così che il conducente possa contattarti.",
        ],
      },
      {
        heading: "9. Mancata presentazione (no-show)",
        body: [
          "Se non sei presente nel luogo di partenza concordato entro il periodo di attesa applicabile, la Prenotazione potrà essere considerata una mancata presentazione, il conducente potrà allontanarsi e la tariffa potrà essere addebitata per intero.",
        ],
      },
      {
        heading: "10. Tuoi obblighi",
        body: [
          "Accetti di fornire informazioni accurate; di essere pronto all'ora e nel luogo concordati; di rispettare il conducente e il Veicolo; di indossare le cinture di sicurezza come previsto dalla legge; e di non trasportare oggetti illegali o pericolosi né di superare il numero di passeggeri concordato o la capacità del Veicolo.",
          "Fumare, svapare e mangiare non sono consentiti nel Veicolo. Potrebbero esserti addebitati costi di pulizia o danni causati durante il tuo viaggio.",
          "Noi e i nostri conducenti possiamo rifiutare o interrompere un viaggio se il tuo comportamento è pericoloso, illecito o pregiudica il comfort o la sicurezza altrui, senza rimborso ove la legge lo consenta.",
        ],
      },
      {
        heading: "11. Bagagli",
        body: [
          "La capacità per i bagagli è limitata ed è concordata al momento della prenotazione. Non siamo obbligati a trasportare oggetti che superano la capacità concordata o non idonei al Veicolo. Ti preghiamo di segnalarci in anticipo oggetti ingombranti, sedie a rotelle o altre esigenze particolari.",
        ],
      },
      {
        heading: "12. Responsabilità",
        body: [
          "Siamo responsabili dei danni diretti causati da nostra colpa in conformità alla legge italiana. Non siamo responsabili di ritardi o mancate esecuzioni causati da traffico, condizioni meteorologiche, incidenti o altri eventi al di fuori del nostro ragionevole controllo; di oggetti personali lasciati nel Veicolo; o di danni indiretti o consequenziali.",
          "Ove consentito dalla legge, la nostra responsabilità complessiva è limitata al prezzo del Servizio. Nulla nei presenti Termini limita le responsabilità che non possono essere escluse per legge, inclusa la responsabilità per morte o lesioni personali causate da nostra colpa.",
          "I veicoli sono assicurati in conformità ai requisiti applicabili agli operatori NCC. Si consiglia ai passeggeri di disporre di un'adeguata assicurazione di viaggio e personale.",
        ],
      },
      {
        heading: "13. Proprietà intellettuale",
        body: [
          "Il contenuto di questo sito web, incluso il nome, il logo, i testi e le immagini, è di nostra proprietà o concesso in licenza a noi e non può essere copiato o utilizzato senza il nostro previo consenso scritto.",
        ],
      },
      {
        heading: "14. Reclami",
        body: [
          `Se qualcosa non va, ti preghiamo di contattarci entro 14 giorni dal viaggio all'indirizzo ${COMPANY.email}, così da poter effettuare le verifiche e rispondere tempestivamente.`,
        ],
      },
      {
        heading: "15. Legge applicabile e foro competente",
        body: [
          "I presenti Termini sono disciplinati dalla legge italiana. Ogni controversia sarà di competenza del tribunale di Padova, Italia. Nulla nei presenti Termini pregiudica il diritto dei consumatori di agire dinanzi ai tribunali del proprio Paese di residenza nell'Unione europea.",
        ],
      },
      {
        heading: "16. Modifiche alle presenti Condizioni",
        body: [
          "Possiamo aggiornare i presenti Termini di tanto in tanto. La versione in vigore al momento della tua Prenotazione si applica a quella Prenotazione. La data indicata in alto indica l'ultima revisione.",
        ],
      },
      {
        heading: "17. Contatti",
        body: [
          `${COMPANY.name} · ${COMPANY.addressIt} · Partita IVA ${COMPANY.vat} · ${COMPANY.email} · ${COMPANY.phone}.`,
        ],
      },
    ],
  },
};

const CONTENT = { en, it };

export function getLegal(lang) {
  return CONTENT[lang] || CONTENT.en;
}
