import { NextResponse } from 'next/server'
import ALLOWED_TYPES from '../../constants/applianceTypes'

// GET /api/appliances — returns the available appliance types for the form dropdown
export async function GET() {
  let types = ALLOWED_TYPES
  return NextResponse.json({ applianceTypes: types })
}
