// ==UserScript==
// @name         Longs
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Remove YouTube Shorts.
// @author       mWalrus
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==


(function() {
    // youtube url matcher with relevant match grouping
    // taken from: https://stackoverflow.com/a/37704433/16166072
    // window.URL_REGEX            = "^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$"
    window.YOUTUBE_REEL_SELECTOR = "ytd-reel-shelf-renderer"
    window.BASE_YOUTUBE_URL      = "https://www.youtube.com/"
    window.MAIN_PAGE_SELECTOR    = "[is-shorts='']"
    window.NAV_BAR_SELECTOR      = "[title='Shorts']"
    window.LOG_PREFIX            = "LONGS: "

    const resizeHandler = () => {
        if (clearNavLinks()) window.removeEventListener("resize", resizeHandler)
    }

    initialCleanup()

    window.addEventListener("resize", resizeHandler)

    listenForNavigatorEventsAndClear()
})();

function initialCleanup() {
    runWhenReady(window.NAV_BAR_SELECTOR, clearNavLinks)
    if (userIsOnMainPage()) {
        runWhenReady(window.MAIN_PAGE_SELECTOR, clearShortsSection)
    } else if (userIsWatching()) {
        runWhenReady(window.YOUTUBE_REEL_SELECTOR, () => {
            clearShortsSection(window.YOUTUBE_REEL_SELECTOR)
        })
    }
}


// helper function for running a passed callback function when a selector can be found in the DOM.
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
                log('Giving up after 34 attempts. Could not find: ' + readySelector);
            } else {
                setTimeout(tryNow, 250 * Math.pow(1.1, numAttempts));
            }
        }
    };
    tryNow();
}

function clearNavLinks() {
    const shortsLinks = document.querySelectorAll(window.NAV_BAR_SELECTOR)

    if (!shortsLinks || shortsLinks.length === 0) return false

    for (let link of shortsLinks) {
        link.parentNode.removeChild(link)
        log('Removed youtube shorts link from left nav-bar')
    }

    return true
}

function clearShortsSection(s = window.MAIN_PAGE_SELECTOR) {
    let shortsSection = document.querySelector(s)

    if (!shortsSection) return

    shortsSection.parentNode.removeChild(shortsSection)
    log('Removed shorts section from page')
}

function listenForNavigatorEventsAndClear() {
    window.addEventListener("yt-navigate-finish", () => {
        if (userIsOnMainPage()) {
            runWhenReady(window.MAIN_PAGE_SELECTOR, clearShortsSection)
        } else if (userIsWatching()) {
            runWhenReady(window.YOUTUBE_REEL_SELECTOR, () => clearShortsSection(window.YOUTUBE_REEL_SELECTOR))
        }
    })
}

function userIsOnMainPage() {
    return window.location.href === window.BASE_YOUTUBE_URL
}

function userIsWatching() {
    return window.location.href.includes("/watch?v=")
}

function log(msg) {
    console.log(window.LOG_PREFIX, msg)
}
