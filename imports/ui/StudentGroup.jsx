import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';


// StudentGroup component - represents a single todo item
export default class StudentGroup extends Component {
  constructor(props) {
    super(props);

    this.deleteThisStudentGroup = this.deleteThisStudentGroup.bind(this);
    this.toggleChecked = this.toggleChecked.bind(this);
    this.togglePrivate = this.togglePrivate.bind(this);
  }


  toggleChecked() {
    // Set the checked property to the opposite of its current value
    Meteor.call('studentGroups.setChecked', this.props.studentGroup._id, !this.props.studentGroup.checked);
  }
  deleteThisStudentGroup() {
    Meteor.call('studentGroups.remove', this.props.studentGroup._id);
  }
  togglePrivate() {
    Meteor.call('studentGroups.setPrivate', this.props.studentGroup._id, !this.props.studentGroup.private);
  }


  render() {
    // Give studentGroups a different className when they are checked off,
    // so that we can style them nicely in CSS
    const studentGroupClassName = classnames({
      checked: this.props.studentGroup.checked,
      private: this.props.studentGroup.private,
    });
    return (
      <li className={studentGroupClassName}>
        <button className="delete" onClick={this.deleteThisStudentGroup}>
          &times;
        </button>
        <input
          type="checkbox"
          readOnly
          // HKa how is the checked set... not understanding...
          checked={this.props.studentGroup.checked}
          onClick={this.toggleChecked}
        />

        <span className="text">
          {this.props.studentGroup.studentGroupName}
        </span>
      </li>
    );
  }
}

StudentGroup.propTypes = {

  // This component gets the studentGroup to display through a React prop.
  // We can use propTypes to indicate it is required
  studentGroup: PropTypes.object.isRequired,
  // showPrivateButton: PropTypes.bool.isRequired,

};
