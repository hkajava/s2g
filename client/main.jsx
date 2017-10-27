import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';

import App from '../imports/ui/App.jsx';
// import MealPlanner from '../imports/ui/WeekDay.jsx';
import '../imports/startup/accounts-config.js';

Meteor.startup(() => {
  render(<App />, document.getElementById('render-target-app'));
  // render(<Weekday />, document.getElementById('render-target-weekday'));
});
