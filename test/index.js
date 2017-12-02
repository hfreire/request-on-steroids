/*
 * Copyright (c) 2017, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

describe('Module', () => {
  let subject
  let Request

  before(() => {
    Request = td.object([])
  })

  afterEach(() => td.reset())

  describe('when loading', () => {
    beforeEach(() => {
      td.replace('../src/request-on-steroids', Request)

      subject = require('../src/index')
    })

    it('should export request', () => {
      subject.should.be.equal(Request)
    })
  })
})
