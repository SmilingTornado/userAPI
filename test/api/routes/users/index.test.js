const sinon = require('sinon')
const { assert } = require('chai')
const proxyquire = require('proxyquire').noCallThru()

describe('api - routes - index', () => {
  let express, router, db, req, res, next

  express = {
    Router: () => ({
      get: sinon.stub(),
      post: sinon.stub(),
      delete: sinon.stub(),
      put: sinon.stub(),
      use: sinon.stub(),
    })
  }

  db = {
    collection: sinon.stub()
  }
  req = sinon.stub()
  res = {
    send: sinon.stub()
  }
  next = sinon.stub()
  router = proxyquire('../../../../src/api/routes/users/index.js', {
    express,
    '../../../lib/firebase': db,
  })

  it('should call router correctly', () => {
    describe('path /', () => {
      it('should set path correctly', () => {
        assert.deepEqual(router.get.args[0][0], '/')
      })

      it('should call function correctly',async () => {
        users = {
          get: sinon.stub().resolves([{data:sinon.stub().returns(1)}])
        }

        db.collection.returns(users)

        await router.get.args[0][1](req,res,next)

        assert.deepEqual(res.send.args[0][0], { 'users': [1] })
      })
    })
  })
})