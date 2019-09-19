const program = require('commander')
const cliff = require('cliff')

const fs = require('fs')
const path = '../src/data/channels.json'
const file = require(path)

program.version('0.0.1')

function writeInJson(content) {
  fs.writeFile(__dirname + '/' + path, JSON.stringify(content), function(err) {
    if (err) return console.log(err)
  })
}

program
  .command('ls')
  .description('list the current channels')
  .action(function() {
    console.log(
      cliff.stringifyRows(
        [['Slack channel ID', 'Sheet name']].concat(Object.entries(file)),
        ['red', 'blue']
      ) + '\n'
    )
  })

program
  .command('add [slack] [sheet]')
  .description('add a new channel')
  .action(function(slack, sheet) {
    if (file[slack])
      console.error(`Value ${slack} already exists, please use 'edit' command.`)

    file[slack] = sheet
    writeInJson(file)
  })

program
  .command('edit [slack] [sheet]')
  .description('edit a channel')
  .action(function(slack, sheet) {
    if (!file[slack])
      console.error(`Value ${slack} doesn\'t exists, please use 'add' command.`)

    file[slack] = sheet
    writeInJson(file)
  })

program
  .command('remove [slack]')
  .description('add a new channel')
  .action(function(slack) {
    if (!file[slack]) console.error(`Value ${slack} doesn\'t exists.`)

    delete file[slack]
    writeInJson(file)
  })

program.parse(process.argv)
