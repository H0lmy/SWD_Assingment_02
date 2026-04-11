'use client'

import { useState } from 'react'
import BookingForm from './components/BookingForm'
import BookingConfirmation from './components/BookingConfirmation'
import ApplianceForm from './components/ApplianceForm'

export default function Home() {
  const [booking, setBooking] = useState(null)
  const [part, setPart] = useState('A')

  return (
    <div>
      <div className="tabs">
        <button className={part === 'A' ? 'active' : ''} onClick={() => setPart('A')}>
          Part A — Cinema Booking
        </button>
        <button className={part === 'B' ? 'active' : ''} onClick={() => setPart('B')}>
          Part B — Appliance Inventory
        </button>
      </div>

      {part === 'A' ? (
        booking ? (
          <BookingConfirmation booking={booking} onReset={() => setBooking(null)} />
        ) : (
          <BookingForm onBook={setBooking} />
        )
      ) : (
        <ApplianceForm />
      )}
    </div>
  )
}
