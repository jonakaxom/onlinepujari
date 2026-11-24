# Run from anywhere: python3 tools/build.py  -> regenerates every page into its folder, sitemap.xml, robots.txt
import json,html,datetime,re,csv,math,collections,os,sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));os.chdir(ROOT);sys.path.insert(0,os.path.join(ROOT,"tools"))
from blog_data import ARTS
from cities import STATES,CITYDATA,FEATURED
def LANGCITIES(nm):return ", ".join(f'<a href="pandit-in-{c[0]}.html">{c[1]}</a>' for c in CITYDATA if nm in STATES[c[2]][2])
SITE="https://onlinepujari.in";BRAND="Online Pujari";PHONE="+91 99999 99999";EMAIL="care@onlinepujari.in"
S=[ # slug,name,hindi,short,keyword,price,duration,why,samagri,faq
("griha-pravesh-puja","Griha Pravesh Puja","गृह प्रवेश","Housewarming ritual to bless your new home.","griha pravesh puja",5100,"2–3 hours","Griha Pravesh invites positive energy, Ganesh and Lakshmi’s blessings and removes negativity before you start living in a new home.",["Kalash, mango leaves, coconut","Rice, turmeric, kumkum","Ghee, camphor, incense","Fruits, flowers, sweets","Havan samagri and wood"],[("Which day is best for Griha Pravesh?","The date is chosen from your family’s Panchang and the home’s direction. Our pandit shares auspicious muhurats before you confirm."),("Can the pandit bring all the samagri?","Yes. Choose the “with samagri” option and everything is brought to your home.")]),
("satyanarayan-puja","Satyanarayan Puja","सत्यनारायण पूजा","Katha for prosperity, peace and gratitude.","satyanarayan puja",3100,"2 hours","Performed on full-moon days, after a housewarming, wedding or any milestone to thank Lord Vishnu and seek family wellbeing.",["Panchamrit and prasad (sheera)","Banana leaves and tulsi","Kalash and coconut","Yellow flowers, roli, moli","Satyanarayan idol or photo"],[("How long is the katha?","Usually 2 hours including puja, five chapters of katha and aarti."),("Can it be done online?","Yes. A pandit leads the puja over video and guides you step by step.")]),
("rudrabhishek-puja","Rudrabhishek Puja","रुद्राभिषेक","Abhishek of Lord Shiva to remove obstacles and planetary doshas.","rudrabhishek puja",4100,"1.5–2 hours","Rudrabhishek with milk, honey, curd and Ganga jal is performed for health, peace, relief from doshas and success.",["Shivling or Shiv photo","Milk, curd, honey, ghee, sugar","Gangajal, belpatra, dhatura","Bhasma, chandan, flowers","Rudraksha mala"],[("What is the cost of Rudrabhishek?","It depends on the type (Laghu, Maha) and number of pandits. See the starting price and request an exact quote."),("Can I do it at home?","Yes. It is commonly done at home or online with the pandit chanting Rudri path.")]),
("bhoomi-puja","Bhoomi Puja","भूमि पूजन","Ground-breaking ceremony before construction begins.","bhoomi puja",4100,"2 hours","Bhoomi Puja seeks the blessings of Mother Earth, Vastu Purush and the directional deities before the first foundation is dug.",["Kalash and coconut","Silver snake and tortoise (optional)","Navdhanya (nine grains)","Bricks, turmeric, kumkum","Panchratna"],[("Is a muhurat needed?","Yes, our pandit checks tithi and nakshatra for an auspicious time."),("Who should attend?","The owner and family. The puja is done at the plot’s northeast corner.")]),
("vastu-shanti-puja","Vastu Shanti Puja","वास्तु शांति","Balance the energies of your home or office.","vastu shanti puja",5100,"3 hours","Vastu Shanti corrects directional imbalances and brings harmony to a home, shop or office, especially after renovation or purchase.",["Navgraha items and kalash","Havan kund and samagri","Nine types of grains","Turmeric, kumkum, flowers","Ghee and sesame"],[("When should Vastu Shanti be done?","Before moving into a new property or after structural changes."),("What is the cost?","See the starting price above; larger homes or homams cost more.")]),
("kaal-sarp-dosh-puja","Kaal Sarp Dosh Puja","काल सर्प दोष","Remedy ritual for Kaal Sarp Dosh in the birth chart.","kaal sarp dosh puja online",7100,"3–4 hours","This puja is performed to reduce delays, obstacles and anxiety attributed to Rahu–Ketu positions in a kundli.",["Silver or copper naag-naagin","Black sesame, milk, flowers","Kalash, coconut, rice","Havan samagri","Blue/black cloth"],[("Can Kaal Sarp Dosh puja be done online?","Yes, with your name, gotra and birth details the pandit performs the sankalp and puja on video."),("What details do I need to share?","Name, gotra, date, time and place of birth.")]),
("ganesh-puja","Ganesh Puja","गणेश पूजा","Begin anything new with Lord Ganesha’s blessing.","ganesh puja",2100,"1–1.5 hours","Ganesh Puja removes obstacles before weddings, business openings, new vehicles and festivals such as Ganesh Chaturthi.",["Ganesh idol, durva grass","Modak and laddoo","Red flowers, sindoor","Coconut and banana","Incense, diya, camphor"],[("Do you perform Ganesh Chaturthi puja?","Yes. Book early for the festival dates, pandits are in high demand."),("Is a muhurat needed?","For Chaturthi the pandit shares the madhyahna muhurat; otherwise any auspicious time works.")]),
("lakshmi-puja","Lakshmi Puja","लक्ष्मी पूजा","Diwali, Dhanteras and Varalakshmi Vratam puja.","lakshmi puja",3100,"1.5–2 hours","Lakshmi Puja is performed for prosperity and business growth, most commonly on Diwali, Dhanteras and Fridays.",["Lakshmi–Ganesh idol or photo","Lotus, kumkum, akshat","Coins and silver","Sweets, fruits, paan","Kalash and diyas"],[("When is Lakshmi Puja on Diwali?","In the Pradosh kaal after sunset. See our festival calendar for dates."),("Can business owners book it for the shop?","Yes, we do Dukan and Office Lakshmi Puja too.")]),
("new-car-puja","New Vehicle Puja","वाहन पूजा","Bless your new car or bike on delivery day.","new car pooja",1100,"30–45 minutes","A short puja with lemon, coconut and kumkum for safety on the road, done at the showroom or your home.",["Coconut and lemons","Kumkum, flowers, garland","Camphor and incense","Sweets","Moli thread"],[("Can the pandit come to the showroom?","Yes, we can meet you at the delivery point."),("Which day is best?","Tuesday and Thursday are popular. Our pandit confirms a good time.")]),
("mundan-sanskar","Mundan Sanskar","मुण्डन संस्कार","First haircut ceremony for your child.","mundan sanskar",3100,"1.5 hours","Mundan, or Chudakarana, is a Hindu sanskar in which a child’s first hair is shaved, usually in years 1–3, to purify and bless.",["Kalash, kusha grass","Rice, curd, ghee","Fresh flowers","Clean cloth and a barber","Sweets for prasad"],[("What age is right?","Commonly at 1, 3 or 5 years, depending on family tradition."),("Do you help with the muhurat?","Yes, from the child’s birth details.")]),
("annaprasan-puja","Annaprasan Puja","अन्नप्राशन","Baby’s first solid food ceremony.","annaprasanam",2500,"1–1.5 hours","Annaprasan marks a baby’s first taste of rice, usually at 6 months, with blessings for health and nourishment.",["Kheer or payasam","Silver spoon or bowl","Kalash, flowers","Rice, ghee, honey","New clothes for the child"],[("When is it done?","Typically in the 6th or 7th month. Boys and girls can differ by tradition."),("Can it be done online?","Yes, with the family feeding the baby as the pandit guides.")]),
("maha-mrityunjaya-homam","Maha Mrityunjaya Homam","महामृत्युंजय","Homam for health, protection and long life.","maha mrityunjaya homam",6100,"3–4 hours","Chanting the Maha Mrityunjaya Mantra with homam is done for recovery, protection and peace of mind.",["Havan kund, mango wood","Ghee, black sesame","Havan samagri","Kalash, flowers","Shiva photo"],[("How many chants are done?","Common counts are 1,25,000 or 11,000; the pandit advises by budget and need."),("Can I take part online?","Yes, with sankalp in your name.")]),
("shradh-pitru-puja","Shradh and Pitru Puja","श्राद्ध पूजा","Rituals to honour ancestors.","shradh puja",3500,"2 hours","Shradh, including Pind Daan and Tarpan, is performed to honour ancestors, mostly during Pitru Paksha.",["Black sesame, kusha","Rice flour pinda","Water, barley","Cooked food for offering","White flowers"],[("Can it be done online?","Yes. The pandit completes the vidhi and you offer tarpan as directed."),("What details are needed?","Name, gotra and date of passing of the departed.")]),
("seemantham-godh-bharai","Seemantham / Godh Bharai","सीमंतम्","Baby shower rituals for the mother-to-be.","seemantham",3100,"2 hours","Seemantham, also called Godh Bharai or Valaikaapu, blesses the expectant mother and child in the 7th month.",["Bangles, flowers","Fruits, coconut","Turmeric, kumkum","Sweets, new saree","Kalash"],[("When is it done?","Usually in the 5th, 7th or 9th month, depending on custom."),("Are regional customs followed?","Yes, tell us your community and our pandit follows your tradition.")]),
]
S+=[
("office-opening-puja","Office Opening Puja","कार्यालय पूजा","Ganesh–Lakshmi puja to open a new office with good beginnings.","office opening puja",3100,"1–1.5 hours","An office opening puja invokes Lord Ganesha and Goddess Lakshmi for smooth work, good clients and a positive workplace before the first day of business.",["Ganesh and Lakshmi idols or photos","Kalash, coconut, mango leaves","Roli, haldi, akshat, moli","Flowers, fruits, sweets","Incense, camphor, diya"],[("What is the right day to open an office?","Our pandit checks tithi and nakshatra and suggests a muhurat, often a Thursday or a day with a strong Ganesh or Lakshmi tithi."),("Do you do Vastu check for offices?","Yes, a short Vastu Shanti can be added to the same visit.")]),
("shop-factory-opening-puja","Shop and Factory Opening Puja","दुकान उद्घाटन पूजा","Inauguration puja for a new shop, showroom, clinic or factory.","shop opening puja",3500,"1–2 hours","A shop or factory opening puja (Dukan or Karkhana Muhurat) blesses the business, the tools and the first sale. Factories often add a machine puja.",["Ganesh–Lakshmi photo","Kalash, coconut","Red cloth, roli, akshat","Lemon and green chilli (optional)","Sweets for first customers"],[("Can machinery be worshipped too?","Yes. The pandit performs a short Ayudha or machine puja for factories and workshops."),("Can it be done on Sunday?","If the muhurat is good, yes. Ask the pandit; local custom varies.")]),
("sundarkand-path","Sundarkand Path","सुंदरकांड पाठ","Recitation of Sundar Kand from the Ramcharitmanas.","sunderkand near me",2100,"2–3 hours","Sundarkand Path is the recitation of the fifth book of the Ramcharitmanas about Hanuman’s journey to Lanka. It is read on Tuesdays and Saturdays for courage, peace and removal of obstacles.",["Hanuman and Ram Darbar photo","Ghee diya, incense","Red flowers, sindoor","Boondi or laddoo prasad","Tulsi leaves, Gangajal"],[("How long does Sundarkand take?","Around 2 to 3 hours depending on the recital style and whether bhajans are added."),("Can it be done in a society hall?","Yes. We often arrange it in flats, society halls and offices.")]),
]
FEST=[("Holika Dahan","3 March 2026","Pradosh kaal after sunset"),("Vat Savitri Vrat","16 May 2026","Amavasya, Jyeshtha"),("Nag Panchami","17 August 2026","Shravan Shukla Panchami"),("Krishna Janmashtami","4 September 2026","Nishita puja around midnight"),("Ganesh Chaturthi","14 September 2026","Madhyahna muhurat"),("Ganesh Visarjan (Anant Chaturdashi)","25 September 2026","Shukla Chaturdashi"),("Sharad Navratri begins","11 October 2026","Ghatasthapana in morning"),("Dussehra (Vijayadashami)","20 October 2026","Aparahna puja"),("Karva Chauth","29 October 2026","Moonrise in evening"),("Dhanteras","6 November 2026","Pradosh kaal"),("Diwali (Lakshmi Puja)","8 November 2026","Pradosh kaal after sunset")]
CITIES="Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad, Jaipur, Lucknow".split(", ")
e=html.escape
ICO_PIN='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>'
ICO_PH='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>'
ICO_WA='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.6z"/></svg>'
ICO_ML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>'
ICO_OK='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>'
ICO_LK='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
ICO_VD='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/></svg>'
KW=[r["Keywords"].strip() for r in csv.DictReader(open("tools/data/keywords.csv",encoding="utf-8-sig"))]
VOL={r["Keywords"].strip():int(r["Volume"]) for r in csv.DictReader(open("tools/data/keywords.csv",encoding="utf-8-sig"))}
SERV={"griha-pravesh-puja":r"griha|gruha|house ?warming","satyanarayan-puja":r"satyanarayan","rudrabhishek-puja":r"rudrabhishek","bhoomi-puja":r"bhoomi","vastu-shanti-puja":r"vastu","kaal-sarp-dosh-puja":r"kaal sarp","ganesh-puja":r"ganesh puja|ganesha puja","lakshmi-puja":r"lakshmi pooja|laxmi puja|lakshmi puja","new-car-puja":r"car|bike|vehicle","mundan-sanskar":r"mundan","annaprasan-puja":r"annapras","maha-mrityunjaya-homam":r"mrityunjaya","shradh-pitru-puja":r"shradh.*(puja|pooja)|(puja|pooja).*shradh","seemantham-godh-bharai":r"seemantham|godh bharai"}
TRANS=r"puja|pooja|pandit|cost|price|booking|samagri|at home|near me|homam|bharai|mundan|annapras|seemantham"
MAP=collections.defaultdict(list)
for k in KW:
  t=None
  for sl,p in SERV.items():
    if re.search(p,k) and re.search(TRANS,k): t=sl;break
  if not t and re.search(r"noida|ghaziabad|gurgaon|gurugram|faridabad",k): t="pandit-ji-in-noida-greater-noida"
  if not t and re.search(r"pandit|booking|book |online (pooja|puja)|pooja online|pujas? online|online puja|near me",k): t="pandit-booking"
  if not t:
    for a in ARTS:
      if re.search(a[4],k): t=a[0];break
  MAP[t or "puja-glossary"].append(k)
