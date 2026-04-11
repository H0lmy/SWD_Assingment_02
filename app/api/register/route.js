import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import ALLOWED_TYPES from '../../constants/applianceTypes'

// path to the inventory file
const INVENTORY_FILE = path.join(process.cwd(), 'inventory.json')

// replacing the core ascii elements which can provide a fully operatable script in the form for browser to avoid breaking into system
function sanitize(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// Parse DD/MM/YYYY into a Date object
function parseDate(str) {
  const [day, month, year] = str.split('/')
  return new Date(`${year}-${month}-${day}`)
}

// POST /api/register — validates form data and saves to inventory
// returns sanitized fields back on error for sticky form repopulation
export async function POST(request) {
  const body = await request.json()
  const { eircode, applianceType, brand, modelNumber, serialNumber, purchaseDate, warrantyDate } = body

  const errors = {}

  // sanitize all submitted fields so they can be safely sent back to the form
  let sanitizedFields = {
    eircode: sanitize(eircode || ''),
    applianceType: sanitize(applianceType || ''),
    brand: sanitize(brand || ''),
    modelNumber: sanitize(modelNumber || ''),
    serialNumber: sanitize(serialNumber || ''),
    purchaseDate: sanitize(purchaseDate || ''),
    warrantyDate: sanitize(warrantyDate || ''),
  }

  // here are validations for each of the data retrieved from the form(i have added them straightly during the part B because i was used to implement error checks straight away )
  if (!eircode || !/^D\d{2} [A-Z0-9]{4}$/i.test(eircode)) {
    errors.eircode = 'Invalid Eircode. Expected format: D00 XXXX'
  }

  if (!ALLOWED_TYPES.includes(applianceType)) {
    errors.applianceType = 'Please select a valid appliance type.'
  }

  if (!brand || brand.trim().length < 1) {
    errors.brand = 'Brand is required.'
  }

  if (!modelNumber || !/^\d{3}-\d{3}-\d{4}$/.test(modelNumber)) {
    errors.modelNumber = 'Invalid model number. Expected: 000-000-0000'
  }

  if (!serialNumber || !/^\d{4}-\d{4}-\d{4}$/.test(serialNumber)) {
    errors.serialNumber = 'Invalid serial number. Expected: 0000-0000-0000'
  }

  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/

  if (!purchaseDate || !dateRegex.test(purchaseDate)) {
    errors.purchaseDate = 'Invalid date. Expected: DD/MM/YYYY'
  }

  if (!warrantyDate || !dateRegex.test(warrantyDate)) {
    errors.warrantyDate = 'Invalid date. Expected: DD/MM/YYYY'
  }

  // Warranty must not be earlier than purchase
  if (!errors.purchaseDate && !errors.warrantyDate) {
    const purchase = parseDate(purchaseDate)
    const warranty = parseDate(warrantyDate)
    if (warranty < purchase) {
      errors.warrantyDate = 'Warranty date cannot be earlier than purchase date.'
    }
  }

  // check if theres any errors and return them with the fields for sticky repopulation
  let errorCount = Object.keys(errors).length
  if (errorCount > 0) {
    return NextResponse.json({ errors, fields: sanitizedFields }, { status: 400 })
  }

  // Save sanitized entry to JSON file
  const inventory = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8'))
  inventory.push(sanitizedFields)
  fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventory, null, 2))

  return NextResponse.json({ message: 'Appliance registered successfully.', entry: sanitizedFields })
}
