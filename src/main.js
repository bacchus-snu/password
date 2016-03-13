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
type Action = { type: 'INPUT'|'SUBMIT', input?: string };
type Dispatch = (action: Action) => Action;
const init: State = { stage: 'STANDBY', password: '' }

const reducer = (state: State = init, action: Action): State => {
  switch (action.type) {
  case 'INPUT':
    // TODO: Emit warning
    if (action.input == null) { return state; }

    return { stage: 'STANDBY', password: action.input };
  case 'SUBMIT':
    return { stage: 'DECRYPTED', password: state.password };
  default:
    return state;
  }
};

// View
type Props = {
  state: State;
  input: (password: string) => Action;
  submit: () => Action;
};

const View = ({ state, input, submit }: Props) => {
  switch (state.stage) {
  case 'STANDBY':
    let field, button;

    const invalid = !state.password;
    const onChange = e => { input(field.value); };
    const onSubmit = e => {
      e.preventDefault();
      submit();
      field.value = '';
    };

    return <div>
      <h1>비밀번호를 입력하세요</h1>
      <form onSubmit={onSubmit}>
        <input type='password' onChange={onChange} ref={n=>{field = n;}}/>
        <button disabled={invalid} ref={n=>{button = n;}}>Unlock!</button>
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
type StateProps = { state: State };
type DispatchProps = $Diff<Props, StateProps>;

const mapState = (state: State): StateProps => ({ state });
const mapDispatch = (dispatch: Dispatch): DispatchProps => ({
  input: password => dispatch({ type: 'INPUT', input: password }),
  submit: () => dispatch({ type: 'SUBMIT' }),
});
const App = connect(mapState, mapDispatch)(View);

const store = createStore(reducer);

render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('target')
);
