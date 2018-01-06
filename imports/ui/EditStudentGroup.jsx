import React, { Component } from 'react';
import PropTypes from 'prop-types'; // ES6
import { Meteor } from 'meteor/meteor';
import Student from './Student.jsx';
import { StudentGroups } from '../api/studentGroups.js';

// EditStudentGroup component - represents an editable list of
// students belonging to a group. It is used by teacher when a new course
// starts.
export default class EditStudentGroup extends Component {
  static sortArrayAccordingToLastName(a, b) {
    const textA = a.lastName.toUpperCase();
    const textB = b.lastName.toUpperCase();

    if (textB > textA) {
      return -1;
    } else if (textA > textB) {
      return 1;
    }
    return 0;
  }

  constructor(props) {
    super(props);

    this.handleStudentClick = this.handleStudentClick.bind(this);
    this.getStudentsInClient = this.getStudentsInClient.bind(this);
    this.addStudentToClass = this.addStudentToClass.bind(this);
    this.deleteThisStudent = this.deleteThisStudent.bind(this);
    this.handleGoToMainView = this.handleGoToMainView.bind(this);

    let tempNbrEnrolledStudents = 0;
    const fetchedStudentArray = this.getStudentsInClient();

    if (fetchedStudentArray !== null &&
        fetchedStudentArray !== []) {
      tempNbrEnrolledStudents = fetchedStudentArray.length;
    }

    this.state =
    { studentArray: fetchedStudentArray,
      nbrEnrolledStudents: tempNbrEnrolledStudents,
      placeholderForEnteringNewStudentToClass: 'Add student: <firstname> <lastname>' };
  }

  getStudentsInClient() {
    let currentStudentArray = [];
    const query = {};
    query.studentGroupName = this.props.studentGroupName;
    // Here is made assumption that there is only one studentGroup with
    // a certain name. That has been taken care of in studentGroup addition
    const currentStudentGroup = StudentGroups.findOne(query);
    if (currentStudentGroup.students !== undefined &&
        currentStudentGroup.students !== null) {
      currentStudentArray = Array.from(currentStudentGroup.students);
    }
    return currentStudentArray;
  }

  placeholderOnFocus () {
    this.setState({
      placeholderForEnteringNewStudentToClass: '',
    });
  }

  placeholderOnBlur () {
    this.setState({
      placeholderForEnteringNewStudentToClass: 'Add student: <firstname> <lastname>',
    });
  }

  addStudentToClass(event) {
    event.preventDefault();

    const text = this.textInput.value.trim();

    // Clear form
    this.textInput.value = '';
    // add checking that firstname and lastname are correctly given. exactly two
    // names (first and last) should be given. Or then another possibility would
    // to have two input text fields
    const textArray = text.split(' ');
    if (textArray.length !== 2) {
      // console.log('Could not add student to class. The name was incorrect or missing.');
      alert('Could not add student to class. Name should contain first and lastname separated by space.');
      return;
    }
    const firstName = textArray[0];
    const lastName = textArray[1];


    Meteor.call('studentGroup.addStudent', firstName, lastName, this.props.studentGroupName, this.props.studentGroupID, function(error, result) {
      if (error) {
        alert(error);
      } else {
        console.log('studentGroup.addStudent successful', result);
        const fetchedStudentArray = this.getStudentsInClient();
        let tempNbrEnrolledStudents = 0;

        if (fetchedStudentArray !== null &&
            fetchedStudentArray !== []) {
          tempNbrEnrolledStudents = fetchedStudentArray.length;
        }
        this.setState({ studentArray: fetchedStudentArray,
          nbrEnrolledStudents: tempNbrEnrolledStudents });
      }
    }.bind(this));
  }

  deleteThisStudent(studentFirstName, studentLastName) {
    Meteor.call('studentGroup.removeStudent', studentFirstName, studentLastName,
      this.props.studentGroupName, this.props.studentGroupID, function(error, result) {
        if (error) {
          alert(error);
        } else {
          console.log('studentGroup.removeStudent successful', result);
          const fetchedStudentArray = this.getStudentsInClient();
          let tempNbrEnrolledStudents = 0;

          if (fetchedStudentArray !== null &&
              fetchedStudentArray !== []) {
            tempNbrEnrolledStudents = fetchedStudentArray.length;
          }
          this.setState({ studentArray: fetchedStudentArray,
            nbrEnrolledStudents: tempNbrEnrolledStudents });
        }
      }.bind(this));
  }

  handleStudentClick(studentFirstName, studentLastName) {
    console.log('handleStudentClick: ', studentFirstName, ' ', studentLastName, ' ', this.props.studentGroupName);
  }

  handleGoToMainView() {
    this.props.cbGoToMainViewClicked();
  }

  renderStudentGroup() {
    if (this.state.studentArray == null ||
        this.state.studentArray === undefined ||
        this.state.studentArray.length === 0) {
      return (<h4>No students listed as enrolled in this class.</h4>);
    }
    let studentArray = Array.from(this.state.studentArray);
    studentArray = studentArray.sort(EditStudentGroup.sortArrayAccordingToLastName);

    return studentArray.map((student) => {
      return (
        <Student
          key={this.props.studentGroupID + student.firstName + student.lastName}
          studentGroupID={this.props.studentGroupID}
          studentGroupName={this.props.studentGroupName}
          studentID={this.props.studentGroupID + student.firstName + student.lastName}
          studentFirstName={student.firstName}
          studentLastName={student.lastName}
          studentAbsent={false}
          studentCanBeClicked={false}
          parentView="EditStudentGroup"
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
          <h3>{this.props.studentGroupName}</h3>
          <h5>Number of enrolled students: {this.state.nbrEnrolledStudents}<br />
          </h5>
          <button className="goToMainViewButton" onClick={this.handleGoToMainView}>
            Go To Main View
          </button>
        </span>
        { this.props.currentUser ?
          <form className="new-studentToClass" onSubmit={this.addStudentToClass} >
            <input
              type="text"
              ref={node => this.textInput = node}
              placeholder={this.state.placeholderForEnteringNewStudentToClass}
              onFocus={() => this.placeholderOnFocus()}
              onBlur={() => this.placeholderOnBlur()}
            />
          </form> : ''
        }
        {this.renderStudentGroup()}
      </div>
    );
  }
}

EditStudentGroup.propTypes = {
  studentGroupID: PropTypes.string.isRequired,
  studentGroupName: PropTypes.string.isRequired,
  currentUser: PropTypes.object.isRequired,
  cbGoToMainViewClicked: PropTypes.func.isRequired,
};
