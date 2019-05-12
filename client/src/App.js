import React, {Component} from 'react'
import update from 'react-addons-update'
import { BrowserRouter as Router, Route, Link } from "react-router-dom"
import {Alert, Badge, Table, Card, CardTitle, CardText, Col, Button, Form, FormGroup, Label, Input} from 'reactstrap'
import {itemsObj, itemsArr} from './items'
import _ from 'lodash'
import './App.css'

//const URL = 'http://localhost:5000'
const URL = 'http://35.236.47.41:5000'

const fetchDefaults = {
   headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
}

class LostForm extends Component {
  editing = false
  state = {
    username: '',
    server: 'us',
    skills: [],
    items: [],
    notes: '',
    userid: '',
    status: 'pending',

    submitting: false
  }

  componentDidMount() {
    const id = _.get(this.props, 'match.params.id')
    if (id) {
      this.editing = id
      fetch(`${URL}/lost/` + id, fetchDefaults)
      .then(r => r.json()).then(res => {
        this.setState(res)
      })
    }
  }

  incr = (k, dir) => () => {
    const state = this.state
    const newItem = k === 'skills' ? ['forging', 0] : ['14844', 0]
    const updates = dir > 0 ?
      {[k]: {$push: [newItem]}} :
      {[k]: {$splice: [ [state[k].length - 1, 1] ]}}
    this.setState(update(state, updates))
  }

  submit = (e) => {
    e.preventDefault()
    const { username, server, skills, items, notes, userid, status } = this.state
    const data = { username, server, skills, items, notes, userid, status }

    const fetchURL = this.editing ? 'lost/' + this.editing : 'lost'
    const method = this.editing ? 'PUT' : 'POST'

    this.setState({submitting: true})
    fetch(`${URL}/${fetchURL}`, {
      method,
      body: JSON.stringify(data),
      ...fetchDefaults
    })
    .then(r => r.json()).then(res => {
      window.location = '/form/' + res.id
    })
    return false
  }

  renderIncrBtns = k => (
    <div>
      {this.state[k].length > 0 && <Button onClick={this.incr(k, -1)}>-</Button>}
      <Button onClick={this.incr(k, 1)}>+</Button>
    </div>
  )

  changeInput = (k, idxs=null) => e => {
    const val = e.target.value
    if (idxs === null) {
      return this.setState({[k]: val})
    }
    this.setState(update(this.state, {
      [k]: {[idxs[0]]: {[idxs[1]]: {$set: val}}}
    }))
  }

  renderCommands = () => {
    const { server, skills, items, username, userid } = this.state
    const skills_ = !skills.length ? null :
      skills.map(s => `$> player progression pathlevelup ${username} ${s[0]}  # ${s[1]}x`).join('\n')
    const items_ = !items.length ? null :
      items.map(s => `$> trade post ${userid ? userid : '<userid>'} ${s[0]} ${s[1]}`).join('\n')
    return <div>
      <Label>Commands</Label>
      <pre><code>
        Log into {server} server{'\n'}
        {items_}{'\n'}
        {skills_}
      </code></pre>
    </div>

  }

