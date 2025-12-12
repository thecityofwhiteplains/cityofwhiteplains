-- Draft blog posts batch insert. Run in Supabase SQL editor or psql to save as drafts.
-- All posts are drafts with no hero images; add images later if desired.

insert into blog_posts (
  slug,
  title,
  category,
  status,
  published_at,
  reading_time,
  meta_title,
  meta_description,
  hero_image_url,
  body_html,
  ad_embed_code
) values

-- 1) White Plains restaurants scene
(
  'white-plains-restaurant-scene-guide',
  'Where to Eat in White Plains Right Now: Neighborhood Bites, Happy Hours, and Late-Night Staples',
  'Guide',
  'draft',
  null,
  7,
  'White Plains Restaurant Scene Guide | WP Insider Blog',
  'A calm, current guide to White Plains restaurants: quick lunches, happy hours, and late-night bites within a few blocks of transit.',
  null,
  $$<h1>Where to Eat in White Plains Right Now: Neighborhood Bites, Happy Hours, and Late-Night Staples</h1>
<p>White Plains packs an outsized restaurant scene into a walkable core. Whether you step off Metro-North, park once and roam, or meet friends after work, you can cover coffee, lunch, happy hour, dinner, and late-night desserts without leaving a 10–15 minute grid.</p>

<h2>Fast, reliable lunch near transit</h2>
<p>Within a few blocks of the station and transit center, you’ll find salads, grain bowls, ramen, sushi, tacos, and slices. Around City Center, quick counter spots keep lines moving even on court days. If you need AC and a seat, the dining level at The Westchester offers predictable options and clean restrooms.</p>

<h2>Happy hour targets on Mamaroneck Ave</h2>
<p>Mamaroneck Ave is the spine. Pub-style spots deliver wings, burgers, and beer specials; nearby cocktail bars pour more polished drinks with small bites. On good weather days, sidewalk seating fills up fast between Main St and Maple Ave—arrive before 5:30 p.m. to snag a table.</p>

<h2>Dinner picks by mood</h2>
<ul>
  <li><strong>Group-friendly:</strong> Mediterranean grills, sushi combos, and family-style Italian are clustered within two blocks of Renaissance Plaza.</li>
  <li><strong>Date night:</strong> Steak and seafood houses west of Mamaroneck Ave stay quieter than the central strip.</li>
  <li><strong>Casual but polished:</strong> Modern ramen, tapas, and noodle bars around City Center keep waits short and offer bar seating.</li>
</ul>

<h2>Late-night staples</h2>
<p>After 9 p.m., pizza slices, diner plates, and a few pubs keep kitchens open. Check posted kitchen hours before settling in—several bars switch to drinks-only late night. Rideshares are easiest on Hamilton Ave or Court St if the station loop clogs.</p>

<h2>Coffee, treats, and non-alcohol options</h2>
<p>Independent cafés along Main St and Mamaroneck Ave turn out espresso, matcha, and pastries; chain staples sit closer to the station. For desserts, look for gelato, frozen yogurt, or bakery cases near City Center. Mocktails are now standard on many menus—ask your server, most bars will mix zero-proof versions of house favorites.</p>

<h2>How to plan a smooth night</h2>
<ol>
  <li>Pick a parking garage (Hamilton-Main, City Center) or arrive by train/bus.</li>
  <li>Choose a dinner anchor within 5–10 minutes of your exit.</li>
  <li>Layer on happy hour or dessert stops along Mamaroneck Ave or Main St.</li>
  <li>Check kitchen closing times if you’re heading out after 9 p.m.</li>
</ol>

<h2>Local etiquette and tips</h2>
<p>Reservations help on Friday/Saturday after 6 p.m., especially for steak and sushi. Many spots add automatic gratuity on large parties—ask upfront. If a place is packed, the next block often has an open bar seat; walk a minute rather than waiting 40.</p>

<h2>More to explore</h2>
<p>We keep restaurant guides current with reader tips. Tell us what’s new at <a href="https://cityofwhiteplains.com" target="_blank" rel="noopener">CityOfWhitePlains.com</a> and we’ll add it to the next update.</p>
$$,
  null
),

