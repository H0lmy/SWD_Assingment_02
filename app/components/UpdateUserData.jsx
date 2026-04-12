'use client'

import {useState} from 'react'

export default function UpdateUserData({initialUser, onUpdated}) {
    const [userData, setUserData] = useState({
        firstName: initialUser?.firstName ?? '',
        lastName: initialUser?.lastName ?? '',
        address: initialUser?.address ?? '',
        mobile: initialUser?.mobile ?? '',
        email: initialUser?.email ?? '',
        eircode: initialUser?.eircode ?? '',
    })
    const [fieldErrors, setFieldErrors] = useState({})
    const [generalError, setGeneralError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    function handleChange(e) {
        setUserData({...userData, [e.target.name]: e.target.value})
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setFieldErrors({})
        setGeneralError(null)
        setSuccess(null)
        setSubmitting(true)

        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({user: userData}),
            })
            const data = await res.json()

            if (!res.ok) {
                if (data.errors?.user) setFieldErrors(data.errors.user)
                else setGeneralError(data.error ?? 'Update failed.')
                return
            }

            setSuccess('User data successfully updated')
            onUpdated?.(userData)
        } catch {
            setGeneralError('Could not connect to server')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                First name
                <input name="firstName" value={userData.firstName} onChange={handleChange}/>
                {fieldErrors.firstName && <span>{fieldErrors.firstName}</span>}
            </label>

            <label>
                Last name
                <input name="lastName" value={userData.lastName} onChange={handleChange}/>
                {fieldErrors.lastName && <span>{fieldErrors.lastName}</span>}
            </label>

            <label>
                Address
                <input name="address" value={userData.address} onChange={handleChange}/>
                {fieldErrors.address && <span>{fieldErrors.address}</span>}
            </label>

            <label>
                Mobile
                <input name="mobile" value={userData.mobile} onChange={handleChange}/>
                {fieldErrors.mobile && <span>{fieldErrors.mobile}</span>}
            </label>

            <label>
                Email
                <input name="email" type="email" value={userData.email} onChange={handleChange}/>
                {fieldErrors.email && <span>{fieldErrors.email}</span>}
            </label>

            <label>
                Eircode
                <input name="eircode" value={userData.eircode} onChange={handleChange}/>
                {fieldErrors.eircode && <span>{fieldErrors.eircode}</span>}
            </label>

            <button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save changes'}
            </button>

            {generalError && <p role="alert">{generalError}</p>}
            {success && <p>{success}</p>}
        </form>
    )
}