for k in list(MAP):  # cap per page; overflow goes to the glossary
  if k!="puja-glossary" and len(MAP[k])>60:
    MAP[k].sort(key=lambda x:-VOL[x]);MAP["puja-glossary"]+=MAP[k][60:];MAP[k]=MAP[k][:60]
CAT=sorted({a[2] for a in ARTS})
def wc(h):return len(re.sub("<[^>]+>"," ",h).split())
def rt(a):return max(1,math.ceil(wc(a[5]+"".join(b for _,b in a[6]))/180))
def rel(slug):
  ks=sorted(set(MAP.get(slug,[])),key=lambda x:-VOL[x])
  if not ks:return ""
  return f'<h2>Related searches</h2><details open><summary>{len(ks)} topics people search for</summary><ul class="chips">{"".join(f"<li>{e(k)}</li>" for k in ks)}</ul></details>'
def artcard(a):return f'<a class="row post" href="{a[0]}.html" data-cat="{e(a[2])}"><small>{e(a[2])} · {rt(a)} min read</small><h3>{e(a[1])}</h3><p>{e(a[3])}</p></a>'
def opts(sel=""):return "".join(f'<option value="{e(s[1])}"{" selected" if s[1]==sel else ""}>{e(s[1])}</option>' for s in S)+'<option value="Other puja (tell us on WhatsApp)">Other puja</option>'
def form(sel="",cta="Send booking on WhatsApp"):
  tiles="".join(f'<label><input type="radio" name="puja" value="{e(x[1])}"{" checked" if x[1]==sel else ""} required><span>{e(x[1])}</span></label>' for x in S)+'<label><input type="radio" name="puja" value="Other puja (tell us on WhatsApp)"><span>Other puja</span></label>'
  return f'''<form class="book wiz card" data-start="{2 if sel else 1}" aria-label="Book a puja" novalidate><h3>Book your pandit</h3><div class="dots"><i></i><i></i><i></i></div>
<fieldset data-step="1"><legend class="hint">1. Which puja?</legend><div class="tiles">{tiles}</div><p class="err" role="alert"></p><div class="nav2"><button type="button" class="btn" data-next>Next</button></div></fieldset>
<fieldset data-step="2"><legend class="hint">2. Where and when?</legend>
<label class="f">Mode</label><select name="mode"><option>At my home</option><option>Online (video)</option><option>At temple / venue</option></select>
<label class="f">Pandit language</label><select name="lang"><option>Any language</option>{"".join(f"<option>{l[0]}</option>" for l in LANGS)}</select>
<label class="f">City</label><input type="text" name="city" required placeholder="e.g. Pune" list="cl"><datalist id="cl">{"".join(f"<option>{c}" for c in CITIES)}</datalist>
<label class="f">Preferred date</label><input type="date" name="date"><label class="f" style="font-weight:400"><input type="checkbox" name="help" value="1"> Help me find an auspicious date</label><p class="err" role="alert"></p><div class="nav2"><button type="button" class="btn ghost" data-back>Back</button><button type="button" class="btn" data-next>Next</button></div></fieldset>
<fieldset data-step="3"><legend class="hint">3. Your details</legend>
<label class="f">Your name</label><input type="text" name="name" required autocomplete="name">
<label class="f">Mobile number</label><input name="phone" type="tel" required pattern="[0-9+ ]{{10,14}}" autocomplete="tel"><p class="err" role="alert"></p>
<div class="nav2"><button type="button" class="btn ghost" data-back>Back</button><button class="btn alt" type="submit">{cta}</button></div><p class="hint">We confirm the pandit and muhurat on WhatsApp. Pay only after confirmation.</p></fieldset></form>'''

