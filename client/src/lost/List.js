import React from 'react'
import {Badge} from 'reactstrap'
import {itemsObj} from './items'
import CommonList from '../common/List'


class List extends CommonList {
  model = 'lost'

  columns = [
    {accessor: 'timestamp', Header: 'Date'},
    {accessor: 'username', Header: 'User'},
    {accessor: 'server', Header: 'Server'},
    {accessor: 'items', Header: 'Items', Cell: ({value}) => {
      return value.map(i => itemsObj[i[0]]).join(', ')
    }},
    {accessor: 'skills', Header: 'Skills', Cell: ({value}) => {
      return value.map(i => i[0]).join(', ')
    }},
    {accessor: 'notes', Header: 'Notes'},
    {accessor: 'status', Header: 'Status', Cell: ({value}) => {
      const badgeColor = {
        'pending': 'warning',
        'wip': 'success',
        'complete': 'success',
        'rejected': 'danger'
      }[value]
      return <Badge color={badgeColor}>{value}</Badge>
    }}
  ]
}

export default List;
