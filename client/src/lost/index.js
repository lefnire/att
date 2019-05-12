import React, {Component} from 'react'
import { Route, Link } from "react-router-dom"
import {Button} from 'reactstrap'
import Form from './Form'
import List from './List'


class Index extends Component {
  render() {
    return (
      <div>
        <Button tag={Link} to='/lost/new'>New Case</Button>
        <br/><br/>
        <Button tag={Link} to='/lost/list'>List Cases</Button>
      </div>
    )
  }
}

class Lost extends Component {
  render() {
    const {match} = this.props
    return (
      <div>
        <Route path={match.path} exact component={Index} />
        <Route path={match.path + '/new'} component={Form} />
        <Route path={match.path + '/list'} component={List} />
        <Route path={match.path + '/form/:id'} component={Form} />
      </div>
    );
  }
}

export default Lost;
