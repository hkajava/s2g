import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const StudentGroups = new Mongo.Collection('studentGroups');

if (Meteor.isServer) {
  Meteor.publish('studentGroups', function studentGroupsPublication() {
    const currentUser = Meteor.user();

    if (currentUser !== null && currentUser !== undefined) {
      // Only publish to client those studentGroups that are owned
      // by the logged in user. This achieves better privacy and performance.
      return StudentGroups.find({ owner: Meteor.user()._id });
    }
    return '';
  });
}

Meteor.methods({
  'studentGroups.insert'(text) {
    check(text, String);

    // Make sure the user is logged in before inserting a group
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    // TODO: add checking so that it's not possible to add a class/group with
    // name that already exists for that user
    const currentStudentGroupArray = StudentGroups.find({ owner: Meteor.user()._id }).fetch();

    function hasGroupName(element) {
      if (element.studentGroupName === text) {
        return element;
      }
      return undefined;
    }

    if (currentStudentGroupArray.find(hasGroupName) !== undefined) {
      if (Meteor.isClient) {
        // only in client
        // TODO change into something more eloquent than alert box
        alert('studentGroup with that name already exists! Try different name.');
      }
    } else {
      StudentGroups.insert({
        createdAt: new Date(),
        owner: Meteor.userId(),
        username: Meteor.user().username,
        studentGroupName: text,
      });
    }
  },
  'studentGroups.updateRandomizeStatistic'(groupId) {
    check(groupId, String);

    // Make sure the user is logged in before updating statistics
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    // If the randomization counter doesn't exist yet, let's create it and
    // initialize to one. If it already exists then just increment it.
    StudentGroups.update(groupId, { $inc: { nbrOfRandomizations: 1 } });
  },
  'studentGroups.remove'(groupId) {
    check(groupId, String);

    const group = StudentGroups.findOne(groupId);
    if (group.owner !== Meteor.userId()) {
      // only the owner can delete it, otherwise throw error because
      // unauthorized users shouldn't even see the group
      throw new Meteor.Error('not-authorized');
    }

    StudentGroups.remove(groupId);
  },
  'studentGroup.addStudent'(firstNameParam, lastNameParam, groupName, groupID) {
    check(firstNameParam, String);
    check(lastNameParam, String);
    check(groupName, String);
    check(groupID, String);

    const newStudent = {};
    newStudent.firstName = firstNameParam;
    newStudent.lastName = lastNameParam;

    const tempStudentGroup = StudentGroups.findOne({ _id: groupID });
    if (tempStudentGroup === null) {
      throw new Meteor.Error('studentGroup.addStudent: internal error, group missing');
    }
    if (tempStudentGroup.owner !== Meteor.userId()) {
      // only the owner can add students to a group, otherwise throw error because
      // unauthorized users shouldn't even see the group
      throw new Meteor.Error('not-authorized');
    }

    let tempStudentArray = [];
    if (tempStudentGroup.students !== undefined) {
      if (tempStudentGroup.students.length > 0) {
        tempStudentArray = Array.from(tempStudentGroup.students);
      }
    }

    if (tempStudentArray.length > 0) {
      for (let i = 0; i < tempStudentArray.length; i += 1) {
        if (tempStudentArray[i].firstName === firstNameParam &&
            tempStudentArray[i].lastName === lastNameParam) {
          console.log('studentGroup.addStudent, cannot add. Student with same name already found: ',
            firstNameParam, lastNameParam);
          throw new Meteor.Error('studentGroup.addStudent: student with same name already exists in db');
        }
      }
      // only add if there is not a student with same name
      // feedback needed to calling method
      StudentGroups.update({ _id: groupID }, { $push: { students: newStudent } });
    } else {
      // students array for this studentGroup was still missing and need to be created now.
      StudentGroups.update({ _id: groupID }, { $set: { students: [newStudent] } });
    }
  },
  'studentGroup.removeStudent'(firstNameParam, lastNameParam, groupName, groupID) {
    check(firstNameParam, String);
    check(lastNameParam, String);
    check(groupName, String);
    check(groupID, String);

    const group = StudentGroups.findOne(groupID);
    if (group.owner !== Meteor.userId()) {
      // If the group is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }
    /** This broke studentGroups.tests.js. Meteor.userId() can't be called for some
        reason in the test.
    if (group.owner === Meteor.userId()) {
      StudentGroups.remove(groupId);
    }
    */
    const tempStudentGroupArray = StudentGroups.find({ _id: groupID }).fetch();
    let tempStudentArray = [];
    if (tempStudentGroupArray.length === 1 && tempStudentGroupArray[0].students.length > 0) {
      tempStudentArray = Array.from(tempStudentGroupArray[0].students);
    }

    if (tempStudentArray.length > 0) {
      for (let i = 0; i < tempStudentArray.length; i += 1) {
        if (tempStudentArray[i].firstName === firstNameParam &&
            tempStudentArray[i].lastName === lastNameParam) {
          console.log('studentGroup.removeStudent, about to remove student: ', firstNameParam, lastNameParam);
          tempStudentArray.splice(i, 1);
          StudentGroups.update({ _id: groupID }, { $set: { students: tempStudentArray } });
        }
      }
    }
  },
});