ANNOUNCE=("Griha Pravesh and Satyanarayan slots are open. Share your date and we confirm the muhurat.","Book a puja","book.html")  # edit monthly
REVIEWS=[]  # add real ones: [("Name, City","Review text","https://link-to-google-review")]. Section shows only if filled.
LANGS=[("Hindi","हिंदी","पंडित जी","Pandit ji","गृह प्रवेश","North Indian vidhi: kalash sthapana, Ganesh puja, Navagraha puja, Vastu puja and havan."),
("Tamil","தமிழ்","வாத்தியார்","Vadhyar","கிரகப்பிரவேசம்","Often includes Ganapathi Homam, Navagraha Homam, Vastu puja and boiling milk in the new kitchen."),
("Telugu","తెలుగు","పురోహితులు","Purohit","గృహప్రవేశం","Gruhapravesam includes Ganapati puja, Punyahavachanam, Vastu puja and boiling milk (paalu ponginchadam)."),
("Kannada","ಕನ್ನಡ","ಪುರೋಹಿತರು","Purohit","ಗೃಹಪ್ರವೇಶ","Gruhapravesha includes Ganapati puja, Punyahavachana, Navagraha and Vastu homa, and boiling milk."),
("Marathi","मराठी","गुरुजी","Guruji","वास्तुशांत","Vastushanti with Ganesh puja, Punyahavachan and Navagraha puja; Satyanarayan is often added."),
("Bengali","বাংলা","পুরোহিত","Purohit","গৃহপ্রবেশ","Griha Pravesh with Ganesh puja, Vastu puja and homa; Satyanarayan Puja is often added."),
("Gujarati","ગુજરાતી","પુરોહિત","Purohit","ગૃહપ્રવેશ","Vastu pujan, Ganesh sthapana, Navagraha and havan; Satyanarayan katha is common."),
("Malayalam","മലയാളം","പൂജാരി","Poojari","ഗൃഹപ്രവേശം","Griha Pravesham with Ganapathi Homam, Vastu puja and boiling milk at the chosen muhurat.")]
LN={l[0]:l for l in LANGS}
METROS=[("bengaluru","Bengaluru",["Kannada","Hindi","Tamil","Telugu","Marathi","Bengali"],"Whitefield, HSR Layout, Koramangala, Jayanagar, Indiranagar, Electronic City and Yelahanka","Bengaluru is a mix of Kannada, Tamil, Telugu and Hindi-speaking families, so language matching matters most here."),
("chennai","Chennai",["Tamil","Telugu","Hindi","Kannada","Bengali"],"Adyar, Velachery, T. Nagar, Anna Nagar, OMR, Tambaram and Porur","Chennai homes usually prefer a Tamil vadhyar who follows the Smartha or Vaishnava sampradaya of the family."),
("hyderabad","Hyderabad",["Telugu","Hindi","Marathi","Tamil","Kannada"],"Gachibowli, Kondapur, Madhapur, Kukatpally, Banjara Hills and Secunderabad","Hyderabad has Telugu, Hindi, Marathi and Tamil households, often in the same apartment complex."),
("pune","Pune",["Marathi","Hindi","Gujarati","Telugu"],"Kothrud, Baner, Hinjewadi, Wakad, Viman Nagar and Hadapsar","Pune households commonly book a Marathi guruji for Vastushanti, Satyanarayan and Ganesh festival pujas."),
("mumbai","Mumbai",["Marathi","Hindi","Gujarati","Tamil","Bengali"],"Andheri, Powai, Thane, Navi Mumbai, Borivali and Dadar","In Mumbai’s high-rise societies, timing and society permissions matter as much as the muhurat.")]
FAQS=[("What pujas can I book?","Griha Pravesh, Satyanarayan, Rudrabhishek, Bhoomi, Vastu Shanti, Kaal Sarp Dosh, Lakshmi, Ganesh, office and shop opening, sanskar, homams and more. See the full list on our pujas page."),
("Will I get a pandit who speaks my language?","We match by language and city first. If your language is not available on your date, we tell you before you pay and suggest options, including an online puja."),
("Do I need to pay in advance?","No payment is taken until the pandit and muhurat are confirmed with you on WhatsApp."),
("When will I know which pandit is assigned?","After confirmation we share the pandit’s name, language and arrival time, plus a samagri list."),
("Is samagri included?","You choose: pandit only, or pandit with the full samagri kit. Each puja page shows both prices."),
("Can I do the puja online?","Yes. A pandit leads the puja over video and performs the sankalp in your name and gotra, which suits families abroad."),
("What if I do not know the muhurat?","Choose “help me find a date” in the form. We suggest auspicious dates from the Panchang for your city."),
("Can I reschedule?","Yes, free up to 48 hours before the puja.")]
CATS=[("New beginnings","आरंभ",[("griha-pravesh-puja","Griha Pravesh"),("bhoomi-puja","Bhoomi Puja"),("vastu-shanti-puja","Vastu Shanti"),("new-car-puja","New vehicle"),("office-opening-puja","Office opening"),("shop-factory-opening-puja","Shop or factory")]),
("Family and sanskar","संस्कार",[("seemantham-godh-bharai","Godh Bharai"),("annaprasan-puja","Annaprasan"),("mundan-sanskar","Mundan"),("satyanarayan-puja","Satyanarayan Katha")]),
("Health and protection","रक्षा",[("rudrabhishek-puja","Rudrabhishek"),("maha-mrityunjaya-homam","Mrityunjaya Homam"),("sundarkand-path","Sundarkand Path")]),
("Dosha and planetary","ग्रह",[("kaal-sarp-dosh-puja","Kaal Sarp Dosh"),("kaal-sarp-ashlesha-bali-homam-guide","Homam and dosha guide")]),
("Wealth and success","लक्ष्मी",[("lakshmi-puja","Lakshmi Puja"),("ganesh-puja","Ganesh Puja"),("office-opening-puja","Business puja")]),
("Ancestors","पितृ",[("shradh-pitru-puja","Shradh and Pitru Puja"),("shradh-pitru-paksha-guide","Shradh guide")])]
PROMISE=[("Verified pandits","M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4"),("Vedic vidhi","M4 5h7a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4z M20 5h-7"),("Samagri option","M5 8h14l-1 12H6z M9 8a3 3 0 0 1 6 0"),("Muhurat guidance","M12 6v6l4 2 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"),("Clear pricing","M6 4h12 M6 9h12 M9 4c6 0 6 8 0 8l7 8"),("On-time focus","M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9 12l2 2 4-4")]
FX='<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@700&family=Noto+Sans+Tamil:wght@700&family=Noto+Sans+Kannada:wght@700&family=Noto+Sans+Bengali:wght@700&family=Noto+Sans+Gujarati:wght@700&family=Noto+Sans+Malayalam:wght@700&display=swap" rel="stylesheet">'
def ico2(p):return f'<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{p}"/></svg>'

def form_full():
  return f'''<form class="book full card" aria-label="Enquiry form" novalidate><div class="g2"><div><label class="f">Your name</label><input type="text" name="name" required autocomplete="name"></div><div><label class="f">Phone number</label><input type="tel" name="phone" required pattern="[0-9+ ]{{10,14}}" autocomplete="tel" placeholder="+91"></div>
<div><label class="f">Language preference</label><select name="lang"><option>Any language</option>{"".join(f"<option>{l[0]}</option>" for l in LANGS)}</select></div><div><label class="f">Your city</label><input type="text" name="city" required placeholder="e.g. Pune"></div></div>
<label class="f">Puja type</label><select name="puja" required><option value="">Select puja</option>{opts()}</select>
<label class="f">Date preference</label><label class="f" style="font-weight:400"><input type="radio" name="dpref" value="specific"> I have a date: <input type="date" name="date" style="width:auto;display:inline-block"></label><label class="f" style="font-weight:400"><input type="radio" name="dpref" value="help" checked> Help me find the most auspicious date</label>
<label class="f">Additional information (optional)</label><textarea name="notes" rows="3" placeholder="Special requirements, number of people, rituals"></textarea><p class="err" role="alert"></p><button class="btn" type="submit">Send enquiry on WhatsApp</button></form>'''

# ---------- folder layout: old flat file name -> new path ----------
ASSET_MAP={"assets/style.css":"assets/css/style.css","assets/enhance.css":"assets/css/enhance.css","assets/app.js":"assets/js/app.js","assets/enhance.js":"assets/js/enhance.js","assets/img/favicon.svg":"assets/img/favicon.svg","assets/img/apple-touch-icon.png":"assets/img/apple-touch-icon.png","site.webmanifest":"site.webmanifest"}
ROOT_FILES={"index.html","404.html"}
ACCOUNT={"login.html":"account/login.html"}
def dest(name):
  if name in ROOT_FILES:return name
  if name in ACCOUNT:return ACCOUNT[name]
  sl=name[:-5]
  if name=="blog.html":return "blog/index.html"
  if name=="locations.html":return "locations/index.html"
  if name=="services.html":return "pujas/index.html"
  if sl in {a[0] for a in ARTS}:return "blog/"+name
  if sl in {x[0] for x in S}:return "pujas/"+name
  if sl in {l[0].lower()+"-pandit" for l in LANGS}:return "languages/"+name
  if sl.startswith("pandits-in-") or sl.startswith("pandit-in-") or sl.startswith("pandit-ji-in-"):return "locations/"+name
  return "pages/"+name
def public(name):
  d=dest(name)
  return "" if d=="index.html" else d[:-10] if d.endswith("/index.html") else d
def relink(h,d):
  base=os.path.dirname(d) or "."
  def fix(m):
    attr,t,frag=m.group(1),m.group(2),m.group(3) or ""
    if t.endswith(".html"):n=dest(t)
    elif t in ASSET_MAP:n=ASSET_MAP[t]
    elif t.startswith("assets/"):n=t
    else:return m.group(0)
    r=os.path.relpath(n,base)
    if r.endswith("index.html"):r=r[:-10] or "./"
    return f'{attr}="{r}{frag}"'
  h=re.sub(r'(href|src)="(?!https?:|tel:|mailto:|data:|#|/)([^"#]+)(#[^"]*)?"',fix,h)
  return re.sub(re.escape(SITE)+r'/([a-z0-9-]+\.html)',lambda m:SITE+"/"+public(m.group(1)),h)

