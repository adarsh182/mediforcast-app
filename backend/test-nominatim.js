import axios from 'axios';

async function testNominatimBbox() {
  const lat = 18.5213738;
  const lon = 73.8545071;
  const radiusDegrees = 0.05; // Roughly 5km
  const viewbox = `${lon - radiusDegrees},${lat + radiusDegrees},${lon + radiusDegrees},${lat - radiusDegrees}`;
  
  const q = 'hospital';
  console.log(`Searching Nominatim for: ${q} in viewbox ${viewbox}`);
  
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: q,
        format: 'json',
        limit: 10,
        viewbox: viewbox,
        bounded: 1,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'SUMO-HealthApp/1.0'
      }
    });

    console.log(`Found ${response.data.length} results`);
    console.log(response.data.slice(0, 2));
  } catch (err) {
    console.error(err.message);
  }
}

testNominatimBbox().catch(console.error);
