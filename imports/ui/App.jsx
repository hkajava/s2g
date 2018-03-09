import React, { Component } from 'react';
import PropTypes from 'prop-types'; // ES6
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';
import { StudentGroups } from '../api/studentGroups.js';
import StudentGroup from './StudentGroup.jsx';
import EditStudentGroup from './EditStudentGroup.jsx';
import RandomizeStudentGroup from './RandomizeStudentGroup.jsx';
import { version } from '../../package.json';

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

  componentDidMount() {
    // enabled only when user is not logged in
    if (!this.props.currentUser) {
      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.src = '//ra.revolvermaps.com/0/0/8.js?i=0paxcz5fm5z&amp;m=0&amp;c=ff0000&amp;cr1=ffffff&amp;f=arial&amp;l=33';
      s.innerHTML = '';
      this.instance.appendChild(s);
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    // new studentGroup name received in textInput field
    const text = this.textInput.value.trim();

    Meteor.call('studentGroups.insert', text);

    // Clear form textInput
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

  // for textInput field that is used to enter new studentGroup
  placeholderOnFocus () {
    this.setState({
      placeholderForEnteringNewGroup: '',
    });
  }

  // for textInput field that is used to enter new studentGroup
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

    const currentUserId = this.props.currentUser._id;

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
      <div className="container_test">
        <header>
          <div className="loginCircle"><AccountsUIWrapper /></div>
          <h1>Students2Groups</h1>
          <h6>Version: {version}</h6>
          <br />
        </header>

        { this.props.currentUser && this.state.selectedView === 'mainView' &&
          <form className="new-studentGroup" onSubmit={this.handleSubmit} >
            <input
              type="text"
              // this ref part is copied from tutorial. strange syntax
              ref={node => this.textInput = node}
              placeholder={this.state.placeholderForEnteringNewGroup}
              onFocus={() => this.placeholderOnFocus()}
              onBlur={() => this.placeholderOnBlur()}
            />
          </form>
        }

        { this.props.currentUser && this.state.selectedView === 'mainView' &&
          this.renderStudentGroups()
        }

        { this.props.currentUser && this.state.selectedView === 'editorView' &&
          <EditStudentGroup
            studentGroupID={this.state.selectedGroupID}
            studentGroupName={this.state.selectedGroupName}
            currentUser={this.props.currentUser}
            cbGoToMainViewClicked={this.openMainView}
          />
        }
        { this.props.currentUser && this.state.selectedView === 'randomizeStudentGroupView' &&
          <RandomizeStudentGroup
            studentGroupID={this.state.selectedGroupID}
            studentGroupName={this.state.selectedGroupName}
            currentUser={this.props.currentUser}
            cbGoToMainViewClicked={this.openMainView}
          /> }
        <br />
        <br />
        <br />
        { !this.props.currentUser &&
          <div>
            <h5>Student2Groups application user locations:</h5>
            <div className="revolvermapContainer" ref={el => (this.instance = el)} >
            </div>
          </div>
        }
      </div>
    );
  }
}

App.propTypes = {
  studentGroups: PropTypes.array.isRequired,
  currentUser: PropTypes.object,
};

App.defaultProps = {
  currentUser: {},
};

export default withTracker(() => {
  Meteor.subscribe('studentGroups');
  const currentUser = Meteor.user();

  if (currentUser !== null && currentUser !== undefined) {
    return {
      studentGroups: StudentGroups.find({ owner: currentUser._id },
        { sort: { createdAt: -1 } }).fetch(),
      currentUser: Meteor.user(),
    };
  }
  return {
    studentGroups: [],
    currentUser: Meteor.user(),
  };
})(App);