DIYA='<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><g class="flame-a"><path d="M16 1c3.2 4.2 4.4 6.4 4.4 9a4.4 4.4 0 0 1-8.8 0C11.6 7.4 12.8 5.2 16 1z" fill="#ffb703"/><path d="M16 6c1.5 2 2.2 3.2 2.2 4.4a2.2 2.2 0 0 1-4.4 0c0-1.2.7-2.4 2.2-4.4z" fill="#d9480f"/></g><path d="M2 17h28c0 6.5-6 12-14 12S2 23.500 2 17z" fill="#ffb703"/><path d="M2 17h28" stroke="#d9480f" stroke-width="1.6"/></svg>'
ORN='<div class="orn" aria-hidden="true"><img src="assets/img/lotus.svg" alt="" width="40" height="40" loading="lazy"></div>'
def _i(p,sw="1.8"):return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{p}"/></svg>'
CAT_ICO=[_i("M3 11l9-7 9 7 M5 10v10h14V10 M10 20v-6h4v6"),_i("M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6 M17 11a2.5 2.5 0 1 0 0-5 M21 19c0-2.5-1.5-4.5-4-5"),_i("M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"),_i("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3 12c0-2 4-3.5 9-3.5s9 1.5 9 3.5-4 3.5-9 3.5-9-1.5-9-3.5z M5 6l2 2 M19 18l-2-2"),_i("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9 9.500c0-1 1.300-1.800 3-1.800s3 .8 3 1.800-1.300 1.600-3 2-3 1-3 2 1.300 1.800 3 1.800 3-.8 3-1.800 M12 6v1.700 M12 16.300V18"),_i("M12 3c2.500 3 3.500 5 3.500 7a3.500 3.500 0 0 1-7 0c0-2 1-4 3.500-7z M5 21h14 M7 17h10")]
ICO_WA2='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21l1.600-4.600A8.500 8.500 0 1 1 8 19.600z"/><path d="M9 9.500c0 3 2.500 5.500 5.500 5.500l1-1.500-2-1-1 .8a4 4 0 0 1-1.800-1.800l.8-1-1-2z"/></svg>'
ICO_UP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>'
STRIP=[("M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",f"{len(LANGS)} languages","Hindi to Malayalam"),("M12 21s7-6.200 7-11a7 7 0 1 0-14 0c0 4.800 7 11 7 11z M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",f"{len(CITYDATA)+len(METROS)+5}+ cities","Across India, or online"),("M4 5h7a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4z M20 5h-7a2 2 0 0 0-2 2",f"{len(S)} pujas","Pandit only or with samagri"),("M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z M9 12l2 2 4-4","Pay after confirmation","Muhurat confirmed first")]
STRIPH='<div class="strip"><ul>'+"".join(f'<li>{_i(p)}<span><b>{t}</b><small>{d}</small></span></li>' for p,t,d in STRIP)+'</ul></div>'

BRS=" | Online Pujari"
def fit_title(t):
  core=t[:-len(BRS)] if t.endswith(BRS) else t
  if len(core)+len(BRS)<=60:return core+BRS
  if len(core)<=60:return core
  c=core[:60];c=c[:c.rfind(" ")] if " " in c else c
  for w in (" and"," for"," in"," to"," of"," with"," &"," –"," -",":",","):
    while c.endswith(w):c=c[:-len(w)].rstrip()
  return c
def fit_desc(d):
  if len(d)>160:
    c=d[:160];k=max(c.rfind(". "),c.rfind("? "))
    d=c[:k+1] if k>110 else c[:c.rfind(" ")].rstrip(" ,;:-")+"."
  if len(d)<90:d=d.rstrip(".")+". Online Pujari arranges verified pandits for puja at home or online across India."
  return d
def related(path,_d):
  if _d.startswith("pujas/") and path!="services.html":
    i=[x[0] for x in S].index(path[:-5]);nm=S[i][1]
    oth="".join(f'<a href="{S[(i+k)%len(S)][0]}.html">{S[(i+k)%len(S)][1]}</a>' for k in range(1,7))
    cts="".join(f'<a href="pandit-in-{c[0]}.html">{c[1]}</a>' for f in FEATURED[:14] for c in CITYDATA if c[0]==f)
    return f'<section class="soft"><div class="w"><h2>Related pujas</h2><div class="cityc plain">{oth}</div><h2>Book {nm} by city</h2><div class="cityc">{cts}<a href="locations.html">All cities</a></div></div></section>'
  if _d.startswith("blog/") and path!="blog.html":
    sl=path[:-5];a=[x for x in ARTS if x[0]==sl]
    if not a:return ""
    a=a[0];same=[x for x in ARTS if x[2]==a[2] and x[0]!=sl][:4] or [x for x in ARTS if x[0]!=sl][:4]
    pj=[x for x in S if x[0]==a[7]]
    r="".join(f'<a href="{x[0]}.html">{x[1].split(":")[0]}</a>' for x in same)
    pl=f'<h2>Book a pandit</h2><div class="cityc plain"><a href="{pj[0][0]}.html">{pj[0][1]}</a><a href="pandit-booking.html">Book a pandit</a><a href="locations.html">Pandit in your city</a></div>' if pj else ""
    return f'<section class="soft"><div class="w"><h2>Related reading</h2><div class="cityc plain">{r}</div>{pl}</div></section>'
  return ""
