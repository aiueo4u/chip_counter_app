import React, { Component } from 'react';
import { connect } from 'react-redux';
import GameTable from './components/GameTable';
import Player from './components/Player';
import {
  addChip,
  betAction,
  callAction,
  foldAction,
  checkAction,
  playerActionReceived,
  gameHandActionReceived,
  gameHandFinishedReceived,
} from './data/actions.js';
import CircularProgress from 'material-ui/CircularProgress';
import Information from './components/Information';
import GameDialog from './components/GameDialog';
import ActionCable from 'actioncable';
import { WEBSOCKET_ENDPOINT } from './../../../../Configuration.js'; // TODO: 何とか良い感じに参照したい。。

const gameStartButtonClicked = (tableId) => {
  return { type: "GAME_START_BUTTON_CLICKED", tableId: tableId };
}

class Room extends Component {
  componentDidMount() {
    const { match, onGameHandFinishedReceived, onGameHandActionReceived, onPlayerActionReceived } = this.props;

    // action cable setup
    this.App = {}
    const jwt = localStorage.getItem('playerSession.jwt');
    this.App.cable = ActionCable.createConsumer(`${WEBSOCKET_ENDPOINT}/cable?jwt=${jwt}`);

    let tableId = match.params.id;

    this.App.ChipChannel = this.App.cable.subscriptions.create({ channel: 'ChipChannel', tableId: tableId }, {
      connected() { console.log("Chip Channel connected") },
      disconnected() { console.log("Chip Channel disconnected") },
      received(data) {
        console.log("Chip Channel received", data)
        if (data.type === 'player_action') {
          onPlayerActionReceived(data);
        } else if (data.type === 'game_hand') {
          onGameHandActionReceived(data);
        } else if (data.type === 'game_hand_finished') {
          onGameHandFinishedReceived(data)
        }
      },
      rejected(data) { console.log("Chip Channel rejected", data) },
    });
  }

  componentWillUnmount() {
    this.App.ChipChannel.unsubscribe();
  }

  render() {
    const { playerSession, onFoldAction, onCheckAction, buttonSeatNo, currentSeatNo, gameHandState, onGameStart, players, tableId, tableName, onAddChip, onCallAction, onBetAction, pot, isReady, informationItems } = this.props

    let isSeated = players.find(player => player.id === playerSession.playerId) ? true : false

    return (!isReady) ? (
      <div>
        <CircularProgress />
      </div>
    ) : (
      <div>
        <GameDialog tableId={tableId} />
        <GameTable
          tableName={tableName}
          tableId={tableId}
          pot={pot}
          onGameStart={onGameStart}
          gameHandState={gameHandState}
          players={players}
          playerSession={playerSession}
          currentSeatNo={currentSeatNo}
          buttonSeatNo={buttonSeatNo}
          isSeated={isSeated}
        />
        {players.map(player => {
          return playerSession.playerId === player.id ? (
            <Player
              key={player.id}
              player={player}
              onAddChip={onAddChip}
              onCheckAction={onCheckAction}
              onBetAction={onBetAction}
              onCallAction={onCallAction}
              onFoldAction={onFoldAction}
              yourTurn={currentSeatNo === player.seat_no}
              pot={pot}
            />
          ) : (<div key={player.id}></div>)
        })}
        <Information informationItems={informationItems} tableId={tableId} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { Room } = state.scenes.Tables;
  const tableId = ownProps.match.params.id;

  return {
    tableId: tableId,
    tableName: tableId, // TODO
    players: Room.Players,
    pot: Room.GameTable.pot,
    playerSession: state.data.playerSession,
    isReady: Room.GameTable.isReady,
    informationItems: state.scenes.Tables.Room.Information.informationItems,
    onAddChip: (playerId, amount) => {
      return addChip(tableId, playerId, amount);
    },
    onCheckAction: (playerId) => {
      return checkAction(tableId, playerId);
    },
    onFoldAction: (playerId) => {
      return foldAction(tableId, playerId);
    },
    onCallAction: (playerId) => {
      return callAction(tableId, playerId);
    },
    onBetAction: (playerId, amount) => {
      return betAction(tableId, playerId, amount);
    },
    gameHandState: Room.GameTable.gameHandState,
    currentSeatNo: Room.GameTable.currentSeatNo,
    buttonSeatNo: Room.GameTable.buttonSeatNo,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const tableId = ownProps.match.params.id;

  return {
    onGameHandFinishedReceived: (data) => {
      dispatch(gameHandFinishedReceived());
    },
    onGameHandActionReceived: (data) => {
      dispatch(gameHandActionReceived(data.pot, data.players));
    },
    onPlayerActionReceived: (data) => {
       dispatch(playerActionReceived(data.pot, data.game_hand_state, data.players, data.current_seat_no, data.button_seat_no));
    },
    onGameStart: () => {
       dispatch(gameStartButtonClicked(tableId));
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Room);
