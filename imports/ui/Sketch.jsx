import React, { Component } from 'react';


export default class Sketch extends Component {
  constructor() {
    super();
    this.handleMouseMove = this.handleMouseMove.bind(this);

    this.state = {
      x: 50,
      y: 50,
    };
  }

  handleMouseMove(event) {

    const svg = document.getElementById('studentGroupAnimationSvg');
    let NS = svg.getAttribute('xmlns');

    let pt = svg.createSVGPoint();

    pt.x = event.clientX;
    pt.y = event.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    this.setState({
      x: svgP.x,
      y: svgP.y,
    });
  }

  render() {
    return (
      <svg
        width="640"
        height="600"
        onMouseMove={this.handleMouseMove}
        style={{ border: 'solid black 1px' }}
        id="studentGroupAnimationSvg"
      >
        { /**  <text
          x="0"
          y="35"
          fontFamily="Verdana"
          fontSize="35"
        >
          x: {this.state.x}
          y: {this.state.y}
        </text>
        <circle
          cx={this.state.x}
          cy={this.state.y}
          r="30"
          stroke="black"
          fill="yellow"
        />

        */ }
        <g>
          <rect
            x="50"
            y="50"
            width="200"
            height="30"
            stroke="black"
            fill="red"
          />
          <text
            x="70"
            y="70"
            fontFamily="Verdana"
            fontSize="20"
            fill="black"
          >
            Peter Handerson
          </text>
          <path
            d="M10, 50 q30,30 100, 0 q60, -50 100,0"
            id="theMotionPath"
            style={{ fill: 'solid', stroke: 'black', strokeWidth: 7, strokeLinecap: 'round' }}
          />
          <animateMotion
            begin="0s"
            dur="10s"
            repeatCount="indefinite"
            rotate="auto"
          >
            <mpath xlinkHref="#theMotionPath" />
          </animateMotion>
        </g>
      </svg>
    );
  }
}
