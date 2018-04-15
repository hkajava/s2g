import React, { Component } from 'react';
import PropTypes from 'prop-types'; // ES6
import { Meteor } from 'meteor/meteor';
import Slider from 'react-rangeslider';
// To include the default styles
import 'react-rangeslider/lib/index.css';
// typical import
import { TweenMax } from 'gsap';
// import { Button } from 'reactstrap';

import Student from './Student.jsx';
import { StudentGroups } from '../api/studentGroups.js';

let globalAnimatedStudentArray = []; /* keep track of students that have been animated */

const exampleStudentGroup = [
  { absent: false,
    firstName: 'Peter',
    lastName: 'Helmerson',
  },
  { absent: false,
    firstName: 'Pertti',
    lastName: 'Kerttula',
  },
  { absent: false,
    firstName: 'Maija',
    lastName: 'Tuununen',
  },
  { absent: false,
    firstName: 'Helena',
    lastName: 'Riippala',
  },
  { absent: false,
    firstName: 'Jussi',
    lastName: 'Mäkikukka',
  },
  { absent: false,
    firstName: 'Joonas',
    lastName: 'Ryntynen',
  },
  { absent: false,
    firstName: 'Herbert',
    lastName: 'Granqvist',
  },
  { absent: false,
    firstName: 'Hanna',
    lastName: 'Kanttula',
  },
  { absent: false,
    firstName: 'Olli',
    lastName: 'Hontio',
  },
  { absent: false,
    firstName: 'Tiina',
    lastName: 'Jyväläinen',
  },
  { absent: false,
    firstName: 'Riina',
    lastName: 'Paanala',
  },
  { absent: false,
    firstName: 'Ulla',
    lastName: 'Runtula',
  },
  { absent: false,
    firstName: 'Kari',
    lastName: 'Haarala',
  },
  { absent: false,
    firstName: 'Hannu',
    lastName: 'Patala',
  },
  { absent: false,
    firstName: 'Joe',
    lastName: 'Schmuck',
  },
  { absent: false,
    firstName: 'Peter',
    lastName: 'Johnson',
  },
  { absent: false,
    firstName: 'Greta',
    lastName: 'Gibbons',
  },
];

// RandomizeStudentGroup component - show a list of students belonging
// to a course. Those that are not present today can be deselected.
// The remaining students that are present in the class can be split
// randomly into small groups.
export default class RandomizeStudentGroup extends Component {
  // TODO, should ES6 international collation features be used
  // here to get alphabets correctly sorted?
  // With brief testing it looks like Finnish alphabets (ä,ö) work correctly
  static sortAccordingToLastName(a, b) {
    const textA = a.lastName.toUpperCase();
    const textB = b.lastName.toUpperCase();


    if (textB > textA) {
      return -1;
    } else if (textA > textB) {
      return 1;
    }
    return 0;
  }

  // New algorithm
  static randomizeArray(studentArray) {
    const randomizedStudentArray = [];

    for (let i = 0; i < studentArray.length;) {
      // take one student randomly
      const removedIndex = Math.floor(Math.random() * studentArray.length);
      const tempStudent = studentArray[removedIndex];

      // ... and put it to randomized array
      randomizedStudentArray.push(tempStudent);

      // time to remove student from original array
      studentArray.splice(removedIndex, 1);
    }
    return randomizedStudentArray;
  }

  // New algorithm
  static findNbrOfSmallGroups(nbrPresentStudents, minGroupSize) {
    // debugger;
    if (nbrPresentStudents < 2 * minGroupSize) {
      // there is not enough present students to divide them into small groups.
      return 1;
    }
    let nbrOfGroups = 0;
    if (nbrPresentStudents % minGroupSize === 0) {
      nbrOfGroups = (nbrPresentStudents / minGroupSize);
      return nbrOfGroups;
    }
    // + 1 will make for example of 15 presents students and desired group size 4,
    // 3 groups of 4 students and 1 group of 3 students. That is the
    // use case from teacher Javier Ramos Lázaro
    nbrOfGroups = Math.floor(nbrPresentStudents / minGroupSize);
    if (nbrPresentStudents % minGroupSize !== 0 &&
        minGroupSize > 3) {
      nbrOfGroups += 1;
    }
    return nbrOfGroups;
  }

