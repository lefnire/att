import React, {Component} from 'react'
import { Link } from "react-router-dom"
import {Button} from 'reactstrap'


class CommonIndex extends Component {
  render() {
    return (
      <div className='action-buttons'>
        {this.links.map(link => (
          <Button
            tag={Link}
            to={link.to}
            outline
          >{link.name}</Button>
        ))}
      </div>
    )
  }
}

export default CommonIndex;
