import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import Student from './Student.jsx';
import { StudentGroups } from '../api/studentGroups.js';
// import classnames from 'classnames';


// RandomizeStudentGroup component - show a list of students belonging
// to a course. Those that are not present can be deselected.
// The remaining students that are present in the class can be split
// randomly into small groups.
export default class RandomizeStudentGroup extends Component {
  // TODO, should ES6 international collation features be used
  // here to get alphabets correctly sorted?
  static sortArrayAccordingToLastName(a, b) {
    const textA = a.lastName.toUpperCase();
    const textB = b.lastName.toUpperCase();


    if (textB > textA) {
      return -1;
    } else if (textA > textB) {
      return 1;
    }
    return 0;
    // return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  }

  constructor(props) {
    super(props);

    this.handleStudentClick = this.handleStudentClick.bind(this);
    this.getStudentsInClient = this.getStudentsInClient.bind(this);
    this.deleteThisStudent = this.deleteThisStudent.bind(this);
    this.handleGoToMainView = this.handleGoToMainView.bind(this);
    this.randomizeStudentGroup = this.randomizeStudentGroup.bind(this);

    const fetchedStudentArray = this.getStudentsInClient();

    this.state =
    { changesSaved: true,
      selectedView: 'main',
      studentArray: fetchedStudentArray,
      randomizedStudentArrayOfArrays: [],
      placeholderForEnteringNewStudentToClass: 'Add student',
      minGroupSize: 3 };

    // Meteor.subscribe('studentGroups');
  }

  getStudentsInClient() {
    let currentStudentArray = [];
    const query = {};
    query.studentGroupName = this.props.studentGroupName;
    const currentStudentGroupArray = StudentGroups.find(query).fetch();
    const currentStudentGroup = currentStudentGroupArray[0];
    if (currentStudentGroup.students !== undefined &&
        currentStudentGroup.students !== null) {
      currentStudentArray = Array.from(currentStudentGroup.students);
    }
    return currentStudentArray;
  }

  randomizeStudentGroup() {
    const randomizedArrayOfArrays = [];
    const tempStudentsArray = Array.from(this.state.studentArray);
    const tempMinGroupSize = this.state.minGroupSize;

    // this would tell always how many students would be left out
    // after splitting the whole student group into equal size small groups
    let tempRemainingNumberOfStudents = 0;

    tempRemainingNumberOfStudents = tempStudentsArray.length % tempMinGroupSize;

    const targetGroupSize = tempMinGroupSize;

    if (tempRemainingNumberOfStudents === 0) {
      // There is such number of students that they can be split into
      // equal size groups that have the smallest allowed size
      let tempNumberOfStudentsInSmallGroup = 0;
      let tempSmallGroupArray = [];
      // note that index is not incremented as the array is shrinked

      for (let i = 0; i < tempStudentsArray.length;) {
        const removedIndex = Math.floor(Math.random() * tempStudentsArray.length);
        const tempStudent = tempStudentsArray[removedIndex];
        tempSmallGroupArray.push(tempStudent);
        tempNumberOfStudentsInSmallGroup += 1;
        // time to remove student from origin array
        tempStudentsArray.splice(removedIndex, 1);
        if (tempNumberOfStudentsInSmallGroup === targetGroupSize) {
          randomizedArrayOfArrays.push(tempSmallGroupArray);
          // let's reset temp type variables
          tempNumberOfStudentsInSmallGroup = 0;
          tempSmallGroupArray = [];
        }
      }
    }
    this.setState({ selectedView: 'randomized',
      randomizedStudentArrayOfArrays: randomizedArrayOfArrays });
  }

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

  handleStudentClick(studentFirstName, studentLastName,
    studentGroupID, studentGroupName) {
    console.log('handleStudentClick: ', studentFirstName, ' ', studentLastName,
      ' ', studentGroupID, ' ', studentGroupName);
    this.setState({ changesSaved: false });
  }

  handleGoToMainView() {
    this.props.cbGoToMainViewClicked();
  }

/*
  renderOneStudentSmallGroup(oneStudentGroupArray) {
    let filteredStudents = Array.from(oneStudentGroupArray);
    filteredStudents = filteredStudents.sort(RandomizeStudentGroup.sortArrayAccordingToLastName);

    return filteredStudents.map((student) => {
      // const currentUserId = this.props.currentUser && this.props.currentUser._id;
      // const showPrivateButton = task.owner === currentUserId;
      return (
        <Student
          key={this.props.studentGroupID + student.firstName + student.lastName}
          studentGroupID={this.props.studentGroupID}
          studentGroupName={this.props.studentGroupName}
          studentID={this.props.studentGroupID + student.firstName + student.lastName}
          studentFirstName={student.firstName}
          studentLastName={student.lastName}
          parentView="RandomizeStudentGroup"
          cbClick={this.handleStudentClick}
          cbDelete={this.deleteThisStudent}
        />
      );
    });
  }
  */

  renderStudentSmallGroups() {
    if (this.state.randomizedStudentArrayOfArrays == null ||
        this.state.randomizedStudentArrayOfArrays === undefined ||
        this.state.randomizedStudentArrayOfArrays.length === 0) {
      return (<h4>ERROR: Small groups were empty.</h4>);
    }
    const tempArrayOfArrays = this.state.randomizedStudentArrayOfArrays;

    let returnString = '';

    /*
    for (let i = 0; i < tempArrayOfArrays.length; i += 1) {
      returnString = returnString.concat('SmallGroup Number ', i + 1);
      return (<div> <h3>{returnString}</h3>{this.renderStudentGroup(tempArrayOfArrays[i])} </div>);
      returnString = returnString.concat(this.renderOneStudentSmallGroup(tempArrayOfArrays[i]));
      returnString = returnString.concat('<br />');
    }
    */

    return tempArrayOfArrays.map((studentSmallGroup, index) => {
      // const currentUserId = this.props.currentUser && this.props.currentUser._id;
      // const showPrivateButton = task.owner === currentUserId;
      const tempGroupNumber = index + 1;
      returnString = `SmallGroup Number ${tempGroupNumber}`;
      return (<div className="smallGroup" key={returnString}> <h3>{returnString}</h3>{this.renderStudentGroup(tempArrayOfArrays[index])} </div>);
    });
    // return returnString;
    // return (<div> dangerouslySetInnerHTML={{__html: returnString}} </div>);
  }


  renderStudentGroup(studentArrayParam) {
    if (this.state.studentArray == null ||
        this.state.studentArray === undefined ||
        this.state.studentArray.length === 0) {
      return (<h4>No students listed as enrolled in this class.</h4>);
    }
    // let filteredStudents = Array.from(this.state.studentArray);
    let filteredStudents = Array.from(studentArrayParam);
    filteredStudents = filteredStudents.sort(RandomizeStudentGroup.sortArrayAccordingToLastName);

    return filteredStudents.map((student) => {
      // const currentUserId = this.props.currentUser && this.props.currentUser._id;
      // const showPrivateButton = task.owner === currentUserId;
      return (
        <Student
          key={this.props.studentGroupID + student.firstName + student.lastName}
          studentGroupID={this.props.studentGroupID}
          studentGroupName={this.props.studentGroupName}
          studentID={this.props.studentGroupID + student.firstName + student.lastName}
          studentFirstName={student.firstName}
          studentLastName={student.lastName}
          parentView="RandomizeStudentGroup"
          cbClick={this.handleStudentClick}
          cbDelete={this.deleteThisStudent}
        />
      );
    });
  }

  render() {
    // Give studentGroups a different className when they are checked off,
    // so that we can style them nicely in CSS
    /*
    const studentGroupClassName = classnames({
      checked: this.props.studentGroup.checked,
      private: this.props.studentGroup.private,
    });
    */
    return (
      <div>
        <span>
          <h3>Randomize</h3>
          <h3>{this.props.studentGroupName}</h3>
          <button className="goToMainViewButton" onClick={this.handleGoToMainView}>
            Go To Main View
          </button>
          <br />
          <button
            className="randomizeStudentGroupButton"
            onClick={this.randomizeStudentGroup}
          >
            Randomize into groups of three or four
          </button>
        </span>
        <br />
        {this.state.selectedView === 'main' &&
         this.props.currentUser &&
         this.renderStudentGroup(this.state.studentArray)}
        <div className="smallGroupContainer">
          {this.state.selectedView === 'randomized' &&
          this.props.currentUser &&
          this.renderStudentSmallGroups()}
       </div>
      </div>
    );
  }
}

RandomizeStudentGroup.propTypes = {

  // This component gets the studentGroup to display through a React prop.
  // We can use propTypes to indicate it is required
  // studentGroup: PropTypes.object.isRequired,
  // key: PropTypes.string.isRequired,
  studentGroupID: PropTypes.string.isRequired,
  studentGroupName: PropTypes.string.isRequired,
  currentUser: PropTypes.object.isRequired,
  cbGoToMainViewClicked: PropTypes.func.isRequired,
  // showPrivateButton: PropTypes.bool.isRequired,

};
