// @flow
import React from 'react'
import { render } from 'react-dom'
import { createStore, compose } from 'redux'
import { Provider, connect } from 'react-redux'
import marked from 'marked'

import loading from './loading.svg'
import secret from './secret.md'

import 'github-markdown-css/github-markdown.css'
import './main.styl'

// State
type State = { stage: 'STANDBY'|'DECRYPTING'|'DECRYPTED', password: string };
type Action = { type: 'INPUT'|'SUBMIT'|'RESPONSE', input?: string };
type Dispatch = (action: Action) => Action;
const init: State = { stage: 'STANDBY', password: '' }

const reducer = (state: State = init, action: Action): State => {
  switch (action.type) {
  case 'INPUT':
    // TODO: Emit warning
    if (action.input == null) { return state; }

    return { stage: 'STANDBY', password: action.input };
  case 'SUBMIT':
    return { stage: 'DECRYPTING', password: state.password };
  case 'RESPONSE':
    // TODO: Error handling
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
  case 'DECRYPTING':
    let field, button;

    const invalid = !state.password || state.stage === 'DECRYPTING';

    const onChange = e => { input(field.value); };
    const onSubmit = e => {
      e.preventDefault();
      submit();
    };

    const btn = state.stage === 'STANDBY' ?
      <button disabled={invalid} ref={n=>{button = n;}}>
        Unlock!
      </button> :
      <img src={loading} alt='loading'/>;

    return <div className='password'>
      <form onSubmit={onSubmit}>
        <input type='password'
          placeholder='비밀번호를 입력하세요'
          value={state.password}
          onChange={onChange} ref={n=>{field = n;}}/>
        <div className='button'>{btn}</div>
      </form>
    </div>;
  case 'DECRYPTED':
    return <div>
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
  submit: () => {
    setTimeout(() => dispatch({ type: 'RESPONSE' }), 1000);
    return dispatch({ type: 'SUBMIT' });
  },
});
const App = connect(mapState, mapDispatch)(View);

const store = createStore(reducer, compose(
  window.devToolsExtension ? window.devToolsExtension() : f => f
));

render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('target')
);
