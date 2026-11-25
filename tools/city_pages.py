# exec()'d from build.py: generates city pages, state hubs and the locations index.
LCODE={l[0]:l for l in LANGS}
SLUGS={m[0] for m in METROS}|{a[0].replace("pandit-in-","") for a in AREAS}
assert not any(c[0] in SLUGS for c in CITYDATA),[c[0] for c in CITYDATA if c[0] in SLUGS]
_min=min(x[5] for x in S);_max=max(x[5] for x in S)
def _lang_links(langs):return ", ".join(f'<a href="{l.lower()}-pandit.html">{l}</a>' for l in langs if l in LCODE)
INTRO=["Looking for a pandit in {city}? Online Pujari matches families in {city}, {state} with verified pandits for home, society, office and shop pujas, with the muhurat confirmed before you pay.",
"Book a pandit in {city} for your next puja without calling around. Tell us the puja, date and language, and we confirm a pandit and muhurat for {city} on WhatsApp before any payment.",
"Families in {city} can book a pandit for griha pravesh, satyanarayan, rudrabhishek and other pujas in one place, with language matching and clear starting prices."]
for idx,(sl,city,st,areas) in enumerate(CITYDATA):
  state,reg,sup,fest,note=STATES[st]
  hub=f"pandits-in-{st}.html"
  area_txt=f"We arrange pandits across {city}, including {areas}, subject to availability on your date." if areas else f"We arrange pandits across {city} and nearby towns, subject to availability on your date."
  regline=f" Pandits who perform puja in {reg} can be arranged on request." if reg not in sup and reg!="Hindi" else ""
  puja_li="".join(f'<li><a href="{x[0]}.html">{x[1]}</a> · from ₹{x[5]:,} · {x[6]}</li>' for x in S[:10])
  near=[c for c in CITYDATA if c[2]==st and c[0]!=sl][:8]
  nearh=f'<h2>Other cities in {state}</h2><p>{", ".join(f"<a href={chr(34)}pandit-in-{c[0]}.html{chr(34)}>{c[1]}</a>" for c in near)}. See all of <a href="{hub}">{state}</a>.</p>' if near else f'<p>See all cities in <a href="{hub}">{state}</a>.</p>'
  faqs=[(f"How do I book a pandit in {city}?",f"Choose your puja, date and language in the booking form or message us on WhatsApp. We confirm the pandit and muhurat for {city} before you pay anything."),
   (f"What is the cost of a pandit in {city}?",f"Pujas start from ₹{_min:,}. The price depends on the puja, duration and whether you want the samagri kit; each puja page shows both prices, and the final amount is confirmed before payment."),
   (f"Which languages are available in {city}?",f"{', '.join(sup)}.{regline}"),
   (f"Do you serve all areas of {city}?",area_txt),
   (f"Can I book an online puja from {city}?",f"Yes. If a pandit in your language is not free on your date, a pandit can lead the puja by video and perform the sankalp in your name and gotra.")]
  body=head(f"Pandit in {city}",f"Verified pandits for puja at home, society, office or online in {city}, {state}.",f' / <a href="locations.html">Locations</a> / <a href="{hub}">{state}</a> / {city}')+f'''<section><div class="w two"><div class="prose">
<p>{INTRO[idx%3].format(city=city,state=state)}</p><p>{e(note)}</p>
<h2>Pandit languages in {city}</h2><p>We match by language and sampradaya first: {_lang_links(sup)}.{regline}</p>
<h2>Areas we serve in {city}</h2><p>{area_txt}</p>
<h2>Popular pujas in {city}</h2><ul>{puja_li}</ul><p><a href="services.html">See all pujas and prices</a></p>
<h2>Festivals and occasions in {state}</h2><p>{fest}. Pandit slots fill quickly in festival weeks, so share your date early.</p>
<h2>Muhurat for {city}</h2><p>Panchang timings such as tithi, nakshatra and sunrise vary by location, so we check the muhurat for {city} instead of using a generic national calendar. Not sure of a date? Choose “help me find a date” in the form.</p>
<h2>How booking works in {city}</h2><ol class="steps"><li>Tell us the puja, date and language.</li><li>We confirm the pandit and muhurat on WhatsApp.</li><li>You pay only after confirmation, and the pandit arrives with the puja plan.</li></ol>
{nearh}
<h2>Frequently asked questions</h2>{"".join(f"<details><summary>{e(q)}</summary><p>{e(a)}</p></details>" for q,a in faqs)}
</div><aside>{form()}</aside></div></section>'''
  sch={"@context":"https://schema.org","@graph":[{"@type":"Service","name":f"Pandit booking in {city}","serviceType":"Pandit booking for puja, havan and sanskar","provider":org,"areaServed":{"@type":"City","name":city,"containedInPlace":{"@type":"AdministrativeArea","name":state}},"offers":{"@type":"AggregateOffer","priceCurrency":"INR","lowPrice":_min,"highPrice":_max,"offerCount":len(S)}},
   {"@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in faqs]}]}
  page(f"pandit-in-{sl}.html",f"Pandit in {city} for Puja: Book Online | Online Pujari",f"Book a verified pandit in {city}, {state} for Griha Pravesh, Satyanarayan, Rudrabhishek and more. {', '.join(sup[:3])} pandits, pay after confirmation.",body,sch)
# ---- state hubs ----
for st,(state,reg,sup,fest,note) in STATES.items():
  cs=[c for c in CITYDATA if c[2]==st]
  if not cs:continue
  body=head(f"Pandit in {state}",f"Book a verified pandit in {len(cs)} cities across {state}, at home or online.",f' / <a href="locations.html">Locations</a> / {state}')+f'''<section><div class="w two"><div class="prose">
<p>{e(note)} Pick your city to see areas, languages and starting prices.</p>
<h2>Cities in {state}</h2><ul>{"".join(f'<li><a href="pandit-in-{c[0]}.html">Pandit in {c[1]}</a></li>' for c in cs)}</ul>
<h2>Languages</h2><p>{_lang_links(sup)}.</p>
<h2>Festivals and occasions</h2><p>{fest}.</p>
<h2>Popular pujas</h2><p>{", ".join(f"<a href={chr(34)}{x[0]}.html{chr(34)}>{x[1]}</a>" for x in S[:8])}, and <a href="services.html">more</a>.</p></div><aside>{form()}</aside></div></section>'''
  page(f"pandits-in-{st}.html",f"Pandit in {state}: Book Puja Online in {len(cs)} Cities | Online Pujari",f"Book a verified pandit in {state}: {', '.join(c[1] for c in cs[:4])} and more. {', '.join(sup[:3])} pandits, pay after confirmation.",body,{"@context":"https://schema.org","@type":"ItemList","name":f"Pandit booking cities in {state}","itemListElement":[{"@type":"ListItem","position":i+1,"name":f"Pandit in {c[1]}","url":f"{SITE}/pandit-in-{c[0]}.html"} for i,c in enumerate(cs)]})
# ---- locations index ----
_MS={"bengaluru":"Karnataka","chennai":"Tamil Nadu","hyderabad":"Telangana","pune":"Maharashtra","mumbai":"Maharashtra"}
rows=[(f"pandit-in-{m[0]}",m[1],_MS[m[0]],m[3]) for m in METROS]+[("pandit-ji-in-noida-greater-noida","Noida and Greater Noida","Delhi NCR","Sectors, Gaur City, Alpha, Beta, Pari Chowk and nearby societies")]+[(a[0],a[1],"Delhi NCR",a[2]) for a in AREAS]+[(f"pandit-in-{c[0]}",c[1],STATES[c[2]][0],c[3] or f"{c[1]} and nearby towns") for c in CITYDATA]
chips="".join(f'<a href="pandits-in-{k}.html">{v[0]}</a>' for k,v in STATES.items() if any(c[2]==k for c in CITYDATA))
page("locations.html",f"Pandit Near Me: Book Pandit in {len(rows)}+ Indian Cities | Online Pujari",f"Find a pandit near you: Guwahati, Kolkata, Delhi NCR, Mumbai, Bengaluru, Chennai, Hyderabad, Jaipur, Lucknow and {len(rows)-9}+ more cities. Puja at home, society, office or online.",head("Pandit near you",f"Choose your city from {len(rows)}+ locations across India. Online puja is available anywhere.",' / Locations')+f'<section><div class="w"><h2>Browse by state</h2><div class="cityc">{chips}</div><h2 style="margin-top:34px">All cities</h2><input class="find" data-search=".list" type="search" placeholder="Search your city or state, e.g. Guwahati" aria-label="Search cities"><div class="list">'+"".join(f'<a class="row post" href="{sl}.html"><small>{stt}</small><h3>Pandit in {c}</h3><p>{a}</p></a>' for sl,c,stt,a in rows)+'</div></div></section>',{"@context":"https://schema.org","@type":"ItemList","name":"Cities where Online Pujari arranges pandits","itemListElement":[{"@type":"ListItem","position":i+1,"name":f"Pandit in {r[1]}","url":f"{SITE}/{r[0]}.html"} for i,r in enumerate(rows)]})
