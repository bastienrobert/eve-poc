const { google } = require('googleapis')
const dlv = require('dlv')

const { formatLinksArray, getRealSheetIndex } = require('../../utils/helpers')

const SUCCESS = { success: true }
const ISSUE = { success: false }

async function authenticate() {
  const options = {
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets'
    ]
  }
  if (process.env.NODE_ENV !== 'development') {
    options.credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  }
  return await google.auth.getClient(options)
}

async function getRangeFromID(sheets, sheet, id) {
  const getID = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${sheet}!A2:A`,
    majorDimension: 'COLUMNS'
  })
  return dlv(getID, ['data', 'values', 0], []).findIndex(val => val === id)
}

async function push(sheets, { id, sheet, text, links, author, date }) {
  if ((await getRangeFromID(sheets, sheet, id)) > 0) {
    console.error('Value already sent')
    return ISSUE
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${sheet}!A1:E1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[id, text, formatLinksArray(links), author, date]]
      }
    })

    return SUCCESS
  } catch (error) {
    console.error(error)
    return ISSUE
  }
}

async function update(sheets, { id, sheet, text, links, author, date }) {
  const index = await getRangeFromID(sheets, sheet, id)
  if (index < 0) {
    console.error(`Cannot find id: ${id}`)
    return ISSUE
  }
  const realIndex = getRealSheetIndex(index)

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${sheet}!B${realIndex}:E${realIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[text, formatLinksArray(links), author, date]]
      }
    })

    return SUCCESS
  } catch (error) {
    console.error(error)
    return ISSUE
  }
}

async function clear(sheets, { id, sheet }) {
  const index = await getRangeFromID(sheets, sheet, id)
  if (index < 0) {
    console.error(`Cannot find id: ${id}`)
    return ISSUE
  }
  const realIndex = getRealSheetIndex(index)

  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${sheet}!A${realIndex}:${realIndex}`
    })

    return SUCCESS
  } catch (error) {
    console.error(error)
    return ISSUE
  }
}

module.exports = async data => {
  const auth = await authenticate()
  const sheets = google.sheets({
    version: 'v4',
    auth
  })

  try {
    switch (data.status) {
      case 'append':
        await push(sheets, data)
        break
      case 'update':
        await update(sheets, data)
        break
      case 'clear':
        await clear(sheets, data)
      default:
        break
    }
  } catch (error) {
    console.error(error)
    return ISSUE
  }

  return SUCCESS
}
