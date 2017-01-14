import React from 'react'

// Fails Codeship test if I add the class btn-primary to the submit button. Why?

export const Login = ({ login }) => (
  <form onSubmit={evt => {
    evt.preventDefault()
    login(evt.target.username.value, evt.target.password.value)
  } }>
    <input className="authFormField" name="username" />
    <input className="authFormField" name="password" type="password" />
    <input className="btn" type="submit" value="Login" />
  </form>
)

import {login} from '../reducers/auth'
import {connect} from 'react-redux'

export default connect (
  state => ({}),
  {login},
) (Login)
