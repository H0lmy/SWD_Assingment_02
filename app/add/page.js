'use client'

import {useState} from 'react'
import AddUserForm from '../components/AddUserForm'
import ApplianceForm from '../components/ApplianceForm'
// step 1 creates the user via /api/users, step 2 posts the appliance with the returned userID
export default function AddPage() {
    const [step, setStep] = useState(1)
    const [userID, setUserID] = useState(null)
    const [userError, setUserError] = useState(null)

    async function handleUserSubmit(userFields) {
        setUserError(null)
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({user: userFields}),
            })
            const data = await res.json()
            if (!res.ok) {
                setUserError(data.errors?.user ?? {general: data.error ?? 'Could not save user.'})
                return
            }
            setUserID(data.userID)
            setStep(2)
        } catch {
            setUserError({general: 'Could not connect to the server.'})
        }
    }

    return (
        <div>
            {step === 1
                ? <AddUserForm onSubmit={handleUserSubmit} serverErrors={userError}/>
                : <ApplianceForm userID={userID}/>
            }
        </div>
    )
}