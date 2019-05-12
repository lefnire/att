import React, {Component} from 'react'
import { BrowserRouter as Router, Route } from "react-router-dom"
import {fetchDefaults, SERVER_URL, setMe} from "./utils"
import NavBar from './NavBar'
import Lost from './lost'
import './App.css'


class App extends Component {
  state = {
    me: {}
  }

  componentDidMount() {
    this.handleLogin()
    this.fetchMe()
  }

  handleLogin = () => {
    // this called when user clicks through Discord oauth flow, redirects here with ?jwt=..
    const urlParams = new URLSearchParams(window.location.search)
    const jwt = urlParams.get('jwt')
    if (!jwt) return
    localStorage.setItem('jwt', jwt)
    window.location.href = '/'  // get the ?jwt query outa URL
  }

  logout = () => {
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/'
  }

  fetchMe = () => {
    fetch(SERVER_URL + '/me', fetchDefaults())
      .then(r => r.json()).then(me => {
        setMe(me)
        this.setState({me})
    })
  }

  render() {
    return (
      <Router>
        <NavBar logout={this.logout} me={this.state.me}/>
        <div className="container-fluid" style={{marginTop:10}}>
          <Route path="/lost" component={Lost} />
        </div>
      </Router>
    );
  }
}

export default App;
