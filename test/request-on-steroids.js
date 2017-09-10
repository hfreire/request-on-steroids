/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable promise/no-callback-in-promise */

describe('Request On Steroids', () => {
  let subject
  let request
  let RandomHttpUserAgent

  before(() => {
    request = td.object([ 'defaults', 'get', 'post', 'put', 'patch', 'del', 'head' ])

    RandomHttpUserAgent = td.object([ 'configure', 'get' ])
  })

  afterEach(() => td.reset())

  describe('when constructing', () => {
    const options = { request: {}, 'random-http-useragent': {} }

    beforeEach(() => {
      td.when(request.defaults(), { ignoreExtraArgs: true }).thenReturn(request)
      td.replace('request', request)

      td.replace('random-http-useragent', RandomHttpUserAgent)

      const RequestOnSteroids = require('../src/request-on-steroids')
      subject = new RequestOnSteroids(options)
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
      const RequestOnSteroids = require('../src/request-on-steroids')
      subject = new RequestOnSteroids()
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
      const RequestOnSteroids = require('../src/request-on-steroids')
      subject = new RequestOnSteroids()
    })

    it('should create a circuit breaker with slaveCircuit function', () => {
      subject._circuitBreaker.should.have.property('slaveCircuit')
      subject._circuitBreaker.slaveCircuit.should.be.instanceOf(Function)
    })
  })

  describe('when doing a get request', () => {
    const url = 'my-url'
    const options = { url }

    beforeEach(() => {
      td.when(request.defaults(), { ignoreExtraArgs: true }).thenReturn(request)
      td.when(request.get(td.matchers.anything()), { ignoreExtraArgs: true }).thenCallback()
      td.replace('request', request)

      const RequestOnSteroids = require('../src/request-on-steroids')
      subject = new RequestOnSteroids()
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
  })

  describe('when doing a post request', () => {
    const url = 'my-url'
    const options = { url }

    beforeEach(() => {
      td.when(request.defaults(), { ignoreExtraArgs: true }).thenReturn(request)
      td.when(request.post(td.matchers.anything()), { ignoreExtraArgs: true }).thenCallback()
      td.replace('request', request)

      const RequestOnSteroids = require('../src/request-on-steroids')
      subject = new RequestOnSteroids()
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

      const RequestOnSteroids = require('../src/request-on-steroids')
      subject = new RequestOnSteroids()
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

      const RequestOnSteroids = require('../src/request-on-steroids')
      subject = new RequestOnSteroids()
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

      const RequestOnSteroids = require('../src/request-on-steroids')
      subject = new RequestOnSteroids()
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

      const RequestOnSteroids = require('../src/request-on-steroids')
      subject = new RequestOnSteroids()
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
})
