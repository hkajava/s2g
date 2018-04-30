import React, { Component } from 'react';
import PropTypes from 'prop-types'; // ES6
import { Meteor } from 'meteor/meteor';
import NotificationSystem from 'react-notification-system';

export default class StudentGroup extends Component {
  constructor(props) {
    super(props);

    this.selectThisStudentGroup = this.selectThisStudentGroup.bind(this);
    this.editThisStudentGroup = this.editThisStudentGroup.bind(this);
    this.deleteThisStudentGroup = this.deleteThisStudentGroup.bind(this);

    this.addNotification = this.addNotification.bind(this);
    this.showErrorNotification = this.showErrorNotification.bind(this);
    this.showSuccessNotification = this.showSuccessNotification.bind(this);
  }

  componentDidMount() {
    // this.notificationSystem = this.refs.notificationSystem;
  }

  selectThisStudentGroup() {
    this.props.cbSelect(this.props.studentGroupID, this.props.studentGroupName);
  }
  editThisStudentGroup() {
    // console.log('editThisStudentGroup');
    if (this.props.loggedIn) {
      this.props.cbEdit(this.props.studentGroupID, this.props.studentGroupName);
    } else {
      // alert('To edit group, you need to login first.');
      this.showErrorNotification('To edit group, you need to login first.');
    }
  }
  deleteThisStudentGroup() {
    if (this.props.loggedIn) {
      Meteor.call('studentGroups.remove', this.props.studentGroupID);
    } else {
      // alert('To delete group, you need to login first.');
      this.showErrorNotification('To delete group, you need to login first.');
    }
  }

  showErrorNotification(errorMessage) {
    // console.log(errorMessage);
    this.notificationSystem.addNotification({
      message: errorMessage,
      level: 'error',
    });
  }

  showSuccessNotification(successMessage) {
    // console.log(successMessage);
    this.notificationSystem.addNotification({
      message: successMessage,
      level: 'success',
    });
  }

  addNotification(event) {
    event.preventDefault();
    this.notificationSystem.addNotification({
      message: 'Notification message',
      level: 'success',
    });
  }

  render() {
    return (
      <div className="selectStudentGroupCSSGridWrapper__gridItem--row">
        <button className="selectStudentGroupButton" onClick={this.selectThisStudentGroup}>
          {this.props.studentGroupName}
        </button>
        <button className="editStudentGroupButton" onClick={this.editThisStudentGroup}>
           Edit
        </button>
        <button className="deleteStudentGroupButton" onClick={this.deleteThisStudentGroup}>
           Delete
        </button>
        <NotificationSystem ref={(c) => { this.notificationSystem = c; }} />
      </div>
    );
  }
}

StudentGroup.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  studentGroupID: PropTypes.string.isRequired,
  studentGroupName: PropTypes.string.isRequired,
  cbSelect: PropTypes.func.isRequired,
  cbEdit: PropTypes.func.isRequired,
};
