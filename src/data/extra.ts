// Hand-written product content for offers whose detail page was not preserved by the
// Wayback Machine. Structure and wording follow the archived tickets2000.com product pages.

export type ProductText = {
  overview: string;
  package?: string[];
  included?: string[];
  info?: string;
  additional?: string;
  address?: string;
  cancellation?: string;
};

const CONFIRM =
  "<li><strong>Confirmation will be received at the time of booking, unless booked within 1 hour of travel. In this case, confirmation will be received as soon as possible, subject to availability</strong></li>";

const additional = (...items: string[]) => `<ul>\n${CONFIRM}\n${items.map((i) => `<li><strong>${i}</strong></li>`).join("\n")}\n</ul>`;

const nonRefundable = (name: string) => `<p><strong>Once purchased, the tickets for ${name} are non-refundable and non-transferable. </strong></p>
<ul>
<li>Therefore, we kindly ask you to carefully consider your plans before making a reservation, <strong>as changes or cancellations cannot be accommodated.</strong></li>
<li> We apologize for any inconvenience this may cause and appreciate your understanding in this matter.</li>
<li>Should you have any questions or require further assistance, please don't hesitate to <strong>reach out to our dedicated support team.</strong></li>
</ul>
<p><strong>Thank you for choosing ${name}, where unforgettable experiences await.</strong></p>`;

const freeCancellation = (weather = false) => `<p>You can cancel up to 24 hours in advance of the experience for a full refund.</p>
<ul>
<li>For a full refund, you must cancel at least 24 hours before the experience's start time.</li>
<li>If you cancel less than 24 hours before the experience's start time, the amount you paid will not be refunded.</li>
<li>Any changes made less than 24 hours before the experience's start time will not be accepted.</li>
<li>Cut-off times are based on the experience's local time.</li>${weather ? "\n<li>This experience requires good weather. If it's canceled due to bad weather, you'll be offered a different date or a full refund.</li>" : ""}
</ul>`;

const LOUVRE_INFO = `<p>The museum is open every day except Tuesday.</p>
<p>The last admission is 1 hour before closing time. The exhibition rooms start closing 30 minutes before closing time.</p>
<p>Closed on January 1, May 1 and December 25.</p>`;
const EIFFEL_INFO = `<p>The Eiffel Tower is open every day of the year.</p>
<p>Please arrive at the meeting point 15 minutes before your selected time slot. Security checks are carried out at the entrance.</p>
<p>Access to the summit depends on weather conditions and visitor numbers and is not included unless stated.</p>`;
const SEINE_INFO = `<p>Departures are scheduled throughout the day, approximately every 30 to 60 minutes depending on the season.</p>
<p>Please arrive at the pier 15 minutes before departure. Your ticket is valid for one cruise on the selected date.</p>`;
const PARIS_MONUMENT_INFO = `<p>Free entrance is available on the first Sunday of January, February, March, November, and December and during European Heritage Days.</p>
<p>Closed on January 1, May 1 and December 25.</p>`;
const FREE_UNDER_26 =
  "<i>Admission is free for under-18s and EU citizens under the age of 26, on presentation of ID at the ticket office before going to the entrance.</i>";