-- 2) Galleria redevelopment
(
  'white-plains-galleria-redevelopment-update',
  'What’s Next for the Galleria Site in White Plains?',
  'Guide',
  'draft',
  null,
  6,
  'Galleria Redevelopment in White Plains | WP Insider Blog',
  'What to know about the Galleria demolition and the mixed-use project planned for downtown White Plains.',
  null,
  $$<h1>What’s Next for the Galleria Site in White Plains?</h1>
<p>The former Galleria mall is coming down to make way for a new mixed-use district in the heart of White Plains. Here’s what locals and visitors should know about the demolition, timelines, and what to expect on the block between Main St, Lexington Ave, and Martin Luther King Jr. Blvd.</p>

<h2>Where the project stands</h2>
<p>Demolition work is staged in sections to minimize traffic impact. Expect intermittent lane shifts on Main St and Lexington Ave and sidewalk detours posted near the site perimeter. The transit center and Metro-North remain fully accessible; give yourself a few extra minutes if you’re walking from the station through Main St.</p>

<h2>What’s planned</h2>
<ul>
  <li><strong>Mixed-use towers:</strong> Residential units over ground-floor retail and food spaces to activate the street.</li>
  <li><strong>Public realm upgrades:</strong> Wider sidewalks, seating pockets, and lighting intended to make the block feel less like a superblock and more like a connected grid.</li>
  <li><strong>Transit-first access:</strong> Direct walking paths toward the transit center plus designated rideshare pickup areas to keep bus lanes clearer.</li>
</ul>

<h2>Timeline signals</h2>
<p>Demolition is phased through the next 12–18 months, followed by site work and foundation activity. Retail and public-space build-outs typically trail residential tops-off, so don’t expect new storefronts overnight. Watch for city notices and BID updates for milestone dates.</p>

<h2>How nearby businesses are affected</h2>
<p>Shops and restaurants just outside the footprint remain open. Wayfinding signs are posted around Main St and Court St; look for “Open During Construction” banners. If you drive, favor the Hamilton-Main or City Center garages to stay out of lane closures.</p>

<h2>Why it matters for downtown</h2>
<p>The project fills a large block that once cut off foot traffic between Main St and the transit center. More street-level retail, better lighting, and housing on top should extend the active hours of downtown, giving locals more options without hopping a train south.</p>

<h2>Stay updated</h2>
<p>We’ll keep a running timeline and local impact notes at <a href="https://cityofwhiteplains.com" target="_blank" rel="noopener">CityOfWhitePlains.com</a>. If you see a detour or update we should share, send it along and we’ll add it to the guide.</p>
$$,
  null
),

