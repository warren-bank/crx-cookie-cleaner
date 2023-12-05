// ==UserScript==
// @name         cookie cleaner
// @description  Add a tiny icon to the top-right corner of every web page that opens a dialog when clicked to view and optionally remove all site cookies.
// @version      1.0.0
// @include      /^.*$/
// @icon         https://github.com/google/material-design-icons/raw/6ebe181c634f9ced978b526e13db6d7d5cb1c1ba/png/social/cookie/materialiconsoutlined/24dp/2x/outline_cookie_black_24dp.png
// @run-at       document-end
// @grant        GM_cookie
// @homepage     https://github.com/warren-bank/crx-cookie-cleaner/tree/webmonkey-userscript/es5
// @supportURL   https://github.com/warren-bank/crx-cookie-cleaner/issues
// @downloadURL  https://github.com/warren-bank/crx-cookie-cleaner/raw/webmonkey-userscript/es5/webmonkey-userscript/cookie-cleaner.user.js
// @updateURL    https://github.com/warren-bank/crx-cookie-cleaner/raw/webmonkey-userscript/es5/webmonkey-userscript/cookie-cleaner.user.js
// @namespace    warren-bank
// @author       Warren Bank
// @copyright    Warren Bank
// ==/UserScript==

// ----------------------------------------------------------------------------- state

var state = {
  dom_element: null
}

// ----------------------------------------------------------------------------- helpers

var cancel_event = function(event) {
  event.stopPropagation();event.stopImmediatePropagation();event.preventDefault();event.returnValue=false;
}

// ----------------------------------------------------------------------------- build DOM

var build_dom = function() {
  if (state.dom_element) return

  var el = document.createElement('img')
  el.setAttribute('src', 'https://github.com/google/material-design-icons/raw/6ebe181c634f9ced978b526e13db6d7d5cb1c1ba/png/social/cookie/materialiconsoutlined/18dp/1x/outline_cookie_black_18dp.png')
  el.style.cssText = 'display: block !important; width: 18px; height: 18px; position: fixed !important; z-index: 99999; top: 0px; right: 0px; user-select: none !important; cursor: pointer;'

  state.dom_element = el
  document.body.appendChild(el)
}

// ----------------------------------------------------------------------------- attach events

var attach_events = function() {
  if (!state.dom_element) return

  state.dom_element.addEventListener('click', onclick_dom_element)
}

var onclick_dom_element = function(event) {
  cancel_event(event)

  init_showdialog_cookies_prompt(false)
}

var init_showdialog_cookies_prompt = function(did_update) {
  var url      = window.location.protocol + '//' + window.location.host + '/'
  var details  = {url: url}
  var callback = showdialog_cookies_prompt.bind(null, url, did_update)

  GM_cookie.list(details, callback)
}

var showdialog_cookies_prompt = function(url, did_update, cookies) {
  if (did_update || !cookies || !Array.isArray(cookies) || !cookies.length) {
    showdialog_cookies_alert(cookies, did_update)
    return
  }

  var msg = 'Remove the ' + cookies.length + ' cookies for this domain?' + "\n\n" + get_cookies_string(cookies)

  var proceed = window.confirm(msg)

  if (proceed) clearCookies(url, cookies)
}

var showdialog_cookies_alert = function(cookies, did_update) {
  if (!cookies || !Array.isArray(cookies))
    cookies = []

  var msg = 'There are ' + (did_update ? 'now ' : '') + cookies.length + ' cookies for this domain'
  msg += (cookies.length) ? (":\n\n" + get_cookies_string(cookies)) : '.'

  window.alert(msg)
}

var get_cookies_string = function(cookies) {
  return cookies.map(function(cookie, index){return '[' + (index + 1) + '] ' + cookie.name + ' = ' + cookie.value}).join("\n")
}

var clearCookies = function(url, cookies) {
  var callback_counter, callback, cookie, details

  callback_counter = 0

  callback = function() {
    callback_counter++

    if (callback_counter >= cookies.length) {
      init_showdialog_cookies_prompt(true)
    }
  }

  for (var i=0; i < cookies.length; i++) {
    cookie  = cookies[i]
    details = {url: url, name: cookie.name}

    GM_cookie.delete(details, callback)
  }
}

// ----------------------------------------------------------------------------- bootstrap

var init = function() {
  build_dom()
  attach_events()
}

init()
