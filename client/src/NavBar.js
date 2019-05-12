import React, {Component} from 'react'
import {SERVER_URL, getMe} from "./utils"
import {
  Button,
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import './App.css'


class NavBar2 extends Component {
  state = {
    isOpen: false
  }

  toggle = () => this.setState({isOpen: !this.state.isOpen})

  renderProfile = () => {
    const {me} = this.props

    if (me.discord_id) {
      const avatar = 'https://cdn.discordapp.com/avatars/' +
        me.discord_id + '/' + me.discord_avatar +
        '.png?size=128'
      return (
        <UncontrolledDropdown nav inNavbar>
          <DropdownToggle nav caret>
            <img
              src={avatar}
              style={{height: 34}}
            />
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem onClick={this.props.logout}>
              Logout
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      )
    }

    // See https://discordapp.com/branding for Discord buttons
    return (
      <NavItem>
        <Button outline href={`${SERVER_URL}/discord`}>
          <img
            src='https://discordapp.com/assets/2c21aeda16de354ba5334551a883b481.png'
            style={{height: 34}}
          />
          Login
        </Button>
      </NavItem>
    )
  }

  render = () => {
    return (
      <Navbar color="light" light expand="md">
        <NavbarBrand href="/">Home</NavbarBrand>
        <NavbarToggler onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav className="ml-auto" navbar>
            <NavItem>
              <NavLink href="/lost">Lost Items/Skills</NavLink>
            </NavItem>
            {this.renderProfile()}
          </Nav>
        </Collapse>
      </Navbar>
    )
  }
}

export default NavBar2;
