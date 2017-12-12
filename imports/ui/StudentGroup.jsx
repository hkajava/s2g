import React, { Component } from 'react';
import PropTypes from 'prop-types'; // ES6
import { Meteor } from 'meteor/meteor';

export default class StudentGroup extends Component {
  constructor(props) {
    super(props);

    this.selectThisStudentGroup = this.selectThisStudentGroup.bind(this);
    this.editThisStudentGroup = this.editThisStudentGroup.bind(this);
    this.deleteThisStudentGroup = this.deleteThisStudentGroup.bind(this);
  }

  selectThisStudentGroup() {
    this.props.cbSelect(this.props.studentGroupID, this.props.studentGroupName);
  }
  editThisStudentGroup() {
    console.log('editThisStudentGroup');
    this.props.cbEdit(this.props.studentGroupID, this.props.studentGroupName);
  }
  deleteThisStudentGroup() {
    Meteor.call('studentGroups.remove', this.props.studentGroupID);
  }

  render() {
    return (
      <li>
        <span className="text">
          <button className="selectGroupButton" onClick={this.selectThisStudentGroup}>
            {this.props.studentGroupName}
          </button>
          <button className="editButton" onClick={this.editThisStudentGroup}>
             Edit
          </button>
          <button className="deleteButton" onClick={this.deleteThisStudentGroup}>
             Delete
          </button>
        </span>
      </li>
    );
  }
}

StudentGroup.propTypes = {
  studentGroupID: PropTypes.string.isRequired,
  studentGroupName: PropTypes.string.isRequired,
  cbSelect: PropTypes.func.isRequired,
  cbEdit: PropTypes.func.isRequired,
};
