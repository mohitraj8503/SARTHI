import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test without MySQL first
    return NextResponse.json({ 
      success: true, 
      message: 'API is working!',
      mysqlReady: false,
      note: 'MySQL connection not tested yet'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

