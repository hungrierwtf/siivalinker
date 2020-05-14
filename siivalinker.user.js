// ==UserScript==
// @name         Siiva linker
// @namespace    https://hungrierwtf.github.io/
// @version      0.9.1
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
  
  const channels = ['SiIvaGunner', 'Flustered Fernando'];
  
  const suggestionUrl = new URL('https://siivagunner.fandom.com/wikia.php');
  suggestionUrl.searchParams.set('controller', 'LinkSuggest');
  suggestionUrl.searchParams.set('method', 'getLinkSuggestions');
  suggestionUrl.searchParams.set('format', 'json');
  
  const wikiUrlBase = 'https://siivagunner.fandom.com/wiki/$1';
  const encSlash = encodeURIComponent('/');
  
  const thinger = (function() {
    const meColor = '#47e';
    
    const container = document.createElement('span');
    container.style.color = meColor;
    container.style.marginLeft = '1em';
    container.style.display = 'inline-block';
    
    let attached = false;
    
    const attachMe = function() {
      if (attached) {
        return;
      }
      
      const titleEl = document.querySelector('#info-contents .title');
      if (!titleEl) {
        console.log('no title el to attach');
        return;
      }
      
      titleEl.appendChild(container);
      console.log('attached to title el');
      attached = true;
    }
    
    const showEl = function(el, show) {
      if (show) { 
        attachMe(); 
      }
      
      el.style.display = show? 'inline': 'none';
    }
    
    const link = document.createElement('a');
    link.text = '🤧🧛‍♀️🔫🤓';
    link.style.textDecoration = 'none';
    link.style.borderColor = meColor;
    link.style.borderWidth = '0 4px 1px 0';
    link.style.borderStyle = 'solid';
    container.appendChild(link);
    
    const lunk = document.createElement('span');
    lunk.appendChild(document.createTextNode('🧻'));
    container.appendChild(lunk);
    
    const setLink = function(url) {
      if (url) {
        link.href = url;
        showEl(link, true);
        showEl(lunk, false);
      } else {
        showEl(link, false);
        showEl(lunk, true);
      }
      
      console.log('updated link', url);
    }
    
    const hideBoth = function() {
      showEl(link, false);
      showEl(lunk, false);
    }
    
    const me = {
      contEl: container,
      linkEl: link,
      lunkEl: lunk,
      setLink: setLink,
      hide: hideBoth
    };
    
    return me;
  })();
  
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
  
  const checkSiiva = function() {
    let isSiiva = channels.indexOf(status.channel) > -1;
    dbg('updating siivs status', isSiiva, status.channel);
    status.siiva = isSiiva;
    
    if (!isSiiva) {
      thinger.hide();
    }
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
        
        thinger.setLink(wikiUrl);
      } else {
        dbg('no suggestion', resObj);
        thinger.setLink();
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
  
  const processTitle = function(title) {
    if (!title) {
      return title;
    }
    
    title = title.trim();
    dbg('trimmed', title);
    
    title = title.replace('#', '');
    dbg('de-numberized', title);
    
    return title;
  }
  
  const getLink = function() {
    if (status.siiva) {
      const query = processTitle(status.title);
      dbg('processed', status.title, '->', query);
      startGetSuggestion(query);
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