def page(path,title,desc,body,schema=None,home=False):
  title=fit_title(title);desc=fit_desc(desc);_dd=dest(path)
  if schema is None:
    _nm=title.split(" | ")[0].split(":")[0]
    if path.startswith(("pandit-in-","pandit-ji-in-")):schema={"@context":"https://schema.org","@type":"Service","name":_nm,"serviceType":"Pandit booking for puja, havan and sanskar","provider":org,"areaServed":{"@type":"Place","name":_nm.replace("Pandit in ","").replace("Pandit ji in ","")}}
    elif _dd.startswith("languages/"):schema={"@context":"https://schema.org","@type":"Service","name":_nm,"serviceType":"Pandit booking for puja in your language","provider":org,"areaServed":{"@type":"Country","name":"India"},"availableLanguage":path.split("-")[0].title()}
    elif _dd.startswith("pages/"):schema={"@context":"https://schema.org","@type":{"contact.html":"ContactPage","about.html":"AboutPage"}.get(path,"WebPage"),"name":_nm,"description":desc,"url":SITE+"/"+public(path),"inLanguage":"en-IN","isPartOf":{"@type":"WebSite","name":BRAND,"url":SITE}}
    elif path=="services.html":schema={"@context":"https://schema.org","@type":"ItemList","name":"Pujas and sanskar you can book","itemListElement":[{"@type":"ListItem","position":i+1,"name":x[1],"url":SITE+"/"+public(x[0]+".html")} for i,x in enumerate(S)]}
  rel=related(path,_dd)
  OGT="article" if _dd.startswith("blog/") and path!="blog.html" else "website"
  ROB="noindex,follow" if path=="404.html" else "index,follow,max-image-preview:large,max-snippet:-1"
  sc=f'<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script>' if schema else ""
  url=SITE+"/"+public(path)
  _d=dest(path);_sec={"blog":("Blog","blog.html"),"pujas":("Pujas","services.html"),"locations":("Locations","locations.html"),"languages":("Languages","locations.html"),"pages":None}.get(_d.split("/")[0]) if "/" in _d else None
  _bc=[("Home",SITE+"/")]+([(_sec[0],SITE+"/"+public(_sec[1]))] if _sec and path not in ("blog.html","services.html","locations.html") else [])+([(title.split(" | ")[0],url)] if path!="index.html" else [])
  bc=f'<script type="application/ld+json">{json.dumps({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":i+1,"name":n,"item":u} for i,(n,u) in enumerate(_bc)]},ensure_ascii=False)}</script>' if path not in ("index.html","404.html") and "BreadcrumbList" not in json.dumps(schema or {}) else ""

  nav="".join(f'<a href="{SITE if False else ""}{h}">{t}</a>' for h,t in [("services.html","Pujas"),("pandit-booking.html","Book Pandit"),("blog.html","Blog"),("festival-calendar-2026.html","Festival Dates"),("about.html","About"),("contact.html","Contact"),("login.html","Login")])
  h=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title><meta name="description" content="{e(desc)}"><link rel="canonical" href="{url}"><link rel="alternate" hreflang="en-IN" href="{url}"><link rel="alternate" hreflang="x-default" href="{url}">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:type" content="{OGT}"><meta property="og:url" content="{url}">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self' https://wa.me"><meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="theme-color" content="#2b1638"><meta name="robots" content="{ROB}"><meta property="og:site_name" content="Online Pujari"><meta property="og:locale" content="en_IN"><meta property="og:image" content="{SITE}/assets/img/og-image.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(title)}"><meta name="twitter:description" content="{e(desc)}"><meta name="twitter:image" content="{SITE}/assets/img/og-image.png"><link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg"><link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png"><link rel="manifest" href="site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Mukta:wght@400;600;700&family=Eczar:wght@500;700&display=swap" rel="stylesheet">
{FX if home else ""}<link rel="stylesheet" href="assets/style.css"><link rel="stylesheet" href="assets/enhance.css">{sc}{bc}</head><body><a class="skip" href="#main">Skip to content</a><div id="bar" aria-hidden="true"></div><div class="announce"><span>{e(ANNOUNCE[0])}</span><a href="{ANNOUNCE[2]}">{e(ANNOUNCE[1])}</a></div>
<header class="top"><div class="w"><a class="logo" href="index.html">{DIYA}<span>Online<span>Pujari</span></span></a>
<button class="menu" aria-expanded="false" aria-label="Menu">Menu</button><nav>{nav}</nav><a class="ph" href="tel:{PHONE.replace(" ","")}">{ICO_PH}<span class="pht">{PHONE}</span></a><a class="btn hd" href="book.html">Book Puja</a></div></header>
<main id="main">{body}{rel}</main>
<div class="skyline" aria-hidden="true"></div><footer><div class="w"><div class="blurbs"><div><h3>Pandit ji near me</h3><p>Looking for a pandit near you? We arrange pandits for homes, societies, offices and shops across Noida, Greater Noida, Greater Noida West, Ghaziabad, Delhi and Gurugram. See every area on our <a href="locations.html">locations page</a>.</p></div>
<div><h3>Muhurat and guidance</h3><p>Not sure which puja suits the occasion or when to hold it? Message us on WhatsApp and we will help you pick the right puja and a muhurat for Griha Pravesh, Mundan, Namkaran, a business opening or any ceremony.</p></div></div>
<div class="cols6"><div><h3>Popular pujas</h3>{"".join(f'<a href="{x}.html">{n}</a>' for x,n in [("griha-pravesh-puja","Griha Pravesh Puja"),("satyanarayan-puja","Satyanarayan Katha"),("lakshmi-puja","Diwali Lakshmi Puja"),("annaprasan-puja","Annaprasan Sanskar"),("ganesh-puja","Ganesh Sthapana and Visarjan"),("rudrabhishek-puja","Rudrabhishek Puja"),("sundarkand-path","Sundarkand Path"),("new-car-puja","Vahan Pujan")])}</div>
<div><h3>Pandit near you</h3>{"".join(f'<a href="{x}">{n}</a>' for x,n in [("locations.html","Pandit in Delhi NCR"),("pandit-ji-in-noida-greater-noida.html","Pandit in Noida"),("pandit-ji-in-noida-greater-noida.html","Pandit in Greater Noida"),("pandit-in-greater-noida-west.html","Pandit in Greater Noida West"),("pandit-in-ghaziabad.html","Pandit in Ghaziabad"),("pandit-in-delhi.html","Pandit in Delhi"),("pandit-in-gurugram.html","Pandit in Gurugram"),("locations.html","All locations")])}</div>
<div><h3>Business puja</h3>{"".join(f'<a href="{x}.html">{n}</a>' for x,n in [("office-opening-puja","Office Opening Puja"),("shop-factory-opening-puja","Shop Opening Puja"),("shop-factory-opening-puja","Factory Opening Puja"),("shop-factory-opening-puja","Business Opening Puja"),("vastu-shanti-puja","Office Vastu Shanti"),("lakshmi-puja","Diwali Office Puja")])}</div>
<div><h3>Company</h3><a href="about.html">About us</a><a href="contact.html">Contact us</a><a href="faqs.html">FAQs</a><a href="become-a-pandit.html">Become a pandit</a><a href="blog.html">Blog</a><a href="puja-glossary.html">Puja glossary</a><a href="privacy.html">Privacy policy</a><a href="terms.html">Terms and conditions</a><a href="refund.html">Refund policy</a></div>
<div><h3>Latest blogs</h3>{"".join(f'<a href="{a_[0]}.html">{e(a_[1].split(":")[0])}</a>' for a_ in [x for x in ARTS if x[0] in ("diwali-date-lakshmi-puja-vidhi","nine-days-of-navratri-nine-forms-of-durga","ganesh-chaturthi-2026-visarjan","janmashtami-2026-date-puja-timing","krishna-quotes-hindi")])}</div>
<div class="contact"><h3>Contact</h3><p>{ICO_PIN}<span>Your office address here</span></p><p>{ICO_PH}<a href="tel:{PHONE.replace(" ","")}">{PHONE}</a></p><p>{ICO_WA}<a href="https://wa.me/919999999999">{PHONE}</a></p><p>{ICO_ML}<a href="mailto:{EMAIL}">{EMAIL}</a></p></div></div>
<div class="cities"><h3>Book puja in your city</h3><div class="cgrid">{"".join(f'<div><h4>{c[1]}</h4>'+"".join(f'<a href="pandit-in-{c[0]}.html#{l.lower()}">{LN[l][3]} in {c[1]} ({l})</a>' for l in c[2])+'</div>' for c in METROS)}<div><h4>Delhi NCR</h4><a href="locations.html">All Delhi NCR locations</a><a href="pandit-in-delhi.html">Pandit in Delhi</a><a href="pandit-in-gurugram.html">Pandit in Gurugram</a></div></div></div><div class="cities"><h3>Pandit by state</h3><div class="stl">{"".join(f'<a href="pandits-in-{k}.html">{v[0]}</a>' for k,v in STATES.items() if any(c[2]==k for c in CITYDATA))}</div></div><ul class="trust2"><li>{ICO_OK}Muhurat confirmed before you pay</li><li>{ICO_LK}Pay only after pandit confirmation</li><li>{ICO_VD}Online puja from anywhere</li><li>{ICO_WA}Help on WhatsApp</li></ul>
<div class="base"><span>© {datetime.date.today().year} {BRAND} (onlinepujari.in). All rights reserved.</span><span><a href="locations.html">All locations</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="refund.html">Refund</a></span></div></div></footer>
<div class="sticky"><a class="btn" href="book.html">Book a pandit</a><a class="btn alt" href="tel:+919999999999">Call</a></div><div class="toast" id="toast"><span>{e(ANNOUNCE[0])}</span><a class="btn alt" data-wa="Namaste, I need help choosing a puja and muhurat." href="book.html">Ask us</a><button aria-label="Dismiss" id="tx">×</button></div><div class="fab"><button class="up" id="up" type="button" aria-label="Back to top">{ICO_UP}</button><a class="wa" data-wa="Namaste, I need help with a puja booking." href="book.html" aria-label="Chat on WhatsApp">{ICO_WA2}</a></div><script src="assets/app.js"></script><script src="assets/enhance.js" defer></script></body></html>'''
  d=dest(path);os.makedirs(os.path.dirname(d) or ".",exist_ok=True)
  open(d,"w",encoding="utf-8").write(relink(h,d))
def card(s):return f'<a class="row" href="{s[0]}.html"><div class="hi">{s[2]}</div><div><h3>{s[1]}</h3><p>{s[3]} {s[6]}.</p></div><b>From ₹{s[5]:,}</b></a>'
def head(t,sub,crumb=""):return f'<div class="page-h"><div class="w"><div class="crumbs"><a href="index.html">Home</a>{crumb}</div><h1>{t}</h1><p style="max-width:44em;color:var(--mut)">{sub}</p></div></div>'
HOW='''<ol class="steps"><li><h3>Choose your puja</h3>Pick the puja, city and date. No sign-up needed.</li><li><h3>Pandit confirmed</h3>We match a verified pandit and share the muhurat on call.</li><li><h3>Puja at home or online</h3>The pandit arrives with samagri, or leads you over video.</li><li><h3>Prasad and blessings</h3>Receive the sankalp details and prasad guidance after the puja.</li></ol>'''
org={"@context":"https://schema.org","@type":"Organization","name":BRAND,"url":SITE,"email":EMAIL,"telephone":PHONE}
# HOME
rot=json.dumps([f"{l[1]} {l[2]}" for l in LANGS],ensure_ascii=False)
home=f'''<section class="hero toran"><div class="mandala" aria-hidden="true"></div><span class="petals" aria-hidden="true"><i style="--x:4%;--d:12s;--w:0px;--l:-10s"></i><i style="--x:13%;--d:15s;--w:0px;--l:-7s"></i><i style="--x:22%;--d:16s;--w:0px;--l:-4s"></i><i style="--x:28%;--d:11s;--w:30px;--l:-12s"></i><i style="--x:37%;--d:10s;--w:30px;--l:-4s"></i><i style="--x:49%;--d:16s;--w:0px;--l:-11s"></i><i style="--x:57%;--d:13s;--w:30px;--l:-1s"></i><i style="--x:63%;--d:17s;--w:0px;--l:-2s"></i><i style="--x:78%;--d:14s;--w:-30px;--l:-7s"></i><i style="--x:84%;--d:9s;--w:30px;--l:-1s"></i><i style="--x:0%;--d:17s;--w:30px;--l:-12s"></i></span><div class="w"><div><p class="dev" id="rot" data-w='{e(rot)}'>{LANGS[0][1]} {LANGS[0][2]}</p><h1>Your puja, done right, in your own language</h1>
<p class="lead">Tell us the puja, your city and the language you pray in. We match a verified pandit, confirm the muhurat and you pay only after confirmation.</p>
<ul class="facts"><li>Pandits for Hindi, Tamil, Telugu, Kannada, Marathi, Bengali, Gujarati and Malayalam</li><li>Home, society hall, office, temple or online</li><li>Pandit only, or pandit with the full samagri kit</li></ul>
<p class="ctas"><a class="btn alt" href="book.html">Book your puja</a><a class="btn ghost2" data-wa="Namaste, please call me back about a puja booking." href="book.html">Request a callback</a></p></div>{form()}</div><div class="diyas" aria-hidden="true"><svg viewBox="0 0 32 32" style="--i:0"><g class="flame-a"><path d="M16 3c3 4 4 6 4 8a4 4 0 0 1-8 0c0-2 1-4 4-8z" fill="#ffb703"/><path d="M16 8c1.300 1.800 2 2.800 2 3.800a2 2 0 0 1-4 0c0-1 .7-2 2-3.800z" fill="#d9480f"/></g><path d="M3 18h26c0 6-5.500 10-13 10S3 24 3 18z" fill="#ffb703"/></svg><svg viewBox="0 0 32 32" style="--i:1"><g class="flame-a"><path d="M16 3c3 4 4 6 4 8a4 4 0 0 1-8 0c0-2 1-4 4-8z" fill="#ffb703"/><path d="M16 8c1.300 1.800 2 2.800 2 3.800a2 2 0 0 1-4 0c0-1 .7-2 2-3.800z" fill="#d9480f"/></g><path d="M3 18h26c0 6-5.500 10-13 10S3 24 3 18z" fill="#ffb703"/></svg><svg viewBox="0 0 32 32" style="--i:2"><g class="flame-a"><path d="M16 3c3 4 4 6 4 8a4 4 0 0 1-8 0c0-2 1-4 4-8z" fill="#ffb703"/><path d="M16 8c1.300 1.800 2 2.800 2 3.800a2 2 0 0 1-4 0c0-1 .7-2 2-3.800z" fill="#d9480f"/></g><path d="M3 18h26c0 6-5.500 10-13 10S3 24 3 18z" fill="#ffb703"/></svg><svg viewBox="0 0 32 32" style="--i:3"><g class="flame-a"><path d="M16 3c3 4 4 6 4 8a4 4 0 0 1-8 0c0-2 1-4 4-8z" fill="#ffb703"/><path d="M16 8c1.300 1.800 2 2.800 2 3.800a2 2 0 0 1-4 0c0-1 .7-2 2-3.800z" fill="#d9480f"/></g><path d="M3 18h26c0 6-5.500 10-13 10S3 24 3 18z" fill="#ffb703"/></svg><svg viewBox="0 0 32 32" style="--i:4"><g class="flame-a"><path d="M16 3c3 4 4 6 4 8a4 4 0 0 1-8 0c0-2 1-4 4-8z" fill="#ffb703"/><path d="M16 8c1.300 1.800 2 2.800 2 3.800a2 2 0 0 1-4 0c0-1 .7-2 2-3.800z" fill="#d9480f"/></g><path d="M3 18h26c0 6-5.500 10-13 10S3 24 3 18z" fill="#ffb703"/></svg><svg viewBox="0 0 32 32" style="--i:5"><g class="flame-a"><path d="M16 3c3 4 4 6 4 8a4 4 0 0 1-8 0c0-2 1-4 4-8z" fill="#ffb703"/><path d="M16 8c1.300 1.800 2 2.800 2 3.800a2 2 0 0 1-4 0c0-1 .7-2 2-3.800z" fill="#d9480f"/></g><path d="M3 18h26c0 6-5.500 10-13 10S3 24 3 18z" fill="#ffb703"/></svg><svg viewBox="0 0 32 32" style="--i:6"><g class="flame-a"><path d="M16 3c3 4 4 6 4 8a4 4 0 0 1-8 0c0-2 1-4 4-8z" fill="#ffb703"/><path d="M16 8c1.300 1.800 2 2.800 2 3.800a2 2 0 0 1-4 0c0-1 .7-2 2-3.800z" fill="#d9480f"/></g><path d="M3 18h26c0 6-5.500 10-13 10S3 24 3 18z" fill="#ffb703"/></svg><svg viewBox="0 0 32 32" style="--i:7"><g class="flame-a"><path d="M16 3c3 4 4 6 4 8a4 4 0 0 1-8 0c0-2 1-4 4-8z" fill="#ffb703"/><path d="M16 8c1.300 1.800 2 2.800 2 3.800a2 2 0 0 1-4 0c0-1 .7-2 2-3.800z" fill="#d9480f"/></g><path d="M3 18h26c0 6-5.500 10-13 10S3 24 3 18z" fill="#ffb703"/></svg><svg viewBox="0 0 32 32" style="--i:8"><g class="flame-a"><path d="M16 3c3 4 4 6 4 8a4 4 0 0 1-8 0c0-2 1-4 4-8z" fill="#ffb703"/><path d="M16 8c1.300 1.800 2 2.800 2 3.800a2 2 0 0 1-4 0c0-1 .7-2 2-3.800z" fill="#d9480f"/></g><path d="M3 18h26c0 6-5.500 10-13 10S3 24 3 18z" fill="#ffb703"/></svg></div></section>
{STRIPH}
<section><div class="w">{ORN}<h2 class="c">Our promise</h2><ul class="promise">{"".join(f"<li>{ico2(p)}<span>{t}</span></li>" for t,p in PROMISE)}</ul></div></section>
<section class="soft" id="categories"><div class="w"><h2>Which puja do you need help with?</h2><p style="color:var(--mut)">Start with what you want to achieve. Each group lists the pujas that fit.</p><div class="cats">{"".join(f'<div class="cat c{i}"><span class="g">{hi}</span><span class="ci">{CAT_ICO[i]}</span><h3>{t}</h3><ul>{"".join(f"<li><a href={chr(34)}{u}.html{chr(34)}>{n}</a></li>" for u,n in items)}</ul></div>' for i,(t,hi,items) in enumerate(CATS))}</div></div></section>
<section class="band"><div class="w"><h2>Griha Pravesh in your language</h2><p>The same ritual, performed in your family’s tradition and language.</p><div class="lg">{"".join(f'<a href="{l[0].lower()}-pandit.html"><span class="nat">{l[4]}</span><b>{l[0]}</b><small>{l[3]} · from ₹{S[0][5]:,}</small></a>' for l in LANGS)}</div></div></section>
<section><div class="w"><h2>All pujas</h2><p style="color:var(--mut)">Tap a puja for samagri, process and price.</p><div class="list">{"".join(card(s) for s in S[:8])}</div><p><a class="btn alt" href="services.html">See all pujas</a></p></div></section>
<section class="soft"><div class="w"><h2>How online puja booking works</h2>{HOW}</div></section>
{('<section><div class="w"><h2>What families say</h2><div class="list">'+"".join(f'<a class="row post" href="{u}"><h3>{e(n)}</h3><p>{e(t)}</p></a>' for n,t,u in REVIEWS)+'</div></div></section>') if REVIEWS else ""}
<section><div class="w"><h2>Guides and festival dates</h2><div class="list">{"".join(artcard(a) for a in ARTS[:6])}</div><p><a class="btn alt" href="blog.html">All guides</a></p></div></section>
<section><div class="w">{ORN}<h2 class="c">Find a pandit in your city</h2><div class="cityc">{"".join(f'<a href="pandit-in-{c[0]}.html">{c[1]}</a>' for f in FEATURED for c in CITYDATA if c[0]==f)}<a href="pandit-in-delhi.html">Delhi</a><a href="pandit-in-mumbai.html">Mumbai</a><a href="pandit-in-bengaluru.html">Bengaluru</a><a href="pandit-in-chennai.html">Chennai</a><a href="pandit-in-hyderabad.html">Hyderabad</a><a href="pandit-in-pune.html">Pune</a></div><p class="c"><a class="btn alt" href="locations.html">See all cities</a></p></div></section>
<section class="soft"><div class="w two"><div><h2>Still have questions?</h2><p style="color:var(--mut)">Fill in the form and we will get back to you on WhatsApp.</p>{form_full()}</div><div class="prose"><h2>Frequently asked questions</h2>{"".join(f"<details><summary>{e(q)}</summary><p>{e(a)}</p></details>" for q,a in FAQS)}</div></div></section>
<section class="cta2"><div class="w"><h2>Perform your puja the right way</h2><p>Book a verified pandit in your language, or ask us anything first.</p><p class="ctas"><a class="btn alt" href="book.html">Book your puja now</a><a class="btn wa2" data-wa="Namaste, I want to book a puja." href="book.html">Chat on WhatsApp</a></p><p class="mini">Verified pandits · Muhurat guidance · Pay after confirmation</p></div></section>'''
page("index.html","Book Pandit & Puja Online in Your Language | Online Pujari","Book verified pandits in Hindi, Tamil, Telugu, Kannada, Marathi, Bengali, Gujarati and Malayalam for Griha Pravesh, Satyanarayan, Rudrabhishek and more, at home or online.",home,{"@context":"https://schema.org","@graph":[org,{"@type":"WebSite","name":BRAND,"url":SITE,"inLanguage":"en-IN"},{"@type":"ProfessionalService","name":BRAND,"url":SITE,"image":SITE+"/assets/img/og-image.png","email":EMAIL,"telephone":PHONE,"priceRange":"₹₹","areaServed":[{"@type":"City","name":m[1]} for m in METROS]+[{"@type":"AdministrativeArea","name":"Delhi NCR"}],"serviceType":"Pandit booking for puja, havan and sanskar","availableLanguage":[l[0] for l in LANGS]},{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in FAQS]}]},home=True)
# METRO PAGES
for sl,city,lgs,areas,note in METROS:
  secs="".join(f'<h2 id="{l.lower()}">{LN[l][3]} in {city} ({l})</h2><p>{LN[l][1]} {LN[l][2]}. {LN[l][5]} We arrange {l}-speaking pandits for homes and societies in {city}.</p>' for l in lgs)
  page(f"pandit-in-{sl}.html",f"Pandit in {city}: {', '.join(lgs[:3])} Pandits for Puja | Online Pujari",f"Book a {lgs[0]}, {lgs[1]} or {lgs[2]} pandit in {city} for Griha Pravesh, Satyanarayan, Rudrabhishek and more at home or online.",head(f"Pandit in {city}",f"{note}",' / <a href="locations.html">Locations</a> / '+city)+f'<section><div class="w two"><div class="prose"><h2>Areas we serve in {city}</h2><p>{areas}.</p>{secs}<h2>Pujas you can book</h2><p>{", ".join(f"<a href={chr(34)}{x[0]}.html{chr(34)}>{x[1]}</a>" for x in S[:7])}, and <a href="services.html">more</a>.</p></div><aside>{form()}</aside></div></section>')
# LANGUAGE PAGES
for l in LANGS:
  nm,sc,w,eng,gp,tr=l
  page(f"{nm.lower()}-pandit.html",f"{nm} {eng} ({w}) for Puja: Book Online | Online Pujari",f"Book a {nm}-speaking {eng.lower()} for Griha Pravesh ({gp}), Satyanarayan and other pujas at home or online.",head(f"{nm} {eng} for puja",f"{sc} {w}. Pujas in your own language and tradition.",' / '+nm)+f'<section><div class="w two"><div class="prose"><h2>{gp}: {nm} Griha Pravesh</h2><p>{tr}</p><h2>Cities with {nm} pandits</h2><p>{", ".join(f"<a href={chr(34)}pandit-in-{c[0]}.html#{nm.lower()}{chr(34)}>{c[1]}</a>" for c in METROS if nm in c[2])}{(", "+LANGCITIES(nm)) if LANGCITIES(nm) else ""}, and online anywhere in India.</p><h2>Pujas in {nm}</h2><p>{", ".join(f"<a href={chr(34)}{x[0]}.html{chr(34)}>{x[1]}</a>" for x in S)}.</p><p>Availability by date and city is confirmed before you pay.</p></div><aside>{form()}</aside></div></section>')
# SERVICES
page("services.html","All Pujas & Sanskar You Can Book Online | Online Pujari","Browse pooja booking options: Griha Pravesh, Satyanarayan, Rudrabhishek, Bhoomi Puja, Vastu Shanti, Mundan, Annaprasan and more.",head("All pujas and sanskar","Select a ceremony to see what it involves, the samagri needed and the starting price.",' / Pujas')+f'<section><div class="w"><input class="find" data-search=".list" type="search" placeholder="Search puja, e.g. griha pravesh" aria-label="Search pujas"><div class="list">{"".join(card(s) for s in S)}</div></div></section>')
# SERVICE PAGES
for s in S:
  slug,name,hi,short,kw,price,dur,why,sam,faq=s
  body=head(f"{name} – book pandit online",f"{short} Starting from ₹{price:,}, {dur}.",f' / <a href="services.html">Pujas</a> / {e(name)}')+f'''<section><div class="w two"><div class="prose">
