import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

export default class Student extends Component {
  constructor(props) {
    super(props);
    this.toggleStudentNameClicked = this.toggleStudentNameClicked.bind(this);
    this.deleteThisStudent = this.deleteThisStudent.bind(this);

    this.state = {
      checked: false,
    };
  }

  toggleStudentNameClicked() {
    this.setState({ checked: false });
    this.props.cbClick(this.props.studentFirstName, this.props.studentLastName);
  }

  deleteThisStudent() {
    this.props.cbDelete(this.props.studentFirstName, this.props.studentLastName);
  }

  render() {
    const studentClassName = classnames({
      checked: this.state.checked,
    });
    // console.log(studentClassName);

    return (
      <ul>
        <li>
          <button className="studentNameButton" id={this.props.key} onClick={this.toggleStudentNameClicked}>
            {this.props.studentFirstName} {this.props.studentLastName}
          </button>
          {(this.props.parentView === 'EditStudentGroup') &&
          <button className="deleteButton" onClick={this.deleteThisStudent}>
             Delete
          </button>
          }
        </li>
      </ul>

    );
  }
}

Student.propTypes = {
  studentGroupID: PropTypes.string.isRequired,
  studentGroupName: PropTypes.string.isRequired,
  studentID: PropTypes.string.isRequired,
  studentFirstName: PropTypes.string.isRequired,
  studentLastName: PropTypes.string.isRequired,
  parentView: PropTypes.string.isRequired,
  cbClick: PropTypes.func.isRequired,
  cbDelete: PropTypes.func.isRequired,
};
