/**
 * scripts/get-gmail-refresh-token.js
 * CLI script to generate a Google OAuth2 refresh token for sending emails via Gmail API.
 */

const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config();

const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;
const redirect_uri = 'http://localhost:3000/api/auth/callback/google'; // Matching the authorized redirect URI

async function main() {
  console.log('\n==================================================');
  console.log('       Gmail API OAuth2 Setup helper');
  console.log('==================================================\n');

  if (!client_id || !client_secret || client_id.includes('your_google_client_id')) {
    console.error('❌ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing from your .env file.');
    console.error('Please configure them in .env before running this script.');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uri
  );

  // Scope to send emails
  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Critical: requests refresh token
    scope: scopes,
    prompt: 'consent' // Forces consent screen to ensure refresh token is returned
  });

  console.log('1. Open the following URL in your browser to authorise this application:\n');
  console.log(`👉 \x1b[36m${authUrl}\x1b[0m\n`);

  console.log('2. Log in with your Gmail account and authorise the application.');
  console.log('3. You will be redirected to localhost:3000 (which may show a connection error - this is normal).');
  console.log('4. Copy the "code" query parameter value from the browser\'s address bar.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Paste the authorisation code here: ', async (code) => {
    rl.close();
    if (!code) {
      console.error('❌ Authorisation code cannot be empty.');
      process.exit(1);
    }

    try {
      console.log('\nExchanging authorization code for tokens...');
      const { tokens } = await oauth2Client.getToken(code.trim());
      
      console.log('\n==================================================');
      console.log('✅ Tokens acquired successfully!');
      console.log('==================================================');
      console.log(`\nCopy the following line and add/replace it in your .env file:\n`);
      console.log(`\x1b[32mGMAIL_REFRESH_TOKEN="${tokens.refresh_token}"\x1b[0m\n`);
      console.log('Note: Keep this token private as it allows sending emails from your account.');
      console.log('==================================================\n');
    } catch (err) {
      console.error('❌ Failed to get tokens:', err.message);
      process.exit(1);
    }
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
