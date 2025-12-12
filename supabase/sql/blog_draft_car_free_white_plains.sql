-- Draft blog post insert. Run in Supabase SQL editor or psql to save as a draft.
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
) values (
  'car-free-day-in-white-plains',
  'White Plains in a Day: Car-Free Guide for Visitors and Locals',
  'Guide',
  'draft',
  null,
  6,
  'Car-Free Day in White Plains | WP Insider Blog',
  'Plan a car-free day in White Plains with walkable eats, parks, transit tips, and local resources.',
  'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80',
  $$<h1>White Plains in a Day: Car-Free Guide for Visitors and Locals</h1>
<p>White Plains is easy to enjoy without a car. Metro-North, Bee-Line buses, and a compact downtown put coffee, parks, food, shopping, and culture within a few blocks—ideal for a court day, quick visit, or local reset.</p>
<p><strong>Quick links:</strong> <a href="https://new.mta.info/agency/metro-north-railroad" target="_blank" rel="noopener">Metro-North schedules</a> · <a href="https://transportation.westchestergov.com/beeline-bus" target="_blank" rel="noopener">Bee-Line routes</a> · <a href="https://whiteplainsdowntown.com/" target="_blank" rel="noopener">Downtown BID</a> · <a href="https://whiteplainslibrary.org/" target="_blank" rel="noopener">Public Library</a> · <a href="https://cityofwhiteplains.com/DocumentCenter/View/810/White-Plains-Parking-Map-PDF" target="_blank" rel="noopener">Municipal parking map (PDF)</a>.</p>

<h2>Why go car-free in White Plains</h2>
<p>The core was built around transit. Metro-North drops you near Main Street; the Bee-Line Transit Center sits across from it; most restaurants and shops are within 10–15 minutes on foot. No circling for parking—just pick a block and roam.</p>

<h2>Morning arrival: train, bus, or one-park-and-walk</h2>
<ul>
  <li><strong>Metro-North:</strong> Exit at White Plains Station and follow Main Street east into downtown.</li>
  <li><strong>Bee-Line:</strong> Routes 1, 13, 21, 27, and 60-series are frequent; check <a href="https://transportation.westchestergov.com/beeline-bus" target="_blank" rel="noopener">real-time arrivals</a>.</li>
  <li><strong>Driving once, parking once:</strong> If you must drive, park at Hamilton-Main, Galleria, or City Center garages (see the <a href="https://cityofwhiteplains.com/DocumentCenter/View/810/White-Plains-Parking-Map-PDF" target="_blank" rel="noopener">official map</a>) and leave the car.</li>
</ul>

<h2>Start with coffee & breakfast</h2>
<p>Walk east from the station toward Mamaroneck Ave. Grab espresso and a pastry near Renaissance Plaza or sit down for diner-style eggs within five minutes of the train.</p>

<h2>Late-morning loop: library, arts, and local history</h2>
<ul>
  <li><strong>White Plains Public Library:</strong> Charging, restrooms, exhibits, and events—check <a href="https://whiteplainslibrary.org/" target="_blank" rel="noopener">whiteplainslibrary.org</a>.</li>
  <li><strong>Street art + plazas:</strong> Loop Renaissance Plaza and Court Street for murals, fountains, and people-watching.</li>
</ul>

<h2>Lunch picks within 10 minutes</h2>
<p>Stay near the spine so you can pivot fast. Fast-casual bowls and salads sit near City Center; Mamaroneck Ave clusters pub fare, pizza, ramen, and sushi within a block.</p>

<h2>Afternoon: errands, shopping, or a quiet break</h2>
<ul>
  <li><strong>City Center & Galleria:</strong> Pick up essentials, catch a matinee, or cool off in A/C.</li>
  <li><strong>Recharge:</strong> Return to the library or grab a bench in Renaissance Plaza with a coffee.</li>
</ul>

<h2>Green space + golden hour</h2>
<p>If you have an extra hour, stroll Tibbits Park or hop a short Bee-Line ride to <a href="https://parks.westchestergov.com/kensico-dam-plaza" target="_blank" rel="noopener">Kensico Dam Plaza</a> for Hudson Valley views. Staying downtown? Bryant-Mamaroneck Park offers benches, shade, and a breather.</p>

<h2>Dinner and drinks without needing a ride</h2>
<p>Choose a spot within a few blocks of your return route to keep the night simple—Mediterranean, Latin, sushi, ramen, steak, and burger options are all nearby. Louder vibe? Try a gastropub on Mamaroneck Ave. Quiet chat? Pick a cocktail bar tucked off the main drag.</p>

<h2>Getting back to the train or bus</h2>
<ul>
  <li><strong>Metro-North:</strong> Check departures on the <a href="https://new.mta.info/agency/metro-north-railroad" target="_blank" rel="noopener">MTA site</a> or TrainTime before you leave dinner.</li>
  <li><strong>Bee-Line:</strong> Confirm last headways; frequency drops late evening on some routes.</li>
  <li><strong>Rideshare:</strong> The station loop can clog. Step to Hamilton Ave for a faster pickup.</li>
</ul>

<h2>FAQ: fast answers</h2>
<p><strong>Is White Plains safe to walk at night?</strong> The lit, busy core near the station, City Center, and Mamaroneck Ave stays active; use normal city awareness.</p>
<p><strong>What if it rains?</strong> Shift indoors: City Center for a movie, The Westchester for shopping, or the library for a work break—all within 10 minutes of each other.</p>
<p><strong>Can I store luggage?</strong> There’s no locker system. Travel light or use a small backpack; most stops are close together.</p>

<h2>Plan your day in minutes</h2>
<p>Pick your arrival, anchor on a lunch or dinner spot within a 5–10 minute walk of the station, and you’re set—White Plains was built to be walkable.</p>
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
