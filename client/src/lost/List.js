import React from 'react'
import {Badge} from 'reactstrap'
import {itemsObj, itemsObjArchive} from './items'
import CommonList from '../common/List'


class List extends CommonList {
  model = 'lost'

  columns = [
    {accessor: 'timestamp', Header: 'Date'},
    {accessor: 'username', Header: 'User'},
    {accessor: 'server', Header: 'Server'},
    {accessor: 'items', Header: 'Items', Cell: ({value}) => {
      return value.map(i => {
        const obj = itemsObj[i[0]] || itemsObjArchive[i[0]];
        return obj.name;
      }).join(', ')
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
