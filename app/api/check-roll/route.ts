import { NextRequest, NextResponse } from 'next/server';
import { checkRollNumberExists } from '@/lib/googleSheets';

export async function POST(req: NextRequest) {
  try {
    const { rollNumber } = await req.json();

    if (!rollNumber || typeof rollNumber !== 'string' || !rollNumber.trim()) {
      return NextResponse.json({ exists: false });
    }

    const exists = await checkRollNumberExists(rollNumber.trim());

    if (exists) {
      return NextResponse.json({
        exists: true,
        message: 'This University Roll Number already exists. You cannot apply again. Please contact the University.',
      });
    }

    return NextResponse.json({ exists: false });
  } catch (error: any) {
    console.error('Error checking roll number duplicate:', error);
    return NextResponse.json({ exists: false });
  }
}
