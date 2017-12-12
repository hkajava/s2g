import React, { Component } from 'react';
import PropTypes from 'prop-types'; // ES6
import { Meteor } from 'meteor/meteor';
import Student from './Student.jsx';
import { StudentGroups } from '../api/studentGroups.js';

// RandomizeStudentGroup component - show a list of students belonging
// to a course. Those that are not present today can be deselected.
// The remaining students that are present in the class can be split
// randomly into small groups.
export default class RandomizeStudentGroup extends Component {
  // TODO, should ES6 international collation features be used
  // here to get alphabets correctly sorted?
  // With brief testing it looks like Finnish alphabets (ä,ö) work correctly
  static sortAccordingToLastName(a, b) {
    const textA = a.lastName.toUpperCase();
    const textB = b.lastName.toUpperCase();


    if (textB > textA) {
      return -1;
    } else if (textA > textB) {
      return 1;
    }
    return 0;
  }

  static addOddStudentsToOtherGroups(student, randomizedArrayOfArrays) {
    // Add student to the smallest small group.
    // If there are more than one with the smallest size then
    // put it to one of them randomly

    // let's initialize smallesGroupSize to the size of the first
    // student small group (i.e. randomizedArrayOfArrays[0])
    let smallestGroupSize = randomizedArrayOfArrays[0].length;
    let tempSmallGroupIndexArray = [];
    const tempRandomizedArrayOfArrays = Array.from(randomizedArrayOfArrays);

    for (let i = 0; i < tempRandomizedArrayOfArrays.length; i += 1) {
      if (tempRandomizedArrayOfArrays[i].length < smallestGroupSize) {
        smallestGroupSize = tempRandomizedArrayOfArrays[i].length;
        tempSmallGroupIndexArray = [];
        tempSmallGroupIndexArray.push(i);
      } else if (tempRandomizedArrayOfArrays[i].length === smallestGroupSize) {
        // found a group which is as small as the so far smallest found
        // let's add that to tempSmallGroupIndexArray to keep track of it
        tempSmallGroupIndexArray.push(i);
      }
    }
    const chosenIndexIndex = Math.floor(Math.random() * tempSmallGroupIndexArray.length);
    const chosenIndex = tempSmallGroupIndexArray[chosenIndexIndex];
    tempRandomizedArrayOfArrays[chosenIndex].push(student);
    return tempRandomizedArrayOfArrays;
  }

  constructor(props) {
    super(props);

    this.handleStudentClick = this.handleStudentClick.bind(this);
    this.getStudentsInClient = this.getStudentsInClient.bind(this);
    this.deleteThisStudent = this.deleteThisStudent.bind(this);
    this.handleGoToListView = this.handleGoToListView.bind(this);
    this.handleGoToMainView = this.handleGoToMainView.bind(this);
    this.randomizeStudentGroup = this.randomizeStudentGroup.bind(this);
    this.updateStudentCounts = this.updateStudentCounts.bind(this);

    const fetchedStudentArray = this.getStudentsInClient();
    // add local state variable to track absent students for this
    // particular class session. Initialize to false so that all students
    // are assumed to be present until teacher goes through attendance
    // and checks off those that are not present.
    for (let i = 0; i < fetchedStudentArray.length; i += 1) {
      fetchedStudentArray[i].absent = false;
    }

    this.state =
    { selectedView: 'listView',
      studentArray: fetchedStudentArray,
      randomizedStudentArrayOfArrays: [],
      placeholderForEnteringNewStudentToClass: 'Add student',
      minGroupSize: 3,
      nbrEnrolledStudents: fetchedStudentArray.length,
      nbrPresentStudents: fetchedStudentArray.length,
      nbrAbsentStudents: fetchedStudentArray.length };
  }

  getStudentsInClient() {
    let currentStudentArray = [];
    const query = {};
    query.studentGroupName = this.props.studentGroupName;
    const currentStudentGroup = StudentGroups.findOne(query);
    if (currentStudentGroup.students !== undefined &&
        currentStudentGroup.students !== null) {
      currentStudentArray = Array.from(currentStudentGroup.students);
    }
    return currentStudentArray;
  }

  updateRandomizeStatistic() {
    Meteor.call('studentGroups.updateRandomizeStatistic', this.props.studentGroupID, function(error, result) {
      if (error) {
        alert(error);
      } else {
        console.log('incremented randomization count for a student group', result);
      }
    });
  }

