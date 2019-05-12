import React, {Component} from 'react'
import CommonForm from '../common/Form'
import {Alert, Card, CardTitle, CardText, Col, Button, Form, FormGroup, Label, Input} from 'reactstrap'

import {fetchDefaults, SERVER_URL} from '../utils'


class ReportForm extends CommonForm {
  editing = false
  state = {
    plaintiff: '',
    defendant: '',
    server: 'us',
    notes: '',
    status: 'pending',

    submitting: false
  }

  componentDidMount() {
    this.loadIfForm('report')
  }

  submit = (e) => {
    e.preventDefault()
    const { plaintiff, defendant, server, notes, status } = this.state
    const data = { plaintiff, defendant, server, notes, status }

    const fetchURL = this.editing ? 'report/' + this.editing : 'report'
    const method = this.editing ? 'PUT' : 'POST'

    this.setState({submitting: true})
    fetch(`${SERVER_URL}/${fetchURL}`, {
      method,
      body: JSON.stringify(data),
      ...fetchDefaults()
    })
    .then(r => r.json()).then(res => {
      window.location = '/report/' + res.id
    })
    return false
  }

  renderForm = () => {
    const { username, server, skills, items, notes, userid, status, submitting } = this.state
    return (
      <Form onSubmit={this.submit}>
        <FormGroup>
          <Label for="plaintiff">Your Username</Label>
          <Input
            type="text"
            name="plaintiff"
            required
            onChange={this.changeInput('plaintiff')}
            value={username}
          />
          <small>Your ATT username, not your Discord username (they're often different)</small>
        </FormGroup>

        <FormGroup>
          <Label for="defendant">Other's Username</Label>
          <Input
            type="text"
            name="defendant"
            onChange={this.changeInput('defendant')}
            value={username}
          />
          <small>ATT username of the transgressor, if you know it. If not (and it's a PK), no worries - we can look up PKs in the logs.</small>
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

        <FormGroup>
          <Label for="notes">Notes</Label>
          <Input
            required
            type="textarea"
            name="text"
            value={notes}
            onChange={this.changeInput('notes')}
          />
          <small>Details of the event</small>
        </FormGroup>

        {this.editing && (
          <Card body>
          <CardTitle>Admin Section</CardTitle>
          <CardText>
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
        <p>Did someone PK you off PvP server? Did someone steal your stuff? Report it here.</p>
      </Alert>

    }
    return <Alert color="info">
      Form submitted. Copy this page's URL and private-message it to @kazun#0001 (aka Sol) in Discord. When he has time, he'll investigate and respond to you.
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

export default ReportForm;
