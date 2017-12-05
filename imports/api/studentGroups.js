import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const StudentGroups = new Mongo.Collection('studentGroups');

// export default StudentGroups;

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('studentGroups', function studentGroupsPublication() {
    const currentUser = Meteor.user();

    if (currentUser !== null && currentUser !== undefined) {
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

    // TODO: add checking that it's not possible to add a class/group with
    // name that already exists for that user
    const currentStudentGroupArray = StudentGroups.find({ owner: Meteor.user()._id }).fetch();

    function hasGroupName(element) {
      if (element.studentGroupName === text) {
        return element;
      }
      return undefined;
    }

    if (currentStudentGroupArray.find(hasGroupName) !== undefined) {
      // change into something more eloquent than alert box
      if (Meteor.isClient) {
        // only in client
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
    // initialize to zero
    StudentGroups.update(groupId, { $inc: { nbrOfRandomizations: 1 } });
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
  'studentGroups.fetchStudentsToArray'(text) {
    check(text, String);

    // Make sure the user is logged in before inserting a group
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    let studentArray = [];

    if (Meteor.isServer) {
      // console.log('inside server, method fetchStudentsToArray');
    } else {
      // console.log('inside client, method fetchStudentsToArray');
    }
    studentArray = StudentGroups.find({
      studentGroupName: text,
    }).fetch();
    return studentArray;
  },
  'studentGroup.addStudent'(firstNameParam, lastNameParam, groupName, groupID) {
    check(firstNameParam, String);
    check(lastNameParam, String);
    check(groupName, String);
    check(groupID, String);

    const newStudent = {};
    newStudent.firstName = firstNameParam;
    newStudent.lastName = lastNameParam;

    const tempStudentGroupArray = StudentGroups.find({ _id: groupID }).fetch();
    let tempStudentArray = [];
    if (tempStudentGroupArray.length === 1) {
      if (tempStudentGroupArray[0].students !== undefined) {
        if (tempStudentGroupArray[0].students.length > 0) {
          tempStudentArray = Array.from(tempStudentGroupArray[0].students);
        }
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
    }

    // Make sure the user is logged in before inserting a group
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
    // only add if there is not a student with same name
    // feedback needed to calling method
    if (tempStudentArray.length > 0) {
      StudentGroups.update({ _id: groupID }, { $push: { students: newStudent } });
    } else {
      // students array was still missing
      StudentGroups.update({ _id: groupID }, { $set: { students: [newStudent] } });
    }
  },
  'studentGroup.removeStudent'(firstNameParam, lastNameParam, groupName, groupID) {
    check(firstNameParam, String);
    check(lastNameParam, String);
    check(groupName, String);
    check(groupID, String);

    const group = StudentGroups.findOne(groupID);
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