export const EXTRA_EN: Record<number, ProductText> = {
  1: {
    overview: `<h2><strong>Discover Paris from the Seine: Bateaux Parisiens 1-Hour Sightseeing Cruise</strong></h2>
<p><strong>Sit back, relax and let the most beautiful monuments of Paris glide past you!</strong></p>
<p>Departing at the foot of the Eiffel Tower, this one-hour cruise takes you along the Seine past the city's greatest landmarks.</p>
<p><strong>Here's what awaits you:</strong></p>
<ul>
<li><strong>Iconic sights:</strong> Admire the Eiffel Tower, the Louvre, Notre-Dame, the Musée d'Orsay and the Grand Palais from the water.</li>
<li><strong>Audio commentary:</strong> Learn about the history of Paris with the onboard commentary available in several languages.</li>
<li><strong>Panoramic boats:</strong> Enjoy unobstructed views from the glass-roofed cabin or the open-air upper deck.</li>
</ul>`,
    included: ["1-hour sightseeing cruise on the Seine", "Audio commentary in several languages"],
    info: SEINE_INFO,
    additional: additional("Wheelchair accessible", "Stroller accessible", "Near public transportation", "Most travelers can participate"),
    address: "Port de la Bourdonnais, 75007 Paris, France",
    cancellation: freeCancellation(),
  },
  7: {
    overview: `<h2><strong>An Unforgettable Evening: Bateaux Parisiens 3-Course Dinner Cruise</strong></h2>
<p><strong>Combine French gastronomy with the magic of Paris by night!</strong></p>
<p>Board at the foot of the Eiffel Tower and enjoy a refined three-course dinner while the illuminated monuments of the City of Light pass by your window.</p>
<p><strong>Here's what awaits you:</strong></p>
<ul>
<li><strong>French cuisine:</strong> A starter, main course and dessert prepared on board by the boat's chefs.</li>
<li><strong>Live atmosphere:</strong> Soft live music accompanies your dinner throughout the cruise.</li>
<li><strong>Paris by night:</strong> See the sparkling Eiffel Tower, Notre-Dame and the Louvre lit up along the Seine.</li>
</ul>`,
    included: ["Dinner cruise on the Seine", "3-course dinner", "Live music on board"],
    info: `<p>Please arrive at the pier 30 minutes before departure for boarding.</p>
<p>Drinks are not included unless your selected menu states otherwise. Smart casual dress code is recommended.</p>`,
    additional: additional("Wheelchair accessible", "Near public transportation", "Vegetarian options are available on request"),
    address: "Port de la Bourdonnais, 75007 Paris, France",
    cancellation: freeCancellation(),
  },
  30: {
    overview: `<h2><strong>Step Into the Middle Ages: Cité de Carcassonne Castle & Ramparts Entry Tickets</strong></h2>
<p><strong>Explore one of the largest medieval fortified cities in Europe!</strong></p>
<p>The Cité de Carcassonne, a UNESCO World Heritage Site, is crowned by the Château Comtal and encircled by three kilometres of double walls and 52 towers.</p>
<p><strong>Here's what awaits you:</strong></p>
<ul>
<li><strong>The Count's Castle:</strong> Discover the castle built in the 12th century by the Trencavel family.</li>
<li><strong>The ramparts:</strong> Walk along the walls and enjoy breathtaking views over the Cité and the surrounding countryside.</li>
<li><strong>A living history:</strong> Learn how Viollet-le-Duc restored the fortress in the 19th century.</li>
</ul>`,
    included: ["Entry ticket to the Château Comtal and the ramparts of Carcassonne"],
    info: PARIS_MONUMENT_INFO,
    additional: additional("Not wheelchair accessible", "Most travelers can participate", FREE_UNDER_26),
    address: "Château Comtal, 1 Rue Viollet le Duc, 11000 Carcassonne, France",
    cancellation: nonRefundable("Cité de Carcassonne"),
  },
  35: {
    overview: `<h2><strong>Discover the World's Most Visited Museum: Louvre Entry Tickets</strong></h2>
<p><strong>Come face to face with the Mona Lisa, the Venus de Milo and the Winged Victory of Samothrace!</strong></p>
<p>The Louvre houses more than 35,000 works of art spanning from antiquity to the 19th century.</p>
<p><strong>Here's what awaits you:</strong></p>
<ul>
<li><strong>Masterpieces:</strong> See Leonardo da Vinci's Mona Lisa and many other world-famous works.</li>
<li><strong>A royal palace:</strong> Wander through the former residence of the kings of France and the Napoleon III apartments.</li>
<li><strong>Timed entry:</strong> Enter at your chosen time slot and explore the museum at your own pace.</li>
</ul>`,
    included: ["Timed entry ticket to the Louvre Museum", "Access to the permanent collections"],
    info: LOUVRE_INFO,
    additional: additional("Wheelchair accessible", "Stroller accessible", "Near public transportation", "No luggage or large bags allowed", FREE_UNDER_26),
    address: "Musée du Louvre, Rue de Rivoli, 75001 Paris, France",
    cancellation: freeCancellation(),
  },
  36: {
    overview: `<h2><strong>Climb Higher with an Expert: Eiffel Tower 2nd Floor with Tour Guide</strong></h2>
<p><strong>Discover the secrets of the Iron Lady with a professional guide!</strong></p>
<p>Your guide will share the fascinating story of Gustave Eiffel's masterpiece before you enjoy one of the most beautiful views over Paris from the second floor.</p>
<p><strong>Here's what awaits you:</strong></p>
<ul>
<li><strong>Guided visit:</strong> Learn about the construction, the engineering and the anecdotes of the tower.</li>
<li><strong>Second floor:</strong> Enjoy panoramic views of the Seine, the Trocadéro and the Champ de Mars.</li>
<li><strong>Small group:</strong> A more personal experience with your guide.</li>
</ul>`,
    included: ["Entry ticket to the 2nd floor of the Eiffel Tower", "Professional tour guide"],
    info: EIFFEL_INFO,
    additional: additional("Not wheelchair accessible", "Near public transportation", "Most travelers can participate"),
    address: "Tour Eiffel, Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
    cancellation: freeCancellation(),
  },
  47: {
    overview: `<h2><strong>Two Parisian Treasures in One Ticket: Sainte Chapelle + Panthéon Combo</strong></h2>
<p><strong>Save time and money by visiting two of the most remarkable monuments of Paris!</strong></p>
<ul>
<li><strong>Sainte Chapelle:</strong> Marvel at the 13th-century chapel and its stunning stained-glass windows, masterpieces of the Gothic era.</li>
<li><strong>Panthéon:</strong> Explore the neoclassical masterpiece of Jacques-Germain Soufflot and the crypt where great French figures rest.</li>
</ul>`,
    package: ["Sainte Chapelle - Entry Ticket", "Pantheon Paris Entry Tickets"],
    included: ["Entry ticket to Sainte Chapelle", "Entry ticket to the Panthéon"],
    info: PARIS_MONUMENT_INFO,
    additional: additional("Not wheelchair accessible", "Near public transportation", "Most travelers can participate", FREE_UNDER_26),
    address: "10 Boulevard du Palais, 75001 Paris, France",
    cancellation: freeCancellation(),
  },
  48: {
    overview: `<h2><strong>Medieval Paris Combo: Conciergerie + Sainte Chapelle Tickets</strong></h2>
<p><strong>Discover the heart of the former royal palace on the Île de la Cité!</strong></p>
<ul>
<li><strong>Conciergerie:</strong> Visit the royal palace turned revolutionary prison where Marie Antoinette was held.</li>
<li><strong>Sainte Chapelle:</strong> Admire the 15 monumental stained-glass windows of this Gothic jewel just next door.</li>
</ul>`,
    package: ["Conciergerie Paris Entry Ticket", "Sainte Chapelle - Entry Ticket"],
    included: ["Entry ticket to the Conciergerie", "Entry ticket to Sainte Chapelle"],
    info: PARIS_MONUMENT_INFO,
    additional: additional("Not wheelchair accessible", "Near public transportation", "Most travelers can participate", FREE_UNDER_26),
    address: "2 Boulevard du Palais, 75001 Paris, France",
    cancellation: freeCancellation(),
  },
  50: {
    overview: `<h2><strong>The Perfect Paris Duo: 1-Hour Boat Tour + Eiffel Tower Entry</strong></h2>
<p><strong>See Paris from the water and from above on the same day!</strong></p>
<ul>
<li><strong>Seine cruise:</strong> A one-hour sightseeing cruise past the Louvre, Notre-Dame and the Musée d'Orsay.</li>
<li><strong>Eiffel Tower:</strong> Go up to the second floor and enjoy breathtaking views over the city.</li>
</ul>`,
    package: ["Seine River: 1-hour Sightseeing Cruise", "Eiffel Tower - Entry Ticket Second Floor"],
    included: ["1-hour Seine river cruise", "Entry ticket to the 2nd floor of the Eiffel Tower"],
    info: `${EIFFEL_INFO}\n${SEINE_INFO}`,
    additional: additional("Near public transportation", "Most travelers can participate"),
    address: "Tour Eiffel, Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
    cancellation: freeCancellation(),
  },
  77: {
    overview: `<h2><strong>Two Parks, One Unforgettable Holiday: Loro Parque & Siam Park COMBO</strong></h2>
<p><strong>Enjoy the two most popular attractions of Tenerife with one ticket!</strong></p>
<ul>
<li><strong>Loro Parque:</strong> Meet orcas, dolphins, gorillas, penguins and parrots in one of the most famous zoos in the world.</li>
<li><strong>Siam Park:</strong> Slide, swim and relax in the Thai-themed water kingdom with its record-breaking attractions.</li>
<li><strong>Flexible:</strong> Visit each park on a different day of your stay.</li>
</ul>`,
    package: ["Loro Park - Entry Ticket", "Siam Park - Entry Ticket"],
    included: ["1 entry to Loro Parque", "1 entry to Siam Park"],
    info: "<p>Both parks are open every day of the year. Each park can be visited once, on different days.</p>",
    additional: additional("Wheelchair accessible", "Stroller accessible", "Most travelers can participate"),
    address: "Loro Parque, Avenida Loro Parque, 38400 Puerto de la Cruz, Tenerife, Spain",
    cancellation: freeCancellation(true),
  },
  87: {
    overview: `<h2><strong>Gaudí's Masterpiece: Sagrada Familia Entry Tickets</strong></h2>
<p><strong>Visit the most famous basilica in the world, still under construction after more than a century!</strong></p>
<ul>
<li><strong>A forest of stone:</strong> Admire the tree-like columns and the colourful light filtering through the stained-glass windows.</li>
<li><strong>The façades:</strong> Discover the Nativity and Passion façades and their rich symbolism.</li>
<li><strong>A UNESCO World Heritage Site:</strong> Learn about Antoni Gaudí's vision and the history of the basilica.</li>
</ul>`,
    included: ["Timed entry ticket to the Sagrada Familia"],
    additional: additional("Wheelchair accessible", "Stroller accessible", "Near public transportation", "Shoulders and knees must be covered"),
    address: "Carrer de Mallorca, 401, 08013 Barcelona, Spain",
    cancellation: nonRefundable("Sagrada Familia"),
  },
  89: {
    overview: `<h2><strong>The Best of Gaudí: Sagrada Familia + Güell Park COMBO Ticket</strong></h2>
<p><strong>Discover Antoni Gaudí's two most iconic works in Barcelona!</strong></p>
<ul>
<li><strong>Sagrada Familia:</strong> Step inside the extraordinary basilica and its forest of columns.</li>
<li><strong>Park Güell:</strong> Stroll through the colourful park, sit on the famous serpentine bench and enjoy the views over the city.</li>
</ul>`,
    package: ["Sagrada Familia - Entry Ticket", "Güell Park - Entry Ticket"],
    included: ["Entry ticket to the Sagrada Familia", "Entry ticket to Park Güell"],
    additional: additional("Near public transportation", "Most travelers can participate"),
    address: "Carrer de Mallorca, 401, 08013 Barcelona, Spain",
    cancellation: nonRefundable("Sagrada Familia + Güell Park"),
  },
  100: {
    overview: `<h2><strong>The Louvre at Your Own Pace: Entry Tickets with Audioguide</strong></h2>
<p><strong>Explore the masterpieces of the Louvre with expert commentary in your ear!</strong></p>
<ul>
<li><strong>Audioguide:</strong> Discover the stories behind the Mona Lisa, the Venus de Milo and many more works.</li>
<li><strong>Your own rhythm:</strong> Choose what to see and spend as much time as you like in front of each piece.</li>
<li><strong>Timed entry:</strong> Enter the museum at your selected time.</li>
</ul>`,
    included: ["Timed entry ticket to the Louvre Museum", "Audioguide"],
    info: LOUVRE_INFO,
    additional: additional("Wheelchair accessible", "Stroller accessible", "Near public transportation", "No luggage or large bags allowed"),
    address: "Musée du Louvre, Rue de Rivoli, 75001 Paris, France",
    cancellation: freeCancellation(),
  },
  135: {
    overview: `<h2><strong>Unlock the Treasures of the Louvre: Louvre Museum Entry Tickets</strong></h2>
<p><strong>Visit the largest art museum in the world and meet the Mona Lisa!</strong></p>
<p>Once a royal palace, the Louvre now displays thousands of masterpieces from ancient Egypt to the great European painters.</p>
<p><strong>Here's what awaits you:</strong></p>
<ul>
<li><strong>World-famous works:</strong> The Mona Lisa, the Venus de Milo, the Winged Victory of Samothrace and The Raft of the Medusa.</li>
<li><strong>Endless collections:</strong> Egyptian antiquities, Greek sculptures, Italian Renaissance and French painting.</li>
<li><strong>Iconic architecture:</strong> Admire the glass pyramid and the splendid palace courtyards.</li>
</ul>`,
    included: ["Timed entry ticket to the Louvre Museum", "Access to the permanent collections"],
    info: LOUVRE_INFO,
    additional: additional("Wheelchair accessible", "Stroller accessible", "Near public transportation", "No luggage or large bags allowed", FREE_UNDER_26),
    address: "Musée du Louvre, Rue de Rivoli, 75001 Paris, France",
    cancellation: nonRefundable("the Louvre Museum"),
  },
  136: {
    overview: `<h2><strong>Paris at Your Feet: Eiffel Tower Entry Ticket – Second Floor</strong></h2>
<p><strong>Go up the most famous monument in the world!</strong></p>
<ul>
<li><strong>Breathtaking views:</strong> From the second floor, at 115 metres, see the Seine, Montmartre, the Arc de Triomphe and the Louvre.</li>
<li><strong>Engineering marvel:</strong> Get close to the iron lattice designed by Gustave Eiffel for the 1889 World's Fair.</li>
<li><strong>First floor included:</strong> Walk on the glass floor and visit the exhibitions on the first floor.</li>
</ul>`,
    included: ["Entry ticket to the 1st and 2nd floor of the Eiffel Tower"],
    info: EIFFEL_INFO,
    additional: additional("Wheelchair accessible", "Stroller accessible", "Near public transportation", "Most travelers can participate"),
    address: "Tour Eiffel, Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
    cancellation: nonRefundable("the Eiffel Tower"),
  },
  137: {
    overview: `<h2><strong>See the City of Light from the Water: Seine River 1-Hour Sightseeing Cruise</strong></h2>
<p><strong>The most relaxing way to discover Paris!</strong></p>
<ul>
<li><strong>Landmarks from the river:</strong> Glide past the Eiffel Tower, the Louvre, Notre-Dame, the Musée d'Orsay and the Pont Neuf.</li>
<li><strong>Commentary on board:</strong> Learn about the history of Paris during your cruise.</li>
<li><strong>Flexible:</strong> Choose any departure on your selected date.</li>
</ul>`,
    included: ["1-hour sightseeing cruise on the Seine", "Commentary on board"],
    info: SEINE_INFO,
    additional: additional("Wheelchair accessible", "Stroller accessible", "Near public transportation", "Most travelers can participate"),
    address: "Port de la Bourdonnais, 75007 Paris, France",
    cancellation: nonRefundable("the Seine River Cruise"),
  },
  138: {
    overview: `<h2><strong>The Ultimate Paris Experience: Louvre + Eiffel Tower + Seine River Cruise</strong></h2>
<p><strong>Three must-sees of Paris in one combo ticket at a special price!</strong></p>
<ul>
<li><strong>Louvre Museum:</strong> Admire the Mona Lisa and the treasures of the world's largest museum.</li>
<li><strong>Eiffel Tower:</strong> Go up to the second floor for spectacular views over the city.</li>
<li><strong>Seine River Cruise:</strong> Relax on a one-hour sightseeing cruise along the Seine.</li>
</ul>`,
    package: ["Louvre Museum - Entry Tickets", "Eiffel Tower - Entry Ticket Second Floor", "Seine River: 1-hour Sightseeing Cruise - Entry Tickets"],
    included: ["Timed entry ticket to the Louvre Museum", "Entry ticket to the 2nd floor of the Eiffel Tower", "1-hour Seine river cruise"],
    info: `${LOUVRE_INFO}\n<p>The Eiffel Tower and the cruise can be visited on the same day or on different days.</p>`,
    additional: additional("Near public transportation", "Most travelers can participate", "No luggage or large bags allowed"),
    address: "Musée du Louvre, Rue de Rivoli, 75001 Paris, France",
    cancellation: nonRefundable("the combo tickets"),
  },
  139: {
    overview: `<h2><strong>Discover the Louvre's Stories: Entry Tickets with Audioguide</strong></h2>
<p><strong>Your personal guide to the world's greatest museum!</strong></p>
<ul>
<li><strong>Audioguide included:</strong> Expert commentary on the most important works of the collections.</li>
<li><strong>Must-see masterpieces:</strong> The Mona Lisa, the Venus de Milo, the Winged Victory of Samothrace.</li>
<li><strong>Timed entry:</strong> Choose your time slot and explore at your own pace.</li>
</ul>`,
    included: ["Timed entry ticket to the Louvre Museum", "Audioguide"],
    info: LOUVRE_INFO,
    additional: additional("Wheelchair accessible", "Stroller accessible", "Near public transportation", "No luggage or large bags allowed"),
    address: "Musée du Louvre, Rue de Rivoli, 75001 Paris, France",
    cancellation: nonRefundable("the Louvre Museum"),
  },
  140: {
    overview: `<h2><strong>Up and Down the Seine: Eiffel Tower + Seine River Cruise Combo</strong></h2>
<p><strong>Two classic Paris experiences in one ticket!</strong></p>
<ul>
<li><strong>Eiffel Tower:</strong> Go up to the second floor and admire the panorama of Paris.</li>
<li><strong>Seine River Cruise:</strong> Enjoy a one-hour sightseeing cruise departing right next to the tower.</li>
</ul>`,
    package: ["Eiffel Tower - Entry Ticket Second Floor", "Seine River: 1-hour Sightseeing Cruise - Entry Tickets"],
    included: ["Entry ticket to the 2nd floor of the Eiffel Tower", "1-hour Seine river cruise"],
    info: `${EIFFEL_INFO}\n${SEINE_INFO}`,
    additional: additional("Near public transportation", "Most travelers can participate"),
    address: "Tour Eiffel, Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
    cancellation: nonRefundable("the combo tickets"),
  },
  141: {
    overview: `<h2><strong>Art and Views: Louvre Museum + Eiffel Tower Combo</strong></h2>
<p><strong>The two most famous sights of Paris in one combo ticket!</strong></p>
<ul>
<li><strong>Louvre Museum:</strong> Explore the masterpieces of the world's most visited museum.</li>
<li><strong>Eiffel Tower:</strong> Enjoy the view over Paris from the second floor.</li>
</ul>`,
    package: ["Louvre Museum - Entry Tickets", "Eiffel Tower - Entry Ticket Second Floor"],
    included: ["Timed entry ticket to the Louvre Museum", "Entry ticket to the 2nd floor of the Eiffel Tower"],
    info: LOUVRE_INFO,
    additional: additional("Near public transportation", "Most travelers can participate", "No luggage or large bags allowed"),
    address: "Musée du Louvre, Rue de Rivoli, 75001 Paris, France",
    cancellation: nonRefundable("the combo tickets"),
  },
  142: {
    overview: `<h2><strong>Masterpieces and the Seine: Louvre Museum + Seine River Cruise Combo</strong></h2>
<p><strong>Spend a perfect day in Paris between art and the river!</strong></p>
<ul>
<li><strong>Louvre Museum:</strong> Meet the Mona Lisa and thousands of other treasures.</li>
<li><strong>Seine River Cruise:</strong> Relax on a one-hour cruise past the most beautiful monuments of Paris.</li>
</ul>`,
    package: ["Louvre Museum - Entry Tickets", "Seine River: 1-hour Sightseeing Cruise - Entry Tickets"],
    included: ["Timed entry ticket to the Louvre Museum", "1-hour Seine river cruise"],
    info: LOUVRE_INFO,
    additional: additional("Near public transportation", "Most travelers can participate", "No luggage or large bags allowed"),
    address: "Musée du Louvre, Rue de Rivoli, 75001 Paris, France",
    cancellation: nonRefundable("the combo tickets"),
  },
  145: {
    overview: `<h2><strong>Castles and UNESCO Heritage: Spiš Castle & Levoča Guided Tour</strong></h2>
<p><strong>Discover one of the largest castle complexes in Central Europe!</strong></p>
<ul>
<li><strong>Spiš Castle:</strong> Explore the impressive ruins of this UNESCO-listed castle towering over the Spiš region.</li>
<li><strong>Levoča:</strong> Stroll through the historic town and admire the tallest Gothic wooden altar in the world in the Basilica of St. James.</li>
<li><strong>Local guide:</strong> Learn the history and legends of the region from our experienced guides.</li>
</ul>`,
    included: ["Professional guide", "Transport during the tour", "Entry tickets to Spiš Castle"],
    info: "<p>Full-day guided tour. Pick-up from your accommodation in the High Tatras region can be arranged on request.</p>",
    additional: "<p><strong>WHAT TO BRING</strong></p>\n<ul>\n<li>Comfortable shoes, weather-appropriate clothing, camera</li>\n</ul>\n<p><strong>Please NOTE that the minimum number of people for a booking is 2.</strong></p>",
    address: "Spišský hrad, 053 04 Žehra, Slovakia",
    cancellation: freeCancellation(true),
  },
  146: {
    overview: `<h2><strong>A great winter activity for husky dog lovers!</strong></h2>
<p>Do you want to become a musher and drive a dog sled through the snowy fields for an hour?</p>
<p>This is the right place to book this experience!</p>
<p><strong>Huskies have always been friendly dogs, we know it because we have 20 years of experience working with them here in Slovakia.</strong></p>
<p><strong>Here we go, find out what your day with the huskies will be like.</strong></p>
<p>The place where we run our husky and dog sledding adventures depends a lot on the snow conditions of the day. Most of the time, BUT NOT ALWAYS 🙂, we are near the village of Gerlachov in the High Tatras National Park (NP Vysoké Tatry).</p>
<p>Once you meet us at the husky location, we will introduce our team and have a short talk about the dogs. Then our husky instructor will take you for the first ride on a 1–2 km circuit.</p>
<p>Most of the time we have groups of 4 to 6 people. This means that after each lap you will switch places and the instructor will take another person on the sled.</p>
<p>The dogs always follow the trail they have made before, so you don't need to worry about the direction, but if you want to feel like a musher you can try shouting GO-GO-GO or just STOP at the end.</p>
<p>A little tip for you :) : huskies never listen to the word STOP, because they LOVE running and have energy for the whole day!</p>
<p>The only way to stop the huskies is to step hard on the brake located near your feet on the sled.</p>`,
    included: ["2 instructors", "1-hour husky programme on a 1–4 km circuit with 18 dogs"],
    info: `<p><strong>Meet and greet your guides at the husky location</strong></p>
<p>The husky location depends a lot on the snow level. If we have a great winter, the place is in Gerlachov; if we have less snow, we run the husky adventures in the village of Pribylina.</p>
<p><strong>Introduction and programme</strong></p>
<p>You will meet our guides and our huskies, excited to pull the sled. First, you will be taken on the sled with our instructors, then we will let you go with our huskies and sled by yourselves :)</p>
<p><strong>End</strong></p>
<p>After a great session and tons of videos, it is time to say goodbye. If needed, we will provide the transfer back to your hotel.</p>
<p>P.S.: don't forget to take a group photo with the dogs!</p>`,
    additional: `<p><strong>WHAT TO BRING</strong></p>
<ul>
<li>Warm clothes, gloves, camera</li>
</ul>
<p><strong>Please NOTE that the minimum number of people for a booking is 2.</strong></p>
<p><strong>Slovakia is a mountainous country and we DO NOT OFFER half-day or full-day tours like in Finland or Sweden.</strong></p>
<p>Our programme is set for 1 hour on a 1–4 km circuit, where we will teach you all the techniques and everything about dog sledding in Slovakia.</p>
<p>Once the programme is over, you will become a real musher and be able to drive a dog sled with huskies by yourself :)</p>`,
    address: "Pribylina, 032 42, Slovakia",
    cancellation: freeCancellation(true),
  },
  147: {
    overview: `<h2><strong>Into the Wild: Hiking Bear Watching Tour in Slovakia</strong></h2>
<p><strong>Observe brown bears in their natural habitat with an experienced local guide!</strong></p>
<ul>
<li><strong>Wild Slovakia:</strong> Hike through the forests and meadows of the Tatra region, home to one of the largest brown bear populations in Europe.</li>
<li><strong>Expert guide:</strong> Our guides know the bears' habits and the best observation points.</li>
<li><strong>Safe and respectful:</strong> We observe the animals from a safe distance without disturbing them.</li>
</ul>`,
    included: ["Professional wildlife guide", "Binoculars"],
    info: "<p>The tour usually takes place in the late afternoon and evening, when the bears are most active. Sightings cannot be guaranteed as these are wild animals.</p>",
    additional: "<p><strong>WHAT TO BRING</strong></p>\n<ul>\n<li>Hiking shoes, warm and waterproof clothing, camera</li>\n</ul>\n<p><strong>Please NOTE that the minimum number of people for a booking is 2.</strong></p>",
    address: "Vysoké Tatry, Slovakia",
    cancellation: freeCancellation(true),
  },
  148: {
    overview: `<h2><strong>Home of Guernica: Reina Sofía Museum Entry Ticket</strong></h2>
<p><strong>Discover Spain's national museum of 20th-century and contemporary art!</strong></p>
<ul>
<li><strong>Picasso's Guernica:</strong> Stand in front of one of the most powerful paintings of the 20th century.</li>
<li><strong>Great masters:</strong> Admire works by Salvador Dalí, Joan Miró and Juan Gris.</li>
<li><strong>Architecture:</strong> Explore the former hospital building and the modern Jean Nouvel extension.</li>
</ul>`,
    included: ["Entry ticket to the Museo Nacional Centro de Arte Reina Sofía"],
    info: "<p>The museum is closed on Tuesdays, on January 1 and 6, May 1 and 15, November 9 and December 24, 25 and 31.</p>",
    additional: additional("Wheelchair accessible", "Stroller accessible", "Near public transportation", "Most travelers can participate"),
    address: "Calle de Santa Isabel, 52, 28012 Madrid, Spain",
    cancellation: nonRefundable("the Reina Sofía Museum"),
  },
  149: {
    overview: `<h2><strong>An Icon of Modern Architecture: Bilbao Guggenheim Museum Entry Ticket</strong></h2>
<p><strong>Visit Frank Gehry's titanium masterpiece on the banks of the Nervión!</strong></p>
<ul>
<li><strong>Spectacular building:</strong> Admire the curves of one of the most influential buildings of our time.</li>
<li><strong>Contemporary art:</strong> Discover the collection and the temporary exhibitions of international artists.</li>
<li><strong>Puppy and Maman:</strong> See Jeff Koons's floral dog and Louise Bourgeois's giant spider outside the museum.</li>
</ul>`,
    included: ["Entry ticket to the Guggenheim Museum Bilbao", "Access to the temporary exhibitions"],
    info: "<p>The museum is closed on Mondays (except in summer and on some holidays) and on December 25 and January 1.</p>",
    additional: additional("Wheelchair accessible", "Stroller accessible", "Near public transportation", "Most travelers can participate"),
    address: "Abandoibarra Etorb., 2, 48009 Bilbao, Spain",
    cancellation: nonRefundable("the Guggenheim Museum Bilbao"),
  },
  150: {
    overview: `<h2><strong>Royal Splendour: Madrid Royal Palace Entry Ticket</strong></h2>
<p><strong>Step inside the largest royal palace in Western Europe!</strong></p>
<ul>
<li><strong>Lavish interiors:</strong> Walk through the Throne Room, the Royal Chapel and the Gasparini Room.</li>
<li><strong>Royal collections:</strong> See paintings by Velázquez, Goya and Caravaggio and the Stradivarius instruments.</li>
<li><strong>Royal Armoury:</strong> Discover one of the finest collections of arms and armour in the world.</li>
</ul>`,
    included: ["Entry ticket to the Royal Palace of Madrid"],
    info: "<p>The palace may close at short notice for official state ceremonies. Last admission is 1 hour before closing time.</p>",
    additional: additional("Wheelchair accessible", "Near public transportation", "Most travelers can participate"),
    address: "Calle de Bailén, s/n, 28071 Madrid, Spain",
    cancellation: nonRefundable("the Royal Palace of Madrid"),
  },
};

