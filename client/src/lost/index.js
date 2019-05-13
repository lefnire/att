import React, {Component} from 'react'
import { Route, Link } from "react-router-dom"
import {Button} from 'reactstrap'
import CommonIndex from '../common/Index'
import Form from './Form'
import List from './List'


class Index extends CommonIndex {
  links = [{
    to: '/lost/new', name: 'New Case'
  }, {
    to: '/lost/list', name: 'List Cases'
  }]
}

class Lost extends Component {
  render() {
    const {match} = this.props
    return (
      <div>
        <Route path={match.path} exact component={Index} />
        <Route path={match.path + '/new'} component={Form} />
        <Route path={match.path + '/list'} component={List} />
        <Route path={match.path + '/case/:id'} component={Form} />
      </div>
    );
  }
}

export default Lost;
