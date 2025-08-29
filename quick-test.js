const https = require('https');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function test() {
  try {
    const result = await makeRequest('https://order-management-system-backend-amber.vercel.app/api/orders');
    console.log('Status:', result.status);
    console.log('Data type:', typeof result.data);
    console.log('Is array:', Array.isArray(result.data));
    console.log('Length:', result.data.length);
    console.log('First item:', result.data[0] ? 'exists' : 'null');
    console.log('Sample:', JSON.stringify(result.data[0], null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