  randomizeStudentGroup() {
    let randomizedArrayOfArrays = [];
    const tempStudentArrayBeforeAbsentChecking = Array.from(this.state.studentArray);
    const tempStudentArray = [];
    const targetGroupSize = this.state.minGroupSize;

    // remove absent students
    for (let i = 0; i < tempStudentArrayBeforeAbsentChecking.length; i += 1) {
      if (tempStudentArrayBeforeAbsentChecking[i].absent === false) {
        tempStudentArray.push(tempStudentArrayBeforeAbsentChecking[i]);
      }
    }

    if (tempStudentArray.length < 2 * this.state.minGroupSize) {
      // There is not enough students to make small groups with minGroupSize
      // and thus no point continuing algorithm.
      randomizedArrayOfArrays[0] = Array.from(tempStudentArray);
      this.setState({ selectedView: 'randomizedView',
        randomizedStudentArrayOfArrays: randomizedArrayOfArrays });
      return;
    }

    // There is such a number of students that they can be split into
    // two or more small groups
    let tempNumberOfStudentsInSmallGroup = 0;
    let tempSmallGroupArray = [];
    // note that index is not incremented as the array is shrinked

    for (let i = 0; i < tempStudentArray.length;) {
      const removedIndex = Math.floor(Math.random() * tempStudentArray.length);
      const tempStudent = tempStudentArray[removedIndex];
      tempSmallGroupArray.push(tempStudent);
      tempNumberOfStudentsInSmallGroup += 1;
      // time to remove student from origin array
      tempStudentArray.splice(removedIndex, 1);
      if (tempNumberOfStudentsInSmallGroup === targetGroupSize) {
        randomizedArrayOfArrays.push(tempSmallGroupArray);
        // let's reset temp type variables
        tempNumberOfStudentsInSmallGroup = 0;
        tempSmallGroupArray = [];
      }
    }
    if (tempSmallGroupArray.length > 0) {
      // there wasn't an even number of students to split
      // into min group size.
      // tempSmallGroupArray now contains the left out students
      // that need to be put into existing small groups.
      for (let i = 0; i < tempSmallGroupArray.length; i += 1) {
        randomizedArrayOfArrays =
          RandomizeStudentGroup.addOddStudentsToOtherGroups(tempSmallGroupArray[i],
            randomizedArrayOfArrays);
      }
    }

    this.setState({ selectedView: 'randomizedView',
      randomizedStudentArrayOfArrays: randomizedArrayOfArrays });

    // update statistics counter that is used to monitor how much s2g app is actually used
    this.updateRandomizeStatistic();
  }

  // deleteThisStudent is not used currently in RandomizeStudentGroup
  deleteThisStudent(studentFirstName, studentLastName,
    studentGroupID, studentGroupName) {
    Meteor.call('studentGroup.removeStudent', studentFirstName, studentLastName,
      studentGroupName, studentGroupID, function(error, result) {
        if (error) {
          alert(error);
        } else {
          console.log('studentGroup.removeStudent successful', result);
          const fetchedStudentArray = this.getStudentsInClient();
          this.setState({ studentArray: fetchedStudentArray });
        }
      }.bind(this));
  }

  // TODO: perhaps some other data structure than array could be used
  // for storing students. That way these loopings would not be needed
  // to write into functions. Investigate if Map datatype would be good.
  // It could give item based on key and it is iterable.
  findStudentIndex(studentFirstName, studentLastName) {
    const tempStudentArray = Array.from(this.state.studentArray);
    for (let i = 0; i < this.state.studentArray.length; i += 1) {
      if (tempStudentArray[i].firstName === studentFirstName &&
          tempStudentArray[i].lastName === studentLastName) {
        return i;
      }
    }
    return null;
  }

  updateStudentCounts() {
    let tempNbrPresentStudents = 0;
    let tempNbrAbsentStudents = 0;
    for (let i = 0; i < this.state.studentArray.length; i += 1) {
      if (this.state.studentArray[i].absent === false) {
        tempNbrPresentStudents += 1;
      } else {
        tempNbrAbsentStudents += 1;
      }
    }
    this.setState({ nbrPresentStudents: tempNbrPresentStudents,
      nbrAbsentStudents: tempNbrAbsentStudents });
  }

