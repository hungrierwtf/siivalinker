// ==UserScript==
// @name         Siiva linker
// @namespace    https://hungrierwtf.github.io/
// @version      0.7
// @description  Adds a SiIvaGunner wiki link to SiIvaGunner videos on Youtube
// @author       hungrier
// @match        http://www.youtube.com/*
// @match        https://www.youtube.com/*
// @connect      siivagunner.fandom.com
// @grant        GM_xmlhttpRequest
// @homepageURL  https://github.com/hungrierwtf/siivalinker
// @downloadURL  https://github.com/hungrierwtf/siivalinker/raw/master/siivalinker.user.js
// ==/UserScript==

"use strict";

(function() {
  
  const dbg = false? function (...args) { console.log.apply(this, args); }: function() {};
  
  console.log('setting up');
  
  const status = {
    title: undefined,
    channel: undefined,
    siiva: false
  };
  
  const channels = ['SiIvaGunner'];
  
  const suggestionUrl = new URL('https://siivagunner.fandom.com/wikia.php');
  suggestionUrl.searchParams.set('controller', 'LinkSuggest');
  suggestionUrl.searchParams.set('method', 'getLinkSuggestions');
  suggestionUrl.searchParams.set('format', 'json');
  
  const wikiUrlBase = 'https://siivagunner.fandom.com/wiki/$1';
  const encSlash = encodeURIComponent('/');
  
  let linkel = undefined;
  
  const getTextContent = function(q) {
    let titleH = document.querySelector(q);
    if (!titleH) {
      dbg('no element', q);
      return undefined;
    } else if (!titleH.textContent) {
      dbg('no textContent', titleH);
    }

    return titleH.textContent;
  }
  
  const updateStatus = function(which, selecta, watdo) {
    let newText = getTextContent(selecta);
    dbg(which, newText);
    
    if (newText !== status[which]){
      dbg('updating', which, status[which], '->', newText);
      status[which] = newText;
      
      if (watdo) {
        dbg('doing wat')
        watdo();
      }
    }
  }
  
  const putLinkel = function() {
    linkel = document.createElement('a');
    linkel.text = '🤧🧛‍♀️🔫🤓';
    linkel.style.color = '#47e';
    linkel.style.marginLeft = '1em';

    document.querySelector('#info-contents .title').appendChild(linkel);
    dbg('linkel linked');
  }
  
  const checkSiiva = function() {
    let isSiiva = channels.indexOf(status.channel) > -1;
    dbg('updating siivs status', isSiiva, status.channel);
    status.siiva = isSiiva;
    
    if (!linkel) {
      putLinkel();
    }
    
    linkel.style.visibility = isSiiva? 'visible': 'hidden';
  }
  
  const updateLink = function(href) {
    if (!linkel) {
      putLinkel();
    }
    
    if (href) {
      linkel.href = href;
    } else {
      delete linkel.href;
    }
    
    
    
    console.log('link updated', href);
  }
  
  const processSuggestions = function(res) {
    if (res.status === 200) {
      dbg('response:', res.responseText);
      
      let resObj = JSON.parse(res.responseText);
      dbg('resojb', resObj);
      
      let suggestions = resObj.suggestions;
      if (suggestions.length > 0) {
        let valueEnc = encodeURIComponent(suggestions[0].replace(/ /g, '_'));
        let wikiUrl = wikiUrlBase.replace(/\$1/, valueEnc).replace(encSlash, '/');
        dbg('wiki url', wikiUrl);
        
        updateLink(wikiUrl);
      } else {
        dbg('no suggestion', resObj);
        updateLink();
      }
    } else {
      console.log('something bad hapepned', res);
    }
  }
  
  const startGetSuggestion = function(query) {
    suggestionUrl.searchParams.set('query', query);
    dbg('query', query);

    let xhrOptions = {
      method: 'GET',
      url: suggestionUrl,
      onload: processSuggestions
    }
    GM_xmlhttpRequest(xhrOptions);
  }
  
  const getLink = function() {
    if (status.siiva) {
      startGetSuggestion(status.title);
    }
  }

  const loop = function() {
    updateStatus('channel', '#channel-name #text', checkSiiva);
    
    updateStatus('title', '#info-contents .title yt-formatted-string', getLink);
    
    setTimeout(loop, 1000);
  }

  console.log('starting');
  
  setTimeout(loop);
})();
