import React from 'react'
import {Badge} from 'reactstrap'
import CommonList from '../common/List'


class List extends CommonList {
  model = 'report'

  columns = [
    {accessor: 'timestamp', Header: 'Date'},
    {accessor: 'plaintiff', Header: 'Plaintiff'},
    {accessor: 'defendant', Header: 'Defendant'},
    {accessor: 'server', Header: 'Server'},
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
