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
const PQueue = require('p-queue')
const { RateLimiter } = require('limiter')

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
          _options.headers = _.assign({}, _options.headers, { 'User-Agent': userAgent })
        })
    }
  })
    .then(() => _options)
}

const doRateableRequest = function (request, params) {
  return this._rate.removeTokensAsync(1)
    .then(() => request(params))
}

const doRetrieableRequest = function (request, params) {
  return retry(() => doRateableRequest.bind(this)(request, params), this._options.retry)
}

const doBreakableRequest = function (request, params) {
  return this._circuitBreaker.exec(request, params)
}

const doQueueableRequest = function (request, params) {
  return new Promise((resolve, reject) => {
    return this._queue.add(() => {
      return doBreakableRequest.bind(this)(request, params)
        .then(resolve)
        .catch(reject)
    })
  })
}

const defaultOptions = {
  request: { gzip: true },
  retry: { max_tries: 3, interval: 1000, timeout: 3000, throw_original: true },
  breaker: { timeout: 12000, threshold: 80, circuitDuration: 30000 },
  'random-http-useragent': { maxAge: 600000, preFetch: true },
  socks: { socksHost: 'localhost', socksPort: 9050 },
  rate: {
    requests: 1,
    period: 250,
    queue: { concurrency: 1 }
  }
}

class RequestOnSteroids {
  constructor (options = {}) {
    this._options = _.defaultsDeep(options, defaultOptions)

    this._request = Promise.promisifyAll(request.defaults(this._options.request))

    this._circuitBreaker = new Brakes(doRetrieableRequest.bind(this), this._options.breaker)

    RandomHttpUserAgent.configure(this._options[ 'random-http-useragent' ])

    this._rate = Promise.promisifyAll(new RateLimiter(this._options.rate.requests, this._options.rate.period))
    this._queue = new PQueue(this._options.rate.queue)
  }

  get circuitBreaker () {
    return this._circuitBreaker
  }

  get (options) {
    return buildOptions.bind(this)(options)
      .then((options) => doQueueableRequest.bind(this)(this._request.getAsync, options))
  }

  post (options) {
    return buildOptions.bind(this)(options)
      .then((options) => doQueueableRequest.bind(this)(this._request.postAsync, options))
  }

  put (options) {
    return buildOptions.bind(this)(options)
      .then((options) => doQueueableRequest.bind(this)(this._request.putAsync, options))
  }

  patch (options) {
    return buildOptions.bind(this)(options)
      .then((options) => doQueueableRequest.bind(this)(this._request.patchAsync, options))
  }

  del (options) {
    return buildOptions.bind(this)(options)
      .then((options) => doQueueableRequest.bind(this)(this._request.delAsync, options))
  }

  head (options) {
    return buildOptions.bind(this)(options)
      .then((options) => doQueueableRequest.bind(this)(this._request.headAsync, options))
  }
}

module.exports = RequestOnSteroids
