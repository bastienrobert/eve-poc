const dlv = require('dlv')

const channels = require('../../data/channels.json')

module.exports = {
  createEventFromNewMessage: function(event) {
    return {
      id: event.client_msg_id,
      status: 'append',
      text: event.text,
      thread_ts: event.ts,
      sheet: channels[event.channel],
      user: event.user
    }
  },
  createEventFromChangedMessage: function(event) {
    const editor = dlv(event.message, 'edited.user')
    if (!editor) return null

    return {
      id: event.message.client_msg_id,
      status: 'update',
      text: event.message.text,
      thread_ts: event.message.ts,
      sheet: channels[event.channel],
      user: event.message.user,
      editor
    }
  },
  createEventFromDeletedMessage: function(event) {
    return {
      id: event.previous_message.client_msg_id,
      status: 'clear',
      sheet: channels[event.channel]
    }
  }
}
