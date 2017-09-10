# An HTTP client :sparkles: with retry, circuit-breaker and tor support :package: out-of-the-box

[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Build Status](https://travis-ci.org/hfreire/request-on-steroids.svg?branch=master)](https://travis-ci.org/hfreire/request-on-steroids)
[![Coverage Status](https://coveralls.io/repos/github/hfreire/request-on-steroids/badge.svg?branch=master)](https://coveralls.io/github/hfreire/request-on-steroids?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/hfreire/request-on-steroids.svg)](https://greenkeeper.io/)
[![](https://img.shields.io/github/release/hfreire/request-on-steroids.svg)](https://github.com/hfreire/request-on-steroids/releases)
[![](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/npm/v/request-on-steroids.svg)](https://www.npmjs.com/package/request-on-steroids)
[![Downloads](https://img.shields.io/npm/dt/request-on-steroids.svg)](https://www.npmjs.com/package/request-on-steroids) 

An HTTP client with retry, circuit-breaker and tor support out-of-the-box.

### Features
* Retries :shit: failing requests in temporary and unexpected system and :boom: network failures :white_check_mark:
* Uses [Brakes](https://github.com/awolden/brakes) circuit breakers to :hand: fail-fast until it is safe to retry :white_check_mark: 
* Supports [Bluebird](https://github.com/petkaantonov/bluebird) :bird: promises :white_check_mark:

### How to install
```
npm install request-on-steroids
```

### Used by
* [get-me-a-date](https://github.com/hfreire/get-me-a-date) - :heart_eyes: Help me get a :cupid: date tonight :first_quarter_moon_with_face:
* [watch-rtp-play](https://github.com/hfreire/watch-rtp-play) - :tv: Watch and :radio: listen 🇵🇹 RTP Play without a :computer: browser