  static generateRandomGroups(numberOfGroups, randomizedStudentArray) {
    const studentArrayOfArrays = [];
    for (let i = 0, j = 0; i < randomizedStudentArray.length; i += 1) {
      // take one student and put into small group
      if (studentArrayOfArrays[j] === undefined) {
        studentArrayOfArrays[j] = [];
      }
      studentArrayOfArrays[j].push(randomizedStudentArray[i]);
      if (j === numberOfGroups - 1) {
        j = 0;
      } else {
        j += 1;
      }
    }

    return studentArrayOfArrays;
  }

  constructor(props) {
    super(props);

    this.handleStudentClick = this.handleStudentClick.bind(this);
    this.getStudentsInClient = this.getStudentsInClient.bind(this);
    this.deleteThisStudent = this.deleteThisStudent.bind(this);
    this.handleGoToListView = this.handleGoToListView.bind(this);
    this.handleGoToMainView = this.handleGoToMainView.bind(this);
    this.randomizeStudentGroup = this.randomizeStudentGroup.bind(this);
    this.updateStudentCounts = this.updateStudentCounts.bind(this);

    this.renderStudentSmallGroups = this.renderStudentSmallGroups.bind(this);
    this.renderStudentGroup = this.renderStudentGroup.bind(this);
    this.renderStudentSmallGroupContainers = this.renderStudentSmallGroupContainers.bind(this);

    this.animateOneStudent = this.animateOneStudent.bind(this);
    this.animateStudents = this.animateStudents.bind(this);

    this.onMouseMove = this.onMouseMove.bind(this);

    const fetchedStudentArray = this.getStudentsInClient();
    // add local state variable to track absent students for this
    // particular class session. Initialize to false so that all students
    // are assumed to be present until teacher goes through attendance
    // and checks off those that are not present.
    for (let i = 0; i < fetchedStudentArray.length; i += 1) {
      fetchedStudentArray[i].absent = false;
    }

    this.state =
    {
      x: 0,
      y: 0,
      selectedView: 'listView',
      selectedAlgorithm: 'threeFourAlgorithm',
      studentArray: fetchedStudentArray,
      randomizedStudentArrayOfArrays: [],
      placeholderForEnteringNewStudentToClass: 'Add student',
      minGroupSize: 4, /* default value when starting application */
      nbrEnrolledStudents: fetchedStudentArray.length,
      nbrPresentStudents: fetchedStudentArray.length,
      nbrAbsentStudents: 0 };
  }

  componentDidUpdate() {
    this.animateStudents();
  }

  onMouseMove(e) {
    this.setState({ x: e.screenX, y: e.screenY });
  }

  getStudentsInClient() {
    if (this.props.currentUser.user === 'exampleUser') {
      // user is not logged in
      // show example group to let user experiment and
      // avoid signup wall
      return exampleStudentGroup;
    }

    let currentStudentArray = [];
    const query = {};
    query.studentGroupName = this.props.studentGroupName;
    const currentStudentGroup = StudentGroups.findOne(query);

    if (currentStudentGroup === undefined ||
        currentStudentGroup === null) {
      currentStudentArray = [];
    }

    if (currentStudentGroup.students !== undefined &&
        currentStudentGroup.students !== null) {
      currentStudentArray = Array.from(currentStudentGroup.students);
    }
    return currentStudentArray;
  }


  handleSliderChange = (value) => {
    this.setState({
      minGroupSize: value,
    });
  }

  updateRandomizeStatistic() {
    Meteor.call('studentGroups.updateRandomizeStatistic', this.props.studentGroupID, function(error, result) {
      if (error) {
        alert(error);
      } else {
        // console.log('incremented randomization count for a student group', result);
      }
    });
    mixpanel.track('User pressed randomize button.'); // eslint-disable-line no-undef
  }

