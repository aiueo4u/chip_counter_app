import React, { Component } from 'react';
import { connect } from 'react-redux';
import './App.css';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Home from './scenes/Home/index.js';
import Login from './scenes/Login';
import Lobby from './scenes/Lobby';
import Tables from './scenes/Tables';
import AppBar from 'material-ui/AppBar';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import CircularProgress from 'material-ui/CircularProgress';

class InnerAppBar extends Component {
  render() {
    const { match, history, location, staticContext, ...rest } = this.props
    return (
      <AppBar
        {...rest}
        iconElementLeft={
          <IconMenu
            iconButtonElement={<IconButton><MenuIcon /></IconButton>}
          >
            <MenuItem primaryText="ホーム" onTouchTap={() => { history.push("/") }} />
          </IconMenu>
        }
      />
    )
  }
}

class CustomAppBar extends Component {
  render() {
    return (
      <Route path="/" render={(props) => <InnerAppBar {...props} {...this.props} />} />
    )
  }
}

class App extends Component {
  componentWillMount() {
    this.props.dispatch({ type: "INITIAL_LOGIN" });
  }

  render() {
    const { isPrepared, nickname } = this.props;

    return isPrepared ? (
      <div>
        <Router>
          <div>
            <CustomAppBar title="PPPoker Chip Manager" />
            <Route exact path="/" component={Home} />
            <Route path="/login" component={Login} />
            <PrivateRoute path="/newTable" component={Lobby} />
            <PrivateRoute path="/tables" component={Tables} />
          </div>
        </Router>
      </div>
    ) : (
      <div>
        <AppBar title="Brave call" iconElementRight={<span>Hello, {nickname}!</span>} />
        <CircularProgress />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    isPrepared: state.data.playerSession.isPrepared,
    nickname: state.data.playerSession.nickname,
  }
}

export default connect(mapStateToProps)(App);