  renderForm = () => {
    const { username, server, skills, items, notes, userid, status, submitting } = this.state
    return (
      <Form onSubmit={this.submit}>
        <FormGroup>
          <Label for="username">Username</Label>
          <Input
            type="text"
            name="username"
            required
            onChange={this.changeInput('username')}
            value={username}
          />
          <small>Your ATT username, not your Discord username (they're often different)</small>
        </FormGroup>

        <FormGroup>
          <Label for="server-select">Server</Label>
          <Input
            type="select"
            name="server-select"
            onChange={this.changeInput('server')}
            value={server}
          >
            <option value='us'>US</option>
            <option value='eu'>EU</option>
            <option value='aus'>AUS</option>
            <option value='pvp'>PvP</option>
          </Input>
        </FormGroup>

        <div>
          <Label>Skills</Label>
          {skills.map((arr, i) => (
            <FormGroup key={i} row>
              <Col sm={8}>
                <Input
                  type="select"
                  name="skill-select"
                  value={arr[0]}
                  onChange={this.changeInput('skills', [i, 0])}
                >
                  <option value="forging">Forging</option>
                  <option value="woodcutting">Woodcutting</option>
                  <option value="mining">Mining</option>
                  <option value="melee">Melee</option>
                  <option value="ranged">Ranged</option>
                </Input>
              </Col>
              <Col sm={4}>
                <Input
                  type="number"
                  placeholder="Points"
                  value={arr[1]}
                  onChange={this.changeInput('skills', [i, 1])}
                />
              </Col>
            </FormGroup>
          ))}
          {skills.length ? (
            <small>Skill refunds require the player be <em>in-game</em>. Ping @lefnire in Discord when you're playing after submitting this form.</small>
          ): null}
          {this.renderIncrBtns('skills')}
        </div>

        <div>
          <Label>Items</Label>
          {items.map((arr, i) =>(
            <FormGroup key={i} row>
              <Col sm={8}>
                <Input
                  type="select"
                  name="item-select"
                  value={arr[0]}
                  onChange={this.changeInput('items', [i, 0])}
                >
                  {itemsArr.map(el => <option value={el[0]}>{el[1]}</option>)}
                </Input>
              </Col>
              <Col sm={4}>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={arr[1]}
                  onChange={this.changeInput('items', [i, 1])}
                />
              </Col>
            </FormGroup>
          ))}
          {items.length ? (
            <small>Note the lack of crafted items (weapons, tools, backpacks). Only materials can be sent, so calculate your item-loss in total materials.</small>
          ) : null}
          {this.renderIncrBtns('items')}
        </div>

        <FormGroup>
          <Label for="notes">Notes</Label>
          <Input
            type="textarea"
            name="text"
            value={notes}
            onChange={this.changeInput('notes')}
          />
          <small>Anything you want to add? Unusual behavior?</small>
        </FormGroup>

        {this.editing && (
          <Card body>
          <CardTitle>Admin Section</CardTitle>
          <CardText>
            <FormGroup>
              <Label for="userId">User ID</Label>
              <Input
                type="text"
                name="userId"
                value={userid}
                onChange={this.changeInput('userid')}
              />
            </FormGroup>
            <FormGroup>
              <Label for="status-select">Status</Label>
              <Input
                type="select"
                name="status-select"
                value={status}
                onChange={this.changeInput('status')}
              >
                <option value="pending">Pending</option>
                <option value="wip">In Progress</option>
                <option value="complete">Complete</option>
                <option value="rejected">Rejected</option>
              </Input>
            </FormGroup>
          </CardText>

          {this.renderCommands()}
        </Card>
        )}

        <Button
          color='primary'
          type='submit'
          disabled={submitting}
        >
          {this.editing ? 'Save' : 'Submit'}
        </Button>
      </Form>
    )
  }

  renderAlert = () => {
    if (!this.editing) {
      return <Alert color='secondary'>
        Server issues can cause players to lose items, and rarely skills. Before reporting lost items, <em>triple</em> check you're on the correct server. There's a server-selection bug that sends players <em>not</em> where they selected. Signs: you're at character creation, have different items than usual, etc. If you're on the correct server, fill out this form.
      </Alert>

    }
    return <Alert color="info">
      Form submitted. Copy this page's URL and send it to @lefnire in Discord.
    </Alert>
  }

  render() {
    return (
      <div>
        {this.renderAlert()}
        {this.renderForm()}
      </div>
    )
  }
}

class LostList extends React.Component {
  state = {
    list: []
  }

  componentDidMount() {
    fetch(`${URL}/lost`, fetchDefaults)
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
    return (
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
    )
  }
}

class App extends Component {
  render() {
    return (
      <div className="container">
        <Router>
          <Route path="/" exact component={LostForm} />
          <Route path="/b5402542-f3a8-464b-acdc-50f72fbd30c8" exact component={LostList} />
          <Route path="/form/:id" exact component={LostForm} />
        </Router>
      </div>
    );
  }
}

export default App;
