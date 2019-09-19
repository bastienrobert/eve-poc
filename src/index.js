const { json } = require('micro')

const slack = require('./services/slack/index')
const googleSheet = require('./services/googleSheet/index')

require('dotenv').config()

module.exports = async req => {
  const body = await json(req)

  if (body.type === 'url_verification') {
    return body.challenge
  }

  if (body.type === 'event_callback') {
    const event = await slack(body.event)
    if (event) await googleSheet(event)
  }

  return {
    status: 'ok'
  }
}
