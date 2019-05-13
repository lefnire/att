import React, {Component} from 'react'
import {Badge, Table} from 'reactstrap'
import {itemsObj} from './items'
import {Link} from 'react-router-dom'
import {fetchDefaults, SERVER_URL, getMe, isAdmin} from '../utils'
import CommonList from '../common/List'


class List extends CommonList {
  model = 'lost'

  table = [
    {k: 'timestamp', v: 'Date'},
    {k: 'username', v: 'User'},
    {k: 'server', v: 'Server'},
    {k: 'items', v: 'Items', render: (items) => {
      return items.map(i => itemsObj[i[0]]).join(', ')
    }},
    {k: 'skills', v: 'Skills', render: (skills) => {
      return skills.map(i => i[0]).join(', ')
    }},
    {k: 'notes', v: 'Notes'},
    {k: 'status', v: 'Status', render: (status) => {
      const badgeColor = {
        'pending': 'warning',
        'wip': 'success',
        'complete': 'success',
        'rejected': 'danger'
      }[status]
      return <Badge color={badgeColor}>{status}</Badge>
    }}
  ]
}

export default List;
