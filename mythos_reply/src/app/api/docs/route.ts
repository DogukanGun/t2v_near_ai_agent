import { NextRequest, NextResponse } from 'next/server'
import { swaggerSpec } from '@/lib/swagger'

export async function GET(request: NextRequest) {
  return NextResponse.json(swaggerSpec)
}
