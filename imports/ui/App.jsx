import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';
import { StudentGroups } from '../api/studentGroups.js';
import StudentGroup from './StudentGroup.jsx';
import EditStudentGroup from './EditStudentGroup.jsx';
import RandomizeStudentGroup from './RandomizeStudentGroup.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.openStudentGroupEditor = this.openStudentGroupEditor.bind(this);
    this.openRandomizeStudentGroupView = this.openRandomizeStudentGroupView.bind(this);
    this.openMainView = this.openMainView.bind(this);

    this.state = {
      selectedView: 'mainView',
      selectedGroupID: '',
      selectedGroupName: '',
      placeholderForEnteringNewGroup: 'Type to add new class',
    };
  }
  handleSubmit(event) {
    event.preventDefault();
    const text = this.textInput.value.trim();

    Meteor.call('studentGroups.insert', text);

    // Clear form
    // ReactDOM.findDOMNode(this.refs.textInput).value = '';
    this.textInput.value = '';
  }

  openStudentGroupEditor(studentGroupID, studentGroupName) {
    this.setState(
      { selectedView: 'editorView',
        selectedGroupID: studentGroupID,
        selectedGroupName: studentGroupName });
    console.log('openStudentGroupEditor: studentGroupID', studentGroupID);
    console.log('openStudentGroupEditor: studentGroupName', studentGroupName);
  }

  openRandomizeStudentGroupView(studentGroupID, studentGroupName) {
    this.setState(
      { selectedView: 'randomizeStudentGroupView',
        selectedGroupID: studentGroupID,
        selectedGroupName: studentGroupName });
    console.log('openRandomizeStudentGroupView: studentGroupID', studentGroupID);
    console.log('openRandomizeStudentGroupView: studentGroupName', studentGroupName);
  }

  openMainView() {
    this.setState(
      { selectedView: 'mainView' });
  }

  placeholderOnFocus () {
    this.setState({
      placeholderForEnteringNewGroup: '',
    });
  }

  placeholderOnBlur () {
    this.setState({
      placeholderForEnteringNewGroup: 'Type to add new class',
    });
  }


  renderStudentGroups() {
    const filteredStudentGroups = this.props.studentGroups;
    if (filteredStudentGroups === '' ||
        filteredStudentGroups.length === 0) {
      return '';
    }

    const currentUserId = this.props.currentUser && this.props.currentUser._id;

    return filteredStudentGroups.map((studentGroup) => {
      if (studentGroup.owner === currentUserId) {
        return (
          <StudentGroup
            key={studentGroup._id}
            studentGroupID={studentGroup._id}
            studentGroupName={studentGroup.studentGroupName}
            cbSelect={this.openRandomizeStudentGroupView}
            cbEdit={this.openStudentGroupEditor}
          />
        );
      }
      return '';
    });
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Students2Groups</h1>
          <AccountsUIWrapper />
          <br />

          { this.props.currentUser && this.state.selectedView === 'mainView' ?
            <form className="new-studentGroup" onSubmit={this.handleSubmit} >
              <input
                type="text"
                ref={node => this.textInput = node}
                placeholder={this.state.placeholderForEnteringNewGroup}
                onFocus={() => this.placeholderOnFocus()}
                onBlur={() => this.placeholderOnBlur()}
              />
            </form> : ''
          }
        </header>

        { this.state.selectedView === 'editorView' ?
          <EditStudentGroup
            studentGroupID={this.state.selectedGroupID}
            studentGroupName={this.state.selectedGroupName}
            currentUser={this.props.currentUser}
            cbGoToMainViewClicked={this.openMainView}
          />
          : ''
        }
        { this.state.selectedView === 'randomizeStudentGroupView' &&
          <RandomizeStudentGroup
            studentGroupID={this.state.selectedGroupID}
            studentGroupName={this.state.selectedGroupName}
            currentUser={this.props.currentUser}
            cbGoToMainViewClicked={this.openMainView}
          /> }
        { this.state.selectedView === 'mainView' && this.props.currentUser ?
          <ul>
            {this.renderStudentGroups()}
          </ul>
          : ''
        }
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
    // incompleteCount: StudentGroups.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
  };
}, App);