-- 3) Housing in White Plains
(
  'housing-in-white-plains-guide',
  'Housing in White Plains: Rents, Co-ops, and How to Choose a Neighborhood',
  'Guide',
  'draft',
  null,
  7,
  'Housing in White Plains: Neighborhood Guide | WP Insider Blog',
  'Understand rents, co-ops, and neighborhoods in White Plains, from downtown walkability to quieter residential pockets.',
  null,
  $$<h1>Housing in White Plains: Rents, Co-ops, and How to Choose a Neighborhood</h1>
<p>White Plains offers a mix of rentals, co-ops, and newer mid-rise apartments clustered near transit, plus quieter residential pockets a short bus ride away. Use this guide to orient yourself before you start tours.</p>

<h2>Downtown vs. residential pockets</h2>
<ul>
  <li><strong>Downtown core:</strong> Newer luxury rentals with gyms and doormen, steps from Metro-North and Bee-Line. Expect higher rents and paid garage parking.</li>
  <li><strong>Battle Hill & Fisher Hill:</strong> Low-rise buildings and older homes; quieter streets, limited on-street parking rules.</li>
  <li><strong>North White Plains fringe:</strong> More garden-style apartments and co-ops, plus walkable access to the North White Plains station.</li>
</ul>

<h2>What to know about co-ops</h2>
<p>Co-ops remain a path to ownership with lower sticker prices than condos, but boards often have income and down payment requirements. Factor in maintenance fees and interview timelines. Ask about sublet policies if you may move within a few years.</p>

<h2>Parking and commuting</h2>
<p>Many downtown buildings lease garage spots separately; budget $150–$250+ per month. Street parking varies by block—check signage for permit requirements. If you go car-light, the Harlem Line runs frequent trains to Manhattan and Bee-Line routes 1, 13, 21, and 60-series cover most local errands.</p>

<h2>Noise, light, and lifestyle fit</h2>
<ul>
  <li><strong>Nightlife proximity:</strong> Units facing Mamaroneck Ave or Main St trade convenience for weekend noise; higher floors and interior courtyards are quieter.</li>
  <li><strong>Parks and green space:</strong> Tibbits Park, Bryant-Mamaroneck Park, and Bronx River Pathway give you fresh air within a short walk; map these before signing.</li>
  <li><strong>Groceries and errands:</strong> Downtown residents often rely on walkable chains and smaller markets; having a cart makes life easier.</li>
</ul>

<h2>Budgeting tips</h2>
<p>Ask buildings for all-in monthly costs: rent or maintenance, parking, pet fees, and utilities. Newer construction may include gym access; older stock might charge separately. For renters, note renewal caps and concession structures—one free month can mask a higher effective rent later.</p>

<h2>Where to start tours</h2>
<p>Begin with two contrasting options: one newer building in the core and one co-op or garden complex a bit farther out. Compare sunlight, hallway noise, and weekend street activity. If you work hybrid, time a morning and evening commute during your visit.</p>

<h2>Keep up with local changes</h2>
<p>Redevelopments like the former Galleria site will add more housing and retail over time. We track openings and neighborhood shifts at <a href="https://cityofwhiteplains.com" target="_blank" rel="noopener">CityOfWhitePlains.com</a>—check back before you sign.</p>
$$,
  null
),

-- 4) Family day itinerary (kid-friendly)
(
  'family-day-in-white-plains',
  'Family Day in White Plains: Library, Parks, Matinees, and Easy Eats',
  'Guide',
  'draft',
  null,
  6,
  'Family Day in White Plains | WP Insider Blog',
  'Kid-friendly White Plains itinerary with library time, parks, matinees, and easy meals within a short walk or drive.',
  null,
  $$<h1>Family Day in White Plains: Library, Parks, Matinees, and Easy Eats</h1>
<p>You can cover books, playground time, a movie, and dinner in White Plains without racking up miles. Here’s a kid-friendly loop that works for visitors and locals.</p>

<h2>Start at the library</h2>
<p>The White Plains Public Library offers children’s story times, craft tables, and quiet corners. Check the calendar before you go and plan around scheduled programs. It’s also a good weather hedge—if rain hits, you’ve already got an indoor stop.</p>

<h2>Playground break</h2>
<ul>
  <li><strong>Tibbits Park:</strong> Easy stroll from Main St; open space for a quick run-around.</li>
  <li><strong>Bryant-Mamaroneck Park:</strong> Benches, shade, and room for toddlers to move.</li>
  <li><strong>Battle Hill (short drive):</strong> Small neighborhood playground if you’re parked nearby.</li>
</ul>

<h2>Lunch that’s fast and flexible</h2>
<p>City Center and Mamaroneck Ave have kid-friendly menus: pizza by the slice, noodles, burgers, and tacos. Many places have counter service so you can be in and out between nap windows.</p>

<h2>Matinee or indoor backup</h2>
<p>Catch a matinee at City Center to reset energy levels. If you’d rather skip a movie, the mall’s dining level offers space to sit, regroup, and plan the afternoon.</p>

<h2>Afternoon treat</h2>
<p>Gelato and frozen yogurt spots near Main St are easy wins. Bring a stroller—sidewalks get busy, and you’ll appreciate the storage for jackets and snacks.</p>

<h2>Early dinner and home</h2>
<p>Book a 5–6 p.m. table to beat the rush. Family-style Mediterranean, ramen, and casual grills handle groups well. Ask for sidewalk or patio seating in good weather; it’s calmer for younger kids.</p>

<h2>Logistics that help</h2>
<ul>
  <li>Pick one garage (Hamilton-Main or City Center) and leave the car.</li>
  <li>Pack a small blanket for park breaks and movie comfort.</li>
  <li>Restrooms: library, City Center, and larger cafés typically have the most predictable facilities.</li>
</ul>

<h2>Keep it simple</h2>
<p>Build your day around the library and one park, and let snacks and treats fill the gaps. For more local ideas, check <a href="https://cityofwhiteplains.com" target="_blank" rel="noopener">CityOfWhitePlains.com</a>.</p>
$$,
  null
),

