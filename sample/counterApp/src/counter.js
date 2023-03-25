import React from "react";

export class Counter extends React.Component {
  render() {
    return (
      <div className="counters">
        <h2 style={{color:this.props.headingColor}}>{this.props.header}</h2>
        <div className="btn-container">
          <button className="inc-button primary-btn" onClick={this.props.increment}>+</button>
          <span className="count-span">{this.props.count}</span>
          <button className="dec-button primary-btn" onClick={this.props.decrement}>-</button>
        </div>
      </div>
    );
  }
}
