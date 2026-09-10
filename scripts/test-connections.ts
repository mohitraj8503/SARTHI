
import { PrismaClient } from '@prisma/client';
import Razorpay from 'razorpay';
import { Resend } from 'resend';
import { RoomServiceClient } from 'livekit-server-sdk';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🔍 Testing Database Connection...');
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    console.log(`✅ Database Connected (${Date.now() - start}ms)`);
    return true;
  } catch (error: any) {
    console.error(`❌ Database Connection Failed: ${error.message}`);
    return false;
  }
}

async function testRazorpay() {
  console.log('🔍 Testing Razorpay API...');
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.error('❌ Razorpay keys missing in .env');
    return false;
  }

  try {
    const razorpay = new Razorpay({ key_id, key_secret });
    const start = Date.now();
    await razorpay.orders.all({ count: 1 });
    console.log(`✅ Razorpay Authenticated (${Date.now() - start}ms)`);
    return true;
  } catch (error: any) {
    console.error(`❌ Razorpay Authentication Failed: Status ${error.statusCode || 'unknown'} - ${error.description || error.message || JSON.stringify(error)}`);
    return false;
  }
}

async function testResend() {
  console.log('🔍 Testing Resend (Email) API...');
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('❌ Resend API key missing in .env');
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const start = Date.now();
    // Fetching domains or something lightweight
    await resend.emails.get('dummy-id').catch(e => {
        // We expect a 404 or specific error if API key is valid but ID is wrong
        if (e.message.includes('401') || e.message.includes('unauthorized')) {
            throw e;
        }
    });
    console.log(`✅ Resend API Key Validated (${Date.now() - start}ms)`);
    return true;
  } catch (error: any) {
    console.error(`❌ Resend API Failed: ${error.message}`);
    return false;
  }
}

async function testLiveKit() {
  console.log('🔍 Testing LiveKit Connection...');
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_WS_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    console.error('❌ LiveKit credentials missing in .env');
    return false;
  }

  try {
    const host = wsUrl.replace('wss://', 'https://').replace('ws://', 'http://');
    const roomService = new RoomServiceClient(host, apiKey, apiSecret);
    const start = Date.now();
    await roomService.listRooms();
    console.log(`✅ LiveKit Connected (${Date.now() - start}ms)`);
    return true;
  } catch (error: any) {
    console.error(`❌ LiveKit Connection Failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('\n🚀 Starting SARTHI Environment Health Check\n');
  console.log('------------------------------------------------');
  
  const results = {
    db: await testDatabase(),
    razorpay: await testRazorpay(),
    resend: await testResend(),
    livekit: await testLiveKit(),
  };

  console.log('------------------------------------------------');
  console.log('\n📊 FINAL SUMMARY:');
  Object.entries(results).forEach(([svc, ok]) => {
    console.log(`${ok ? '✅' : '❌'} ${svc.toUpperCase()}: ${ok ? 'PASSED' : 'FAILED'}`);
  });

  await prisma.$disconnect();
  process.exit(Object.values(results).every(v => v) ? 0 : 1);
}

runAllTests();
