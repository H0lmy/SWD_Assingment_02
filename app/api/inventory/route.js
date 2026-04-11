import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const INVENTORY_FILE = path.join(process.cwd(), 'inventory.json')

// GET /api/inventory — returns all saved appliances from the JSON file
export async function GET() {
  const data = fs.readFileSync(INVENTORY_FILE, 'utf8')
  const inventory = JSON.parse(data)
  return NextResponse.json({ inventory })
}
