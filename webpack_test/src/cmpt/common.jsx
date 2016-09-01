import { Component } from 'react';
import { Link } from 'react-router';
import style from '../css/style.scss';

//import getMuiTheme from 'material-ui/styles/getMuiTheme'; , PropTypes
//import {darkWhite, lightWhite, grey900} from 'material-ui/styles/colors';
//import AppBar from 'material-ui/AppBar';


export class Root extends Component {
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
      <div id='root'>
       {/*<AppBar title='title' />*/}
        <div className={style.topNavWarp}>
          <Link className={style.title} to="/">rtmap前端架构</Link>
          <div className={style.topNav}>
            <Link to="env" activeClassName={style.active}>环境</Link>
            <Link to="/React">React</Link>
            <Link to="/cmpt">组件库</Link>
          </div>
        </div>
        <div className={style.bottomWarp}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
export class Home extends Component {
  render() {
    return (
      <div>Home</div>
    );
  }
}

export class About extends Component {
  render() {
    return (
      <div>About</div>
    );
  }
}

export class Bottom extends Component {
  render() {
    return (
      <div>
        <div className={style.leftNav}>
          <Link to={this.props.route.path + '/about'} activeClassName={style.active}>About</Link>
        </div>
        <div className={style.mainWarp}>
          <div className={style.main}>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