  randomizeStudentGroup() {
    let tempStudentArrayOfArrays = [];
    let nbrOfSmallGroups = 0;
    let tempStudentArray = [];

    // debugger;

    // only take into account students that are present
    for (let i = 0; i < this.state.studentArray.length; i += 1) {
      if (this.state.studentArray[i].absent === false) {
        tempStudentArray.push(this.state.studentArray[i]);
      }
    }

    tempStudentArray = RandomizeStudentGroup.randomizeArray(tempStudentArray);
    nbrOfSmallGroups = RandomizeStudentGroup.findNbrOfSmallGroups(this.state.nbrPresentStudents,
      this.state.minGroupSize);
    tempStudentArrayOfArrays = RandomizeStudentGroup.generateRandomGroups(nbrOfSmallGroups,
      tempStudentArray);

    // Randomize the order of small groups. For example if there would be
    // 19 present students and minGroupSize 3, there would be 5 groups of three
    // and 1 groups of four. But that group of four with this algorithm would
    // always be groups number 1. And that doesn't look random (even though in a
    // sense the students have been divided to random groups)
    tempStudentArrayOfArrays = RandomizeStudentGroup.randomizeArray(tempStudentArrayOfArrays);

    let tempArray = new Array(nbrOfSmallGroups);
    tempArray = tempArray.fill(0);

    // update global array
    // not in state because that would result in forever update loop
    globalAnimatedStudentArray = Array.from(tempArray);

    this.setState({
      selectedView: 'randomizedView',
      randomizedStudentArrayOfArrays: tempStudentArrayOfArrays,
    });

    // update statistics counter that is used to monitor how much s2g app is actually used
    if (this.props.loggedIn) {
      this.updateRandomizeStatistic();
    }
  }

  // deleteThisStudent is not used currently in RandomizeStudentGroup
  deleteThisStudent(studentFirstName, studentLastName,
    studentGroupID, studentGroupName) {
    Meteor.call('studentGroup.removeStudent', studentFirstName, studentLastName,
      studentGroupName, studentGroupID, function(error, result) {
        if (error) {
          alert(error);
        } else {
          // console.log('studentGroup.removeStudent successful', result);
          const fetchedStudentArray = this.getStudentsInClient();
          this.setState({ studentArray: fetchedStudentArray });
        }
      }.bind(this));
  }

  // TODO: perhaps some other data structure than array could be used
  // for storing students. That way these loopings would not be needed
  // to write into functions. Investigate if Map datatype would be good.
  // It could give item based on key and it is iterable.
  findStudentIndex(studentFirstName, studentLastName) {
    const tempStudentArray = Array.from(this.state.studentArray);
    for (let i = 0; i < this.state.studentArray.length; i += 1) {
      if (tempStudentArray[i].firstName === studentFirstName &&
          tempStudentArray[i].lastName === studentLastName) {
        return i;
      }
    }
    return null;
  }

  updateStudentCounts() {
    let tempNbrPresentStudents = 0;
    let tempNbrAbsentStudents = 0;
    for (let i = 0; i < this.state.studentArray.length; i += 1) {
      if (this.state.studentArray[i].absent === false) {
        tempNbrPresentStudents += 1;
      } else {
        tempNbrAbsentStudents += 1;
      }
    }
    this.setState({ nbrPresentStudents: tempNbrPresentStudents,
      nbrAbsentStudents: tempNbrAbsentStudents });
  }

  handleStudentClick(studentFirstName, studentLastName,
    studentGroupID, studentGroupName) {
    /* console.log('handleStudentClick: ', studentFirstName, ' ',
    studentLastName,' ', studentGroupID, ' ', studentGroupName);
    */
    const tempStudentArray = Array.from(this.state.studentArray);
    const tempIndex = this.findStudentIndex(studentFirstName, studentLastName);

    if (tempIndex !== null) {
      tempStudentArray[tempIndex].absent = !tempStudentArray[tempIndex].absent;
      this.setState({ studentArray: tempStudentArray });
      this.updateStudentCounts();
    }
  }

  handleGoToMainView() {
    this.props.cbGoToMainViewClicked();
  }

