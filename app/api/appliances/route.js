import pool from "../../library/db.js";

export async function POST(request){
    const{user,appliance}=await request.json();
    const connection = await pool.getConnection();


}

function validate(payload) {
    const errors = { user: {}, appliance: {} }
    const { user, appliance } = payload

    if (!user.firstName) {
        errors.user.firstName = 'First name is required.'
    } else if (!/^[A-Za-zÀ-ÿ' -]{1,50}$/.test(user.firstName)) {
        errors.user.firstName = 'Letters and name characters only.'
    }

    if (!user.lastName) {
        errors.user.lastName = 'Last name is required.'
    } else if (!/^[A-Za-zÀ-ÿ' -]{1,50}$/.test(user.lastName)) {
        errors.user.lastName = 'Letters and name characters only.'
    }

    if (!user.address) {
        errors.user.address = 'Address is required.'
    }

    if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        errors.user.email = 'Please enter a valid email.'
    }

    if (!user.mobile || !/^\+?\d{10,15}$/.test(user.mobile)) {
        errors.user.mobile = 'Please enter a valid mobile number.'
    }

    if (!/^[A-Z]\d{2}[A-Z0-9]{4}$/.test(user.eircode)) {
        errors.user.eircode = 'Invalid Eircode. Expected format: A00 XXXX'
    }

    if (!appliance.applianceType) {
        errors.appliance.applianceType = 'Appliance type is required.'
    }

    if (!appliance.brand) {
        errors.appliance.brand = 'Brand is required.'
    }

    if (!/^\d{3}-\d{3}-\d{4}$/.test(appliance.modelNumber)) {
        errors.appliance.modelNumber = 'Format: 000-000-0000'
    }

    if (!/^\d{4}-\d{4}-\d{4}$/.test(appliance.serialNumber)) {
        errors.appliance.serialNumber = 'Format: 0000-0000-0000'
    }

    if (!appliance.purchaseDate) {
        errors.appliance.purchaseDate = 'Invalid date. Format: DD/MM/YYYY'
    }

    if (!appliance.warrantyExpDate) {
        errors.appliance.warrantyExpDate = 'Invalid date. Format: DD/MM/YYYY'
    }

    if (
        appliance.purchaseDate &&
        appliance.warrantyExpDate &&
        appliance.warrantyExpDate < appliance.purchaseDate
    ) {
        errors.appliance.warrantyExpDate = 'Warranty cannot be earlier than purchase date.'
    }

    if (appliance.cost === null || appliance.cost <= 0) {
        errors.appliance.cost = 'Cost must be a positive number.'
    } else if (Math.round(appliance.cost * 100) / 100 !== appliance.cost) {
        errors.appliance.cost = 'Cost can have at most 2 decimal places.'
    }

    // strip empty error buckets so the response is clean
    if (Object.keys(errors.user).length === 0) delete errors.user
    if (Object.keys(errors.appliance).length === 0) delete errors.appliance

    return errors
}




function sanitizePayload(payload) {
    const { user = {}, appliance = {} } = payload

    return {
        // sanitising the user fields before validation
        user: {
            firstName: (user.firstName ?? '').trim(),
            lastName:  (user.lastName  ?? '').trim(),
            address:   (user.address   ?? '').trim(),
            mobile:    (user.mobile    ?? '').replace(/[^\d+]/g, ''),
            email:     (user.email     ?? '').trim().toLowerCase(),
            eircode:   (user.eircode   ?? '').replace(/\s+/g, '').toUpperCase(),
        },
    // sanitising the appliance fields before validation
        appliance: {
            applianceType:   (appliance.applianceType ?? '').trim(),
            brand:           (appliance.brand         ?? '').trim(),
            modelNumber:     (appliance.modelNumber   ?? '').trim(),
            serialNumber:    (appliance.serialNumber  ?? '').trim(),
            purchaseDate:    toMysqlDate(appliance.purchaseDate),
            warrantyExpDate: toMysqlDate(appliance.warrantyExpDate),
            cost:            toNumber(appliance.cost),
        },
    }
}

function toMysqlDate(str) {
    if (!str) return null
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str.trim())
    if (!match) return null
    const [, day, month, year] = match
    return `${year}-${month}-${day}`   // 'YYYY-MM-DD' is what MySQL DATE valid format required
}
// conversion to javascript number function
function toNumber(val) {
    if (val === null || val === undefined || val === '') return null
    const n = Number(val)
    return Number.isFinite(n) ? n : null
}