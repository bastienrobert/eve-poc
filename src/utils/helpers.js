const URL_REGEX = /(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/
const URL_REGEX_WITH_CHEVRON = new RegExp(
  /\</.source + URL_REGEX.source + /\>/.source,
  'g',
  'i'
)

module.exports = {
  getLinksFromString: function(string) {
    return (string.match(URL_REGEX_WITH_CHEVRON) || []).map(l => l.slice(1, -1))
  },
  formatLinksArray: function(links) {
    return links.join(' ')
  },
  getUserName: function(user) {
    return user && (user.user.real_name || user.user.name)
  },
  getRealSheetIndex: function(index) {
    return index + 2 // ignore the first line and array starts at 0 but sheets starts at 1
  }
}
