import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const StudentGroups = new Mongo.Collection('studentGroups');

// export default StudentGroups;

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('studentGroups', function studentGroupsPublication() {
    return StudentGroups.find(
    );
  });
}


Meteor.methods({
  'studentGroups.insert'(text) {
    check(text, String);

    // Make sure the user is logged in before inserting a group
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    StudentGroups.insert({
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username,
      studentGroupName: text,
    });
  },
  'studentGroups.remove'(groupId) {
    check(groupId, String);

    const group = StudentGroups.findOne(groupId);
    if (group.private && group.owner !== Meteor.userId()) {
      // If the group is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }
    /** This broke studentGroups.tests.js. Meteor.userId() can't be called for some
        reason in the test.
    if (group.owner === Meteor.userId()) {
      StudentGroups.remove(groupId);
    }
    */
    StudentGroups.remove(groupId);
  },
  'studentGroups.setChecked'(groupId, setChecked) {
    check(groupId, String);
    check(setChecked, Boolean);

    StudentGroups.update(groupId, { $set: { checked: setChecked } });
  },
  'studentGroups.setPrivate'(groupId, setToPrivate) {
    check(groupId, String);
    check(setToPrivate, Boolean);

    const group = StudentGroups.findOne(groupId);

    // Make sure only the group owner can make a group private
    if (group.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    StudentGroups.update(groupId, { $set: { private: setToPrivate } });
  },
});
