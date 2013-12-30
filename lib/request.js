/**
 * Take formatted options and creates an Express style `req` object
 *
 * @param {Object} mocker
 * @param {Object} options
 * @return {Object}
 */

function Request (mocker, options) {
  // TODO
  this.get = this.header = this.range;
  this.accepts = this.acceptsEncoding = this.acceptsCharset = this.acceptsLanguage = this.is = noop;
  this.accepted = this.acceptedEncodings = this.acceptedCharsets = this.acceptedLanguages = [];
  this.protocol = this.ip = this.ips = this.auth = '';
  this.fresh = this.stale = this.xhr = false;
  this.subdomains = [];
  this.path = this.host = '';
  this.query = {};

  this.params = options.params;
  this.body = options.body;
}
module.exports = Request;

function noop () {}
