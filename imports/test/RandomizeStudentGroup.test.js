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


function flatten(ary) {
  let ret = [];
  for (let i = 0; i < ary.length; i += 1) {
    if (Array.isArray(ary[i])) {
      ret = ret.concat(flatten(ary[i]));
    } else {
      ret.push(ary[i]);
    }
  }
  return ret;
}

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
        { firstName: 'Gary', lastName: 'Gregson' },
        { firstName: 'Edward', lastName: 'Woorward' },
        { firstName: 'Jimmy', lastName: 'Carter' }]));
    });
  });
  describe('static findNbrOfSmallGroups()', function() {
    test('number of present students 10, minGroupSize 3: should return nbrOfGroups 3', function() {
      // number of present students is 10
      // minGroupSize is 3
      expect(RandomizeStudentGroup.findNbrOfSmallGroups(10, 3)).toEqual(3);
    });
    test('number of present students 9, minGroupSize 3: should return nbrOfGroups 3', function() {
      // number of present students is 9
      // minGroupSize is 3
      expect(RandomizeStudentGroup.findNbrOfSmallGroups(9, 3)).toEqual(3);
    });
    test('number of present students 8, minGroupSize 3: should return nbrOfGroups 2', function() {
      // number of present students is 8
      // minGroupSize is 3
      expect(RandomizeStudentGroup.findNbrOfSmallGroups(8, 3)).toEqual(2);
    });
  });
  describe('static generateRandomGroups()', function() {
    test('number of small groups 3, number of present students 9: should return an array that contains three arrays (i.e. smallgroups)', function() {
      // numberOfGroups 3
      expect(RandomizeStudentGroup.generateRandomGroups(3, randomizedStudentArray)).toHaveLength(3);
    });
    test('number of small groups 3, number of present students 9: check that all 9 students can be found from the three subarrays', function() {
      // numberOfGroups 3
      const tempArrayOfArrays = RandomizeStudentGroup.generateRandomGroups(3,
        randomizedStudentArray);
      const tempFlatArray = flatten(tempArrayOfArrays);
      expect(tempFlatArray).toEqual(expect.arrayContaining([{ firstName: 'John', lastName: 'Doe' },
        { firstName: 'Susan', lastName: 'No' },
        { firstName: 'Steven', lastName: 'Grey' },
        { firstName: 'Adam', lastName: 'Smith' },
        { firstName: 'John', lastName: 'Smith' },
        { firstName: 'Hans', lastName: 'Zimmerman' },
        { firstName: 'Gary', lastName: 'Gregson' },
        { firstName: 'Edward', lastName: 'Woorward' },
        { firstName: 'Jimmy', lastName: 'Carter' }]));
    });
  });
});