  handleGoToListView() {
    this.setState({ selectedView: 'listView' });
  }

  renderSliderForMinGroupSize() {
    const horizontalLabels = {
      1: '1',
      5: '5',
      10: '10',
    };

    return (
      <div className="sliderComboCSSGridWrapper">
        <br />
        <div className="gridItem_Instructions_sliderComboCSSGridWrapper" >
          Desired group size:
        </div>
        <div className="gridItem_Slider_sliderComboCSSGridWrapper" >
          <Slider
            value={this.state.minGroupSize}
            orientation="horizontal"
            labels={horizontalLabels}
            min={1}
            max={10}
            onChange={this.handleSliderChange}
          />
        </div>
        <div className="gridItem_NumberBox_sliderComboCSSGridWrapper" >
          <div className="numberBox" >
            {this.state.minGroupSize}
          </div>
        </div>
      </div>);
  }

  renderStudentGroup(studentArrayParam, studentCanBeClickedParam) {
    if (this.state.studentArray == null ||
        this.state.studentArray === undefined ||
        this.state.studentArray.length === 0) {
      return (<h4>No students listed as enrolled in this class.</h4>);
    }
    let filteredStudents = Array.from(studentArrayParam);
    filteredStudents = filteredStudents.sort(RandomizeStudentGroup.sortAccordingToLastName);

    const studentsPerColumn = 8;
    const vDistance = 30;
    const hDistance = 200;

    return filteredStudents.map((student, index) => {
      // switch to next row if more than studentsPerColumn
      const x = parseInt(index / studentsPerColumn, 10) * hDistance;
      const y = (index * vDistance) - (parseInt(index / studentsPerColumn, 10) * studentsPerColumn * vDistance);
      return (
        <foreignObject
          id={'FOR' + this.props.studentGroupID + student.firstName + student.lastName}
          key={this.props.studentGroupID + student.firstName + student.lastName}
          x={x}
          y={y}
          width="150px"
          height="30px"
        >
          <Student
            key={this.props.studentGroupID + student.firstName + student.lastName}
            studentGroupID={this.props.studentGroupID}
            studentGroupName={this.props.studentGroupName}
            studentID={this.props.studentGroupID + student.firstName + student.lastName}
            studentFirstName={student.firstName}
            studentLastName={student.lastName}
            studentAbsent={student.absent}
            studentCanBeClicked={studentCanBeClickedParam}
            parentView="RandomizeStudentGroup"
            cbClick={this.handleStudentClick}
            cbDelete={this.deleteThisStudent}
          />
        </foreignObject>
      );
    });
  }

  renderStudentSmallGroupContainers() {
    if (this.state.randomizedStudentArrayOfArrays == null ||
        this.state.randomizedStudentArrayOfArrays === undefined ||
        this.state.randomizedStudentArrayOfArrays.length === 0) {
      return (<h4>ERROR: Small groups were empty.</h4>);
    }
    const tempArrayOfArrays = this.state.randomizedStudentArrayOfArrays;

    let returnString = '';
    const groupsPerRow = 4;

    // offset to leave room for student list
    // TODO: make these into responsive units
    const vDistanceOffset = 270;
    const vDistance = 270;
    const hDistance = 200;

    const containerHandle = document.getElementById('studentListRandomizeStudentGroupCSSGridWrapperId').getBoundingClientRect();
    const containerWidth = containerHandle.width;
    // const containerHeight = containerHandle.height;
    const groupWidth = (containerWidth / groupsPerRow) - 150;
    // const groupInitialHeight = groupPosition.height;
    const groupInitialHeight = '250';
    // console.log('groupWidth: ' + groupWidth);
    // console.log('groupInitialHeight: ' + groupInitialHeight);

    return tempArrayOfArrays.map((studentSmallGroup, index) => {
      const currentColumn = index % groupsPerRow;
      const currentRow = parseInt((index / groupsPerRow), 10);
      const x = currentColumn * hDistance;
      const y = (currentRow * vDistance) + vDistanceOffset;

      const tempGroupNumber = index + 1;
      returnString = `Group ${tempGroupNumber} `;
      return (
        <foreignObject
          key={returnString}
          id={returnString}
          x={x}
          y={y}
          width={groupWidth}
          height={groupInitialHeight}
        >
          <div
            className="smallGroup"
            key={returnString}
          >
            <h3>{returnString}</h3>
          </div>
        </foreignObject>
      );
    });
  }

