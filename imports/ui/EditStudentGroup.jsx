import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import Student from './Student.jsx';
import { StudentGroups } from '../api/studentGroups.js';
// import classnames from 'classnames';


// EditStudentGroup component - represents an editable list of
// students belonging to a group.
export default class EditStudentGroup extends Component {
  constructor(props) {
    super(props);

    this.handleStudentClick = this.handleStudentClick.bind(this);
    this.getStudentsInClient = this.getStudentsInClient.bind(this);
    this.addStudentToClass = this.addStudentToClass.bind(this);
    this.deleteThisStudent = this.deleteThisStudent.bind(this);
    this.handleGoToMainView = this.handleGoToMainView.bind(this);

    const fetchedStudentArray = this.getStudentsInClient();

    this.state =
    { changesSaved: true,
      studentArray: fetchedStudentArray,
      placeholderForEnteringNewStudentToClass: 'Add student' };

    // Meteor.subscribe('studentGroups');
  }

  getStudentsInClient() {
    let currentStudentArray = [];
    const query = {};
    query.studentGroupName = this.props.studentGroupName;
    const currentStudentGroupArray = StudentGroups.find(query).fetch();
    const currentStudentGroup = currentStudentGroupArray[0];
    if (currentStudentGroup.students !== undefined &&
        currentStudentGroup.students !== null) {
      currentStudentArray = Array.from(currentStudentGroup.students);
    }
    return currentStudentArray;
  }

  placeholderOnFocus () {
    this.setState({
      placeholderForEnteringNewStudentToClass: '',
    });
  }

  placeholderOnBlur () {
    this.setState({
      placeholderForEnteringNewStudentToClass: 'Add student',
    });
  }

  addStudentToClass(event) {
    event.preventDefault();
    // Find the text field via the React ref

    // const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
    const text = this.textInput.value.trim();

    // Clear form
    // ReactDOM.findDOMNode(this.refs.textInput).value = '';
    this.textInput.value = '';
    // add checking that firstname and lastname are correctly given. exactly two
    // names (first and last) should be given. Or then another possibility would
    // to have two input text fields
    const textArray = text.split(' ');
    if (textArray.length === 0) {
      // console.log('Could not add student to class. The name was incorrect or missing.');
      alert('Could not add student to class. The name was incorrect or missing.');
      return;
    }
    const firstName = textArray[0];
    const lastName = textArray[1];


    Meteor.call('studentGroup.addStudent', firstName, lastName, this.props.studentGroupName, this.props.studentGroupID, function(error, result) {
      if (error) {
        alert(error);
      } else {
        // console.log('studentGroup.addStudent successful', result);
        const fetchedStudentArray = this.getStudentsInClient();
        this.setState({ studentArray: fetchedStudentArray });
      }
    }.bind(this));
  }

  deleteThisStudent(studentFirstName, studentLastName) {
    Meteor.call('studentGroup.removeStudent', studentFirstName, studentLastName,
      this.props.studentGroupName, this.props.studentGroupID, function(error, result) {
        if (error) {
          alert(error);
        } else {
          // console.log('studentGroup.removeStudent successful', result);
          const fetchedStudentArray = this.getStudentsInClient();
          this.setState({ studentArray: fetchedStudentArray });
        }
      }.bind(this));
  }

  handleStudentClick(studentFirstName, studentLastName) {
    // console.log('handleStudentClick: ', studentFirstName, ' ', studentLastName);
    this.setState({ changesSaved: false });
  }

  handleGoToMainView() {
    this.props.cbGoToMainViewClicked();
  }

  sortArrayAccordingToLastName(a, b) {
    let textA = a.lastName.toUpperCase();
    let textB = b.lastName.toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  }

  renderStudentGroup() {
    if (this.state.studentArray == null ||
        this.state.studentArray === undefined ||
        this.state.studentArray.length === 0) {
      return (<h4>No students listed as enrolled in this class.</h4>);
    }
    let filteredStudents = Array.from(this.state.studentArray);
    filteredStudents = filteredStudents.sort(this.sortArrayAccordingToLastName);
    // console.log('Meteor.userId()', Meteor.userId());
    // console.log('Meteor.user().username', Meteor.user().username);
    /*
    Meteor.userId() PqP3YjyPkHSxQMCJ3
    EditStudentGroup.jsx:33 Meteor.user().username hkajava
    */
    /*
    let filteredStudents = StudentGroups.find({
      studentGroupName: this.props.studentGroupName,
    }).fetch();

    if (this.state.hideAbsent) {
      filteredStudents = filteredStudents.filter(student => !student.checked);
    }
    */

    return filteredStudents.map((student) => {
      // const currentUserId = this.props.currentUser && this.props.currentUser._id;
      // const showPrivateButton = task.owner === currentUserId;
      return (
        <Student
          key={this.props.studentGroupID + student.firstName + student.lastName}
          studentGroupID={this.props.studentGroupID}
          studentGroupName={this.props.studentGroupName}
          studentID={this.props.studentGroupID + student.firstName + student.lastName}
          studentFirstName={student.firstName}
          studentLastName={student.lastName}
          cbClick={this.handleStudentClick}
          cbDelete={this.deleteThisStudent}
        />
      );
    });
  }

  render() {
    // Give studentGroups a different className when they are checked off,
    // so that we can style them nicely in CSS
    /*
    const studentGroupClassName = classnames({
      checked: this.props.studentGroup.checked,
      private: this.props.studentGroup.private,
    });
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
        {this.renderStudentGroup()}
    */
    return (
      <div>
        <span>
          <h3>{this.props.studentGroupName}</h3>
          <button className="goToMainViewButton" onClick={this.handleGoToMainView}>
            Go To Main View
          </button>
        </span>
        { this.props.currentUser ?
          <form className="new-studentToClass" onSubmit={this.addStudentToClass} >
            <input
              type="text"
              ref={node => this.textInput = node}
              placeholder={this.state.placeholderForEnteringNewStudentToClass}
              onFocus={() => this.placeholderOnFocus()}
              onBlur={() => this.placeholderOnBlur()}
            />
          </form> : ''
        }
        {this.renderStudentGroup()}
      </div>
    );
  }
}

EditStudentGroup.propTypes = {

  // This component gets the studentGroup to display through a React prop.
  // We can use propTypes to indicate it is required
  // studentGroup: PropTypes.object.isRequired,
  // key: PropTypes.string.isRequired,
  studentGroupID: PropTypes.string.isRequired,
  studentGroupName: PropTypes.string.isRequired,
  currentUser: PropTypes.object.isRequired,
  cbGoToMainViewClicked: PropTypes.func.isRequired,
  // showPrivateButton: PropTypes.bool.isRequired,

};
