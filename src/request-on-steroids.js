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
  return Promise.try(() => {
    if (!options) {
      throw new Error('invalid arguments')
    }

    const _url = options.url || options.uri

    if (!_url) {
      throw new Error('invalid arguments')
    }

    const _options = _.clone(options)

    if (_options.tor) {
      const agentClass = _.startsWith(_url, 'https') ? require('socks5-https-client/lib/Agent') : require('socks5-http-client/lib/Agent')
      const agentOptions = this._options.socks

      _.merge(_options, { agentClass, agentOptions })
    }

    return _options
  })
    .then((options) => {
      if (options.randomHttpUserAgent) {
        return RandomHttpUserAgent.get()
          .then((userAgent) => {
            options.headers = _.assign({}, options.headers, { 'User-Agent': userAgent })

            return options
          })
      }

      return options
    })
}

const doRequest = function (request, options, responseHandler) {
  return request(options)
    .then(responseHandler)
}

const doRateableRequest = function (request, options, responseHandler) {
  return this._rate.removeTokensAsync(1)
    .then(() => doRequest.bind(this)(request, options, responseHandler))
}

const doRetrieableRequest = function (request, options, responseHandler) {
  return retry(() => doRateableRequest.bind(this)(request, options, responseHandler), this._options.retry)
}

const doBreakableRequest = function (request, options, responseHandler) {
  return this._circuitBreaker.exec(request, options, responseHandler)
}

const doQueueableRequest = function (request, options, responseHandler) {
  return new Promise((resolve, reject) => {
    return this._queue.add(() => {
      return doBreakableRequest.bind(this)(request, options, responseHandler)
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

  get (options, responseHandler = (response) => response) {
    return Promise.try(() => {
      if (!_.isFunction(responseHandler)) {
        throw new Error('invalid arguments')
      }
    })
      .then(() => buildOptions.bind(this)(options))
      .then((options) => doQueueableRequest.bind(this)(this._request.getAsync, options, responseHandler))
  }

  post (options, responseHandler = (response) => response) {
    return Promise.try(() => {
      if (!_.isFunction(responseHandler)) {
        throw new Error('invalid arguments')
      }
    })
      .then(() => buildOptions.bind(this)(options))
      .then((options) => doQueueableRequest.bind(this)(this._request.postAsync, options, responseHandler))
  }

  put (options, responseHandler = (response) => response) {
    return Promise.try(() => {
      if (!_.isFunction(responseHandler)) {
        throw new Error('invalid arguments')
      }
    })
      .then(() => buildOptions.bind(this)(options))
      .then((options) => doQueueableRequest.bind(this)(this._request.putAsync, options, responseHandler))
  }

  patch (options, responseHandler = (response) => response) {
    return Promise.try(() => {
      if (!_.isFunction(responseHandler)) {
        throw new Error('invalid arguments')
      }
    })
      .then(() => buildOptions.bind(this)(options))
      .then((options) => doQueueableRequest.bind(this)(this._request.patchAsync, options, responseHandler))
  }

  del (options, responseHandler = (response) => response) {
    return Promise.try(() => {
      if (!_.isFunction(responseHandler)) {
        throw new Error('invalid arguments')
      }
    })
      .then(() => buildOptions.bind(this)(options))
      .then((options) => doQueueableRequest.bind(this)(this._request.delAsync, options, responseHandler))
  }

  head (options, responseHandler = (response) => response) {
    return Promise.try(() => {
      if (!_.isFunction(responseHandler)) {
        throw new Error('invalid arguments')
      }
    })
      .then(() => buildOptions.bind(this)(options))
      .then((options) => doQueueableRequest.bind(this)(this._request.headAsync, options, responseHandler))
  }
}

module.exports = RequestOnSteroids
