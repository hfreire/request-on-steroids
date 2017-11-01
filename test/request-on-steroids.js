/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable promise/no-callback-in-promise */

describe('Request', () => {
  let subject
  let request
  let Brakes
  let RandomHttpUserAgent

  before(() => {
    request = td.object([ 'defaults', 'get', 'post', 'put', 'patch', 'del', 'head' ])

    Brakes = td.constructor([ 'exec' ])

    RandomHttpUserAgent = td.object([ 'configure', 'get' ])
  })

  afterEach(() => td.reset())

  describe('when constructing', () => {
    const options = { request: {}, 'random-http-useragent': {} }

    beforeEach(() => {
      td.when(request.defaults(), { ignoreExtraArgs: true }).thenReturn(request)
      td.replace('request', request)

      td.replace('random-http-useragent', RandomHttpUserAgent)

      const Request = require('../src/request-on-steroids')
      subject = new Request(options)
    })

    it('should set default request options', () => {
      td.verify(request.defaults(options.request))
    })

    it('should set default random-http-useragent options', () => {
      td.verify(RandomHttpUserAgent.configure(options[ 'random-http-useragent' ]))
    })
  })

  describe('when constructing and loading request', () => {
    beforeEach(() => {
      const Request = require('../src/request-on-steroids')
      subject = new Request()
    })

    it('should create a request with defaults function', () => {
      subject._request.should.have.property('defaults')
      subject._request.defaults.should.be.instanceOf(Function)
    })

    it('should create a request with get function', () => {
      subject._request.should.have.property('get')
      subject._request.get.should.be.instanceOf(Function)
    })

    it('should create a request with post function', () => {
      subject._request.should.have.property('post')
      subject._request.post.should.be.instanceOf(Function)
    })

    it('should create a request with put function', () => {
      subject._request.should.have.property('put')
      subject._request.put.should.be.instanceOf(Function)
    })

    it('should create a request with patch function', () => {
      subject._request.should.have.property('patch')
      subject._request.patch.should.be.instanceOf(Function)
    })

    it('should create a request with del function', () => {
      subject._request.should.have.property('del')
      subject._request.del.should.be.instanceOf(Function)
    })

    it('should create a request with head function', () => {
      subject._request.should.have.property('head')
      subject._request.head.should.be.instanceOf(Function)
    })
  })

  describe('when constructing and loading brakes', () => {
    beforeEach(() => {
      const Request = require('../src/request-on-steroids')
      subject = new Request()
    })

    it('should create a circuit breaker with slaveCircuit function', () => {
      subject._circuitBreaker.should.have.property('slaveCircuit')
      subject._circuitBreaker.slaveCircuit.should.be.instanceOf(Function)
    })
  })

  describe('when constructing and loading limiter', () => {
    beforeEach(() => {
      const Request = require('../src/request-on-steroids')
      subject = new Request()
    })

    it('should create a queue with removeTokensAsync function', () => {
      subject._rate.should.have.property('removeTokensAsync')
      subject._rate.removeTokensAsync.should.be.instanceOf(Function)
    })
  })

  describe('when constructing and loading queue', () => {
    beforeEach(() => {
      const Request = require('../src/request-on-steroids')
      subject = new Request()
    })

    it('should create a queue with add function', () => {
      subject._queue.should.have.property('add')
      subject._queue.add.should.be.instanceOf(Function)
    })
  })

  describe('when doing a get request', () => {
    const url = 'my-url'
    const options = { url }

    beforeEach(() => {
      td.when(request.defaults(), { ignoreExtraArgs: true }).thenReturn(request)
      td.when(request.get(td.matchers.anything()), { ignoreExtraArgs: true }).thenCallback()
      td.replace('request', request)

      const Request = require('../src/request-on-steroids')
      subject = new Request()
    })

    it('should do a get request to my-url', () => {
      return subject.get(options)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(request.get(captor.capture()), { ignoreExtraArgs: true, times: 1 })

          const options = captor.value
          options.should.have.property('url', url)
        })
    })

    it('should fail with invalid arguments when missing url', () => {
      return subject.get()
        .catch((error) => {
          error.message.should.be.equal('invalid arguments')
        })
    })
  })

  describe('when doing a get request with a random http user-agent', () => {
    const url = 'my-url'
    const options = { url, randomHttpUserAgent: true }
    const userAgent = 'my-user-agent'

    beforeEach(() => {
      td.replace('random-http-useragent', RandomHttpUserAgent)
      td.when(RandomHttpUserAgent.get()).thenResolve(userAgent)

      td.when(request.defaults(), { ignoreExtraArgs: true }).thenReturn(request)
      td.when(request.get(td.matchers.anything()), { ignoreExtraArgs: true }).thenCallback()
      td.replace('request', request)

      const Request = require('../src/request-on-steroids')
      subject = new Request()
    })

    it('should get a random user agent', () => {
      return subject.get(options)
        .then(() => {
          td.verify(RandomHttpUserAgent.get(), { times: 1 })
        })
    })

    it('should use a random user agent in the get request', () => {
      return subject.get(options)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(request.get(captor.capture()), { ignoreExtraArgs: true })

          const options = captor.value

          options.should.have.nested.property('headers.User-Agent')
          options.headers[ 'User-Agent' ].should.be.equal(userAgent)
        })
    })
  })

  describe('when doing a get request with tor', () => {
    const url = 'my-url'
    const options = { url, tor: true }
    const userAgent = 'my-user-agent'

    beforeEach(() => {
      td.replace('random-http-useragent', RandomHttpUserAgent)
      td.when(RandomHttpUserAgent.get()).thenResolve(userAgent)

      td.when(request.defaults(), { ignoreExtraArgs: true }).thenReturn(request)
      td.when(request.get(td.matchers.anything()), { ignoreExtraArgs: true }).thenCallback()
      td.replace('request', request)

      const Request = require('../src/request-on-steroids')
      subject = new Request()
    })

    it('should use agentClass in the get request', () => {
      return subject.get(options)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(request.get(captor.capture()), { ignoreExtraArgs: true })

          const options = captor.value

          options.should.have.property('agentClass')
        })
    })

    it('should use agentOptions in the get request', () => {
      return subject.get(options)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(request.get(captor.capture()), { ignoreExtraArgs: true })

          const options = captor.value

          options.should.have.property('agentOptions')
        })
    })
  })

  describe('when doing a post request', () => {
    const url = 'my-url'
    const options = { url }

    beforeEach(() => {
      td.when(request.defaults(), { ignoreExtraArgs: true }).thenReturn(request)
      td.when(request.post(td.matchers.anything()), { ignoreExtraArgs: true }).thenCallback()
      td.replace('request', request)

      const Request = require('../src/request-on-steroids')
      subject = new Request()
    })

    it('should do a post request to my-url', () => {
      return subject.post(options)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(request.post(captor.capture()), { ignoreExtraArgs: true, times: 1 })

          const options = captor.value
          options.should.have.property('url', url)
        })
    })
  })

  describe('when doing a put request', () => {
    const url = 'my-url'
    const options = { url }

    beforeEach(() => {
      td.when(request.defaults(), { ignoreExtraArgs: true }).thenReturn(request)
      td.when(request.put(td.matchers.anything()), { ignoreExtraArgs: true }).thenCallback()
      td.replace('request', request)

      const Request = require('../src/request-on-steroids')
      subject = new Request()
    })

    it('should do a put request to my-url', () => {
      return subject.put(options)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(request.put(captor.capture()), { ignoreExtraArgs: true, times: 1 })

          const options = captor.value
          options.should.have.property('url', url)
        })
    })
  })

  describe('when doing a patch request', () => {
    const url = 'my-url'
    const options = { url }

    beforeEach(() => {
      td.when(request.defaults(), { ignoreExtraArgs: true }).thenReturn(request)
      td.when(request.patch(td.matchers.anything()), { ignoreExtraArgs: true }).thenCallback()
      td.replace('request', request)

      const Request = require('../src/request-on-steroids')
      subject = new Request()
    })

    it('should do a patch request to my-url', () => {
      return subject.patch(options)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(request.patch(captor.capture()), { ignoreExtraArgs: true, times: 1 })

          const options = captor.value
          options.should.have.property('url', url)
        })
    })
  })

  describe('when doing a delete request', () => {
    const url = 'my-url'
    const options = { url }

    beforeEach(() => {
      td.when(request.defaults(), { ignoreExtraArgs: true }).thenReturn(request)
      td.when(request.del(td.matchers.anything()), { ignoreExtraArgs: true }).thenCallback()
      td.replace('request', request)

      const Request = require('../src/request-on-steroids')
      subject = new Request()
    })

    it('should do a delete request to my-url', () => {
      return subject.del(options)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(request.del(captor.capture()), { ignoreExtraArgs: true, times: 1 })

          const options = captor.value
          options.should.have.property('url', url)
        })
    })
  })

  describe('when doing a head request', () => {
    const url = 'my-url'
    const options = { url }

    beforeEach(() => {
      td.when(request.defaults(), { ignoreExtraArgs: true }).thenReturn(request)
      td.when(request.head(td.matchers.anything()), { ignoreExtraArgs: true }).thenCallback()
      td.replace('request', request)

      const Request = require('../src/request-on-steroids')
      subject = new Request()
    })

    it('should do a head request to my-url', () => {
      return subject.head(options)
        .then(() => {
          const captor = td.matchers.captor()

          td.verify(request.head(captor.capture()), { ignoreExtraArgs: true, times: 1 })

          const options = captor.value
          options.should.have.property('url', url)
        })
    })
  })

  describe('when getting circuit breaker', () => {
    beforeEach(() => {
      td.replace('brakes', Brakes)

      const Request = require('../src/request-on-steroids')
      subject = new Request()
    })

    it('should return a brakes instance', () => {
      subject.circuitBreaker.should.be.instanceOf(Brakes)
    })
  })
})
