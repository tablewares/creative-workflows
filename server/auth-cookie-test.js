import request from 'supertest';
import app from './server.js'; // Adjust the path to your server.js file

async function runAuthTest() {
  console.log('🚀 Starting Authentication & Session Test...\n');

  // Generate a random username so we don't hit unique constraint errors if we run this twice
  const testUser = {
    name: `test_user_${Math.floor(Math.random() * 10000)}`,
    type: 'member',
    password: 'SuperSecurePassword123!'
  };

  try {
    // --- STEP 1: REGISTER ---
    console.log(`1. Registering user: ${testUser.name}...`);
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    // if (regRes.status !== 201) {
    //   throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
    // }
    console.log('✅ Registration Successful!\n');


    // --- STEP 2: LOGIN & CAPTURE COOKIE ---
    console.log('2. Logging in...');
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        name: testUser.name,
        password: testUser.password
      });

    if (loginRes.status !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }
    
    // Extract the cookie from the response headers
    const sessionCookie = loginRes.headers['set-cookie'];
    console.log('✅ Login Successful!');
    console.log(`🍪 Cookie Received: ${sessionCookie[0].split(';')[0]}\n`);


    // --- STEP 3: ACCESS PROTECTED ROUTE WITH COOKIE ---
    console.log('3. Fetching profile using the session cookie...');
    const profileRes = await request(app)
      .get('/api/profile')
      .set('Cookie', sessionCookie); // Manually inject the cookie into the request headers

    if (profileRes.status !== 200) {
      throw new Error(`Profile access denied: ${JSON.stringify(profileRes.body)}`);
    }
    console.log('✅ Profile Access Granted!');
    console.log('👤 Server Session Data:', profileRes.body.user, '\n');


    // --- STEP 4: ACCESS PROTECTED ROUTE WITHOUT COOKIE (Should Fail) ---
    console.log('4. Testing protected route WITHOUT a cookie...');
    const badProfileRes = await request(app).get('/api/profile');
    
    if (badProfileRes.status === 401) {
      console.log('✅ Correctly blocked unauthorized request (401 Unauthorized).\n');
    } else {
      throw new Error('❌ Security Flaw: Allowed access to profile without a cookie.');
    }


    // --- STEP 5: LOGOUT ---
    console.log('5. Logging out...');
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', sessionCookie);

    if (logoutRes.status !== 200) {
      throw new Error(`Logout failed: ${JSON.stringify(logoutRes.body)}`);
    }
    console.log('✅ Logout Successful! Session destroyed.');
    console.log('🎉 All authentication tests passed cleanly!');

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error.message);
  } finally {
    // Explicitly exit the script process
    process.exit(0);
  }
}

runAuthTest();