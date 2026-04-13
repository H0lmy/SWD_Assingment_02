'use client'

import {useState} from 'react'
import UpdateAppliance from '../../components/UpdateAppliance'

function toDDMMYYYY(value) {
    if (!value) return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}/${d.getFullYear()}`
}

export default function UpdateAppliancePage() {
    const [step, setStep] = useState(1)
    const [serialNumber, setSerialNumber] = useState('')
    const [serialError, setSerialError] = useState(null)
    const [lookupError, setLookupError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [appliance, setAppliance] = useState(null)

    async function handleSerialSubmit(e) {
        e.preventDefault()
        const trimmed = serialNumber.trim()
        if (!/^\d{4}-\d{4}-\d{4}$/.test(trimmed)) {
            setSerialError('Format: 0000-0000-0000')
            return
        }
        setSerialError(null)
        setLookupError(null)
        setLoading(true)

        try {
            const res = await fetch(`/api/appliances?serialNumber=${encodeURIComponent(trimmed)}`)
            const data = await res.json()
            if (!res.ok) {
                setLookupError(data.error ?? 'Lookup failed.')
                return
            }
            const row = Array.isArray(data) ? data[0] : data
            setSerialNumber(trimmed)
            setAppliance({
                applianceType: row.applianceType ?? '',
                brand: row.brand ?? '',
                modelNumber: row.modelNumber ?? '',
                serialNumber: row.serialNumber ?? '',
                purchaseDate: toDDMMYYYY(row.purchaseDate),
                warrantyExpDate: toDDMMYYYY(row.warrantyExpDate),
                cost: row.cost ?? '',
            })
            setStep(2)
        } catch {
            setLookupError('Could not connect to the server.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="appliance-form">
            {step === 1 ? (
                <form onSubmit={handleSerialSubmit}>
                    <h3>Update Appliance</h3>
                    <div className="form-group">
                        <label>Serial Number</label>
                        <input
                            name="serialNumber"
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                            placeholder="0000-0000-0000"
                        />
                        {serialError && <span className="error">{serialError}</span>}
                        {lookupError && <span className="error">{lookupError}</span>}
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Checking…' : 'Next'}
                    </button>
                </form>
            ) : (
                <UpdateAppliance initialAppliance={appliance}/>
            )}
        </div>
    )
}