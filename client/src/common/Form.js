import React, {Component} from 'react'
import update from "react-addons-update";
import _ from "lodash";
import {fetchDefaults, SERVER_URL} from "../utils";
import {Alert} from "reactstrap";

class CommonForm extends Component {
  editing = false

  changeInput = (k, idxs=null) => e => {
    const val = e.target.value
    if (idxs === null) {
      return this.setState({[k]: val})
    }
    this.setState(update(this.state, {
      [k]: {[idxs[0]]: {[idxs[1]]: {$set: val}}}
    }))
  }

  loadIfForm = (model) => {
    const id = _.get(this.props, 'match.params.id')
    if (id) {
      this.editing = id
      fetch(`${SERVER_URL}/case/${model}/${id}`, fetchDefaults())
      .then(r => r.json()).then(res => {
        this.setState(res)
      })
    }
  }

  submitForm = (model, data) => {
    const fetchURL = this.editing ? `${model}/${this.editing}` : model
    const method = this.editing ? 'PUT' : 'POST'

    this.setState({submitting: true})
    fetch(`${SERVER_URL}/case/${fetchURL}`, {
      method,
      body: JSON.stringify(data),
      ...fetchDefaults()
    })
    .then(r => r.json()).then(res => {
      window.location = `/${model}/case/${res.id}`
    })
    return false
  }

  render() {
    return (
      <div>
        {this.editing ? (
          <Alert color='info'>{this.alerts.editing}</Alert>
        ) : (
          <Alert color='secondary'>{this.alerts.creating}</Alert>
        )}
        {this.renderForm()}
      </div>
    )
  }
}

export default CommonForm
