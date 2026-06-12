require('dotenv').config();
const http = require('http');

const BASE = 'http://localhost:5000';
let adminToken = '';
let studentToken = '';
let wardenToken = '';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function test() {
  console.log('🧪 COMPREHENSIVE API TEST\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      const result = await fn();
      if (result) {
        console.log(`  ✅ ${name}`);
        passed++;
      } else {
        console.log(`  ❌ ${name} - unexpected result`);
        failed++;
      }
    } catch (e) {
      console.log(`  ❌ ${name} - ${e.message}`);
      failed++;
    }
  }

  // 1. AUTH
  console.log('\n📌 AUTH');
  await check('Admin login', async () => {
    const r = await request('POST', '/api/auth/login', { email: 'admin@hostelhub.com', password: 'admin123' });
    adminToken = r.data.token;
    return r.status === 200 && r.data.success;
  });
  await check('Warden login', async () => {
    const r = await request('POST', '/api/auth/login', { email: 'warden@hostelhub.com', password: 'warden123' });
    wardenToken = r.data.token;
    return r.status === 200 && r.data.success;
  });
  await check('Student login', async () => {
    const r = await request('POST', '/api/auth/login', { email: 'student@hostelhub.com', password: 'student123' });
    studentToken = r.data.token;
    return r.status === 200 && r.data.success;
  });
  await check('Invalid login rejected', async () => {
    const r = await request('POST', '/api/auth/login', { email: 'bad@bad.com', password: 'wrong' });
    return r.status === 401;
  });

  // 2. ANALYTICS
  console.log('\n📌 ANALYTICS / DASHBOARD');
  await check('Get dashboard stats', async () => {
    const r = await request('GET', '/api/analytics/stats', null, adminToken);
    return r.status === 200 && r.data.success;
  });

  // 3. STUDENTS
  console.log('\n📌 STUDENTS');
  await check('Get all students', async () => {
    const r = await request('GET', '/api/students', null, adminToken);
    return r.status === 200 && r.data.success;
  });
  await check('Get student profile (me)', async () => {
    const r = await request('GET', '/api/students/me', null, studentToken);
    return r.status === 200 && r.data.success;
  });

  // 4. ROOMS
  console.log('\n📌 ROOMS');
  await check('Get all rooms', async () => {
    const r = await request('GET', '/api/rooms', null, adminToken);
    return r.status === 200 && r.data.success;
  });
  await check('Add a room', async () => {
    const r = await request('POST', '/api/rooms', { room_number: '101', block: 'A', floor: 1, capacity: 3 }, adminToken);
    return r.status === 201 && r.data.success;
  });

  // 5. COMPLAINTS
  console.log('\n📌 COMPLAINTS');
  await check('Get all complaints', async () => {
    const r = await request('GET', '/api/complaints', null, adminToken);
    return r.status === 200 && r.data.success;
  });
  await check('Raise complaint (student)', async () => {
    const r = await request('POST', '/api/complaints', { title: 'Test Complaint', description: 'Testing', category: 'other', priority: 'low' }, studentToken);
    return r.status === 201 && r.data.success;
  });

  // 6. FEES
  console.log('\n📌 FEES');
  await check('Get all fees', async () => {
    const r = await request('GET', '/api/fees', null, adminToken);
    return r.status === 200 && r.data.success;
  });
  await check('Get my fees (student)', async () => {
    const r = await request('GET', '/api/fees/my', null, studentToken);
    return r.status === 200 && r.data.success;
  });
  await check('Get fee deadline', async () => {
    const r = await request('GET', '/api/fees/deadline', null, adminToken);
    return r.status === 200 && r.data.success;
  });

  // 7. LEAVES
  console.log('\n📌 LEAVES');
  await check('Get all leaves', async () => {
    const r = await request('GET', '/api/leaves', null, adminToken);
    return r.status === 200 && r.data.success;
  });
  await check('Apply for leave (student)', async () => {
    const r = await request('POST', '/api/leaves', { reason: 'Test leave', from_date: '2026-07-01', to_date: '2026-07-03', destination: 'Home' }, studentToken);
    return r.status === 201 && r.data.success;
  });

  // 8. NOTICES
  console.log('\n📌 NOTICES');
  await check('Get notices', async () => {
    const r = await request('GET', '/api/notices', null, adminToken);
    return r.status === 200 && r.data.success;
  });
  await check('Create notice', async () => {
    const r = await request('POST', '/api/notices', { title: 'Test Notice', content: 'Testing notice system' }, adminToken);
    return r.status === 201 && r.data.success;
  });

  // 9. BROADCASTS
  console.log('\n📌 BROADCASTS');
  await check('Get broadcasts', async () => {
    const r = await request('GET', '/api/broadcasts', null, adminToken);
    return r.status === 200 && r.data.success;
  });
  await check('Create broadcast', async () => {
    const r = await request('POST', '/api/broadcasts', { message: 'Test broadcast', type: 'info' }, adminToken);
    return r.status === 201 && r.data.success;
  });

  // 10. MESS MENU
  console.log('\n📌 MESS MENU');
  await check('Get mess menu', async () => {
    const r = await request('GET', '/api/mess-menu', null, adminToken);
    return r.status === 200 && r.data.success;
  });

  // 11. INVENTORY
  console.log('\n📌 INVENTORY');
  await check('Get inventory', async () => {
    const r = await request('GET', '/api/inventory', null, adminToken);
    return r.status === 200 && r.data.success;
  });

  // 12. MESSAGES
  console.log('\n📌 MESSAGES');
  await check('Get messages', async () => {
    const r = await request('GET', '/api/messages', null, adminToken);
    return r.status === 200 && r.data.success;
  });
  await check('Get contacts', async () => {
    const r = await request('GET', '/api/messages/contacts', null, adminToken);
    return r.status === 200 && r.data.success;
  });
  await check('Get unread count', async () => {
    const r = await request('GET', '/api/messages/unread-count', null, adminToken);
    return r.status === 200 && r.data.success;
  });

  // 13. ATTENDANCE
  console.log('\n📌 ATTENDANCE');
  await check('Get attendance stats', async () => {
    const r = await request('GET', '/api/attendance/stats', null, adminToken);
    return r.status === 200 && r.data.success;
  });
  await check('Get attendance logs', async () => {
    const r = await request('GET', '/api/attendance/logs', null, adminToken);
    return r.status === 200 && r.data.success;
  });

  // 14. STAFF
  console.log('\n📌 STAFF');
  await check('Get staff profile', async () => {
    const r = await request('GET', '/api/staff/profile', null, adminToken);
    return r.status === 200 && r.data.success;
  });

  // 15. SECURITY
  console.log('\n📌 SECURITY');
  await check('Get security locations', async () => {
    const r = await request('GET', '/api/security/locations', null, adminToken);
    return r.status === 200 && r.data.success;
  });
  await check('Get security alerts', async () => {
    const r = await request('GET', '/api/security/alerts', null, adminToken);
    return r.status === 200 && r.data.success;
  });

  // 16. ADMIN
  console.log('\n📌 ADMIN');
  await check('Get all users', async () => {
    const r = await request('GET', '/api/admin/all-users', null, adminToken);
    return r.status === 200 && r.data.success;
  });

  // SUMMARY
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED!');
  } else {
    console.log('⚠️  Some tests failed - review above');
  }
}

test().catch(console.error);
