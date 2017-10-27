import React, { Component, PropTypes } from 'react';
// import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import AccountsUIWrapper from './AccountsUIWrapper.jsx';

import { StudentGroups } from '../api/studentGroups.js';

import StudentGroup from './StudentGroup.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleHideCompleted = this.toggleHideCompleted.bind(this);
    this.state = {
      hideCompleted: false,
    };
  }
  handleSubmit(event) {
    event.preventDefault();
    // Find the text field via the React ref

    // const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
    const text = this.textInput.value.trim();


    Meteor.call('studentGroups.insert', text);

    // Clear form
    // ReactDOM.findDOMNode(this.refs.textInput).value = '';
    this.textInput.value = '';
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }


  renderStudentGroups() {
    let filteredStudentGroups = this.props.studentGroups;
    if (this.state.hideCompleted) {
      filteredStudentGroups = filteredStudentGroups.filter(studentGroup => !studentGroup.checked);
    }

    return filteredStudentGroups.map((studentGroup) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = studentGroup.owner === currentUserId;

      return (
        <StudentGroup
          key={studentGroup._id}
          studentGroup={studentGroup}
          showPrivateButton={showPrivateButton}
        />
      );
    });
  }

  /**
  getStudentGroups() {
    return [
      { _id: 1, text: 'This is studentGroup 1. ' },
      { _id: 2, text: 'This is studentGroup 2' },
      { _id: 3, text: 'This is studentGroup 3' },
    ];
  }
  */

  render() {
    return (
      <div className="container">
        <header>
          <h1>Students2Groups</h1>
          <AccountsUIWrapper />
          <br />
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


          { this.props.currentUser ?
            <form className="new-studentGroup" onSubmit={this.handleSubmit} >
              <input
                type="text"
                ref={node => this.textInput = node}
                placeholder="Type to add new student groups"
              />
            </form> : ''
          }
        </header>

        <ul>
          {this.renderStudentGroups()}
        </ul>

      </div>
    );
  }
}

App.propTypes = {
  studentGroups: PropTypes.array.isRequired,
  currentUser: PropTypes.object,
  // incompleteCount: PropTypes.number.isRequired,
};

App.defaultProps = {
  currentUser: {},
};

export default createContainer(() => {
  Meteor.subscribe('studentGroups');
  // what is the logic with HOC and how the props (studentGroups in this case)
  // are passed to App class
  return {
    studentGroups: StudentGroups.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: StudentGroups.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
  };
}, App);
