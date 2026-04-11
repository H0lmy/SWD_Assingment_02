import pool from "../../library/db.js";

export async function POST(request){
    const{user,appliance}=await request.json();


    function validate(payload) {
        const errors = { user: {}, appliance: {} }
        const { user, appliance } = payload

        if (!user.firstName?.trim()) {
            errors.user.firstName = 'First name is required.'
        } else if (!/^[A-Za-zÀ-ÿ' -]{1,50}$/.test(user.firstName)) {
            errors.user.firstName = 'Letters and name related characters are required.'
        }

        if (!user.lastName?.trim()) {
            errors.user.lastName = 'Last name is required.'
        } else if (!/^[A-Za-zÀ-ÿ' -]{1,50}$/.test(user.lastName)) {
            errors.user.lastName = 'Letters and name related characters are required.'
        }

        if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            errors.user.email = 'Please enter a valid email.'
        }

        if (!user.mobile || !/^\+?[0-9\s]{10,15}$/.test(user.mobile)) {
            errors.user.mobile = 'Please enter a valid mobile number.'
        }

        if (!/^[A-Z]\d{2}[A-Z0-9]{4}$/.test(user.eircode)) {
            errors.user.eircode = 'Invalid Eircode. Expected format: A00 XXXX'
        }

        if (!appliance.applianceType.trim()) {
            errors.appliance.applianceType = 'Please enter appliance type.'
        }

        if (!appliance.brand?.trim()) {
            errors.appliance.brand = 'Brand is required.'
        }

        if (!/^\d{3}-\d{3}-\d{4}$/.test(appliance.modelNumber || '')) {
            errors.appliance.modelNumber = 'Format: 000-000-0000'
        }

        if (!/^\d{4}-\d{4}-\d{4}$/.test(appliance.serialNumber || '')) {
            errors.appliance.serialNumber = 'Format: 0000-0000-0000'
        }

        const purchase = parseDate(appliance.purchaseDate)
        if (!purchase) errors.appliance.purchaseDate = 'Invalid date. Format: DD/MM/YYYY'

        const warranty = parseDate(appliance.warrantyExpDate)
        if (!warranty) errors.appliance.warrantyExpDate = 'Invalid date. Format: DD/MM/YYYY'

        if (purchase && warranty && warranty < purchase) {
            errors.appliance.warrantyExpDate = 'Warranty cannot be earlier than purchase date.'
        }

        const cost = parseFloat(appliance.cost)
        if (isNaN(cost) || cost <= 0 || !/^\d+(\.\d{1,2})?$/.test(String(appliance.cost))) {
            errors.appliance.cost = 'Cost must be a positive number with up to 2 decimal places.'
        }

        // strip empty error buckets so the response is clean
        if (Object.keys(errors.user).length === 0) delete errors.user
        if (Object.keys(errors.appliance).length === 0) delete errors.appliance

        return errors
    }

    function parseDate(str) {
        if (!str) return null
        const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str)
        if (!match) return null
        const [, dayStr, monthStr, yearStr] = match
        const day = Number(dayStr)
        const month = Number(monthStr)
        const year = Number(yearStr)
        const d = new Date(year, month - 1, day)
        // verify the Date object actually represents what was typed
        // (catches 31/02/2025 silently rolling over to 03/03/2025)
        if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
            return null
        }
        return d
    }


    const connection = await pool.getConnection();
}