// @flow
import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'

import marked from 'marked'
import secret from './secret.md'

import 'github-markdown-css/github-markdown.css'
import './main.styl'

// State
type State = { stage: 'STANDBY'|'DECRYPTED', password: string };
type Action = { type: 'INPUT', input: string };
type Dispatch = (action: Action) => Action;
const init: State = { stage: 'STANDBY', password: '' }

const reducer = (state: State = init, action: Action): State => {
  switch (action.type) {
  case 'INPUT':
    return {
      stage: 'DECRYPTED',
      password: action.input
    };
  default:
    return state;
  }
};

// View
type Props = { state: State, decrypt: (password: string) => Action };
const View = ({ state, decrypt }: Props) => {
  let input;

  const onSubmit = e => {
    e.preventDefault();
    decrypt(input.value);
    input.value = '';
  };

  switch (state.stage) {
  case 'STANDBY':
    return <div>
      <h1>비밀번호를 입력하세요</h1>
      <form onSubmit={onSubmit}>
        <input type='password' ref={node => { input = node; }}/>
        <button>Unlock!</button>
      </form>
    </div>;
  case 'DECRYPTED':
    return <div>
      <p>입력된 비밀번호: { state.password }</p>
      <div className='markdown-body'
        dangerouslySetInnerHTML={{__html: marked(secret)}}/>
    </div>
  }
};

// App
const mapState = state => ({ state });
const mapDispatch = (dispatch: Dispatch) => ({
  decrypt: password => dispatch({ type: 'INPUT', input: password })
});
const App = connect(mapState, mapDispatch)(View);

const store = createStore(reducer);

render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('target')
);
