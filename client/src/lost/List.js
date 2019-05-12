import React, {Component} from 'react'
import {Badge, Table} from 'reactstrap'
import {itemsObj} from './items'
import {Link} from 'react-router-dom'
import {fetchDefaults, SERVER_URL, getMe, isAdmin} from '../utils'


class FormList extends Component {
  state = {
    list: []
  }

  componentDidMount() {
    fetch(`${SERVER_URL}/lost`, fetchDefaults())
    .then(r => r.json()).then(list => {
      this.setState({list})
    })
  }

  goto = row => () => {
    window.location = '/form/' + row.id
  }

  renderRow = row => {
    const { timestamp, username, server, items, skills, notes, status } = row
    const itemList = items.map(i => itemsObj[i[0]]).join(', ')
    const skillList = skills.map(i => i[0]).join(', ')
    const badgeColor = {
      'pending': 'warning',
      'wip': 'success',
      'complete': 'success',
      'rejected': 'danger'
    }[status]
    return <tr onClick={this.goto(row)}>
      <td>{timestamp}</td>
      <td>{username}</td>
      <td>{server}</td>
      <td>{itemList}</td>
      <td>{skillList}</td>
      <td>{notes}</td>
      <td>
        <Badge color={badgeColor}>{status}</Badge>
      </td>
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
        <Link to={'/lost'}>Back</Link>
        <Table size="sm" hover>
          <thead>
            <tr color='success'>
              <th>Date</th>
              <th>User</th>
              <th>Server</th>
              <th>Items</th>
              <th>Skills</th>
              <th>Notes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {this.state.list.map(this.renderRow)}
          </tbody>
        </Table>
      </div>
    )
  }
}

export default FormList;
