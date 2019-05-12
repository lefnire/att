import _ from 'lodash'

const SERVER_URL = 'http://localhost:5000'
//const SERVER_URL = 'http://35.236.47.41:5000'

const fetchDefaults = () => {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
  const jwt = localStorage.getItem('jwt')
  if (jwt) headers['Authorization'] = `JWT ${jwt}`
  return {headers}
}

const getMe = () => {
  const me = sessionStorage.getItem('me')
  return me ? JSON.parse(me) : {}
}

const setMe = me => {
  sessionStorage.setItem('me', JSON.stringify(me))
}

const isAdmin = u => ~_.get(u, 'roles', []).indexOf('admin')

export {fetchDefaults, SERVER_URL, getMe, setMe, isAdmin}
