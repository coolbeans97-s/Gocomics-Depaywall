// ==UserScript==
// @name        Gocomics Depaywall & Comic Replacer
// @description Bypasses the Gocomics Paywall, Removes Ads, and Replaces Skeletons with the Full Comic Viewer scaled to the device viewport
// @icon        https://github.com/coolbeans97-s/Gocomics-Depaywall/raw/refs/heads/master/Extension/icons/border-48.png
// @match       *://*.gocomics.com/*
// @grant       none
// @version     3.1
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

  // 1. Inject Pure CSS for Hiding Ads and Overriding Mini Layouts
  const css = `
    div[class*="AdDisplay"],
    div[class*="HeaderAd"],
    div[class*="RollUpUpsell"],
    div[class*="UpsellSectionBreak"],
    div[data-paywall] {
        display: none !important;
    }
    
    /* Force GoComics container elements to let go of limited max-widths */
    div[class*="ComicViewer-module-scss-module__FfaN_W__comicViewer"],
    div[class*="ScrollContainer-module-scss-module__vx0EGq__scrollZone"],
    div[class*="ScrollContainer-module-scss-module__vx0EGq__scrollZone__viewport"],
    div[class*="ScrollContainer-module-scss-module__vx0EGq__scrollZone__children"],
    div[class*="Comic-module-scss-module__3szrOa__comic"] {
        width: 100vw !important;
        max-width: 100vw !important;
        min-width: 100vw !important;
    }

    /* Target the image directly and force it to fill the device scale width */
    img[class*="Comic-module-scss-module__3szrOa__comic__image"] {
        width: 100vw !important;
        max-width: 100vw !important;
        height: auto !important;
        display: block !important;
        object-fit: contain !important;
        margin: 0 auto !important; /* Centers the canvas drawing context */
    }
    
    html, body {
        overflow: auto !important;
        width: 100% !important;
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // 2. JavaScript Engine to Intercept and Replace the Skeleton View
  const targetClass = 'ShowComicViewer-module-scss-module__q5dCdq__showComicViewer__skeleton';

  function replaceSkeleton(skeletonEl) {
    const metaImage = document.querySelector('meta[property="og:image"]');
    const imgSrc = metaImage ? metaImage.getAttribute('content') : '';

    if (!imgSrc) return; 

    // Custom structure with explicit inline 100vw widths to blast through standard layout barriers
    const customHTML = `
        <div class="ComicViewer-module-scss-module__FfaN_W__comicViewer" style="width: 100vw !important; max-width: 100vw !important;">
            <div dir="ltr" class="ScrollContainer-module-scss-module__vx0EGq__scrollZone" data-testid="scroll-container-root" style="position: relative; --radix-scroll-area-corner-width: 0px; --radix-scroll-area-corner-height: 0px; width: 100vw !important; max-width: 100vw !important;">
                <style>
                    [data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}
                    [data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}
                </style>
                <div data-radix-scroll-area-viewport="" class="ScrollContainer-module-scss-module__vx0EGq__scrollZone__viewport" style="overflow: scroll hidden; width: 100vw !important; max-width: 100vw !important;">
                    <div style="min-width: 100vw !important; width: 100vw !important; display: table;">
                        <div class="ScrollContainer-module-scss-module__vx0EGq__scrollZone__content ScrollContainer-module-scss-module__vx0EGq__scrollZone__content_container" style="width: 100vw !important; max-width: 100vw !important;">
                            <div class="ScrollContainer-module-scss-module__vx0EGq__scrollZone__children" style="width: 100vw !important; max-width: 100vw !important;">
                                <div class="Comic-module-scss-module__3szrOa__comic" data-aspect-ratio="3.488" style="width: 100vw !important; max-width: 100vw !important;">
                                    <button aria-disabled="false" aria-label="Expand comic" class="Comic-module-scss-module__3szrOa__comic__lightboxTrigger" type="button" style="width: 100vw !important; max-width: 100vw !important; background: none; border: none; padding: 0;">
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