  handleStudentClick(studentFirstName, studentLastName,
    studentGroupID, studentGroupName) {
    console.log('handleStudentClick: ', studentFirstName, ' ', studentLastName,
      ' ', studentGroupID, ' ', studentGroupName);

    const tempStudentArray = Array.from(this.state.studentArray);
    const tempIndex = this.findStudentIndex(studentFirstName, studentLastName);

    if (tempIndex !== null) {
      tempStudentArray[tempIndex].absent = !tempStudentArray[tempIndex].absent;
      this.setState({ studentArray: tempStudentArray });
      this.updateStudentCounts();
    }
  }

  handleGoToMainView() {
    this.props.cbGoToMainViewClicked();
  }

  handleGoToListView() {
    this.setState({ selectedView: 'listView' });
  }
  renderStudentSmallGroups() {
    if (this.state.randomizedStudentArrayOfArrays == null ||
        this.state.randomizedStudentArrayOfArrays === undefined ||
        this.state.randomizedStudentArrayOfArrays.length === 0) {
      return (<h4>ERROR: Small groups were empty.</h4>);
    }
    const tempArrayOfArrays = this.state.randomizedStudentArrayOfArrays;

    let returnString = '';

    return tempArrayOfArrays.map((studentSmallGroup, index) => {
      const tempGroupNumber = index + 1;
      returnString = `Group Number ${tempGroupNumber} `;
      return (<div className="smallGroup" key={returnString}> <h3>{returnString}</h3>{this.renderStudentGroup(tempArrayOfArrays[index], false)} </div>);
    });
  }


  renderStudentGroup(studentArrayParam, studentCanBeClickedParam) {
    if (this.state.studentArray == null ||
        this.state.studentArray === undefined ||
        this.state.studentArray.length === 0) {
      return (<h4>No students listed as enrolled in this class.</h4>);
    }
    let filteredStudents = Array.from(studentArrayParam);
    filteredStudents = filteredStudents.sort(RandomizeStudentGroup.sortAccordingToLastName);

    return filteredStudents.map((student) => {
      return (
        <Student
          key={this.props.studentGroupID + student.firstName + student.lastName}
          studentGroupID={this.props.studentGroupID}
          studentGroupName={this.props.studentGroupName}
          studentID={this.props.studentGroupID + student.firstName + student.lastName}
          studentFirstName={student.firstName}
          studentLastName={student.lastName}
          studentAbsent={student.absent}
          studentCanBeClicked={studentCanBeClickedParam}
          parentView="RandomizeStudentGroup"
          cbClick={this.handleStudentClick}
          cbDelete={this.deleteThisStudent}
        />
      );
    });
  }

  render() {
    return (
      <div>
        <span>
          <h3>{this.props.studentGroupName}
            (nbr enrolled: {this.state.nbrEnrolledStudents},
            nbr present: {this.state.nbrPresentStudents})
          </h3>
          <button className="goToMainViewButton" onClick={this.handleGoToMainView}>
            Go To Main View
          </button>
          {this.state.selectedView === 'randomizedView' &&
          <br />}
          {this.state.selectedView === 'randomizedView' &&
          this.props.currentUser &&
          <button className="goToListViewButton" onClick={this.handleGoToListView}>
            Go To List View
          </button>
          }
          <br />
          <button
            className="randomizeStudentGroupButton"
            onClick={this.randomizeStudentGroup}
          >
            {this.state.selectedView === 'listView' ?
              'Randomize into groups of minimum three' :
              'Randomize AGAIN into groups of minimum three' }
          </button>
        </span>
        <br />
        {this.state.selectedView === 'listView' &&
         this.props.currentUser &&
         this.renderStudentGroup(this.state.studentArray, true)}
        <div className="smallGroupContainer">
          {this.state.selectedView === 'randomizedView' &&
          this.props.currentUser &&
          this.renderStudentSmallGroups()}
        </div>
      </div>
    );
  }
}

RandomizeStudentGroup.propTypes = {
  studentGroupID: PropTypes.string.isRequired,
  studentGroupName: PropTypes.string.isRequired,
  currentUser: PropTypes.object.isRequired,
  cbGoToMainViewClicked: PropTypes.func.isRequired,
};
