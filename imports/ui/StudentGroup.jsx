import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
// import classnames from 'classnames';

// StudentGroup component - represents a single todo item
export default class StudentGroup extends Component {
  constructor(props) {
    super(props);

    this.deleteThisStudentGroup = this.deleteThisStudentGroup.bind(this);
    this.selectThisStudentGroup = this.selectThisStudentGroup.bind(this);
    this.editThisStudentGroup = this.editThisStudentGroup.bind(this);
    // this.togglePrivate = this.togglePrivate.bind(this);
  }


  selectThisStudentGroup() {
    // Set the checked property to the opposite of its current value
    // Meteor.call('studentGroups.setChecked', this.props.studentGroup._id,
    // !this.props.studentGroup.checked);
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

  // This component gets the studentGroup to display through a React prop.
  // We can use propTypes to indicate it is required
  // key: PropTypes.string.isRequired,
  studentGroupID: PropTypes.string.isRequired,
  studentGroupName: PropTypes.string.isRequired,
  cbSelect: PropTypes.func.isRequired,
  cbEdit: PropTypes.func.isRequired,
  // showPrivateButton: PropTypes.bool.isRequired,
};
