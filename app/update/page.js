'use client'

import Link from 'next/link'

export default function UpdatePage() {
    return (
        <div className="appliance-form">
            <h3>Update</h3>
            <div className="form-group">
                <Link href="/update/user">
                    <button type="button" className="submit-btn">Update User Data</button>
                </Link>
            </div>
            <div className="form-group">
                <Link href="/update/appliance">
                    <button type="button" className="submit-btn">Update Appliance Data</button>
                </Link>
            </div>
        </div>
    )
}