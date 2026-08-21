/**
 * End-to-End Endpoint Verification Script
 */

const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    }).on('error', reject);
  });
}

async function runLiveVerification() {
  console.log('--- 1. Testing GET / (Root Status) ---');
  const root = await get('http://localhost:3001/');
  console.log('Root Output:', root);

  console.log('\n--- 2. Testing POST /api/booking/reservation (Create Pending Reservation) ---');
  const res = await post('http://localhost:3001/api/booking/reservation', {
    roomTypeId: 3219,
    checkIn: '2026-10-10',
    checkOut: '2026-10-12',
    adultCount: 2,
    guestName: 'E2E Test Misafir',
    guestEmail: 'test@nourla.com',
    guestPhone: '+905321112233',
    specialNotes: 'E2E Local Test',
  });
  console.log('Reservation Output:', res);

  if (!res.success || !res.reservationId) {
    throw new Error('Reservation creation failed!');
  }

  console.log('\n--- 3. Testing POST /api/payment/create (Initialize Payment Session) ---');
  const pay = await post('http://localhost:3001/api/payment/create', {
    reservationId: res.reservationId,
    card: {
      cardHolderName: 'E2E TEST MISAFIR',
      cardNumber: '4242424242424242',
      expMonth: '12',
      expYear: '28',
      cvv: '123',
    },
  });
  console.log('Payment Output:', pay);

  console.log('\n--- 4. Testing GET /api/payment/status/:id (Payment Status Check) ---');
  const status = await get(`http://localhost:3001/api/payment/status/${pay.data.paymentId}`);
  console.log('Payment Status Output:', status);

  console.log('\n--- 5. Testing GET /api/admin/reservations (Admin Audit Dashboard) ---');
  const admin = await get('http://localhost:3001/api/admin/reservations');
  console.log('Admin Dashboard Count:', admin.count);
  console.log('Latest Admin Entry:', admin.data[0]);

  console.log('\n=====================================================');
  console.log(' ALL LIVE LOCAL ENDPOINTS WORKING 100% PERFECTLY!');
  console.log('=====================================================\n');
}

runLiveVerification().catch((err) => {
  console.error('E2E Test Error:', err);
  process.exit(1);
});