  renderStudentSmallGroups() {
    if (this.state.randomizedStudentArrayOfArrays == null ||
        this.state.randomizedStudentArrayOfArrays === undefined ||
        this.state.randomizedStudentArrayOfArrays.length === 0) {
      return (<h4>ERROR: Small groups were empty.</h4>);
    }
    const tempArrayOfArrays = this.state.randomizedStudentArrayOfArrays;

    let returnString = '';

    return tempArrayOfArrays.map((studentSmallGroup, index) => {
      const tempGroupNumber = index + 1;
      returnString = `Group ${tempGroupNumber} `;
      return (<div className="smallGroup" key={returnString}> <h3>{returnString}</h3>{this.renderStudentGroup(tempArrayOfArrays[index], false)} </div>);
    });
  }

  animateOneStudent(studentNameId, smallGroupNbr) {
    this.yes = 'no';

    const studentGroupId = `Group ${smallGroupNbr} `;

    const studentNameElement = document.getElementById(studentNameId);
    const initialStudentNamePositionX = studentNameElement.getAttribute('x');
    const initialStudentNamePositionY = studentNameElement.getAttribute('y');

    const studentGroupElement = document.getElementById(studentGroupId);
    const groupPositionX = studentGroupElement.getAttribute('x');
    const groupPositionY = studentGroupElement.getAttribute('y');

    const verticalOffsetForGroupTitle = 50;

    // absolute target positions are not supported in TweenMax.to()
    // see https://greensock.com/forums/topic/15731-animating-to-an-absolute-position/
    const newRelativeStudentNamePositionX = groupPositionX - initialStudentNamePositionX;
    let newRelativeStudentNamePositionY =
      (groupPositionY - initialStudentNamePositionY) + verticalOffsetForGroupTitle;

    // let's add offset to fit students into target group (otherwise all
    // students belonging to same small group would be in one pile)
    const verticalOffsetBetweenStudents = 40;
    newRelativeStudentNamePositionY +=
      globalAnimatedStudentArray[(smallGroupNbr - 1)] * verticalOffsetBetweenStudents;

    /*
    const groupPosition = document.getElementById(studentGroupId).getBoundingClientRect();
    const groupPositionX = groupPosition.x;
    const groupPositionY = groupPosition.y;
    const groupPositionLeft = groupPosition.left;
    const groupPositionTop = groupPosition.top;
    const groupPositionRight = groupPosition.right;
    const groupPositionBottom = groupPosition.bottom;
    const groupPositionWidth = groupPosition.width;
    const groupPositionHeight = groupPosition.height;
    console.log(studentGroupId + ': groupPositionX: ' + groupPositionX);
    console.log(studentGroupId + ': groupPositionY: ' + groupPositionY);
    */

    TweenMax.to(document.getElementById(studentNameId), 2,
      { x: newRelativeStudentNamePositionX, y: newRelativeStudentNamePositionY });

    // let's update indexing that is needed for positioning student name inside target group
    globalAnimatedStudentArray[(smallGroupNbr - 1)] += 1;
  }

