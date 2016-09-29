// @flow
import React from 'react'
import { render } from 'react-dom'
import { createStore, compose } from 'redux'
import { Provider, connect } from 'react-redux'
import marked from 'marked'
import 'whatwg-fetch'

import loading from './loading.gif'
import secret from './secret.md'

import 'normalize.css/normalize.css'
import 'github-markdown-css/github-markdown.css'
import './main.styl'

type ServerError = { statusCode: number, message: string };
type LocalError = { message: string };
type ErrorResponse = { local?: LocalError, remote?: ServerError };
type Response = { error?: ErrorResponse, data?: * };
type Password = { id: string, description: string, password: string };
// State
type State = {
  stage: 'STANDBY'|'DECRYPTING'|'DECRYPTED',
  data: Array<Password>,
  error: string,
  password: string
};
type Action = { type: 'INPUT'|'SUBMIT'|'RESPONSE', response?: Response, input?: string };
type Dispatch = (action: Action) => Action;
const init: State = { stage: 'STANDBY', data: [], error: '', password: '' }

const reducer = (state: State = init, action: Action): State => {
  switch (action.type) {
  case 'INPUT':
    // TODO: Emit warning
    if (action.input == null) { return state; }

    return Object.assign({}, state, {
      error: '',
      password: action.input
    });
  case 'SUBMIT':
    return Object.assign({}, state, {
      stage: 'DECRYPTING',
      error: ''
    });
  case 'RESPONSE':
    if (action.response == null) {
      return Object.assign({}, state, {
        stage: 'STANDBY',
        error: 'response field not found. Contact admin'
      });
    }
    if (action.response.error != null) {
      const errorObject = action.response.error;
      const errorMessage =
        errorObject.remote && errorObject.remote.message ||
        errorObject.local && errorObject.local.message;
      return Object.assign({}, state, {
        stage: 'STANDBY',
        error: errorMessage
      });
    } else if (action.response.data == null) {
      return Object.assign({}, state, {
        stage: 'STANDBY',
        error: 'data field not found. Contact admin'
      });
    } else {
      return { stage: 'DECRYPTED', data: action.response.data, error: '', password: state.password };
    }
  default:
    return state;
  }
};

// View
type Props = {
  state: State;
  input: (password: string) => Action;
  submit: (password: string) => Action;
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
      submit(field.value);
    };

    const btn = state.stage === 'STANDBY' ? (
      <button disabled={invalid} ref={n=>{button = n;}}>
        Unlock!
      </button>
    ) : (
      <img src={loading} alt='loading'/>
    );
    const err = state.error ? (
      <div className='error'>
        {state.error}
      </div>
    ) : null;

    return (
      <div className='form-container'>
        {err}
        <form className='password' onSubmit={onSubmit}>
          <input type='password'
            placeholder='비밀번호를 입력하세요'
            value={state.password}
            onChange={onChange} ref={n=>{field = n;}}/>
          <div className='button'>{btn}</div>
        </form>
      </div>
    );
  case 'DECRYPTED':
    const list = state.data.map(item => (
      <li key={item.id}>
        {`${item.description}: `}
        <secret>{item.password}</secret>
      </li>
    ));
    return <div>
      <div className='markdown-body'>
        <ul>{list}</ul>
      </div>
    </div>;
  }
};

// App
type StateProps = { state: State };
type DispatchProps = $Diff<Props, StateProps>;

const mapState = (state: State): StateProps => ({ state });
const mapDispatch = (dispatch: Dispatch): DispatchProps => ({
  input: password => dispatch({ type: 'INPUT', input: password }),
  submit: password => {
    const body = `password=${encodeURIComponent(password)}`;
    fetch('/api/password.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    }).then(resp => {
      if (resp.status !== 200) {
        resp.json().then(error => {
          dispatch({
            type: 'RESPONSE',
            response: {
              error: {
                remote: {
                  statusCode: resp.status,
                  message: error.error
                }
              }
            }
          });
        }).catch(() => {
          dispatch({
            type: 'RESPONSE',
            response: {
              error: {
                remote: {
                  statusCode: resp.status,
                  message: 'Unknown error.'
                }
              }
            }
          });
        });
        return;
      }
      return resp.json();
    }).then(data => {
      if (data) {
        dispatch({ type: 'RESPONSE', response: { data } });
      }
    }).catch(error => {
      dispatch({ type: 'RESPONSE', response: { error: { local: { message: 'Unknown error.' } } } });
    });
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
