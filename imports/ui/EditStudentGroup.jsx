import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import Student from './Student.jsx';
// import classnames from 'classnames';


// EditStudentGroup component - represents an editable list of
// students belonging to a group.
export default class EditStudentGroup extends Component {
  constructor(props) {
    super(props);

    this.deleteThisStudent = this.deleteThisStudent.bind(this);
    this.handleStudentClick = this.handleStudentClick.bind(this);

    this.state =
    { changesSaved: true };
  }

  deleteThisStudent(studentFirstName, studentLastName) {
    Meteor.call('studentGroup.removeStudent', this.props.studentGroupName, studentFirstName, studentLastName);
  }

  handleStudentClick(studentFirstName, studentLastName) {
    console.log('handleStudentClick: ', studentFirstName, ' ', studentLastName);
    this.setState({ changesSaved: false });
  }

  renderStudentGroup() {
    let filteredStudents = this.props.students;
    if (this.state.hideAbsent) {
      filteredStudents = filteredStudents.filter(student => !student.checked);
    }

    return filteredStudents.map((student) => {
      // const currentUserId = this.props.currentUser && this.props.currentUser._id;
      // const showPrivateButton = task.owner === currentUserId;

      return (
        <Student
          key={student._id}
          studentFirstName={student.studentFirstName}
          studentLastName={student.studentLastName}
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
      </div>
    );
  }
}

EditStudentGroup.propTypes = {

  // This component gets the studentGroup to display through a React prop.
  // We can use propTypes to indicate it is required
  // studentGroup: PropTypes.object.isRequired,
  // key: PropTypes.string.isRequired,
  studentGroupID: PropTypes.object.isRequired,
  studentGroupName: PropTypes.string.isRequired,
  students: PropTypes.array.isRequired,
  // cbSaveButtonClicked: PropTypes.func.isRequired,
  // showPrivateButton: PropTypes.bool.isRequired,

};
