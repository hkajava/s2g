import React, { Component } from 'react';
import PropTypes from 'prop-types'; // ES6
import classnames from 'classnames';

export default class Student extends Component {
  constructor(props) {
    super(props);
    this.toggleStudentNameClicked = this.toggleStudentNameClicked.bind(this);
    this.deleteThisStudent = this.deleteThisStudent.bind(this);
  }

  toggleStudentNameClicked() {
    if (this.props.studentCanBeClicked) {
      this.props.cbClick(this.props.studentFirstName, this.props.studentLastName,
        this.props.studentGroupID, this.props.studentGroupName);
    }
  }

  deleteThisStudent() {
    this.props.cbDelete(this.props.studentFirstName, this.props.studentLastName,
      this.props.studentGroupID, this.props.studentGroupName);
  }

  render() {
    // Give student  a different className when they are checked off,
    // so that we can style them nicely in CSS

    const studentClassName = classnames({
      studentNameButton: true,
      canBeClicked: this.props.studentCanBeClicked,
      checked: this.props.studentAbsent,
    });

    // console.log(studentClassName);

    return (
      <div id={this.props.studentID}>
        <button
          className={studentClassName}
          id={this.props.studentID}
          onClick={this.toggleStudentNameClicked}
        >
          {this.props.studentFirstName} {this.props.studentLastName}
        </button>
        {(this.props.parentView === 'EditStudentGroup') &&
        <button className="deleteStudentButton" onClick={this.deleteThisStudent}>
          Delete
        </button>
        }
      </div>

    );
  }
}

Student.propTypes = {
  studentGroupID: PropTypes.string.isRequired,
  studentGroupName: PropTypes.string.isRequired,
  studentID: PropTypes.string.isRequired,
  studentFirstName: PropTypes.string.isRequired,
  studentLastName: PropTypes.string.isRequired,
  studentAbsent: PropTypes.bool.isRequired,
  studentCanBeClicked: PropTypes.bool.isRequired,
  parentView: PropTypes.string.isRequired,
  cbClick: PropTypes.func.isRequired,
  cbDelete: PropTypes.func.isRequired,
};
