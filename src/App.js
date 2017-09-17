import React, {Component} from 'react'
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/observable/empty'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/sampleTime'
import 'rxjs/add/operator/switch'
import 'rxjs/add/operator/takeUntil'
import 'rxjs/add/operator/merge'
import 'whatwg-fetch'

const githubSearchApi = (term) => {
  const url = `https://api.github.com/search/repositories?q=${term}`
  return Observable.fromPromise(
    fetch(url)
      .then(res => res.json().then(json => json.items.map(j => j.full_name)))
      .catch(e => console.log(e))
  )
}

export default class App extends Component {
  constructor() {
    super()
    this.state = {searchOpened: false}
  }

  openSearch() {
    this.setState({searchOpened: true})
  }

  componentDidMount() {
    this.searchHandler = (e) => {
      this.setState({searchOpened: true, search: e.key})
    }
    document.body.addEventListener('keypress', this.searchHandler)
  }

  componentWillUnmount() {
    document.body.removeEventListener('keypress', this.searchHandler)
  }

  render() {
    const {searchOpened} = this.state
    return <div style={{padding: '20px'}}>
      <h1>React Hot Loader Boilerplate!
        <span id="open" onClick={e => this.openSearch()}>open</span>
      </h1>
      {this.state.searchOpened &&
      <SearchBox
        onClose={e => this.setState({searchOpened:true, search: ''})}/>
      }
    </div>
  }
}

class SearchBox extends Component {
  constructor() {
    super()
    this.state = {items: []}
  }

  componentDidMount() {
    const textbox = document.querySelector(".searchbox #textbox")
    const closeButton = document.querySelector(".searchbox #close")
    const keyUps = Observable.fromEvent(textbox, 'keyup')
    const paste = Observable.fromEvent(textbox, 'paste')
    const searchCloses = Observable.fromEvent(closeButton, 'click')
    const clickLinks = Observable.fromEvent(document.querySelector('ul'))

    textbox.focus()
    keyUps
      .sampleTime(500)
      .filter(keyEvent => ![38, 40].some((k) => k === keyEvent.keyCode))
      .map(() => textbox.value.trim())
      .merge(paste)
      .distinctUntilChanged()
      .takeUntil(searchCloses)
      .takeUntil(clickLinks)
      .map((value) => {
        return value && value.trim() != '' ?
          githubSearchApi(value) :
          Observable.empty
      })
      .switch()
      .subscribe(item => this.setState({items: item || []}))
  }

  render() {
    const {items} = this.state
    return (
      <div className="searchbox">
        <h1><span id="close" onClick={e => this.props.onClose(e)}>x</span></h1>
        <input type="text" id="textbox" placeholder="your search here..."/>
        <ul>
          {
            items && items.map((item, i) => <li key={i}>
              <a href={`http://github.com/${item}`}>{item}</a>
            </li>)
          }
        </ul>
      </div>
    )
  }
}

