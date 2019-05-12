import React, {Component} from 'react'
import update from "react-addons-update";
import _ from "lodash";
import {fetchDefaults, SERVER_URL} from "../utils";

class CommonForm extends Component {
  changeInput = (k, idxs=null) => e => {
    const val = e.target.value
    if (idxs === null) {
      return this.setState({[k]: val})
    }
    this.setState(update(this.state, {
      [k]: {[idxs[0]]: {[idxs[1]]: {$set: val}}}
    }))
  }

  loadIfForm = (serverRoute) => {
    const id = _.get(this.props, 'match.params.id')
    if (id) {
      this.editing = id
      fetch(`${SERVER_URL}/${serverRoute}/${id}`, fetchDefaults())
      .then(r => r.json()).then(res => {
        this.setState(res)
      })
    }
  }
}

export default CommonForm
