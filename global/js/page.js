/* =============================================================================

  Product: PoziTone module for YouTube embedded player
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

  Table of Contents:

    Page
      init()
      localize()

 ============================================================================ */

( function() {
  'use strict';

  function Page() {
  }

  /**
   * Initialize.
   *
   * @type    method
   * @param   strPageName
   *            Optional. Page name it's called from.
   * @return  void
   **/

  Page.prototype.init = function ( strPageName ) {
    this.localize( strPageName );
  };

  /**
   * Provide text in the appropriate language for HTML elements that expect it.
   *
   * @type    method
   * @param   strPageName
   *            Optional. Page name it's called from.
   * @param   strCustomSelectorParent
   *            Optional. If only part of the page needs to be localized.
   * @return  void
   **/

  Page.prototype.localize = function( strPageName, strCustomSelectorParent ) {
    var boolIsCustomSelectorParentPresent = typeof strCustomSelectorParent === 'string'
      , strSelectorPrefix = boolIsCustomSelectorParentPresent ? strCustomSelectorParent + ' ' : ''
      , $$allLocalizableElements = document.querySelectorAll( strSelectorPrefix + '[data-i18n]' )
      ;

    for ( var i = 0, l = $$allLocalizableElements.length; i < l; i++ ) {
        var $$localizableElement = $$allLocalizableElements[ i ]
          , strI18 = $$localizableElement.getAttribute( 'data-i18n' )
          , strI18Parameters = $$localizableElement.getAttribute( 'data-i18n-parameters' )
          , arrI18Parameters
          ;

        if ( typeof strI18Parameters === 'string' && strI18Parameters !== '' ) {
          arrI18Parameters = strI18Parameters.split( '|' );
        }

        var strMessage = chrome.i18n.getMessage( strI18, arrI18Parameters );

        if ( $$localizableElement.nodeName === 'LABEL' ) {
          $$localizableElement.innerHTML = $$localizableElement.innerHTML + strMessage;
        }
        else if ( $$localizableElement.nodeName === 'A'
              &&  ! $$localizableElement.classList.contains( 'i18nNoInner' )
        ) {
          $$localizableElement.innerHTML = strMessage;

          if ( $$localizableElement.href === '' ) {
            $$localizableElement.href = chrome.i18n.getMessage( strI18 + 'Href' );
          }
        }
        else if ( $$localizableElement.nodeName === 'IMG' ) {
          $$localizableElement.alt = strMessage;
        }
        else if ( $$localizableElement.nodeName === 'OPTGROUP' ) {
          $$localizableElement.label = strMessage;
        }
        else if ( ! $$localizableElement.classList.contains( 'i18nNoInner' ) ) {
          $$localizableElement.innerHTML = strMessage;
        }

        if ( $$localizableElement.classList.contains( 'i18nTitle' ) ) {
          $$localizableElement.setAttribute( 'title', strMessage );
        }

        // Replace copyright year placeholder with the current year if the start year matches
        // or with a start-current range if the start year is less than the current one.
        var $$copyrightYear = $$localizableElement.getElementsByClassName( 'copyrightYear' );

        if ( $$copyrightYear.length ) {
          [].forEach.call( $$copyrightYear, function ( $$element ) {
            var strCopyrightStartYear = $$element.getAttribute( 'data-copyright-start-year' );

            if ( strCopyrightStartYear && strCopyrightStartYear !== '' && strCopyrightStartYear.length === 4 ) {
              var intCopyrightStartYear = parseInt( strCopyrightStartYear )
                , intCurrentYear = new Date().getFullYear()
                ;

              if ( intCopyrightStartYear < intCurrentYear ) {
                $$element.textContent = '' + intCopyrightStartYear + '-' + intCurrentYear;
              }
              else {
                $$element.textContent = intCurrentYear;
              }
            }
          } );
        }
    }

    if ( ! boolIsCustomSelectorParentPresent && strPageName ) {
      document.title = chrome.i18n.getMessage( strPageName + 'Title' );
    }
  };

  if ( typeof pozitoneModule === 'undefined' ) {
    window.pozitoneModule = {};
  }

  pozitoneModule.page = new Page();
}() );
