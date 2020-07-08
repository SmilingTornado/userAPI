let express = require('express');
let router = express.Router();
const db = require('../../../lib/firebase');

/* GET users listing. */
router.get('/', async function (req, res, next) {
  let out = { 'users': [] };
  let users = db.collection('users');
  let allUsers = await users.get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        out.users.push(doc.data());
      });
      res.send(out);
    })
    .catch(err => {
      res.send({ 'error': err });
    });
});

router.post('/', async function (req, res, next) {
  let user_id = req.body.user_id;
  let users = db.collection('users');
  let user = await users.where("user_id", "==", user_id).get()
    .then(async (snapshot) => {
      if (snapshot.empty) {
        let newUser = db.collection('users').doc();
        newUser.set(req.body);
        return newUser.get()
      } else {
        throw({ 'error': 'user ' + user_id + ' already exists' });
      }
    })
    .then(doc => {
      if (doc) {
        res.send(doc.data());
        return;
      }
    })
    .catch(err => {
      res.send({ 'error': err });
    });
});

router.get('/:userId', async function (req, res, next) {
  let user_id = req.params.userId;
  let users = db.collection('users');
  let userQuery = await users
    .where("user_id", "==", user_id);
  let userQuerySet = await userQuery.get();
  if (userQuerySet.empty) {
    res.send({ 'error': 'user ' + user_id + ' not found' });
    return;
  } else {
    user = userQuerySet.docs[0];
    let out = user.data();
    out.skills = [];
    let skills = await db
      .collection('users')
      .doc(user.id).collection('skills')
      .get();
    skills.forEach(skill => {
      out.skills.push(skill.data())
    })
    res.send(out);
  }
});

router.put('/:userId', async function (req, res, next) {
    let user_id = req.params.userId;
    let userQuery = await db.collection('users').where("user_id", "==", user_id);
    let user = await userQuery.get();
    if (user.empty) {
      res.send({ 'error': 'user ' + user_id + ' not found' });
      return;
    } else {
      let change = await db.collection('users').doc(user.docs[0].id)
      if ('user_id' in req.body) {
        let doc = db.collection('users')
          .where('user_id', '==', req.body.user_id)
          .get();
        if (doc.empty) {
          change.set(req.body)
          let changed = await change.get()
          res.send(changed.data());
          return;
        } else {
          res.send({ 'error': 'user ' + req.body.user_id + ' already exists' });
        }
      } else {
        change.set(req.body)
        let changed = await change.get()
        res.send(changed.data());
        return;
      }
    }
  }
);

router.delete('/:userId', function (req, res, next) {
  let user_id = req.params.userId;
  let users = db.collection('users');
  let user = users.where("user_id", "==", user_id).get()
    .then(snapshot => {
      if (snapshot.empty) {
        res.send({ 'error': 'user ' + user_id + ' not found' });
        return;
      } else {
        snapshot.forEach(doc => {
          db.collection('users').doc(doc.id).delete();
          res.send({ "status": "user deleted" })
          return;
        });
      }
    })
    .catch(err => {
      res.send({ 'error': err });
    });
});

let skillsRouter = require('./skills');

router.use('/:userId/skills', skillsRouter);

module.exports = router;
