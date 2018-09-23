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
import TableList from './scenes/Tables/components/TableList';
import Room from './scenes/Tables/components/Room';
import CircularProgress from '@material-ui/core/CircularProgress';
import { DragDropContext } from 'react-dnd';
import TouchBackend from 'react-dnd-touch-backend';

function parse_query_string(query) {
  if (!query) {
    return {}
  }
  var vars = query.split("&");
  var query_string = {};
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
      query_string[pair[0]] = arr;
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
}

class App extends Component {
  componentWillMount() {
    let url = new URL(window.location.href);

    if (url.searchParams) {
      let jwt = url.searchParams.get('jwt')
      if (jwt) {
        localStorage.setItem('playerSession.jwt', jwt)
        // ブラウザのアドレスバーからJWTパラメータを削除する
        window.history.replaceState({}, "remove JWT", url.href.split('?')[0]);
      }
    } else {
      let parsed = parse_query_string(window.location.href.split('?')[1])
      if (parsed.jwt) {
        localStorage.setItem('playerSession.jwt', parsed.jwt)
        // ブラウザのアドレスバーからJWTパラメータを削除する
        window.history.replaceState({}, "remove JWT", url.href.split('?')[0]);
      }
    }

    // ログイン前のページへとリダイレクトさせる
    let jwt = localStorage.getItem('playerSession.jwt')
    let redirectTo = sessionStorage.getItem('redirectTo')
    sessionStorage.removeItem('redirectTo');
    if (jwt && redirectTo) {
      window.location = redirectTo;
    } else {
      this.props.dispatch({ type: "FETCH_PLAYER" });
    }
  }

  render() {
    const { isPrepared } = this.props;

    return isPrepared ? (
      <div style={{
        'position': 'fixed',
        'display': 'flex',
        'flexDirection': 'column',
        'width': '100%',
        'height': '100%',
        'margin': 0,
      }}>
        <Router>
          <div>
            <PrivateRoute exact path="/" component={Home} />
            <Route path="/login" component={Login} />
            <PrivateRoute path="/newTable" component={Lobby} />
            <PrivateRoute exact path="/tables" component={TableList} />
            <PrivateRoute path="/tables/:id" component={Room} />
          </div>
        </Router>
      </div>
    ) : (
      <div style={{
        position: 'relative',
          width: '100%',
          height: '100%',
      }}>
        <div style={{
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          width: '80%',
          height: '30%',
          position: 'absolute',
          margin: 'auto',
          textAlign: 'center',
        }}>
          <CircularProgress thickness={10} size={100} />
          <div>Loading Player Data...</div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    isPrepared: state.data.playerSession.isPrepared,
  }
}

export default DragDropContext(TouchBackend)(connect(mapStateToProps)(App));
