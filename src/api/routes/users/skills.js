let express = require('express');
let router = express.Router({ mergeParams: true });
const db = require('../../../lib/firebase');

// es6
// function chaining
// if undefined object
const getUserDocId = async (user_id) => {
  let users = db.collection('users');
  let userQuery = await users.where("user_id", "==", user_id).get();
  if (userQuery && userQuery.empty) {
    return false;
  } else {
    let userDocId = await userQuery.docs[0].id
    return userDocId;
  }
}

/* GET skills listing. */
router.get('/', async function (req, res, next) {
  userDocId = await getUserDocId(req.params.userId);
  if (userDocId) {
    let out = { 'skills': [] };
    let skills = await db.collection('users').doc(userDocId).collection('skills');
    let allskills = skills.get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          out.skills.push(doc.data());
        });
        res.send(out);
      })
      .catch(err => {
        res.send({ 'error': err });
      });
  }
  else{
    res.send({ 'error': 'user ' + req.params.userId + ' does not exist' });
  }
});

router.post('/', async function (req, res, next) {
  userDocId = await getUserDocId(req.params.userId);
  if (userDocId) {
    let out = { 'skills': [] };
    let skills = db.collection('users').doc(userDocId).collection('skills');
    let currentSkills = await skills.where('skill_id','==',req.body.skill_id).get();
    if (currentSkills.empty){
      let newSkill = await skills.add(req.body);
      let newSkillObject = await newSkill.get();
      res.send(newSkillObject.data());
    }
    else{
      res.send({ 'error': 'skill ' + req.body.skill_id + ' already exists' });
    }
  }
  else{
    res.send({ 'error': 'user ' + req.params.userId + ' does not exist' });
  }
});

async function getSkillId(user_id, skill_id){
  let userDocId = await getUserDocId(user_id)
  let skills = await db.collection('users').doc(userDocId).collection('skills');
  let skillQuery = await skills.where("skill_id", "==", skill_id);
  let skillQuerySet = await skillQuery.get();
  if (skillQuerySet.empty) {
    return false;
  } else {
    let skillDocId = await skillQuerySet.docs[0].id
    return {'userDocId':userDocId,'skillDocId':skillDocId};
  }
}

router.get('/:skillId', async function (req, res, next) {
  let skillDocIdDict = await getSkillId(req.params.userId, req.params.skillId);
  if (skillDocIdDict) {
    let skillDocId = skillDocIdDict.skillDocId;
    let userDocId = skillDocIdDict.userDocId;
    let skill = await db.collection('users').doc(userDocId).collection('skills').doc(skillDocId);
    let getSkill = await skill.get();
    res.send(getSkill.data());
  }
  else{
    res.send({ 'error': 'skill ' + req.params.skillId + ' does not exist' });
  }
});

router.put('/:skillId', async function (req, res, next) {
  let skillDocIdDict = await getSkillId(req.params.userId, req.params.skillId);
  if (skillDocIdDict) {
    let skillDocId = skillDocIdDict.skillDocId;
    let userDocId = skillDocIdDict.userDocId;
    let skills = await db.collection('users').doc(userDocId).collection('skills')
    let status = await skills.where('skill_id','==',req.body.skill_id).get();
    if (status.empty){
      let toChange = await skills.doc(skillDocId);
      let change = await toChange.set(req.body);
      let changed = await toChange.get();
      res.send(changed.data());
    }
    else{
      res.send({ 'error': 'skill ' + req.body.skill_id + ' already exists' });
    }
  }
  else{
    res.send({ 'error': 'skill ' + req.params.skillId + ' does not exist' });
  }
});

router.delete('/:skillId', async function (req, res, next) {
  let skillDocIdDict = await getSkillId(req.params.userId, req.params.skillId);
  if (skillDocIdDict) {
    let skillDocId = skillDocIdDict.skillDocId;
    let userDocId = skillDocIdDict.userDocId;
    let skill = await db.collection('users').doc(userDocId).collection('skills').doc(skillDocId);
    skill.delete();
    res.send({'status': 'skill deleted'})
  }
  else{
    res.send({ 'error': 'skill ' + req.params.skillId + ' does not exist' });
  }
});

module.exports = router;
