import { connect } from 'react-redux';
import CreateTableForm from './components/CreateTableForm';

const mapStateToProps = (state, ownProps) => {
  return {
    isFetching: state.data.tables.isFetching,
    isTableCreated: state.data.tables.isTableCreated,
    tableId: state.data.tables.tableId,
  }
}

const submitCreateTableForm = (tableName, sb, bb) => {
  return { type: "CREATE_TABLE_FORM_ON_SUBMIT", tableName: tableName, sb: sb, bb: bb };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    clearForm: () => {
      dispatch({ type: "CLEAR_TABLE_FORM" })
    },
    handleSubmit: (event) => {
      event.preventDefault();
      let tableName = event.target.tableNameTextField.value.trim();
      let sb = event.target.smallBlindTextField.value.trim();
      let bb = event.target.bigBlindTextField.value.trim();
      dispatch(submitCreateTableForm(tableName, sb, bb));
    }
  }
}

const Lobby = connect(mapStateToProps, mapDispatchToProps)(CreateTableForm);

export default Lobby;
