'use client'

import {useState} from 'react'

export default function DeleteAppliance() {
    const [serialNumber, setSerialNumber] = useState('')
    const [serialError, setSerialError] = useState(null)
    const [generalError, setGeneralError] = useState(null)
    const [appliance, setAppliance] = useState(null)
    const [deleted, setDeleted] = useState(null)
    const [loading, setLoading] = useState(false)

    async function handleLookup(e) {
        e.preventDefault()
        const trimmed = serialNumber.trim()
        if (!/^\d{4}-\d{4}-\d{4}$/.test(trimmed)) {
            setSerialError('Format: 0000-0000-0000')
            return
        }
        setSerialError(null)
        setGeneralError(null)
        setAppliance(null)
        setDeleted(null)
        setLoading(true)

        try {
            const res = await fetch(`/api/appliances?serialNumber=${encodeURIComponent(trimmed)}`)
            const data = await res.json()
            if (!res.ok) {
                setGeneralError(data.error ?? 'Lookup failed.')
                return
            }
            const row = Array.isArray(data) ? data[0] : data
            setSerialNumber(trimmed)
            setAppliance(row)
        } catch {
            setGeneralError('Could not connect to the server.')
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        setGeneralError(null)
        setLoading(true)
        try {
            const res = await fetch(
                `/api/appliances?serialNumber=${encodeURIComponent(serialNumber)}`,
                {method: 'DELETE'}
            )
            const data = await res.json()
            if (!res.ok) {
                setGeneralError(data.error ?? 'Delete failed.')
                return
            }
            setDeleted(data.deleted ?? {serialNumber})
            setAppliance(null)
            setSerialNumber('')
        } catch {
            setGeneralError('Could not connect to the server.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="appliance-form">
            <h3>Delete Appliance</h3>

            {deleted && (
                <div className="success-message">
                    Deleted {deleted.brand ? `${deleted.brand} ` : ''}
                    {deleted.applianceType ?? 'appliance'} ({deleted.serialNumber}).
                </div>
            )}

            {!appliance && (
                <form onSubmit={handleLookup}>
                    <div className="form-group">
                        <label>Serial Number</label>
                        <input
                            name="serialNumber"
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                            placeholder="0000-0000-0000"
                        />
                        {serialError && <span className="error">{serialError}</span>}
                        {generalError && <span className="error">{generalError}</span>}
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Checking…' : 'Find'}
                    </button>
                </form>
            )}

            {appliance && (
                <div>
                    <div className="inventory-item">
                        <p><strong>Type:</strong> {appliance.applianceType}</p>
                        <p><strong>Brand:</strong> {appliance.brand}</p>
                        <p><strong>Model Number:</strong> {appliance.modelNumber}</p>
                        <p><strong>Serial Number:</strong> {appliance.serialNumber}</p>
                        <p><strong>Cost:</strong> {appliance.cost}</p>
                    </div>

                    {generalError && <p className="error" role="alert">{generalError}</p>}

                    <button type="button" className="submit-btn" onClick={handleDelete} disabled={loading}>
                        {loading ? 'Deleting…' : 'Confirm Delete'}
                    </button>
                    <button
                        type="button"
                        className="submit-btn"
                        style={{marginLeft: '0.5rem'}}
                        onClick={() => {
                            setAppliance(null)
                            setSerialNumber('')
                        }}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    )
}