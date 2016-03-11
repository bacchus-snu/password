// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import marked from 'marked'
import secret from './secret.md'

import 'github-markdown-css/github-markdown.css'
import './main.styl'

const html = {__html: marked(secret)};

ReactDOM.render(
  <div className='markdown-body' dangerouslySetInnerHTML={html}/>,
  document.getElementById('target')
);
