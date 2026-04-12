'use client'

import {useState} from 'react'
import AddUserForm from '../components/AddUserForm'
import ApplianceForm from '../components/ApplianceForm'

export default function AddPage() {
    const [step, setStep] = useState(1)
    const [userData, setUserData] = useState(null)

    function handleUserSubmit(userFields) {
        setUserData(userFields)
        setStep(2)
    }

    return (
        <div>
            <h2>Add Appliance</h2>
            {step === 1
                ? <AddUserForm onSubmit={handleUserSubmit} />
                : <ApplianceForm userData={userData} />
            }
        </div>
    )
}