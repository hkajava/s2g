import React, { Component, PropTypes } from 'react';
// import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import AccountsUIWrapper from './AccountsUIWrapper.jsx';

import { Tasks } from '../api/tasks.js';

import Task from './Task.jsx';

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


    Meteor.call('tasks.insert', text);

    // Clear form
    // ReactDOM.findDOMNode(this.refs.textInput).value = '';
    this.textInput.value = '';
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }


  renderTasks() {
    let filteredTasks = this.props.tasks;
    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }

    return filteredTasks.map((task) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;

      return (
        <Task
          key={task._id}
          task={task}
          showPrivateButton={showPrivateButton}
        />
      );
    });
  }

  /**
  getTasks() {
    return [
      { _id: 1, text: 'This is task 1. ' },
      { _id: 2, text: 'This is task 2' },
      { _id: 3, text: 'This is task 3' },
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
            <form className="new-task" onSubmit={this.handleSubmit} >
              <input
                type="text"
                ref={node => this.textInput = node}
                placeholder="Type to add new tasks"
              />
            </form> : ''
          }
        </header>

        <ul>
          {this.renderTasks()}
        </ul>

      </div>
    );
  }
}

App.propTypes = {
  tasks: PropTypes.array.isRequired,
  currentUser: PropTypes.object,
  // incompleteCount: PropTypes.number.isRequired,
};

App.defaultProps = {
  currentUser: {},
};


export default createContainer(() => {
  Meteor.subscribe('tasks');
  // what is the logic with HOC and how the props (tasks in this case) are passed to App class
  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
  };
}, App);
