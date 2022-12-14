// ==UserScript==
// @name         YouTube Shorts Remover
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  remove youtube shorts from your homepage.
// @author       mWalrus
// @match        https://www.youtube.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==


const MAIN_PAGE_SELECTOR = "[is-shorts='']"
const NAV_BAR_SELECTOR = "[title='Shorts']"

(function() {
    'use strict';
    let resizeHandler = () => {
        // after this clear runs for a second time, i.e. in this listener callback,
        // we want to remove the listener because there are no more nav links to remove.
        if (clearNavLinks()) window.removeEventListener("resize", resizeHandler)
    }

    // poll for readiness and run when ready
    runWhenReady(NAV_BAR_SELECTOR, () => {
        clearNavLinks()
        clearMainPageSection()
    })

    // since yt uses different side nav links depending on the size of the window
    // we want to listen for resizes and remove any newly appended links from the DOM.
    window.addEventListener("resize", resizeHandler)

    // this needs to run continually since yt re-inserts the shorts section on the main page.
    listenForTopBarLogoClick()
})();


// helper function for running when a selector can be found in the DOM.
// yoinked from https://github.com/Tampermonkey/tampermonkey/issues/1279#issuecomment-875386821
function runWhenReady(readySelector, callback) {
    var numAttempts = 0;
    var tryNow = function() {
        var elem = document.querySelector(readySelector);
        if (elem) {
            callback();
        } else {
            numAttempts++;
            if (numAttempts >= 34) {
                console.warn('YT-SHORTS-REMOVER: Giving up after 34 attempts. Could not find: ' + readySelector);
            } else {
                setTimeout(tryNow, 250 * Math.pow(1.1, numAttempts));
            }
        }
    };
    tryNow();
}

// remove side nav links related to shorts
function clearNavLinks() {
    let shortsLinks = document.querySelectorAll(NAV_BAR_SELECTOR)

    // return early if none was found
    if (!shortsLinks || shortsLinks.length === 0) return false

    for (let link of shortsLinks) {
        link.parentNode.removeChild(link)
        console.log('YT-SHORTS-REMOVER: Removed youtube shorts link from left nav-bar')
    }

    // report back outcome
    return true
}

// remove the shorts section itself from the main feed.
function clearMainPageSection() {
    let shortsSection = document.querySelector(MAIN_PAGE_SELECTOR)

    // return early if undefined
    if (!shortsSection) return

    shortsSection.parentNode.removeChild(shortsSection)
    console.log('YT-SHORTS-REMOVER: Removed shorts section from page')
}

// we need to re-clear the main page if the feed is reset, which it is
// when the user clicks the top bar logo to go back to the home page.
function listenForTopBarLogoClick() {
    let logo = document.getElementById("logo")
    logo.addEventListener("click", () => {
        runWhenReady(MAIN_PAGE_SELECTOR, clearMainPageSection)
    })
}