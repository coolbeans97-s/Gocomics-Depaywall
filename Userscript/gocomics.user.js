// ==UserScript==
// @name        Gocomics Depaywall
// @description Bypasses the Gocomics Paywall and Removes Ads
// @icon        https://github.com/coolbeans97-s/Gocomics-Depaywall/raw/refs/heads/master/Extension/icons/border-48.png
// @match       *://*.gocomics.com/*
// @grant       none
// @version     2.2
// @author      Idiot01
// @compatible  chrome
// @compatible  firefox
// @compatible  opera
// @compatible  safari
// @compatible  edge
// @downloadURL https://github.com/coolbeans97-s/Gocomics-Depaywall/raw/master/Userscript/gocomics.user.js
// @updateURL   https://github.com/coolbeans97-s/Gocomics-Depaywall/raw/master/Userscript/gocomics.user.js
// @run-at      document-start
// ==/UserScript==

(function () {
  'use strict';

  // 1. Inject Pure CSS for Hiding Ads and Auto-Scaling Images
  const css = `
    div[class*="AdDisplay"],
    div[class*="HeaderAd"],
    div[class*="RollUpUpsell"],
    div[class*="UpsellSectionBreak"],
    div[data-paywall] {
        display: none !important;
    }
    
    img[class*="Comic-module-scss-module__3szrOa__comic__image"] {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        display: block !important;
        object-fit: contain !important;
    }
    
    html, body {
        overflow: auto !important;
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // 2. JavaScript Engine to Intercept and Replace the Skeleton View
  const targetClass = 'ShowComicViewer-module-scss-module__q5dCdq__showComicViewer__skeleton';

  function replaceSkeleton(skeletonEl) {
    // Safely pull the high-res image source from page metadata
    const metaImage = document.querySelector('meta[property="og:image"]');
    const imgSrc = metaImage ? metaImage.getAttribute('content') : '';

    if (!imgSrc) return; // Don't replace if image source isn't ready yet

    // Inject the structured layout tree matching standard viewports
    const customHTML = `
        <div class="ComicViewer-module-scss-module__FfaN_W__comicViewer">
            <div dir="ltr" class="ScrollContainer-module-scss-module__vx0EGq__scrollZone" data-testid="scroll-container-root" style="position: relative; --radix-scroll-area-corner-width: 0px; --radix-scroll-area-corner-height: 0px;">
                <style>
                    [data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}
                    [data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}
                </style>
                <div data-radix-scroll-area-viewport="" class="ScrollContainer-module-scss-module__vx0EGq__scrollZone__viewport" style="overflow: scroll hidden;">
                    <div style="min-width: 100%; display: table;">
                        <div class="ScrollContainer-module-scss-module__vx0EGq__scrollZone__content ScrollContainer-module-scss-module__vx0EGq__scrollZone__content_container">
                            <div class="ScrollContainer-module-scss-module__vx0EGq__scrollZone__children">
                                <div class="Comic-module-scss-module__3szrOa__comic" data-aspect-ratio="3.488">
                                    <button aria-disabled="false" aria-label="Expand comic" class="Comic-module-scss-module__3szrOa__comic__lightboxTrigger" type="button">
                                        <img alt="Comic panel" decoding="async" data-nimg="1" class="Comic-module-scss-module__3szrOa__comic__image Comic-module-scss-module__3szrOa__comic__image_isStrip" src="${imgSrc}">
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    skeletonEl.outerHTML = customHTML;
  }

  // Monitor DOM generation patterns to catch elements before structural scripts lock them down
  const observer = new MutationObserver((mutations) => {
    const skeleton = document.querySelector(`.${targetClass}`);
    if (skeleton) {
        replaceSkeleton(skeleton);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();

// chat ads hidden within closed shadow root, can't remove
