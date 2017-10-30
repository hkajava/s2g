import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';


// StudentGroup component - represents a single todo item
export default class StudentGroup extends Component {
  constructor(props) {
    super(props);

    this.deleteThisStudentGroup = this.deleteThisStudentGroup.bind(this);
    this.toggleChecked = this.toggleChecked.bind(this);
    this.editThisStudentGroup = this.editThisStudentGroup.bind(this);
    // this.togglePrivate = this.togglePrivate.bind(this);
  }


  toggleChecked() {
    // Set the checked property to the opposite of its current value
    // Meteor.call('studentGroups.setChecked', this.props.studentGroup._id,
    // !this.props.studentGroup.checked);
    this.props.cb(this.props.studentGroupID);
  }
  editThisStudentGroup() {
    console.log('editThisStudentGroup');
    this.props.cb(this.props.studentGroupID, this.props.studentGroupName);
  }
  deleteThisStudentGroup() {
    Meteor.call('studentGroups.remove', this.props.studentGroupID);
  }

  /*
  togglePrivate() {
    Meteor.call('studentGroups.setPrivate', this.props.studentGroupID,
                !this.props.studentGroup.private);
  }
  */


  render() {
    return (
      <li>
        <input
          type="checkbox"
          readOnly
          onClick={this.toggleChecked}
        />
        <span className="text">
          {this.props.studentGroupName}
          <button className="edit" onClick={this.editThisStudentGroup}>
             Edit
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
  cb: PropTypes.func.isRequired,
  // showPrivateButton: PropTypes.bool.isRequired,
};
