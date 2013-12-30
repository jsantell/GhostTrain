/**
 * Takes Backbone's `params` and turns it into an Express-style `request` object.
 *
 * @param {Object} mocker
 * @param {Object} route
 * @param {Object} params
 * @return {Object}
 */

function Request (mocker, route, params) {
  // TODO
  this.get = this.header = this.range;
  this.accepts = this.acceptsEncoding = this.acceptsCharset = this.acceptsLanguage = this.is = noop;
  this.accepted = this.acceptedEncodings = this.acceptedCharsets = this.acceptedLanguages = [];
  this.protocol = this.ip = this.ips = this.auth = '';
  this.fresh = this.stale = this.xhr = false;
  this.subdomains = [];
  this.path = this.host = '';
  this.query = {};

  this.params = route.params;
  this.body = JSON.stringify(params || '{}');
}
module.exports = Request;

function noop () {}