-- 5) Rainy day guide
(
  'rainy-day-in-white-plains',
  'Rainy Day in White Plains: Indoor Plans, Coffee Stops, and Quick Errands',
  'Guide',
  'draft',
  null,
  6,
  'Rainy Day Guide to White Plains | WP Insider Blog',
  'Stay productive and comfortable on a rainy day in White Plains with indoor stops, coffee breaks, and easy errands near transit.',
  null,
  $$<h1>Rainy Day in White Plains: Indoor Plans, Coffee Stops, and Quick Errands</h1>
<p>Rain doesn’t have to stall your White Plains plans. Everything here stays close to transit and garages so you can keep your shoes dry and still get things done.</p>

<h2>Start with a covered arrival</h2>
<p>Park once in a garage with interior access (Hamilton-Main or City Center) or ride Metro-North/Bee-Line and head straight into downtown under covered awnings. If you need an umbrella or charger, check the convenience shops near the transit center first.</p>

<h2>Anchor stops to build around</h2>
<ul>
  <li><strong>White Plains Public Library:</strong> Reliable Wi-Fi, seating, and events. Use it as your home base between errands.</li>
  <li><strong>The Westchester:</strong> Indoor laps for steps, window shopping, and food court seating when you need a reset.</li>
  <li><strong>City Center:</strong> Movie matinees and dining options without crossing long blocks in the rain.</li>
</ul>

<h2>Coffee and lunch without a long walk</h2>
<p>Cafés on Main St and Mamaroneck Ave give you espresso, pastries, and soups within a few covered blocks. For lunch, pick a spot attached to a garage or inside City Center to keep umbrellas packed away.</p>

<h2>Errands you can finish indoors</h2>
<p>Bank branches, shipping counters, and pharmacy stops cluster around Main St and Hamilton Ave. If you’re dropping off tailoring or repairs, call ahead—rain days can shorten hours. Bring a tote for dry carry-outs.</p>

<h2>Late afternoon options</h2>
<p>Swap parks for wellness: a quick gym drop-in, a salon appointment, or browsing the library’s new releases. If kids are with you, head back to the children’s floor at the library or a matinee at City Center.</p>

<h2>Dinner and the trip home</h2>
<p>Choose a restaurant close to your garage or station exit so the last walk is short. Aim for earlier seating—rain pushes more people indoors. Check train times or Bee-Line headways while you’re finishing up.</p>

<h2>Keep your day moving</h2>
<p>Plan two indoor anchors and float coffee, lunch, and errands between them. For more local, practical ideas, visit <a href="https://cityofwhiteplains.com" target="_blank" rel="noopener">CityOfWhitePlains.com</a>.</p>
$$,
  null
)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  status = excluded.status,
  published_at = excluded.published_at,
  reading_time = excluded.reading_time,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  hero_image_url = excluded.hero_image_url,
  body_html = excluded.body_html,
  ad_embed_code = excluded.ad_embed_code;
