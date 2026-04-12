import pool from "../../library/db.js";


export async function POST(request) {
    let rawPayload
    try {
        rawPayload = await request.json()
    } catch {
        return Response.json({error: 'Invalid JSON body.'}, {status: 400})
    }

    const cleaned = sanitizePayload(rawPayload)
    const errors = validate(cleaned)
    if (Object.keys(errors).length > 0) {
        return Response.json({errors}, {status: 400})
    }
    if (!cleaned.userID) {
        return Response.json({error: 'userID is required.'}, {status: 400})
    }

    const {userID, appliance} = cleaned
    const connection = await pool.getConnection()
    try {
        // confirm the referenced user actually exists
        const [userRow] = await connection.query(
            'SELECT userID FROM Appliance.users WHERE userID = ?',
            [userID]
        )
        if (userRow.length === 0) {
            return Response.json({error: 'Referenced user does not exist.'}, {status: 404})
        }

        await connection.query(`INSERT INTO Appliance.appliance
                                (userID, applianceType, brand, modelNumber, serialNumber, purchaseDate, warrantyExpDate,
                                 cost)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userID, appliance.applianceType, appliance.brand, appliance.modelNumber,
                appliance.serialNumber, appliance.purchaseDate, appliance.warrantyExpDate, appliance.cost])

        return Response.json({userID}, {status: 201})
    } catch (err) {
        // duplicate serial number triggers a UNIQUE sql error
        if (err.code === 'ER_DUP_ENTRY') {
            return Response.json(
                {errors: {appliance: {serialNumber: 'An appliance with this serial number already exists.'}}},
                {status: 409}
            )
        }
        return Response.json({error: err.message}, {status: 500})
    } finally {
        connection.release()
    }
}


export async function GET(request) {
    const {searchParams} = new URL(request.url)
    const serialNumber = (searchParams.get('serialNumber') ?? '').trim()
    const applianceType = (searchParams.get('applianceType') ?? '')
    const brand = (searchParams.get('brand') ?? '')
    const modelNumber = (searchParams.get('modelNumber') ?? '')

    if (serialNumber && !/^\d{4}-\d{4}-\d{4}$/.test(serialNumber)) {
        return Response.json(
            {error: 'Invalid serial number. Expected format: 0000-0000-0000.'},
            {status: 400}
        )
    }

    if (!serialNumber && !applianceType && !modelNumber && !brand) {
        return Response.json({error: 'Provide at least one parameter.'}, {status: 400})
    }

    const connection = await pool.getConnection();

    const conditions = [];
    const params = [];
    if (serialNumber) {
        conditions.push('serialNumber = ?');
        params.push(serialNumber);
    }
    if (applianceType) {
        conditions.push('applianceType = ?');
        params.push(applianceType);
    }
    if (brand) {
        conditions.push('brand = ?');
        params.push(brand);
    }
    if (modelNumber) {
        conditions.push('modelNumber = ?');
        params.push(modelNumber);
    }
    const whereClause = conditions.join(' AND ');
    try {
        const [rows] = await connection.query(
            `SELECT *
             FROM Appliance.appliance
             WHERE ${whereClause}`,
            params
        )

        if (rows.length === 0) {
            return Response.json(
                {error: 'No matching appliance found.'},
                {status: 404}
            )
        }
        return Response.json(rows, {status: 200})
    } catch (err) {
        return Response.json({error: err.message}, {status: 500})
    } finally {
        connection.release()
    }
}

export async function PUT(request) {
    let rawPayload
    try {
        rawPayload = await request.json()
    } catch {
        return Response.json({error: 'Invalid JSON body.'}, {status: 400})
    }

    const cleaned = sanitizePayload(rawPayload)
    const errors = validate(cleaned)
    if (Object.keys(errors).length > 0) {
        return Response.json({errors}, {status: 400})
    }

    const connection = await pool.getConnection()
    try {
        await connection.beginTransaction()
        // identify appliance by serialNumber
        const [existing] = await connection.query(
            `SELECT applianceID
             FROM Appliance.appliance
             WHERE serialNumber = ?`, [cleaned.appliance.serialNumber]
        )

        if (existing.length === 0) {
            return Response.json({error: 'No matching appliance found.'}, {status: 404})
        }

        await connection.query(
            `UPDATE Appliance.appliance
             SET applianceType   = ?,
                 brand           = ?,
                 modelNumber     = ?,
                 purchaseDate    = ?,
                 warrantyExpDate = ?,
                 cost            = ?
             WHERE applianceID = ?`,
            [cleaned.appliance.applianceType, cleaned.appliance.brand,
                cleaned.appliance.modelNumber, cleaned.appliance.purchaseDate,
                cleaned.appliance.warrantyExpDate, cleaned.appliance.cost,
                existing[0].applianceID]
        )

        await connection.commit()
        return Response.json({message: 'Appliance has been updated.'}, {status: 200})
    } catch (error) {
        await connection.rollback()
        return Response.json({error: error.message}, {status: 500})
    } finally {
        connection.release()
    }
}

export async function DELETE(request) {
    const {searchParams} = new URL(request.url)
    const serialNumber = (searchParams.get('serialNumber') ?? '').trim()

    if (!/^\d{4}-\d{4}-\d{4}$/.test(serialNumber)) {
        return Response.json(
            {error: 'Invalid serial number. Expected format: 0000-0000-0000.'},
            {status: 400}
        )
    }

    const connection = await pool.getConnection()
    try {
        await connection.beginTransaction()

        const [existing] = await connection.query(
            `SELECT applianceType, brand, serialNumber
             FROM Appliance.appliance
             WHERE serialNumber = ?`, [serialNumber]
        )

        if (existing.length === 0) {
            return Response.json({error: 'No matching appliance found.'}, {status: 404})
        }

        await connection.query(
            `DELETE
             FROM Appliance.appliance
             WHERE serialNumber = ?`, [serialNumber]
        )

        await connection.commit()
        return Response.json({message: 'Appliance has been deleted.', deleted: existing[0]}, {status: 200})
    } catch (error) {
        await connection.rollback()
        return Response.json({error: error.message}, {status: 500})
    } finally {
        connection.release()
    }
}

function validate(payload) {
    const errors = {appliance: {}}
    const {appliance} = payload

    if (!appliance.applianceType) {
        errors.appliance.applianceType = 'Appliance type is required.'
    } else if (appliance.applianceType.length > 100) {
        errors.appliance.applianceType = 'Appliance type cannot exceed 100 characters.'
    }

    if (!appliance.brand) {
        errors.appliance.brand = 'Brand is required.'
    } else if (appliance.brand.length > 255) {
        errors.appliance.brand = 'Brand cannot exceed 255 characters.'
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
    if (appliance.cost === null) {
        errors.appliance.cost = 'Cost must be a positive number with at most 2 decimal places.'
    } else if (appliance.cost <= 0) {
        errors.appliance.cost = 'Cost must be greater than 0.'
    } else if (appliance.cost > 9999.99) {
        errors.appliance.cost = 'Cost cannot exceed 9999.99.'
    }

    if (Object.keys(errors.appliance).length === 0) delete errors.appliance
    return errors
}


function sanitizePayload(payload) {
    const {userID, appliance = {}} = payload ?? {}

    return {
        userID: userID ?? null,
        appliance: {
            applianceType: (appliance.applianceType ?? '').trim(),
            brand: (appliance.brand ?? '').trim(),
            modelNumber: (appliance.modelNumber ?? '').trim(),
            serialNumber: (appliance.serialNumber ?? '').trim(),
            purchaseDate: toMysqlDate(appliance.purchaseDate),
            warrantyExpDate: toMysqlDate(appliance.warrantyExpDate),
            cost: toNumber(appliance.cost),
        },
    }
}

function toMysqlDate(str) {
    if (!str) return null
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str.trim())
    if (!match) return null
    const [, day, month, year] = match
    const d = new Date(`${year}-${month}-${day}`)
    if (
        d.getFullYear() !== Number(year) ||
        d.getMonth() + 1 !== Number(month) ||
        d.getDate() !== Number(day)
    ) {
        return null
    }
    return d;
}

function toNumber(val) {
    if (val === null || val === undefined || val === '') return null
    const str = String(val).trim()
    if (!/^\d+(\.\d{1,2})?$/.test(str)) return null
    const n = Number(str)
    return Number.isFinite(n) ? n : null
}