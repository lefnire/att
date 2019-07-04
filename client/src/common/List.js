import React, {Component} from 'react'
import moment from 'moment';
import ReactTable from 'react-table'
import {fetchDefaults, SERVER_URL, getMe, isAdmin} from '../utils'


class CommonList extends Component {
  state = {
    list: []
  }

  filterCaseInsensitive = ({ id, value }, row) => row[id] ? row[id].toLowerCase().includes(value.toLowerCase()) : true

  componentDidMount() {
    fetch(`${SERVER_URL}/case/${this.model}`, fetchDefaults())
    .then(r => r.json()).then(list => {

      list.forEach(i => {
        i.timestamp = moment.utc(i.timestamp).format('YYYY-MM-DD')
      });

      this.setState({list})
    })
  }

  getTdProps = (state, rowInfo, column, instance) => {
    return {
      onClick: (e, handleOriginal) => {
        const {id} = rowInfo.row._original
        const win = window.open(`/${this.model}/case/${id}`, '_blank');
        win.focus();
        // IMPORTANT! React-Table uses onClick internally to trigger
        // events like expanding SubComponents and pivots.
        // By default a custom 'onClick' handler will override this functionality.
        // If you want to fire the original onClick handler, call the
        // 'handleOriginal' function.
        // if (handleOriginal) {
        //   handleOriginal()
        // }
      }
    }
  }

  render() {
    const me = getMe()
    if (!isAdmin(me)) {
      return (
        <div>Must be an admin to view this list</div>
      )
    }

    return (
      <div>
        <ReactTable
          defaultSorted={[
            {id: 'timestamp', desc: true}
          ]}
          filterable={true}
          defaultFilterMethod={this.filterCaseInsensitive}
          defaultFiltered={[
            {id: 'status', value: 'pending'}
          ]}

          defaultPageSize={50}
          data={this.state.list}
          columns={this.columns}
          getTdProps={this.getTdProps}
        />
      </div>
    )
  }
}

export default CommonList;
