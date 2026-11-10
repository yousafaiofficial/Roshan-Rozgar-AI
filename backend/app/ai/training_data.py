"""
Training dataset for Roshan Rozgar AI service category classification.
Covers real-world Pakistani home service and repair requests in English, Roman Urdu, and Urdu script.
"""

TRAINING_DATA = [
    # ==========================================
    # 1. Electrician
    # ==========================================
    # English
    ("Circuit breaker tripped and sparks coming from switchboard", "Electrician"),
    ("Main electrical wiring short circuit in bedroom", "Electrician"),
    ("Ceiling fan not working capacitor replacement needed", "Electrician"),
    ("Need electrician to install new light switches and sockets", "Electrician"),
    ("UPS battery connection and inverter wiring fault", "Electrician"),
    ("Generator changeover switch burned out needs replacement", "Electrician"),
    ("Exhaust fan stopped spinning making humming electrical noise", "Electrician"),
    ("Dimmer switch is smoking and burning smell from panel", "Electrician"),
    ("Chandelier hanging and ceiling light fixture installation", "Electrician"),
    ("Power outage in one portion only fuse needs repair", "Electrician"),
    ("Three phase electricity meter connection load check", "Electrician"),
    ("Doorbell button not working and transformer wiring", "Electrician"),
    # Roman Urdu
    ("Bijli ka switch board jal gaya hai aur dhuwaan nikal raha hai", "Electrician"),
    ("Pankha bohat slow chal raha hai capacitor badalna hai", "Electrician"),
    ("Main breaker baar baar trip ho raha hai short circuit lagta hai", "Electrician"),
    ("Kamray ki lights nahi chal rahi hain bijli theek karani hai", "Electrician"),
    ("UPS ki battery ka connection aur wiring check karwani hai", "Electrician"),
    ("Pankhay ka dimmer kharab hai regulator kaam nahi kar raha", "Electrician"),
    ("Generator ka changeover switch lagwana hai", "Electrician"),
    ("Socket mein spark ho raha hai plug lagane par bijli jati hai", "Electrician"),
    ("Ghar ki poori wiring check karwani hai bijli ka jhatka lagta hai", "Electrician"),
    ("Exhaust fan ki motor band ho gayi hai nayi lagani hai", "Electrician"),
    ("Chhat ka pankha theek karna hai boht awaz kar raha hai", "Electrician"),
    ("Bijli ka masla hai meter se supply nahi aa rahi", "Electrician"),
    # Urdu Script
    ("کمرے کا مین سوئچ بورڈ جل گیا ہے چنگاریاں نکل رہی ہیں", "Electrician"),
    ("چھت کا پنکھا بہت آہستہ چل رہا ہے کپیسٹر تبدیل کرنا ہے", "Electrician"),
    ("بجلی کا بریکر بار بار ٹرپ ہو رہا ہے شارٹ سرکٹ ہے", "Electrician"),
    ("یو پی ایس کی وائرنگ اور بیٹری کنکشن ٹھیک کروانا ہے", "Electrician"),
    ("کمرے کی تمام لائٹس اور پنکھے بند ہو گئے ہیں الیکٹریشن چاہیے", "Electrician"),
    ("ساکٹ میں پلگ لگانے پر کرنٹ آ رہا ہے ارتھنگ چیک کروانی ہے", "Electrician"),
    ("جنریٹر چینج اوور سوئچ خراب ہو گیا ہے نیا لگانا ہے", "Electrician"),
    ("ایگزاسٹ فین کی وائرنگ جل گئی ہے موٹر چیک کروانی ہے", "Electrician"),
    ("گھر کی بجلی کی تاریں تبدیل کروانی ہیں شارٹ سرکٹ کا خطرہ ہے", "Electrician"),
    ("ڈمر ریگولیٹر خراب ہے پنکھے کی سپیڈ کنٹرول نہیں ہو رہی", "Electrician"),

    # ==========================================
    # 2. Plumber
    # ==========================================
    # English
    ("Kitchen sink pipe leaking water all over floor", "Plumber"),
    ("Water motor pump not lifting water to rooftop tank", "Plumber"),
    ("Bathroom flush tank continuously running and dripping", "Plumber"),
    ("Water geyser leaking from inlet pipe valve", "Plumber"),
    ("Blocked bathroom drain pipe with water backing up", "Plumber"),
    ("Replace leaking brass tap in laundry area", "Plumber"),
    ("Shower mixer valve broken hot water not coming", "Plumber"),
    ("Submersible water pump installation and plumbing line", "Plumber"),
    ("Water pipeline joint leaking in underground storage", "Plumber"),
    ("Commode seat installation and silicone sealing", "Plumber"),
    ("Low water pressure in all taps main line air lock", "Plumber"),
    ("Wash basin drainage siphon broken water dripping under vanity", "Plumber"),
    # Roman Urdu
    ("Kitchen ka sink leak kar raha hai paani tapak raha hai", "Plumber"),
    ("Paani ki motor paani nahi charha rahi tanki khali hai", "Plumber"),
    ("Washroom ka commode aur flush tank leak ho raha hai", "Plumber"),
    ("Nal kharab hai paani band nahi ho raha tap badalna hai", "Plumber"),
    ("Geyser ka pipe phat gaya hai garm paani beh raha hai", "Plumber"),
    ("Bathroom ka drain band hai paani jam ho gaya hai gutter kholna hai", "Plumber"),
    ("Muslim shower leak kar raha hai pipe naya lagwana hai", "Plumber"),
    ("Paani ki pipeline mein se leakage hai deewar geeli ho rahi hai", "Plumber"),
    ("Wash basin ka siphon pipe toot gaya hai plumber chahiye", "Plumber"),
    ("Tanki ka float valve kharab hai paani overflow ho raha hai", "Plumber"),
    ("Shower mixer se thanda paani to aa raha hai magar garam nahi", "Plumber"),
    ("Ghar ke saaray nalon mein paani ka pressure boht kam hai", "Plumber"),
    # Urdu Script
    ("باورچی خانے کے سنک کا پائپ پھٹ گیا ہے پانی بہہ رہا ہے", "Plumber"),
    ("پانی کا موٹر پمپ پانی چھت کی ٹینکی پر نہیں چڑھا رہا پلمبر چاہیے", "Plumber"),
    ("باتھ روم کا نل خراب ہے بند کرنے پر بھی پانی ٹپکتا رہتا ہے", "Plumber"),
    ("فلش ٹینکی اور کموڈ سے مسلسل پانی لیک ہو رہا ہے", "Plumber"),
    ("گیز کا والو اور انلیٹ پائپ لیک ہو گیا ہے گرم پانی نہیں آ رہا", "Plumber"),
    ("باتھ روم کا ڈرین پائپ بند ہو گیا ہے گندا پانی کھڑا ہے", "Plumber"),
    ("مسلم شاور کا پائپ تبدیل کروانا ہے پانی ضائع ہو رہا ہے", "Plumber"),
    ("پانی کی زیر زمین پائپ لائن سے سیپج ہو رہی ہے لیکیج بند کرنی ہے", "Plumber"),
    ("ٹینکی کا فلوٹ والو خراب ہو گیا ہے چھت پر پانی اوور فلو ہو رہا ہے", "Plumber"),
    ("شاور مکسر ٹوٹ گیا ہے نیا مکسر والو فٹ کروانا ہے", "Plumber"),

    # ==========================================
    # 3. AC Technician
    # ==========================================
    # English
    ("Air conditioner blowing warm air compressor not turning on", "AC Technician"),
    ("Split AC cooling is very weak needs gas refill and pressure check", "AC Technician"),
    ("Indoor AC unit leaking water droplets inside the bedroom", "AC Technician"),
    ("Inverter AC deep service and outdoor condenser coil wash", "AC Technician"),
    ("AC outdoor fan motor rattling with loud vibration sound", "AC Technician"),
    ("AC remote sensor not responding error code E4 on display", "AC Technician"),
    ("Need AC technician to uninstall AC and reinstall in new house", "AC Technician"),
    ("Ductless mini split freezing up ice on copper pipes", "AC Technician"),
    ("AC compressor capacitor blown needs immediate replacement", "AC Technician"),
    ("1.5 ton split AC cooling maintenance and chemical servicing", "AC Technician"),
    ("AC foul smell coming from air blower vents", "AC Technician"),
    # Roman Urdu
    ("AC thandi hawa nahi phek raha sirf fan chal raha hai", "AC Technician"),
    ("AC ki cooling bohat kam hai gas charge karwani hai", "AC Technician"),
    ("Indoor unit se kamray mein paani tapak raha hai AC technician chahiye", "AC Technician"),
    ("Inverter split AC ki servicing karwani hai filters bohat ganday hain", "AC Technician"),
    ("AC ka outdoor unit band ho gaya hai compressor nahi uth raha", "AC Technician"),
    ("AC ke pipes par barf jam rahi hai cooling nahi ho rahi", "AC Technician"),
    ("AC ek kamray se utarwa kar doosray kamray mein fitting karwani hai", "AC Technician"),
    ("AC on karne par E6 error aa raha hai technician bulao", "AC Technician"),
    ("Outdoor unit boht shor kar raha hai fan blade hil raha hai", "AC Technician"),
    ("Split AC ki chemical washing karani hai garmi mein cooling theek karein", "AC Technician"),
    ("AC ka remote kaam nahi kar raha aur display blink kar raha hai", "AC Technician"),
    # Urdu Script
    ("اے سی ٹھنڈی ہوا نہیں دے رہا صرف پنکھا چل رہا ہے کمپریسر بند ہے", "AC Technician"),
    ("سپلٹ اے سی کی کولنگ ختم ہو گئی ہے گیس ریفل کروانی ہے", "AC Technician"),
    ("انڈور یونٹ سے کمرے کے اندر پانی کے قطرے ٹپک رہے ہیں", "AC Technician"),
    ("انوورٹر اے سی کی مکمل سروس اور کیمیکل واش درکار ہے", "AC Technician"),
    ("اے سی کے کاپر پائپ پر برف جم رہی ہے اے سی مکینک چاہیے", "AC Technician"),
    ("آؤٹ ڈور یونٹ بہت شور کر رہا ہے فین موٹر چیک کروانی ہے", "AC Technician"),
    ("ڈیڑھ ٹن اے سی کھول کر دوسری جگہ فٹ کروانا ہے", "AC Technician"),
    ("اے سی کے ڈسپلے پر ایرر کوڈ آ رہا ہے اور کولنگ بند ہو گئی ہے", "AC Technician"),
    ("اے سی کا فلٹر اور کوائل صاف کروانی ہے ہوا کا پریشر کم ہے", "AC Technician"),
    ("گرمیوں کے سیزن کے لیے اے سی کی ٹیوننگ اور گیس پریشر چیک کروانا ہے", "AC Technician"),

    # ==========================================
    # 4. Carpenter
    # ==========================================
    # English
    ("Wooden wardrobe door hinge broken and drawer jammed", "Carpenter"),
    ("Main entrance wooden door sticking and deadbolt lock jammed", "Carpenter"),
    ("Dining table chair leg loose and wobbling needs repair", "Carpenter"),
    ("Kitchen wooden cabinets repair and new handles installation", "Carpenter"),
    ("Custom wooden bookshelf fabrication and wall mounting", "Carpenter"),
    ("Bed frame joint broken need carpenter with wood glue and screws", "Carpenter"),
    ("Window wooden frame warped unable to close latch", "Carpenter"),
    ("Sofa wooden structure cracked needs structural reinforcement", "Carpenter"),
    ("Wooden lock cylinder replacement and door planing", "Carpenter"),
    ("Almirah shelf fallen down needs new wooden cleats", "Carpenter"),
    ("Shoe rack wooden door repair and polish touching", "Carpenter"),
    # Roman Urdu
    ("Almari ka darwaza toot gaya hai qabzay theek karwane hain", "Carpenter"),
    ("Lakri ka darwaza phans raha hai theek se band nahi hota", "Carpenter"),
    ("Mez ki taang hil rahi hai lakri ka kaam karne wala tarkhan chahiye", "Carpenter"),
    ("Bed ka frame dheet ho gaya hai screws aur keelein lagani hain", "Carpenter"),
    ("Kitchen ke wooden cupboards ki hinges aur handles badalwane hain", "Carpenter"),
    ("Darwazay ka lock kharab hai chabi nahi ghoom rahi carpenter chahiye", "Carpenter"),
    ("Lakri ki almari ke racks gir gaye hain dobara fitting karni hai", "Carpenter"),
    ("Kursi ki peeth toot gayi hai lakri ki marammat karwani hai", "Carpenter"),
    ("Darwaza zameen se ragad raha hai neeche se randa lagwana hai", "Carpenter"),
    ("Wooden show case ka shisha aur lakri ka palla set karwana hai", "Carpenter"),
    # Urdu Script
    ("لکڑی کی الماری کا دروازہ ٹوٹ گیا ہے قبضے اور لاک ٹھیک کرنے ہیں", "Carpenter"),
    ("کمرے کا لکڑی کا دروازہ پھنس رہا ہے رندہ لگوا کر سیٹ کروانا ہے", "Carpenter"),
    ("کھانے کی میز اور کرسیوں کی ٹانگیں ہل رہی ہیں بڑھئی کی ضرورت ہے", "Carpenter"),
    ("کچن کی لکڑی کی کیبنٹس کے ہینڈل اور چینل تبدیل کروانے ہیں", "Carpenter"),
    ("بیڈ کا لکڑی کا فریم ٹوٹ گیا ہے ترکھان چاہیے جو مضبوطی سے جوڑے", "Carpenter"),
    ("دروازے کا تالا خراب ہے نیا لاک فٹ کروانا ہے", "Carpenter"),
    ("الماری کے خانے لٹک گئے ہیں نئی لکڑی کی سپورٹ لگوانی ہے", "Carpenter"),
    ("صوفے کا لکڑی کا فریم کریک ہو گیا ہے مرمت طلب ہے", "Carpenter"),
    ("کھڑکی کے لکڑی کے پٹ ٹھیک سے بند نہیں ہو رہے لاک لگانا ہے", "Carpenter"),
    ("کتابوں کی لکڑی کی الماری تیار کروانی ہے", "Carpenter"),

    # ==========================================
    # 5. Painter
    # ==========================================
    # English
    ("Living room walls peeling paint with damp moisture patches", "Painter"),
    ("Full house whitewash and plastic emulsion paint before Eid", "Painter"),
    ("Wooden doors and window sills need varnish polish", "Painter"),
    ("Ceiling dampness scraping, putty filling and distemper paint", "Painter"),
    ("Exterior house walls weather sheet protective painting", "Painter"),
    ("Wall crack filling with plaster and base coat application", "Painter"),
    ("Single bedroom accent wall paint with textured finish", "Painter"),
    ("Metal grill gate rust removal and oil paint coating", "Painter"),
    ("Water seepage damp wall waterproofing primer and paint", "Painter"),
    ("Matt finish wall paint for drawing room and hallway", "Painter"),
    # Roman Urdu
    ("Kamray ki deewaron par se rang utar raha hai seelan aagayi hai", "Painter"),
    ("Poore ghar ka paint aur whitewash karwana hai painter chahiye", "Painter"),
    ("Lakri ke darwazon par varnish aur spirit polish lagani hai", "Painter"),
    ("Chatt par seelan hai pehle khrachna hai phir waterproof paint", "Painter"),
    ("Ghar ke bahar weather sheet ka rang karwana hai", "Painter"),
    ("Deewaron mein dararein hain putty bhar kar distemper karna hai", "Painter"),
    ("Main gate ko zang lag gaya hai oil paint karwana hai", "Painter"),
    ("Drawing room mein emulsion paint aur new color karwana hai", "Painter"),
    ("Ghar mein rang roghan ka kaam karwana hai mahir painter chahiye", "Painter"),
    ("Wall putty aur primer lagana hai naye plaster par", "Painter"),
    # Urdu Script
    ("دیواروں سے پینٹ اکھڑ رہا ہے اور سیم آ گئی ہے پینٹر کی ضرورت ہے", "Painter"),
    ("پورے گھر کی سفیدی اور پلاسٹک ایمولشن پینٹ کروانا ہے", "Painter"),
    ("لکڑی کے دروازوں اور فرنیچر پر پالش اور وارنش کروانی ہے", "Painter"),
    ("چھت کی کھرچائی کر کے پٹی بھرنی ہے اور ڈسٹمبر پینٹ کرنا ہے", "Painter"),
    ("گھر کی بیرونی دیواروں پر ویدر شیٹ کا رنگ کروانا ہے", "Painter"),
    ("دیواروں میں دراڑیں ہیں وال پٹی اور پرائمر لگوانا ہے", "Painter"),
    ("لوہے کے مین گیٹ کو زنگ اتار کر آئل پینٹ کروانا ہے", "Painter"),
    ("ڈرائنگ روم اور ٹی وی لاؤنج میں میٹ فنش پینٹ درکار ہے", "Painter"),
    ("سیم والی دیوار پر واٹر پروفنگ کیمیکل اور نیا رنگ کروانا ہے", "Painter"),
    ("گھر کے تمام کمروں میں رنگ روغن کا ٹھیکہ دینا ہے", "Painter"),

    # ==========================================
    # 6. Cleaner
    # ==========================================
    # English
    ("Deep cleaning of 3 bedroom apartment after paint renovation", "Cleaner"),
    ("Kitchen grease scrubbing tiles and stove exhaust cleaning", "Cleaner"),
    ("Sofa set shampoo washing and carpet stain deep extraction", "Cleaner"),
    ("Bathroom tile grout descaling and sanitary disinfection", "Cleaner"),
    ("Full home dusting mopping and window glass cleaning", "Cleaner"),
    ("Move in house cleaning before shifting family", "Cleaner"),
    ("Water tank inside scrubbing and chlorine disinfection", "Cleaner"),
    ("Balcony floor power washing and cobweb removal", "Cleaner"),
    ("Office deep cleaning floors bathrooms and workstations", "Cleaner"),
    ("Mattress steam cleaning and sanitization service", "Cleaner"),
    # Roman Urdu
    ("Ghar ki deep cleaning karwani hai dhoor mitti bohat hai", "Cleaner"),
    ("Kitchen ke tiles aur choolha grease saaf karwana hai", "Cleaner"),
    ("Sofa aur carpet wash karwana hai shampoo cleaning chahiye", "Cleaner"),
    ("Washrooms ki gandi tiles chamkani hain tezab se safai", "Cleaner"),
    ("Naye ghar mein shift hone se pehle poori safai karani hai", "Cleaner"),
    ("Pani ki tanki ke andar mitti aur algae saaf karni hai", "Cleaner"),
    ("Ghar ka jharoo poncha aur khirkiyon ke sheeshay saaf karne hain", "Cleaner"),
    ("Renovation ke baad deewaron aur farsh se cement ke daagh utarne hain", "Cleaner"),
    ("Sofa set par daagh lag gaye hain wet vacuum wash chahiye", "Cleaner"),
    ("Full house deep clean service chahiye safai wala banda bhaijo", "Cleaner"),
    # Urdu Script
    ("گھر کی مکمل ڈیپ کلیننگ درکار ہے رینوویشن کے بعد سیمنٹ اور دھول ہے", "Cleaner"),
    ("باورچی خانے کے چولہے ایگزاسٹ اور ٹائلز کی چکنائی صاف کروانی ہے", "Cleaner"),
    ("صوفہ سیٹ اور قالین کی شیمپو سروس اور ویکیوم واش چاہیے", "Cleaner"),
    ("باتھ روم کی ٹائلز اور واش بیسن کی گہری صفائی اور جراثیم کشی", "Cleaner"),
    ("نئے گھر میں شفٹ ہونے سے پہلے جھاڑو پونچھا اور صفائی کروانی ہے", "Cleaner"),
    ("پانی کی زیر زمین اور چھت والی ٹینکی اندر سے رگڑ کر صاف کروانی ہے", "Cleaner"),
    ("کھڑکیوں کے شیشے اور جالیوں کی صفائی کے لیے عملہ درکار ہے", "Cleaner"),
    ("پورے فلیٹ کی واشنگ اور فرش چمکانے کے لیے صفائی والا چاہیے", "Cleaner"),
    ("میٹریس اور قالین کی ڈسٹ اور الرجی کلیننگ کروانی ہے", "Cleaner"),
    ("گھر کی عمومی صفائی اور باتھ رومز واش کروانے ہیں", "Cleaner"),

    # ==========================================
    # 7. Mechanic
    # ==========================================
    # English
    ("Honda 125 motorcycle engine tuning and mobile oil change", "Mechanic"),
    ("Motorcycle kick slipping and clutch wire snapped", "Mechanic"),
    ("Bike disc brake not gripping making loud screeching sound", "Mechanic"),
    ("Motorcycle carburetor cleaning and spark plug replacement", "Mechanic"),
    ("Bike won't start in morning battery dead and ignition fault", "Mechanic"),
    ("Motorcycle chain sprocket loose and making clanking noise", "Mechanic"),
    ("Scooter front shock absorber leaking oil needs overhaul", "Mechanic"),
    ("Car radiator overheating coolant leaking on road", "Mechanic"),
    ("Vehicle brake pad replacement and drum skimming", "Mechanic"),
    ("Motorcycle tire puncture roadside assistance", "Mechanic"),
    # Roman Urdu
    ("Motorcycle ki tuning aur engine oil change karwana hai", "Mechanic"),
    ("Bike ki kick slip ho rahi hai clutch wire toot gayi hai", "Mechanic"),
    ("Motorcycle ke brake lagane par boht awaz aa rahi hai brake shoes badalne hain", "Mechanic"),
    ("Bike subah start nahi hoti kick maari jao current nahi aata", "Mechanic"),
    ("Carburetor ki safai aur spark plug check karwana hai bike missing kar rahi hai", "Mechanic"),
    ("Bike ki chain boht loose hai sprocket set badalna hai", "Mechanic"),
    ("Motorcycle mechanic chahiye bike chalte chalte band ho gayi", "Mechanic"),
    ("Gari ka radiator garam ho raha hai coolant leak ho gaya hai", "Mechanic"),
    ("Bike ke aglay shocks leak ho gaye hain oil nikal raha hai", "Mechanic"),
    ("70cc motorcycle ki complete tuning aur tappet adjustment", "Mechanic"),
    # Urdu Script
    ("موٹر سائیکل کی ٹیوننگ اور آئل تبدیل کروانا ہے مکینک چاہیے", "Mechanic"),
    ("بائیک کی کک سلپ ہو رہی ہے اور کلچ تار ٹوٹ گئی ہے", "Mechanic"),
    ("موٹر سائیکل کے بریک شو ختم ہو گئے ہیں بریک نہیں لگ رہے", "Mechanic"),
    ("بائیک صبح سٹارٹ نہیں ہوتی مسنگ کر رہی ہے پلگ چیک کرنا ہے", "Mechanic"),
    ("کاربوریٹر کی سروس اور پٹرول ایوریج سیٹ کروانی ہے", "Mechanic"),
    ("موٹر سائیکل کی چین اور گراری سیٹ تبدیل کروانی ہے", "Mechanic"),
    ("گاڑی کا ریڈی ایٹر اوور ہیٹ ہو رہا ہے پانی ابل رہا ہے", "Mechanic"),
    ("موٹر سائیکل کے اگلے شاکس جام ہو گئے ہیں آئل لیک ہو رہا ہے", "Mechanic"),
    ("روڈ پر بائیک بند ہو گئی ہے فوری مکینک درکار ہے", "Mechanic"),
    ("ہونڈا 125 کی ٹیپٹ اور کلچ پلیٹیں نئی ڈلوانی ہیں", "Mechanic"),
]
