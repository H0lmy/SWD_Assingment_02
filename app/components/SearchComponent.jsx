import {useState} from "react";
import Link from "next/link";

export default function SearchComponent() {
    const [filters, setFilters] = useState({
        serialNumber: '',
        applianceType: '',
        brand: '',
        modelNumber: ''
    })
    const [results, setResults] = useState([])
    const [error, setError] = useState(null)

    function handleChange(e) {
        setFilters({...filters, [e.target.name]: e.target.value})
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setResults([])
        setError(null)

        // build query string from only non-empty filters
        const params = new URLSearchParams()
        for (const [key, value] of Object.entries(filters)) {
            if (value.trim()) params.append(key, value.trim())
        }

        const res = await fetch(`/api/appliances?${params}`)
        const data = await res.json()

        if (!res.ok) {
            setError(data.error)
            return
        }
        setResults(data)
    }

    return (
        <div className="appliance-form">
            <h3>Search Appliance</h3>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Serial Number</label>
                    <input name="serialNumber" value={filters.serialNumber} onChange={handleChange} placeholder="0000-0000-0000" />
                </div>

                <div className="form-group">
                    <label>Appliance Type</label>
                    <input name="applianceType" value={filters.applianceType} onChange={handleChange} placeholder="e.g. Washing Machine" />
                </div>

                <div className="form-group">
                    <label>Brand</label>
                    <input name="brand" value={filters.brand} onChange={handleChange} placeholder="e.g. Samsung" />
                </div>

                <div className="form-group">
                    <label>Model Number</label>
                    <input name="modelNumber" value={filters.modelNumber} onChange={handleChange} placeholder="000-000-0000" />
                </div>

                <button type="submit" className="submit-btn">Search</button>
            </form>

            {error && (
                <div className="error" style={{marginTop: '1rem'}}>
                    <p>{error}</p>
                    <Link href="/"><button type="button" className="submit-btn">Back to Homepage</button></Link>
                </div>
            )}

            {results.length > 0 && (
                <div style={{marginTop: '1rem'}}>
                    <h3>Results ({results.length})</h3>
                    {results.map((item, i) => (
                        <div key={i} className="inventory-item">
                            <p><strong>Type:</strong> {item.applianceType}</p>
                            <p><strong>Brand:</strong> {item.brand}</p>
                            <p><strong>Model Number:</strong> {item.modelNumber}</p>
                            <p><strong>Serial Number:</strong> {item.serialNumber}</p>
                            <p><strong>Purchase Date:</strong> {item.purchaseDate}</p>
                            <p><strong>Warranty Expiry:</strong> {item.warrantyExpDate}</p>
                            <p><strong>Cost:</strong> {item.cost}</p>
                        </div>
                    ))}
                    <Link href="/"><button type="button" className="submit-btn">Back to Homepage</button></Link>
                </div>
            )}
        </div>
    )
}