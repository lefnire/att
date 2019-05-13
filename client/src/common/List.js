import React, {Component} from 'react'
import {Badge, Table} from 'reactstrap'
import {Link} from 'react-router-dom'
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

  goto = row => () => {
    window.location = `/${this.model}/case/${row.id}`
  }

  renderRow = row => {
    return <tr onClick={this.goto(row)}>
      {this.table.map(col => <td>{col.render ? col.render(row[col.k]) : row[col.k]}</td>)}
    </tr>
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
        <Table size="sm" hover>
          <thead>
            <tr color='success'>
              {this.table.map(col => <th>{col.v}</th>)}
            </tr>
          </thead>
          <tbody>{this.state.list.map(this.renderRow)}</tbody>
        </Table>
      </div>
    )
  }
}

export default CommonList;
