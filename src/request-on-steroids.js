/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const _ = require('lodash')
const Promise = require('bluebird')
const retry = require('bluebird-retry')
const Brakes = require('brakes')

const request = require('request')

const RandomHttpUserAgent = require('random-http-useragent')

const buildOptions = function (options) {
  if (!options || !options.url) {
    return Promise.reject(new Error('invalid arguments'))
  }

  const _options = _.clone(options)

  if (_options.tor) {
    const agentClass = _.startsWith(_options.url, 'https') ? require('socks5-https-client/lib/Agent') : require('socks5-http-client/lib/Agent')
    const agentOptions = this._options.socks

    _.merge(_options, { agentClass, agentOptions })
  }

  return Promise.try(() => {
    if (_options.randomHttpUserAgent) {
      return RandomHttpUserAgent.get()
        .then((userAgent) => {
          options.headers = _.assign({}, _options.headers, { 'User-Agent': userAgent })
        })
    }
  })
}

const defaultOptions = {
  request: { gzip: true },
  retry: { max_tries: 3, interval: 1000, timeout: 3000, throw_original: true },
  breaker: { timeout: 12000, threshold: 80, circuitDuration: 30000 },
  'random-http-useragent': { maxAge: 600000, preFetch: true },
  socks: { socksHost: 'localhost', socksPort: 9050 }
}

class RequestOnSteroids {
  constructor (options = {}) {
    this._options = _.defaultsDeep(options, defaultOptions)

    this._request = Promise.promisifyAll(request.defaults(this._options.request))

    this._circuitBreaker = new Brakes(this._options.breaker)

    this._request.getCircuitBreaker = this._circuitBreaker.slaveCircuit((params) => retry(() => this._request.getAsync(params), this._options.retry))
    this._request.postCircuitBreaker = this._circuitBreaker.slaveCircuit((params) => retry(() => this._request.postAsync(params), this._options.retry))
    this._request.putCircuitBreaker = this._circuitBreaker.slaveCircuit((params) => retry(() => this._request.putAsync(params), this._options.retry))
    this._request.patchCircuitBreaker = this._circuitBreaker.slaveCircuit((params) => retry(() => this._request.patchAsync(params), this._options.retry))
    this._request.delCircuitBreaker = this._circuitBreaker.slaveCircuit((params) => retry(() => this._request.delAsync(params), this._options.retry))
    this._request.headCircuitBreaker = this._circuitBreaker.slaveCircuit((params) => retry(() => this._request.headAsync(params), this._options.retry))

    RandomHttpUserAgent.configure(this._options[ 'random-http-useragent' ])
  }

  get (options) {
    return buildOptions(options)
      .then(() => this._request.getCircuitBreaker.exec(options))
  }

  post (options) {
    return buildOptions(options)
      .then(() => this._request.postCircuitBreaker.exec(options))
  }

  put (options) {
    return buildOptions(options)
      .then(() => this._request.putCircuitBreaker.exec(options))
  }

  patch (options) {
    return buildOptions(options)
      .then(() => this._request.patchCircuitBreaker.exec(options))
  }

  del (options) {
    return buildOptions(options)
      .then(() => this._request.delCircuitBreaker.exec(options))
  }

  head (options) {
    return buildOptions(options)
      .then(() => this._request.headCircuitBreaker.exec(options))
  }
}

module.exports = RequestOnSteroids
