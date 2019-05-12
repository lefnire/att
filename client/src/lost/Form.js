import React, {Component} from 'react'
import update from 'react-addons-update'
import {Alert, Card, CardTitle, CardText, Col, Button, Form, FormGroup, Label, Input} from 'reactstrap'
import {Link} from 'react-router-dom'
import {itemsArr} from './items'
import _ from 'lodash'

import {fetchDefaults, SERVER_URL} from '../utils'


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
      fetch(`${SERVER_URL}/lost/` + id, fetchDefaults())
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
    fetch(`${SERVER_URL}/${fetchURL}`, {
      method,
      body: JSON.stringify(data),
      ...fetchDefaults()
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
    let items_ = null
    if (items.length) {
      items_ = userid ?
        items.map(s => `$> trade post ${userid ? userid : '<userid>'} ${s[0]} ${s[1]}`).join('\n')
        : `$> player id ${username}  # then copy/paste ID into "User ID" above to see item commands`
      items_ += `\n\n`

    }

    return <div>
      <Label>Commands</Label>
      <pre><code>
        Log into {server} server{'\n\n'}
        {items_}
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
        <p>Server issues can cause players to lose items, and rarely skills. Before reporting lost items, <em>triple</em> check you're on the correct server. There's a server-selection bug that sends players <em>not</em> where they selected. Signs: you're at character creation, have different items than usual, etc. If you're on the correct server, fill out this form.</p>
        <p>No need to login via Discord</p>
      </Alert>

    }
    return <Alert color="info">
      Form submitted. Copy this page's URL and private-message it to @lefnire in Discord. When he has time, he'll approve the form and send the items to your in-game mailbox (near Townhall).
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

export default LostForm;
