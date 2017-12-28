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

const assert = require('assert');

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

describe('Testing RandomizeStudentGroup.jsx', function() {
  describe('static sortAccordingToLastName(a, b)', function() {
    it('should return 1', function() {
      // debugger;
      assert.equal(1, RandomizeStudentGroup.sortAccordingToLastName({ firstName: 'Wes', lastName: 'Montgomery' },
        { firstName: 'John', lastName: 'McLaughlinall' }));
    });
    it('should return -1', function() {
      assert.equal(-1, RandomizeStudentGroup.sortAccordingToLastName({ firstName: 'Pat', lastName: 'Metheny' },
        { firstName: 'Joe', lastName: 'Pass' }));
    });
  });
});
