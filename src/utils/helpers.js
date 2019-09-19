const URL_REGEX = /(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/gi

module.exports = {
  getLinksFromString: function(string) {
    return string.match(URL_REGEX) || []
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
