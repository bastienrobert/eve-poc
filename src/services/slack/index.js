const { WebClient } = require('@slack/client')

const {
  createEventFromChangedMessage,
  createEventFromDeletedMessage,
  createEventFromNewMessage
} = require('./events')
const { getLinksFromString, getUserName } = require('../../utils/helpers')

function createEventFromSubTypeMessage(event) {
  switch (event.subtype) {
    case 'message_changed':
      return createEventFromChangedMessage(event)
    case 'message_deleted':
      return createEventFromDeletedMessage(event)
    default:
      return createEventFromNewMessage(event)
  }
}

module.exports = async event => {
  if (event.type !== 'message') return null

  const res = createEventFromSubTypeMessage(event)

  // ERROR HANDLING
  if (!res) return null // IGNORE
  if (res.status === 'clear') return res // DON'T PROCESS COMPLEX IF SIMPLE CLEAR

  const links = getLinksFromString(res.text)
  if (links.length <= 0) return null // IF NO LINKS, SKIP THE MESSAGE
  // END

  const web = new WebClient(process.env.SLACK_OAUTH_TOKEN)

  const author = await web.users.info({ user: res.user })
  res.author = getUserName(author)
  if (res.editor) {
    const editor = await web.users.info({ user: res.user })
    res.author += `(edited by ${getUserName(editor)})`
  }

  const date = new Date()
  res.date = date.toLocaleString('fr')
  res.links = links

  return res
}
