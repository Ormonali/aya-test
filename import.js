import { readFileSync } from 'fs'
import pg from "pg"
const { Pool } = pg
import dotenv from 'dotenv'
import util from 'util'

dotenv.config()

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

const createSchema = async () => {
    const schema = readFileSync('./db/schema.sql', 'utf8')
    await pool.query(schema)
}

const insertDataIntoDB = async (employees) => {
    for (const employee of employees) {
        const { id, name, surname, department, statements, donations } = employee

        await pool.query(
            'INSERT INTO Department (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
            [department.id, department.name]
        )

        await pool.query(
            'INSERT INTO Employee (id, name, surname, department_id) VALUES ($1, $2, $3, $4)',
            [id, name, surname, department.id]
        )

        for (const statement of statements) {
            await pool.query(
                'INSERT INTO Statement (id, employee_id, amount, date) VALUES ($1, $2, $3, $4)',
                [statement.id, id, statement.amount, statement.date]
            )
        }
        for (const donation of donations) {
            await pool.query(
                'INSERT INTO Donation (id, employee_id, amount, currency ,date) VALUES ($1, $2, $3, $4, $5)',
                [donation.id, id, donation.amount, donation.currency, donation.date]
            )
        }
    }
}

function getRates(lines) {
  let word = "Rates"
  let position = lines.indexOf(word)
  let rates = []
  if (position === -1) {
    console.log(`The Rates was not found in the text.`)
    return rates
  }
  let newText = lines.slice(position)
  let currentRate = {}
  newText.forEach(line => {
      if (line.startsWith('Rate')) {
          if (currentRate.sign){
            rates[`${currentRate.date}-${currentRate.sign}`] = currentRate.value
          }
          currentRate = {}
      } else if( line.includes(':')) {
          const [key, value] = line.split(':').map(part => part.trim())
          currentRate[key] = isNaN(value) ? value : Number(value)
      }
  })
  if (currentRate.sign){
    rates[`${currentRate.date}-${currentRate.sign}`] = currentRate.value
  }
  return rates
}

function parseDumpFile(filePath) {
    const data = readFileSync(filePath, 'utf8')
    const lines = data.split('\n').map(line => line.trim()).filter(line => line)
    const rates = getRates(lines)
    // console.log(rates)
    const result = []
    let currentEmployee = null
    let currentStatement = null
    let currentDonation = null
    let currentSection = null

    lines.forEach(line => {
        if (line.startsWith('Employee')) {
            if (currentEmployee) result.push(currentEmployee)
            currentEmployee = { id: null, name: null, surname: null, department: {}, statements: [], donations: [] }
            currentSection = 'Employee'
        } else if (line.startsWith('Department')) {
            currentSection = 'Department'
        } else if (line.startsWith('Statement')) {
            currentSection = 'Statement'
            if(currentStatement){
              currentEmployee.statements.push(currentStatement)
              currentStatement = null
            } 
        } else if (line.startsWith('Donation')) {
            currentSection = 'Donation'
            if(currentDonation){
              currentEmployee.donations.push(currentDonation)
              currentDonation = null
            } 
        } else {
            const [key, value] = line.split(':').map(part => part.trim())
            let index = 0
            switch (currentSection) {
                case 'Employee':
                    if (['id', 'name', 'surname'].includes(key)) {
                        currentEmployee[key] = isNaN(value) ? value : Number(value)
                    }
                    break
                case 'Department':
                    if (['id', 'name'].includes(key)) {
                        currentEmployee.department[key] = isNaN(value) ? value : Number(value)
                    }
                    break
                case 'Statement':
                    let statement = currentStatement ?? {}
                    if (key === 'id') {
                        statement.id = Number(value)
                    } else if (key === 'amount') {
                        statement.amount = parseFloat(value)
                    } else if (key === 'date') {
                        statement.date = value
                    }
                    currentStatement = statement
                    break
                case 'Donation':
                    let donation = currentDonation ?? {}
                    if (key === 'id') {
                        donation.id = Number(value)
                    } else if (key === 'amount') {
                        let amount_currency  = getAmountCurrency(rates, donation.date, value)
                        donation.amount = amount_currency.amount
                        donation.currency = amount_currency.currency
                    } else if (key === 'date') {
                        donation.date = value
                    }
                    currentDonation = donation
                    break
            }
        }
    })
    if (currentDonation) currentEmployee.donations.push(currentDonation)
    if (currentStatement) currentEmployee.statements.push(currentStatement)
    if (currentEmployee) result.push(currentEmployee)

    console.log(util.inspect(result.reverse(), {showHidden: false, depth: null, colors: true}))
    return result
}

function getAmountCurrency(rates, date, value ){
  let amount_currency  = value.split(' ')
  let donation = {
    amount: amount_currency[0],
    currency: amount_currency[1],
  }
  if(rates[`${date}-${amount_currency[1]}`]){
    donation.amount = Number(amount_currency[0]) * rates[`${date}-${amount_currency[1]}`]
    donation.currency = 'USD'
  } 
  return donation
}

const main = async () => {
    try {
        await createSchema()
        const employees = parseDumpFile('./dump/dump.txt')
        await insertDataIntoDB(employees)
        console.log('Data successfully imported')
    } catch (error) {
        console.error('Error importing data:', error)
    } finally {
        await pool.end()
    }
}

// Run the main function
main()
