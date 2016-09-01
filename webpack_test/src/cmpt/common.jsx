import { Component, PropTypes} from 'react';
import { Link } from 'react-router';
import style from '../css/style.scss';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
//import {darkWhite, lightWhite, grey900} from 'material-ui/styles/colors';
import AppBar from 'material-ui/AppBar';

export class Layout extends Component {
  // static propTypes = {
  //   children: PropTypes.node,
  //   location: PropTypes.object,
  //   muiTheme: getMuiTheme()
  // };
  // componentWillMount() {
  //   this.setState({
  //     muiTheme: getMuiTheme(),
  //   });
  // }

  render() {
    return (
      <div>
       {/*<AppBar title='title' />*/}
      <h1>react study</h1>
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
