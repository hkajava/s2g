import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import Student from './Student.jsx';
import { StudentGroups } from '../api/studentGroups.js';
// import classnames from 'classnames';


// EditStudentGroup component - represents an editable list of
// students belonging to a group.
export default class EditStudentGroup extends Component {
  constructor(props) {
    super(props);

    this.deleteThisStudent = this.deleteThisStudent.bind(this);
    this.handleStudentClick = this.handleStudentClick.bind(this);
    this.getStudentsInClient = this.getStudentsInClient.bind(this);

    let studentArray = this.getStudentsInClient();

    this.state =
    { changesSaved: true,
      studentArray: studentArray };
    // Meteor.subscribe('studentGroups');
    //this.getStudentsInClient(this.studentGroupName);

    // this.setState({ changesSaved: false }, this.stateChangeDone);
  }

  deleteThisStudent(studentFirstName, studentLastName) {
    Meteor.call('studentGroup.removeStudent', this.props.studentGroupName, studentFirstName, studentLastName);
  }

  handleStudentClick(studentFirstName, studentLastName) {
    console.log('handleStudentClick: ', studentFirstName, ' ', studentLastName);
    this.setState({ changesSaved: false });
  }

  stateChangeDone() {
  console.log('stateChangeDone');
}

  getStudentsInClient() {
    let query = {};
    query.studentGroupName = this.props.studentGroupName;
    let currentStudentGroupArray = StudentGroups.find(query).fetch();
    let currentStudentGroup = currentStudentGroupArray[0];
    let currentStudentArray = Array.from(currentStudentGroup.students);
    return currentStudentArray;
  }

  renderStudentGroup() {

    if (this.state.studentArray == null) {
      return '';
    }
    let filteredStudents = Array.from(this.state.studentArray);
    console.log('Meteor.userId()', Meteor.userId());
    console.log('Meteor.user().username', Meteor.user().username);
    /*
    Meteor.userId() PqP3YjyPkHSxQMCJ3
    EditStudentGroup.jsx:33 Meteor.user().username hkajava
    */

/*
    let filteredStudents = StudentGroups.find({
      studentGroupName: this.props.studentGroupName,
    }).fetch();

    if (this.state.hideAbsent) {
      filteredStudents = filteredStudents.filter(student => !student.checked);
    }
*/

    return filteredStudents.map((student) => {
      // const currentUserId = this.props.currentUser && this.props.currentUser._id;
      // const showPrivateButton = task.owner === currentUserId;

      return (
        <Student
          key={student._id}
          studentFirstName={student.firstName}
          studentLastName={student.lastName}
          cb={this.handleStudentClick}
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
    <input
      type="checkbox"
      id="hide-completed-checkbox"
      readOnly
      checked={this.state.hideCompleted}
      onClick={this.toggleHideCompleted}
    />
    <label htmlFor="hide-completed-checkbox" className="hide-completed">
      Hide students not present today
    </label>
        {this.renderStudentGroup()}
    */
    return (
      <div>
        <h3>{this.props.studentGroupName}</h3>
        {this.renderStudentGroup()}
      </div>
    );
  }
}

EditStudentGroup.propTypes = {

  // This component gets the studentGroup to display through a React prop.
  // We can use propTypes to indicate it is required
  // studentGroup: PropTypes.object.isRequired,
  // key: PropTypes.string.isRequired,
  studentGroupID: PropTypes.string.isRequired,
  studentGroupName: PropTypes.string.isRequired,
  // cbSaveButtonClicked: PropTypes.func.isRequired,
  // showPrivateButton: PropTypes.bool.isRequired,

};