<h2>What is {e(name)}?</h2><p>{e(why)}</p>
<h2>Samagri (puja items)</h2><ul>{"".join(f"<li>{e(i)}</li>" for i in sam)}</ul><p>Our pandit can bring the complete samagri kit, or share a list if you prefer to arrange it.</p>
<h2>How we perform it</h2><p>Duration is about {dur}. The pandit performs the sankalp with your name and gotra, Ganesh pujan, the main ritual with mantras, aarti and closing prasad. The puja can be at home, at a venue or online by video.</p>
<h2>Price</h2><table><tr><th>Option</th><th>Starting price</th></tr><tr><td>Pandit only (you arrange samagri)</td><td>₹{price:,}</td></tr><tr><td>Pandit with complete samagri</td><td>₹{round(price*1.4,-2):,.0f}</td></tr><tr><td>Online puja</td><td>₹{round(price*0.8,-2):,.0f}</td></tr></table>
<h2>Frequently asked questions</h2>{"".join(f"<details><summary>{e(q)}</summary><p>{e(a)}</p></details>" for q,a in faq)}{rel(slug)}<p><a href="blog.html">Read more guides</a></p>
</div><aside>{form(name)}</aside></div></section>'''
  sch={"@context":"https://schema.org","@graph":[{"@type":"Service","name":name,"provider":org,"areaServed":"India","offers":{"@type":"Offer","priceCurrency":"INR","price":price},"description":why},{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faq]}]}
  page(slug+".html",f"{name} – Book Pandit Online, Samagri & Price | Online Pujari",f"Book {kw} with a verified pandit at home or online. Samagri list, process, duration and price from ₹{price:,}.",body,sch)
# FESTIVALS
page("festival-calendar-2026.html","Festival Dates 2026: Diwali, Navratri, Janmashtami, Ganesh Chaturthi | Online Pujari","Hindu festival dates 2026 with puja timings: Diwali, Dhanteras, Navratri, Janmashtami, Ganesh Chaturthi, Vat Savitri, Nag Panchami and more.",head("Hindu festival dates 2026","Dates and puja timings for major festivals. Exact muhurat varies by city, so confirm with your pandit.",' / Festival dates')+f'<section><div class="w prose" style="max-width:820px"><table><tr><th>Festival</th><th>Date</th><th>Puja time</th></tr>{"".join(f"<tr><td>{a}</td><td>{b}</td><td>{c}</td></tr>" for a,b,c in FEST)}</table><p style="margin-top:24px">Pandits book out quickly around Diwali, Ganesh Chaturthi and Navratri. <a href="book.html">Reserve your pandit now</a>.</p></div></section>')
# PANDIT BOOKING
page("pandit-booking.html","Book Pandit Online for Puja – Pandit Ji at Home | Online Pujari","Book pandit online for any puja. Verified pandit ji for puja at your home, temple or by video call, with muhurat help and clear pricing.",head("Book a pandit online","Pandit ji for puja at home or by video, matched to your language, tradition and city.",' / Book pandit')+f'<section><div class="w two"><div class="prose"><h2>How to book a pandit ji</h2>{HOW}<h2>Our pandits</h2><p>Every pandit is interviewed for Vedic knowledge and conduct, and is rated by families after each puja. Pandits speak Hindi, Sanskrit, Tamil, Telugu, Kannada, Marathi, Gujarati and Bengali.</p>{rel("pandit-booking")}<h2>Pujas you can book</h2><p>{", ".join(f"<a href={chr(34)}{s[0]}.html{chr(34)}>{s[1]}</a>" for s in S)}.</p></div><aside>{form()}</aside></div></section>')
page("book.html","Book Puja Online – Request a Pandit | Online Pujari","Request a pandit for your puja in under a minute. We confirm on WhatsApp or call.",head("Book your puja","Fill in the details and we will confirm your pandit and muhurat on WhatsApp.",' / Book')+f'<section><div class="w" style="max-width:560px">{form()}</div></section>')
page("about.html","About Online Pujari","Online Pujari connects families across India and abroad with verified pandits for authentic puja and sanskar.",head("About Online Pujari","We make it simple to perform pujas properly, wherever you live.",' / About')+'<section><div class="w prose"><p>Online Pujari began with a simple problem: finding a knowledgeable pandit at short notice. Today we connect families in India and abroad with verified pandits for pujas, homams and sanskar, performed at home or online.</p><p>We keep pricing clear, respect each family’s tradition and confirm the muhurat before you pay.</p></div></section>')
page("contact.html","Contact Online Pujari",f"Call or email Online Pujari to book a pandit or ask about puja.",head("Contact us","We reply within a few hours.",' / Contact')+f'<section><div class="w prose"><p>Phone and WhatsApp: <b>{PHONE}</b></p><p>Email: <a href="mailto:{EMAIL}">{EMAIL}</a></p><p>Hours: 7 am – 9 pm, every day.</p></div></section>')
page("privacy.html","Privacy and Terms | Online Pujari","Privacy policy and booking terms.",head("Privacy and terms","How we handle your details and bookings.")+'<section><div class="w prose"><p>We collect your name, phone number, city and puja preference only to arrange your booking. We do not sell your data. Prices shown are starting prices and may vary by city, samagri and number of pandits. Rescheduling is free up to 48 hours before the puja. Replace this text with your final policy.</p></div></section>')
page("404.html","Page not found | Online Pujari","Page not found",head("Page not found","That page has moved. Try our pujas or go home.")+'<section><div class="w"><a class="btn" href="services.html">Browse pujas</a></div></section>')

# BLOG
page("blog.html","Puja Blog: Festival Dates, Vrat, Muhurat & Sanskar Guides | Online Pujari","Hindu festival dates, vrat rules, Gita quotes, muhurat and sanskar guides from Online Pujari.",head("Puja guides and festival dates","Dates, vidhi and meanings, written to be used.",' / Blog')+f'<section><div class="w"><div class="bar2"><input class="find" data-search=".list" type="search" placeholder="Search guides, e.g. diwali, ekadashi, gotra" aria-label="Search guides"><div class="chipbar" role="group" aria-label="Category"><button class="on" data-c="">All</button>{"".join(f"<button data-c={chr(34)}{e(c)}{chr(34)}>{e(c)}</button>" for c in CAT)}</div></div><div class="list">{"".join(artcard(a) for a in ARTS)}</div></div></section>',{"@context":"https://schema.org","@type":"Blog","name":BRAND+" Blog","url":SITE+"/blog.html"})
today=datetime.date.today().isoformat()
for a in ARTS:
  slug,title,cat,desc,pat,intro,secs,svc=a
  toc="".join(f'<li><a href="#s{i}">{e(h)}</a></li>' for i,(h,_) in enumerate(secs))
  more="".join(artcard(b) for b in [x for x in ARTS if x[2]==cat and x[0]!=slug][:3] or ARTS[:3])
  sv=next(x for x in S if x[0]==svc)
  body=head(title,desc,f' / <a href="blog.html">Blog</a> / {e(cat)}')+f'''<section><div class="w two"><article class="prose"><p class="meta">By Online Pujari pandit team · Updated {today} · {rt(a)} min read</p>
