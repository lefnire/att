import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import ReactTable from 'react-table'
import {fetchDefaults, SERVER_URL, getMe, isAdmin} from '../utils'


class CommonList extends Component {
  state = {
    list: []
  }

  componentDidMount() {
    fetch(`${SERVER_URL}/case/${this.model}`, fetchDefaults())
    .then(r => r.json()).then(list => {
      this.setState({list})
    })
  }

  getTdProps = (state, rowInfo, column, instance) => {
    return {
      onClick: (e, handleOriginal) => {
        const {id} = rowInfo.row._original
        window.location = `/${this.model}/case/${id}`
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
          filterable={true}
          data={this.state.list}
          columns={this.columns}
          getTdProps={this.getTdProps}
        />
      </div>
    )
  }
}

export default CommonList;
