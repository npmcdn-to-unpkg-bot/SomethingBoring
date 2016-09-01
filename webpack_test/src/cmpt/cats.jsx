import { Component } from 'react';
import { Link } from 'react-router';
export class Index extends Component {
  render() {
    return (
      <div>
      <h1>App</h1>

      <ul>
        <li><Link to="/about">About</Link></li>
      </ul>

      {this.props.children}
      </div>
    );
  }
}

export class About extends Component {
  render() {
    return (
      <div>About
      </div>
    );
  }
}