<p class="lead2">{intro}</p><nav class="toc" aria-label="Contents"><b>In this guide</b><ol>{toc}</ol></nav>
{"".join(f'<h2 id="s{i}">{e(h)}</h2>{b}' for i,(h,b) in enumerate(secs))}{rel(slug)}
<div class="cta"><h3>Need a pandit for this?</h3><p>{e(sv[1])} from ₹{sv[5]:,}. Verified pandit, muhurat confirmed before you pay.</p><a class="btn" href="{sv[0]}.html">See {e(sv[1])}</a></div></article>
<aside>{form(sv[1])}</aside></div></section><section class="soft"><div class="w"><h2>More guides</h2><div class="list">{more}</div></div></section>'''
  sch={"@context":"https://schema.org","@graph":[{"@type":"Article","headline":title,"inLanguage":"en-IN","image":SITE+"/assets/img/og-image.png","description":desc,"dateModified":today,"author":org,"publisher":org,"mainEntityOfPage":SITE+"/"+slug+".html"},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":SITE+"/"},{"@type":"ListItem","position":2,"name":"Blog","item":SITE+"/blog.html"},{"@type":"ListItem","position":3,"name":title}]}]}
  page(slug+".html",title+" | Online Pujari",desc,body,sch)
# GLOSSARY (every keyword that did not fit a page above)
g=sorted(set(MAP["puja-glossary"]),key=str.lower);by=collections.defaultdict(list)
for k in g:by[k[0].upper() if k[0].isalpha() else "#"].append(k)
page("puja-glossary.html","Puja, Festival & Hindu Terms A–Z | Online Pujari","A–Z of puja, festival, vrat and ritual terms people search for, with links to our guides and booking pages.",head("Puja and festival terms A–Z","Quick index of terms, festivals and rituals. Use our guides for full details.",' / Glossary')+'<section><div class="w prose" style="max-width:900px"><p>Looking for a puja or date? Start with <a href="blog.html">our guides</a>, <a href="festival-calendar-2026.html">festival dates</a> or <a href="pandit-booking.html">book a pandit</a>.</p>'+"".join(f'<h2>{l}</h2><ul class="chips">{"".join(f"<li>{e(k)}</li>" for k in v)}</ul>' for l,v in sorted(by.items()))+'</div></section>')
with open("tools/data/coverage.csv","w",newline="",encoding="utf-8") as f:
  w=csv.writer(f);w.writerow(["keyword","volume","page"])
  for sl,ks in MAP.items():
    for k in ks:w.writerow([k,VOL[k],sl+".html"])
# LOCATIONS
AREAS=[("pandit-in-greater-noida-west","Greater Noida West","Noida Extension, Gaur City, Supertech Ecovillage and other large gated societies","Most homes here are flats in high-rise societies. Ask your RWA about havan or open-flame rules, and plan parking for the pandit and any samagri kit."),
("pandit-in-ghaziabad","Ghaziabad","Indirapuram, Vaishali, Vasundhara, Raj Nagar Extension and Crossings Republik","Ghaziabad has many apartment federations and independent houses. We can arrange the puja at your flat, a society hall or a temple venue."),
("pandit-in-delhi","Delhi","Dwarka, Rohini, Laxmi Nagar, Mayur Vihar, South Delhi colonies and Janakpuri","Delhi homes range from DDA flats to independent floors. Tell us the floor and parking so the pandit arrives on time with the samagri."),
("pandit-in-gurugram","Gurugram","Golf Course Road, Sohna Road, DLF phases and Dwarka Expressway societies","Gurugram’s gated societies often need a gate pass and have clubhouse booking rules. Share the society name and we plan the timing around them.")]
for slug,city,areas,tip in AREAS:
  svcs=", ".join(f'<a href="{x[0]}.html">{x[1]}</a>' for x in S[:6])
  page(slug+".html",f"Pandit in {city} for Puja at Home | Online Pujari",f"Book a pandit in {city} for Griha Pravesh, Satyanarayan, Rudrabhishek, office opening and more at your home or society.",head(f"Pandit in {city}",f"Pandit ji for puja at your home, society or office in {city}.",' / <a href="locations.html">Locations</a> / '+city)+f'<section><div class="w two"><div class="prose"><h2>Areas we serve in {city}</h2><p>{areas}.</p><h2>Tips for {city} homes</h2><p>{tip}</p><h2>Pujas you can book</h2><p>{svcs}, and <a href="services.html">many more</a>.</p><h2>Online option</h2><p>If you prefer, a pandit can lead the puja over video and guide your family step by step.</p></div><aside>{form()}</aside></div></section>')
exec(open("tools/city_pages.py",encoding="utf-8").read())
# POLICY & COMPANY
page("faqs.html","FAQs: Booking a Pandit Online | Online Pujari","Answers to common questions about booking a pandit, language, samagri, online puja, muhurat, payment and rescheduling.",head("Frequently asked questions","Quick answers before you book.",' / FAQs')+'<section><div class="w prose">'+"".join(f"<details><summary>{e(q)}</summary><p>{e(a)}</p></details>" for q,a in FAQS)+'</div></section>',{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in FAQS]})
page("become-a-pandit.html","Become a Pandit Partner | Online Pujari","Join Online Pujari as a pandit. Get puja bookings in your city, at home, office and online.",head("Become a pandit partner","Get regular puja bookings in your city.",' / Become a pandit')+f'<section><div class="w prose"><p>If you are a trained pandit or purohit, share your name, city, languages, pujas you perform and years of experience. We will contact you for verification.</p><p><a class="btn" href="mailto:{EMAIL}?subject=Pandit%20partner">Apply by email</a></p></div></section>')
page("terms.html","Terms and Conditions | Online Pujari","Terms for booking puja services with Online Pujari.",head("Terms and conditions","Please read before booking.",' / Terms')+'<section><div class="w prose"><p>Prices shown are starting prices and may vary with city, samagri and pandits. A booking is confirmed once the pandit and muhurat are agreed. We connect you with independent pandits and are not responsible for outcomes of rituals. Replace this text with your final terms after legal review.</p></div></section>')
page("refund.html","Refund Policy | Online Pujari","Refund and rescheduling policy for puja bookings.",head("Refund policy","Rescheduling and refunds.",' / Refund policy')+'<section><div class="w prose"><p>Reschedule free up to 48 hours before the puja. If we cannot assign a pandit, you receive a full refund. Replace with your final policy.</p></div></section>')

urls=["index.html","blog.html","puja-glossary.html"]+[a[0]+".html" for a in ARTS]+["index.html","services.html","pandit-booking.html","festival-calendar-2026.html","book.html","about.html","contact.html","locations.html","faqs.html","become-a-pandit.html","terms.html","refund.html","privacy.html"]+[x[0]+".html" for x in AREAS]+[f"pandit-in-{m[0]}.html" for m in METROS]+[l[0].lower()+"-pandit.html" for l in LANGS]+[s[0]+".html" for s in S]+[f"pandit-in-{c[0]}.html" for c in CITYDATA]+[f"pandits-in-{k}.html" for k,v in STATES.items() if any(c[2]==k for c in CITYDATA)]
urls=list(dict.fromkeys(urls))
open("sitemap.xml","w").write('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+"".join(f"<url><loc>{SITE}/{public(u)}</loc><lastmod>{datetime.date.today().isoformat()}</lastmod></url>" for u in urls)+"</urlset>")
open("robots.txt","w").write(f"User-agent: *\nAllow: /\nDisallow: /account/\nSitemap: {SITE}/sitemap.xml\n")
# CNAME intentionally not generated until the custom domain is bought
open(".nojekyll","w").write("")
json.dump([[x[0],x[1]] for x in S],open("assets/data/pujas.json","w",encoding="utf-8"),ensure_ascii=False)
print(len(urls)+2,"pages built")

open("llms.txt","w",encoding="utf-8").write(f"""# Online Pujari
> Book verified pandits for puja, havan and sanskar at home or online in {len(CITYDATA)+len(METROS)+5}+ Indian cities, in Hindi, Tamil, Telugu, Kannada, Marathi, Bengali, Gujarati and Malayalam. Muhurat is confirmed before you pay.

## Key pages
- [All pujas and prices]({SITE}/pujas/)
- [Book a pandit]({SITE}/pages/pandit-booking.html)
- [Cities and states]({SITE}/locations/)
- [Festival dates 2026]({SITE}/pages/festival-calendar-2026.html)
- [Blog: festival and puja guides]({SITE}/blog/)
- [FAQs]({SITE}/pages/faqs.html)
""")
