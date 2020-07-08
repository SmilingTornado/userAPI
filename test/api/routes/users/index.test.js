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
  req = {
    body: sinon.stub()
  }
  res = {
    send: sinon.stub()
  }
  next = sinon.stub()
  router = proxyquire('../../../../src/api/routes/users/index.js', {
    express,
    '../../../lib/firebase': db,
  })

  it('should call router correctly', () => {
    describe('path GET /', () => {
      it('should set path for get base correctly', () => {
        assert.deepEqual(router.get.args[0][0], '/')
      })

      it('should call get function correctly', async () => {
        users = {
          get: sinon.stub().resolves([{ data: sinon.stub().returns(1) }])
        }

        db.collection.returns(users)

        await router.get.args[0][1](req, res, next)

        assert.deepEqual(res.send.args[0][0], { 'users': [1] })
      })

      it('should call get function incorrectly', async () => {
        const err = new Error("TestError")
        users = {
          get: sinon.stub().rejects(err)
        }

        db.collection.returns(users)

        await router.get.args[0][1](req, res, next)
        assert.deepEqual(res.send.args[1][0], {
          error: err
        })
      })
    })
    describe('path POST /', () => {
      it('should set path for post base correctly', () => {
        assert.deepEqual(router.post.args[0][0], '/')
      })

      it('should call post function correctly', async () => {
        req.body = {
          user_id: 'user'
        }
        users = {
          where: sinon.stub().returns({
            get: sinon.stub().resolves({
              empty: true
            })
          }),
          doc: sinon.stub().returns({
            set: sinon.stub(),
            get: sinon.stub().resolves({
              data: sinon.stub().returns({ 'users_id': 'name' })
            })
          })
        }

        db.collection.returns(users)

        await router.post.args[0][1](req, res, next)

        assert.deepEqual(res.send.args[2][0], { 'users_id': 'name' })
      })

      it('should already have a user', async () => {
        req.body = {
          user_id: 'user'
        }
        users = {
          where: sinon.stub().returns({
            get: sinon.stub().resolves({
              empty: false
            })
          }),
        }

        db.collection.returns(users)

        await router.post.args[0][1](req, res, next)

        assert.deepEqual(res.send.args[3][0], { error: { error: 'user user already exists' } })
      })

      it('should call post function incorrectly', async () => {
        const err = new Error("TestError")
        req.body = {
          user_id: 'user'
        }
        users = {
          where: sinon.stub().returns({
            get: sinon.stub().resolves({
              empty: true
            })
          }),
          doc: sinon.stub().returns({
            set: sinon.stub(),
            get: sinon.stub().rejects(err)
          })
        }

        db.collection.returns(users)

        await router.post.args[0][1](req, res, next)

        assert.deepEqual(res.send.args[4][0], { error: err })
      })
    })
    describe('path GET /:userId', () => {
      it('should set path for get userId correctly', () => {
        assert.deepEqual(router.get.args[1][0], '/:userId')
      })

      it('should call get function correctly', async () => {
        req.params = {
          userId: 'user'
        }
        users = {
          where: sinon.stub().returns({
            get: sinon.stub().resolves({
              empty: false,
              docs: [{
                data: sinon.stub().returns({ 'users_id': 'name' })
              }]
            })
          }),
          doc: sinon.stub().returns({
            collection: sinon.stub().returns({
              get: sinon.stub().resolves([{
                data: sinon.stub().returns({ 'skill': 'testing' })
              }])
            })
          })
        }

        db.collection.returns(users)

        await router.get.args[1][1](req, res, next)

        assert.deepEqual(res.send.args[5][0], {
          users_id: 'name', skills: [{ skill: 'testing' }]
        })
      })

      it('should not find user', async () => {
        req.params = {
          userId: 'user'
        }
        users = {
          where: sinon.stub().returns({
            get: sinon.stub().resolves({
              empty: true
            })
          }),
        }

        db.collection.returns(users)

        await router.get.args[1][1](req, res, next)

        assert.deepEqual(res.send.args[6][0], { error: 'user user not found' })
      })
    })
  })
})