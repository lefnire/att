import _ from 'lodash'

// const SERVER_URL = 'http://localhost:5003'
const SERVER_URL = 'http://54.235.141.176:5003'

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
