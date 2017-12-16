// import React from 'react';
// import { shallow, mount, render } from 'enzyme';
jest.mock('meteor/meteor');
jest.mock('../api/studentGroups.js', () => ({
}));
// import PropTypes from 'prop-types'; // ES6
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import RandomizeStudentGroup from '../ui/RandomizeStudentGroup.jsx';

configure({ adapter: new Adapter() });

// debugger;

let randomizedStudentArray = [{ firstName: 'John', lastName: 'Doe' },
  { firstName: 'Susan', lastName: 'No' },
  { firstName: 'Steven', lastName: 'Grey' },
  { firstName: 'Adam', lastName: 'Smith' },
  { firstName: 'John', lastName: 'Smith' },
  { firstName: 'Hans', lastName: 'Zimmerman' },
  { firstName: 'Edward', lastName: 'Woorward' },
  { firstName: 'Gary', lastName: 'Gregson' },
  { firstName: 'Jimmy', lastName: 'Carter' }];


/*
function cbMock() { return "hello"; };


const props = { studentGroupID: 'aaabbbccc',
  studentGroupName: 'test studentGroupName',
  currentUser: {},
  cbGoToMainViewClicked: cbMock,
};

const app = shallow(<RandomizeStudentGroup {...props} />);
*/
// let rSG = new RandomizeStudentGroup.constructor();

beforeEach(() => {
  randomizedStudentArray = [{ firstName: 'John', lastName: 'Doe' },
    { firstName: 'Susan', lastName: 'No' },
    { firstName: 'Steven', lastName: 'Grey' },
    { firstName: 'Adam', lastName: 'Smith' },
    { firstName: 'John', lastName: 'Smith' },
    { firstName: 'Hans', lastName: 'Zimmerman' },
    { firstName: 'Edward', lastName: 'Woorward' },
    { firstName: 'Gary', lastName: 'Gregson' },
    { firstName: 'Jimmy', lastName: 'Carter' }];
});

describe('Testing RandomizeStudentGroup.jsx', function() {
  describe('static randomizeStudentArray()', function() {
    test('should return array of length 9', function() {
      expect(RandomizeStudentGroup.randomizeStudentArray(randomizedStudentArray)).toHaveLength(9);
    });
    test('should return array containing all the 9 students that were in initial array', function() {
      expect(RandomizeStudentGroup.randomizeStudentArray(
        randomizedStudentArray)).toEqual(expect.arrayContaining([{ firstName: 'John', lastName: 'Doe' },
        { firstName: 'Susan', lastName: 'No' },
        { firstName: 'Steven', lastName: 'Grey' },
        { firstName: 'Adam', lastName: 'Smith' },
        { firstName: 'John', lastName: 'Smith' },
        { firstName: 'Hans', lastName: 'Zimmerman' },
        { firstName: 'Edward', lastName: 'Woorward' },
        { firstName: 'Gary', lastName: 'Gregson' },
        { firstName: 'Jimmy', lastName: 'Carter' }]));
    });
  });
});
