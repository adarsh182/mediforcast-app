import { geocodeCity, fetchNearbyClinics } from './src/services/overpassClient.js';

async function test() {
  const city = 'Pune';
  console.log(`Geocoding ${city}...`);
  const coords = await geocodeCity(city);
  console.log(`Coords:`, coords);

  if (coords) {
    console.log(`Fetching clinics for ${city} (cardiology)...`);
    const clinics = await fetchNearbyClinics(coords.lat, coords.lng, 'cardiology');
    console.log(`Found ${clinics.length} clinics`);
    console.log(clinics.slice(0, 2));
  }
}

test().catch(console.error);
