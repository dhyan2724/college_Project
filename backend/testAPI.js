const fetch = require('node-fetch');

const API_BASE = 'http://172.168.2.130:5000/api';

async function testAPI() {
  console.log('Testing API endpoints...\n');

  try {
    // Test chemicals endpoint
    console.log('Testing /chemicals endpoint...');
    const chemicalsResponse = await fetch(`${API_BASE}/chemicals`);
    console.log('Status:', chemicalsResponse.status);
    if (chemicalsResponse.ok) {
      const chemicals = await chemicalsResponse.json();
      console.log('Chemicals count:', chemicals.length);
      if (chemicals.length > 0) {
        console.log('Sample chemical:', chemicals[0]);
      }
    }
    console.log('');

    // Test glasswares endpoint
    console.log('Testing /glasswares endpoint...');
    const glasswaresResponse = await fetch(`${API_BASE}/glasswares`);
    console.log('Status:', glasswaresResponse.status);
    if (glasswaresResponse.ok) {
      const glasswares = await glasswaresResponse.json();
      console.log('Glasswares count:', glasswares.length);
      if (glasswares.length > 0) {
        console.log('Sample glassware:', glasswares[0]);
      }
    }
    console.log('');

    // Test specimens endpoint
    console.log('Testing /specimens endpoint...');
    const specimensResponse = await fetch(`${API_BASE}/specimens`);
    console.log('Status:', specimensResponse.status);
    if (specimensResponse.ok) {
      const specimens = await specimensResponse.json();
      console.log('Specimens count:', specimens.length);
      if (specimens.length > 0) {
        console.log('Sample specimen:', specimens[0]);
      }
    }
    console.log('');

    // Test slides endpoint
    console.log('Testing /slides endpoint...');
    const slidesResponse = await fetch(`${API_BASE}/slides`);
    console.log('Status:', slidesResponse.status);
    if (slidesResponse.ok) {
      const slides = await slidesResponse.json();
      console.log('Slides count:', slides.length);
      if (slides.length > 0) {
        console.log('Sample slide:', slides[0]);
      }
    }
    console.log('');

    // Test miscellaneous endpoint
    console.log('Testing /miscellaneous endpoint...');
    const miscellaneousResponse = await fetch(`${API_BASE}/miscellaneous`);
    console.log('Status:', miscellaneousResponse.status);
    if (miscellaneousResponse.ok) {
      const miscellaneous = await miscellaneousResponse.json();
      console.log('Miscellaneous count:', miscellaneous.length);
      if (miscellaneous.length > 0) {
        console.log('Sample miscellaneous:', miscellaneous[0]);
      }
    }
    console.log('');

  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAPI();
