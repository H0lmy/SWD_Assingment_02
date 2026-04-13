'use client'

import {useState} from 'react'
import AddUserForm from '../components/AddUserForm'
import ApplianceForm from '../components/ApplianceForm'

// step 0: choose existing user (by email) or new user
// step 1: create user via /api/users
// step 2: post appliance with userID
export default function AddPage() {
    const [step, setStep] = useState(0)
    const [userID, setUserID] = useState(null)
    const [userError, setUserError] = useState(null)

    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState(null)
    const [lookupError, setLookupError] = useState(null)
    const [loading, setLoading] = useState(false)

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

    async function handleEmailLookup(e) {
        e.preventDefault()
        const trimmed = email.trim().toLowerCase()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setEmailError('Please enter a valid email.')
            return
        }
        setEmailError(null)
        setLookupError(null)
        setLoading(true)
        try {
            const res = await fetch(`/api/users?email=${encodeURIComponent(trimmed)}`)
            const data = await res.json()
            if (!res.ok) {
                setLookupError(data.error ?? 'Lookup failed.')
                return
            }
            setUserID(data.userID)
            setStep(2)
        } catch {
            setLookupError('Could not connect to the server.')
        } finally {
            setLoading(false)
        }
    }

    if (step === 0) {
        return (
            <div className="appliance-form">
                <h3>Add Appliance</h3>
                <p className="form-hint">Do you already have an account with us?</p>
                <div className="form-group">
                    <button
                        type="button"
                        className="submit-btn"
                        onClick={() => setStep('existing')}
                    >
                        I already have an account
                    </button>
                </div>
                <div className="form-group">
                    <button
                        type="button"
                        className="submit-btn"
                        onClick={() => setStep(1)}
                    >
                        New user
                    </button>
                </div>
            </div>
        )
    }

    if (step === 'existing') {
        return (
            <div className="appliance-form">
                <form onSubmit={handleEmailLookup}>
                    <h3>Find Account</h3>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                        />
                        {emailError && <span className="error">{emailError}</span>}
                        {lookupError && <span className="error">{lookupError}</span>}
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Checking…' : 'Continue'}
                    </button>
                    <button
                        type="button"
                        className="submit-btn"
                        style={{marginLeft: '0.5rem'}}
                        onClick={() => setStep(0)}
                        disabled={loading}
                    >
                        Back
                    </button>
                </form>
            </div>
        )
    }

    if (step === 1) {
        return <AddUserForm onSubmit={handleUserSubmit} serverErrors={userError}/>
    }

    return <ApplianceForm userID={userID}/>
}
