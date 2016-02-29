// @flow
import html from './secret.md'
import 'github-markdown-css/github-markdown.css'
import './main.styl'

document.getElementById('target').innerHTML = html;
