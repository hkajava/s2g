import React, { Component, PropTypes } from 'react';
// import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';
import { StudentGroups } from '../api/studentGroups.js';
import StudentGroup from './StudentGroup.jsx';
import EditStudentGroup from './EditStudentGroup.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleHideCompleted = this.toggleHideCompleted.bind(this);
    this.openStudentGroupEditor = this.openStudentGroupEditor.bind(this);
    this.openStudentGroupView = this.openStudentGroupView.bind(this);
    this.openMainView = this.openMainView.bind(this);

    this.state = {
      hideCompleted: false,
      editorSelected: false,
      selectedView: 'mainView',
      studentGroupViewSelected: false,
      selectedGroupID: '',
      selectedGroupName: '',
      placeholderForEnteringNewGroup: 'Type to add new class',
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

  openStudentGroupEditor(studentGroupID, studentGroupName) {
    this.setState(
      { editorSelected: true,
        selectedView: 'editorView',
        selectedGroupID: studentGroupID,
        selectedGroupName: studentGroupName });
    console.log('openStudentGroupEditor: studentGroupID', studentGroupID);
    console.log('openStudentGroupEditor: studentGroupName', studentGroupName);
  }

  openStudentGroupView(studentGroupID, studentGroupName) {
    this.setState(
      { studentGroupViewSelected: true,
        selectedView: 'studentGroupView',
        selectedGroupID: { studentGroupID },
        selectedGroupName: { studentGroupName } });
    console.log('openStudentGroupView: studentGroupID', studentGroupID);
    console.log('openStudentGroupView: studentGroupName', studentGroupName);
  }

  openMainView() {
    this.setState(
      { selectedView: 'mainView',
        studentGroupViewSelected: false,
        editorSelected: false });
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
    let filteredStudentGroups = this.props.studentGroups;
    if (filteredStudentGroups === '' ||
        filteredStudentGroups.length === 0) {
      return '';
    }

    if (this.state.hideCompleted) {
      filteredStudentGroups = filteredStudentGroups.filter(studentGroup => !studentGroup.checked);
    }

    return filteredStudentGroups.map((studentGroup) => {
      return (
        <StudentGroup
          key={studentGroup._id}
          studentGroupID={studentGroup._id}
          studentGroupName={studentGroup.studentGroupName}
          cbSelect={this.openStudentGroupView}
          cbEdit={this.openStudentGroupEditor}
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

          { this.props.currentUser && !this.state.editorSelected ?
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

        { this.state.editorSelected ?
          <EditStudentGroup
            studentGroupID={this.state.selectedGroupID}
            studentGroupName={this.state.selectedGroupName}
            currentUser={this.props.currentUser}
            cbGoToMainViewClicked={this.openMainView}
          />
          : ''
        }
        { !this.state.editorSelected && this.props.currentUser ?
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
