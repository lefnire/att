import React from 'react'
import _ from 'lodash';
import update from 'react-addons-update'
import {Alert, Card, CardTitle, CardText, Col, Button, Form, FormGroup, Label, Input} from 'reactstrap'
import CommonForm from '../common/Form'
import {itemsArr, itemsObj, itemsObjArchive} from './items'

class LostForm extends CommonForm {
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

  alerts = {
    editing: <p>Form submitted. Copy this page's URL and private-message it to @lefnire in Discord. When he has time, he'll approve the form and send the items to your in-game mailbox (near Townhall).</p>,
    creating: <ul>
      <li>No need to login via Discord</li>
      <li>We only refund items due to server crashes/glitches. Not theft, deaths, etc.</li>
      <li>If you put your bag down and it disappeared, please look around the area thoroughly. There's an issue with backpack physics: they can easily fling away so fast it looks like they disappeared. This is especially true when taking long objects out of your bag (long handles/weapons, etc).</li>
      <li>It's at our digression whether/what to refund. We can reject forms without reason.</li>
    </ul>
  }

  componentDidMount() {
    this.loadIfForm('lost')
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

    return this.submitForm('lost', data)
  }

  renderIncrBtns = k => (
    <div>
      {this.state[k].length > 0 && <Button onClick={this.incr(k, -1)}>-</Button>}
      <Button onClick={this.incr(k, 1)}>+</Button>
    </div>
  )

  renderCommands = () => {
    const { server, skills, items, userid } = this.state
    let { username } = this.state;
    if (~username.indexOf(' ')) { username = `"${username}"`}

    // Skills
    let skills_ = skills.length ? '' : null;
    if (skills.length) {
      skills.forEach(s => {
        const repeat = s[1];
        _.times(repeat, () => skills_ += `player progression pathlevelup ${username} ${s[0]}\n`);
      })
    }

    // Items
    let items_ = items.length ? '' : null;
    if (items.length) {
      if (userid) {
        items.forEach(s => {
          const obj = itemsObj[s[0]] || itemsObjArchive[s[0]];
          const repeat = obj.single ? s[1] : 1;
          _.times(repeat, () => items_ += `trade post ${userid} ${s[0]} ${obj.single ? 1 : s[1]}\n`);
        });
      } else {
        items_ = `player id ${username}`;
      }
      items_ += `\n\n`;
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
    const { username, server, skills, items, notes, status, userid, submitting } = this.state
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
          <small>Your ATT username, not your Discord username (they're usually different)</small>
        </FormGroup>

        <FormGroup>
          <Label for="server-select">Server</Label>
          <Input
            type="select"
            name="server-select"
            onChange={this.changeInput('server')}
            value={server}
          >
            <option value='us'>US1</option>
            <option value='us2'>US2</option>
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
                  {itemsArr.map(el => <option value={el[0]}>{el[1].name}</option>)}
                </Input>
              </Col>
              <Col sm={4}>
                <Input
                  type="number"
                  min="1"
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
            required
            type="textarea"
            name="text"
            value={notes}
            onChange={this.changeInput('notes')}
          />
          <small>Please describe what happened in as much detail as possible</small>
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
}

export default LostForm;
