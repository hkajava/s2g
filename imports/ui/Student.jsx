import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

export default class Student extends Component {
  constructor(props) {
    super(props);
    this.toggleImageClicked = this.toggleImageClicked.bind(this);

    this.state = {
      checked: false,
    };
  }

  toggleStudentNameClicked() {
    this.setState({ checked: false });
    this.props.cb(this.props.studentFirstName, this.props.studentLastName);
  }

  render() {
    const studentClassName = classnames({
      checked: this.state.checked,
    });
    console.log(studentClassName);

    return (
      <button id={this.props.key} onClick={this.toggleStudentNameClicked}>
        <p>
          {this.props.studentFirstName} {this.props.studentLastName}
        </p>
      </button>

    );
  }
}

Student.propTypes = {
  // key: PropTypes.string.isRequired,
  studentFirstName: PropTypes.string.isRequired,
  studentLastName: PropTypes.string.isRequired,
  cb: PropTypes.func.isRequired,
};
