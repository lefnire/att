import React from 'react'
import {Badge, Table} from 'reactstrap'
import CommonList from '../common/List'


class List extends CommonList {
  model = 'report'

  table = [
    {k: 'timestamp', v: 'Date'},
    {k: 'plaintiff', v: 'Plaintiff'},
    {k: 'defendant', v: 'Defendant'},
    {k: 'server', v: 'Server'},
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