  animateStudents() {
    if (this.state.selectedView === 'randomizedView' && this.props.currentUser) {

      this.animateOneStudent('FORExampleStudentGroupIdPerttiKerttula', '1');
      this.animateOneStudent('FORExampleStudentGroupIdUllaRuntula', '1');
      this.animateOneStudent('FORExampleStudentGroupIdOlliHontio', '1');
      this.animateOneStudent('FORExampleStudentGroupIdJoeSchmuck', '1');

      this.animateOneStudent('FORExampleStudentGroupIdMaijaTuununen', '2');
      this.animateOneStudent('FORExampleStudentGroupIdPeterJohnson', '2');
      this.animateOneStudent('FORExampleStudentGroupIdHannuPatala', '2');

      this.animateOneStudent('FORExampleStudentGroupIdHerbertGranqvist', '3');
      this.animateOneStudent('FORExampleStudentGroupIdHannaKanttula', '3');
      this.animateOneStudent('FORExampleStudentGroupIdGretaGibbons', '3');
      this.animateOneStudent('FORExampleStudentGroupIdTiinaJyväläinen', '3');

      this.animateOneStudent('FORExampleStudentGroupIdJoonasRyntynen', '4');
      this.animateOneStudent('FORExampleStudentGroupIdRiinaPaanala', '4');
      this.animateOneStudent('FORExampleStudentGroupIdPeterHelmerson', '4');

      this.animateOneStudent('FORExampleStudentGroupIdKariHaarala', '5');
      this.animateOneStudent('FORExampleStudentGroupIdJussiMäkikukka', '5');
      this.animateOneStudent('FORExampleStudentGroupIdHelenaRiippala', '5');


      // after all students have been animated to correct groups, let's move
      // the groups upwards to fill the location previously occupied by the
      // students
      /*
      this.animateOneStudent('FORExampleStudentGroupIdHerbertGranqvist', '1');
      this.animateOneStudent('FORExampleStudentGroupIdKariHaarala', '1');
      this.animateOneStudent('FORExampleStudentGroupIdPeterHelmerson', '1');
      this.animateOneStudent('FORExampleStudentGroupIdOlliHontio', '1');
      */
    }
  }

  render() {
    return (
      <div className="randomizeStudentGroupCSSGridWrapper">
        <div className="gridItem_goToMainViewButton_randomizeStudentGroupCSSGridWrapper">
          <button className="goToMainViewButton" onClick={this.handleGoToMainView}>
            MainView
          </button>
          {this.state.selectedView === 'randomizedView' &&
          this.props.currentUser &&
          <button className="goToListViewButton" onClick={this.handleGoToListView}>
            ListView
          </button>
          }
        </div>
        <div className="gridItem_studentGroupName_randomizeStudentGroupCSSGridWrapper">
          <h3>{this.props.studentGroupName}
          </h3>
          <h4>Number of present students: {this.state.nbrPresentStudents}<br />
            Number of absent students: {this.state.nbrAbsentStudents}
          </h4>
        </div>
        {this.state.selectedView === 'listView' &&
          this.props.currentUser &&
          <div className="gridItem_sliderCombo_randomizeStudentGroupCSSGridWrapper">
            {this.renderSliderForMinGroupSize()}
          </div>
        }
        <br />
        { this.props.currentUser &&
        <div className="gridItem_studentList_randomizeStudentGroupCSSGridWrapper">
          <div
            id="studentListRandomizeStudentGroupCSSGridWrapperId"
            className="studentListRandomizeStudentGroupCSSGridWrapper"
          >
            <svg
              width="1000px"
              height="800px"
            >
              { this.state.selectedView === 'listView' &&
                this.renderStudentGroup(this.state.studentArray, true)
              }
              { /* TODO: refactor into randomizedView stuff into one clause */
                this.state.selectedView === 'randomizedView' &&
                    this.renderStudentGroup(this.state.studentArray, true)
              }
              { this.state.selectedView === 'randomizedView' &&
                    this.renderStudentSmallGroupContainers()
              }
            </svg>
          </div>
        </div>
        }
        <div className="gridItem_randomizeStudentGroupButton_randomizeStudentGroupCSSGridWrapper">
          <button
            className="randomizeStudentGroupButton"
            onClick={this.randomizeStudentGroup}
          >
            {this.state.selectedView === 'listView' ?
              'Randomize!' :
              'Randomize AGAIN!' }
          </button>
        </div>
      </div>
    );
  }
}

RandomizeStudentGroup.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  studentGroupID: PropTypes.string.isRequired,
  studentGroupName: PropTypes.string.isRequired,
  currentUser: PropTypes.object.isRequired,
  cbGoToMainViewClicked: PropTypes.func.isRequired,
};
