// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from 'express'

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from 'liquidjs';

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express()

// Maak werken met data uit formulieren iets prettiger
app.use(express.urlencoded({ extended: true }))

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static('public'))

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine('liquid', engine.express());

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set('views', './views')


console.log('Let op: Er zijn nog geen routes. Voeg hier dus eerst jouw GET en POST routes toe.')

/*
// Zie https://expressjs.com/en/5x/api.html#app.get.method over app.get()
app.get(…, async function (request, response) {
  
  // Zie https://expressjs.com/en/5x/api.html#res.render over response.render()
  response.render(…)
})
*/

/*
// Zie https://expressjs.com/en/5x/api.html#app.post.method over app.post()
app.post(…, async function (request, response) {

  // In request.body zitten alle formuliervelden die een `name` attribuut hebben in je HTML
  console.log(request.body)

  // Via een fetch() naar Directus vullen we nieuwe gegevens in

  // Zie https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch over fetch()
  // Zie https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify over JSON.stringify()
  // Zie https://docs.directus.io/reference/items.html#create-an-item over het toevoegen van gegevens in Directus
  // Zie https://docs.directus.io/reference/items.html#update-an-item over het veranderen van gegevens in Directus
  await fetch(…, {
    method: …,
    body: JSON.stringify(…),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  });

  // Redirect de gebruiker daarna naar een logische volgende stap
  // Zie https://expressjs.com/en/5x/api.html#res.redirect over response.redirect()
  response.redirect(303, …)
})
*/

// index ophalen alle data van cards
app.get('/events', async function (request, response) {
  const apiResponse = await fetch('https://fdnd-agency.directus.app/items/dda_events')
  const apiResponseJSON = await apiResponse.json()
  // console.log(apiResponseJSON.data)


  response.render('events.liquid', { events: apiResponseJSON.data })
})




app.get('/events/:location', async function (request, response) {
  const location = request.params.location;

  let apiResponse;

  if (location === 'Alle-locaties') {
    apiResponse = await fetch('https://fdnd-agency.directus.app/items/dda_events');

  } else if (location === 'Nog-niet-bekend') {
    apiResponse = await fetch('https://fdnd-agency.directus.app/items/dda_events?filter={"location":{"_null":true}}');

  } else if (location) {
    apiResponse = await fetch('https://fdnd-agency.directus.app/items/dda_events?filter={"location":{"_eq":"' + request.params.location + '"}}');

  } else {
    apiResponse = await fetch('https://fdnd-agency.directus.app/items/dda_events');
  }

  const apiResponseJSON = await apiResponse.json();
  console.log(apiResponseJSON);


  response.render('events.liquid', { events: apiResponseJSON.data });
});


// details pagina
app.get('/events/detail-event/:id', async function (request, response) {

    // ophalen van event details
    const apiResponseDetails = await fetch('https://fdnd-agency.directus.app/items/dda_events/' + request.params.id);
    const apiResponseDetailsJSON = await apiResponseDetails.json();

    // ophalen companies per event
    const apiResponseCompany = await fetch('https://fdnd-agency.directus.app/items/dda_signups?fields=company&filter[event][_eq]=' + request.params.id);
    const apiResponseCompanyJSON = await apiResponseCompany.json();

    console.log("Evendid:", request.params.id);
    console.log("Companys:", apiResponseCompanyJSON);

    response.render('detail-event.liquid', { 
      eventDetails: apiResponseDetailsJSON.data, 
      companies: apiResponseCompanyJSON.data 
    });

});







// Maak een POST route voor de index; hiermee kun je bijvoorbeeld formulieren afvangen
// Hier doen we nu nog niets mee, maar je kunt er mee spelen als je wilt
app.post('/send', async function (request, response) {
  const { name, company, event } = request.body;

  const apiResponse = await fetch('https://fdnd-agency.directus.app/items/dda_signups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      
    },
    body: JSON.stringify({
      name: name,
      company: company,
      event: event 
    })
  });


  response.send(`Je naam is ${request.body.name} en je company is ${request.body.company} en de eventnummer id ${request.body.event}`);
    
  // response.redirect(303, '/');
});


// nodemon activeren npx nodemon server.js










// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000; als deze applicatie ergens gehost wordt, waarschijnlijk poort 80
app.set('port', process.env.PORT || 8000)

// Start Express op, gebruik daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console
  console.log(`Daarna kun je via http://localhost:${app.get('port')}/ jouw interactieve website bekijken.\n\nThe Web is for Everyone. Maak mooie dingen 🙂`)
})