// Coordinates for products whose location block was not archived
export const COORDS: Record<number, [number, number]> = {
  1: [48.8597, 2.2932], 7: [48.8597, 2.2932], 30: [43.2068, 2.3653], 35: [48.8606, 2.3376], 36: [48.8584, 2.2945],
  47: [48.8554, 2.345], 48: [48.8564, 2.3456], 50: [48.8584, 2.2945], 77: [28.4103, -16.5641], 87: [41.4036, 2.1744],
  89: [41.4036, 2.1744], 100: [48.8606, 2.3376], 135: [48.8606, 2.3376], 136: [48.8584, 2.2945], 137: [48.8597, 2.2932],
  138: [48.8606, 2.3376], 139: [48.8606, 2.3376], 140: [48.8584, 2.2945], 141: [48.8606, 2.3376], 142: [48.8606, 2.3376],
  145: [48.9995, 20.7681], 146: [49.1072, 19.8086], 147: [49.1386, 20.2211], 148: [40.408, -3.6943], 149: [43.2687, -2.934],
  150: [40.418, -3.7143], 14: [48.636, -1.5115], 12: [48.8462, 2.3464], 27: [48.8554, 2.345], 28: [48.8738, 2.295],
  75: [28.4103, -16.5641], 76: [28.0716, -16.7259], 88: [41.4145, 2.1527],
};
