import React, {Component} from 'react'
import {Route, Link} from "react-router-dom"
import {fetchDefaults, SERVER_URL, setMe} from "./utils"
import NavBar from './NavBar'
import Lost from './lost'
import './App.css'

class App_ extends Component {
  state = {
    me: {}
  }

  componentDidMount() {
    this.handleLogin()
  }

  handleLogin = () => {
    // this called when user clicks through Discord oauth flow, redirects here with ?jwt=..
    const urlParams = new URLSearchParams(window.location.search)
    const jwt = urlParams.get('jwt')
    if (jwt) {
      localStorage.setItem('jwt', jwt)
      window.location.href = '/'  // get the ?jwt query outa URL
      return
    }
    setTimeout(() => {
      fetch(SERVER_URL + '/me', fetchDefaults())
        .then(r => r.json()).then(me => {
          setMe(me)
          this.setState({me})
      })
    }, 100)
  }

  logout = () => {
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/'
  }

  renderBreadcrumbs = () => {
    const loc = this.props.location.pathname
    if (loc === '/') return null
    const bread = {
      '': {
        name: 'Home',
        lost: {
          name: 'Lost Items/Skills',
        },
        report: {
          name: 'Report Player'
        }

      }
    }
    let crumbs = loc.split('/')
    crumbs.pop()
    const crumbsJSX = []
    let currObj = bread, currLink = ''
    while (true) {
      const c = crumbs.shift()
      currObj = currObj[c]
      if (!currObj) {
        crumbsJSX.pop()  // remove that last >>
        break
      }
      currLink = currLink + c + '/'
      crumbsJSX.push(<Link to={currLink}>{currObj.name}</Link>)
      crumbsJSX.push(<span> » </span>)
    }
    return crumbsJSX
  }

  render() {
    return (
      <div>
        <NavBar logout={this.logout} me={this.state.me}/>
        <div className="container-fluid" style={{marginTop:10}}>
          {this.renderBreadcrumbs()}
          <Route path="/lost" component={Lost} />
        </div>
      </div>
    );
  }
}

const App = () => <Route path='/' component={App_} />

export default App;
