/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const _ = require('lodash')
const Promise = require('bluebird')

const request = require('request')

const Perseverance = require('perseverance')

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

const defaultOptions = {
  request: { gzip: true },
  socks: { socksHost: 'localhost', socksPort: 9050 },
  perseverance: {
    retry: { max_tries: 3, interval: 1000, timeout: 3000, throw_original: true },
    breaker: { timeout: 12000, threshold: 80, circuitDuration: 30000 },
    rate: {
      executions: 1,
      period: 250,
      queue: { concurrency: 1 }
    }
  },
  'random-http-useragent': {}
}

class Request {
  constructor (options = {}) {
    this.configure(options)
  }

  configure (options = {}) {
    this._options = _.defaultsDeep({}, options, defaultOptions)

    this._request = Promise.promisifyAll(request.defaults(_.get(this._options, 'request')))

    this._perseverance = new Perseverance(_.get(this._options, 'perseverance'))

    RandomHttpUserAgent.configure(_.get(this._options, 'random-http-useragent'))
  }

  get circuitBreaker () {
    return this._perseverance.circuitBreaker
  }

  get (options, responseHandler = (response) => response) {
    return Promise.try(() => {
      if (!_.isFunction(responseHandler)) {
        throw new Error('invalid arguments')
      }
    })
      .then(() => buildOptions.bind(this)(options))
      .then((options) => this._perseverance.exec(() => {
        return this._request.getAsync(options)
          .then(responseHandler)
      }))
  }

  post (options, responseHandler = (response) => response) {
    return Promise.try(() => {
      if (!_.isFunction(responseHandler)) {
        throw new Error('invalid arguments')
      }
    })
      .then(() => buildOptions.bind(this)(options))
      .then((options) => this._perseverance.exec(() => {
        return this._request.postAsync(options)
          .then(responseHandler)
      }))
  }

  put (options, responseHandler = (response) => response) {
    return Promise.try(() => {
      if (!_.isFunction(responseHandler)) {
        throw new Error('invalid arguments')
      }
    })
      .then(() => buildOptions.bind(this)(options))
      .then((options) => this._perseverance.exec(() => this._request.putAsync(options)))
      .then(responseHandler)
  }

  patch (options, responseHandler = (response) => response) {
    return Promise.try(() => {
      if (!_.isFunction(responseHandler)) {
        throw new Error('invalid arguments')
      }
    })
      .then(() => buildOptions.bind(this)(options))
      .then((options) => this._perseverance.exec(() => {
        return this._request.patchAsync(options)
          .then(responseHandler)
      }))
  }

  del (options, responseHandler = (response) => response) {
    return Promise.try(() => {
      if (!_.isFunction(responseHandler)) {
        throw new Error('invalid arguments')
      }
    })
      .then(() => buildOptions.bind(this)(options))
      .then((options) => this._perseverance.exec(() => {
        return this._request.delAsync(options)
          .then(responseHandler)
      }))
  }

  head (options, responseHandler = (response) => response) {
    return Promise.try(() => {
      if (!_.isFunction(responseHandler)) {
        throw new Error('invalid arguments')
      }
    })
      .then(() => buildOptions.bind(this)(options))
      .then((options) => this._perseverance.exec(() => {
        return this._request.headAsync(options)
          .then(responseHandler)
      }))
  }
}

module.exports = Request
