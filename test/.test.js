import { sumtwonumbers } from '../imports/ui/WeekDay.jsx';


const assert = require('assert');

/**
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1, 2, 3].indexOf(4));
    });
  });
});
*/
describe('Testing WeekDay.jsx', function() {
  describe('sumtwonumbers', function() {
    it('should return 14', function() {
      assert.equal(14, sumtwonumbers(10, 4));
    });
  });
  it('should not return 14', function() {
    assert.notEqual(14, sumtwonumbers(4, 4));
  });
});
