import fetch from 'isomorphic-fetch'
import { API_ENDPOINT } from './Configuration.js';

const send = (path, method, headers = {}, body = '') => {
  let url = `${API_ENDPOINT}${path}`;

  const jwt = localStorage.getItem('playerSession.jwt');
  if (jwt) {
    headers['PLAYER_JWT'] = jwt;
  }

  let options = { method: method, headers: headers };

  if (method === 'POST' || method === 'PUT') {
    options['body'] = body
  }

  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
}

const get = (path) => {
  return send(path, 'GET')
}

const put = (path, headers = {}, body = '') => {
  return send(path, 'PUT', {}, body)
}

const post = (path, headers = {}, body = '') => {
  return send(path, 'POST', {}, body)
}

export const updateChip = (tableId, playerId, amount) => {
  let body = new FormData();
  body.append('amount', amount);
  return put(`/tables/${tableId}/players/@me`, {}, body)
    .then(json => {
      return { json };
    })
}

export const actionToGameDealer = (action) => {
  let body = new FormData();
  for (let key in action) {
    body.append(key, action[key])
  }
  return post('/game_dealer', {}, body)
}

export const initialLogin = () => {
  return get('/players/@me')
    .then(json => {
      let playerSession = { isLoggedIn: true, nickname: json.nickname, playerId: json.player_id }
      return { json: playerSession };
    })
    .catch(error => {
      let playerSession = { isLoggedIn: false };
      return { json: playerSession };
    })
}

export const tableCreate = (tableName) => {
  let body = new FormData();
  body.append('table_name', tableName);
  return post('/tables', {}, body).then(json => { return { json } })
}

export const submitLogin = (nickname) => {
  let body = new FormData();
  body.append('nickname', nickname);
  return post('/session', {}, body).then(json => { return { json } })
}

export const tables = () => {
  return get('/tables').then(json => { return { json } })
}
