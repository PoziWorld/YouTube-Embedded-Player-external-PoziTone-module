/* =============================================================================

  Product: PoziTone module for YouTube embedded player
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

  Table of Contents:

    Constants
    Listeners

 ============================================================================ */

( function () {
  'use strict';

/* =============================================================================

  Constants

 ============================================================================ */

  const
      objSettings = {
          // TODO: Let object name be anything
          objSettings_com_youtube : {
              // TODO: Let provide i18n names
              strName : chrome.i18n.getMessage( 'shortName' )
            , boolIsEnabled : true
            , boolShowNotificationLogo : true
            , strNotificationLogo : 'site'
            , arrAvailableNotificationButtons : [
                  'next'
                , 'previous'
                , 'playStop'
                , 'muteUnmute'
                , 'volumeUp'
                , 'volumeDown'
              ]
            , arrActiveNotificationButtons : [
                  'playStop'
                , 'muteUnmute'
              ]
            , boolShowNotificationWhenMuted : false
              // TODO: Change
            , strRegex : '(http:\/\/|https:\/\/)youtube.com\/.*'
            , boolUseGeneralVolumeDelta : true
            , intVolumeDelta : 10
          }
      }
    ;

/* =============================================================================

  Listeners

 ============================================================================ */

  document.addEventListener( 'DOMContentLoaded', function (  ) {
    pozitoneModule.page.init();
    pozitoneModule.api.init( objConst.strPozitoneEdition, undefined, boolConstIsOperaAddon );

    var $$connectCta = document.getElementById( 'connectCta' )
      , $$openModuleSettingsCta = document.getElementById( 'openModuleSettingsCta' )
      , $limitationsDisclaimer = document.getElementById( 'limitationsDisclaimer' )
      , $readme = document.getElementById( 'readme' )
      , boolDocumentContainsConnectModuleCta = document.contains( $$connectCta )
      , boolDocumentContainsOpenModuleSettingsCta = document.contains( $$openModuleSettingsCta )
      , boolDocumentContainsLimitationsDisclaimer = document.contains( $limitationsDisclaimer )
      , boolDocumentContainsReadme = document.contains( $readme )
      ;

    if ( boolDocumentContainsConnectModuleCta ) {
      $$connectCta.addEventListener( 'click', function ( objEvent ) {
        var $$this = this;
  
        pozitoneModule.api.connectModule(
            objSettings
          , function( objResponse, intStatusCode, strApiVersion ) {
              $$this.disabled = true;
  
              // Show message
              document.getElementById( 'connectionStatus' ).textContent = objResponse.strMessage;
  
              // Show button to open settings
              if ( boolDocumentContainsOpenModuleSettingsCta ) {
                $$openModuleSettingsCta.hidden = false;
              }

              // Show limitations disclaimer
              if ( boolDocumentContainsLimitationsDisclaimer ) {
                $limitationsDisclaimer.hidden = false;
              }

              // Show readme
              if ( boolDocumentContainsReadme ) {
                $readme.querySelector('a').href = objConst.strModuleReadmeUrl;
                $readme.hidden = false;
              }

              // Save Host API version
              var strHostApiVersion = objConst.strHostApiVersionVar;

              // TODO: No need to get, set right away
              pozitoneModule.utils.getStorageItems(
                  StorageLocal
                , strHostApiVersion
                , function( objStorage ) {
                    if ( typeof objStorage === 'object' && ! Array.isArray( objStorage )  ) {
                      objStorage[ strHostApiVersion ] = strApiVersion;
  
                      pozitoneModule.utils.setStorageItems( StorageLocal, objStorage );
                    }
                  }
              );
            }
          , function( objResponse, intStatusCode, strApiVersion ) {
              var strMessage;
  
              if ( typeof objResponse === 'object' && ! Array.isArray( objResponse ) ) {
                strMessage = objResponse.strMessage;
              }
              else if ( typeof intStatusCode === 'number' ) {
                strMessage = chrome.i18n.getMessage( 'pozitoneModuleApiConnectStatusCode' + intStatusCode );
              }
              else {
                strMessage = chrome.i18n.getMessage( 'pozitoneModuleApiConnectUnrecognizedError' );
              }
  
              document.getElementById( 'connectionStatus' ).innerHTML = strMessage;

              if ( document.getElementById( 'apiConnectInstallationLink' ) ) {
                document.getElementById( 'apiConnectInstallationLink' ).href = objConst.strPozitoneInstallationUrl;
              }
            }
        );
      } );
    }

    if ( boolDocumentContainsOpenModuleSettingsCta ) {
      $$openModuleSettingsCta.addEventListener( 'click', function ( objEvent ) {
        pozitoneModule.api.openModuleSettings( objConst.strModuleId );
      } );
    }

    // If connected, show "Open module settings" CTA. Otherwise, "Connect module"
    var strHostApiVersionVar = objConst.strHostApiVersionVar;

    pozitoneModule.utils.getStorageItems(
        StorageLocal
      , strHostApiVersionVar
      , function( objStorage ) {
          if ( typeof objStorage === 'object' && ! Array.isArray( objStorage )  ) {
            var strHostApiVersion = objStorage[ strHostApiVersionVar ];

            if ( typeof strHostApiVersion === 'string' && strHostApiVersion !== '' ) {
              if ( boolDocumentContainsConnectModuleCta ) {
                $$connectCta.disabled = true;
              }

              if ( boolDocumentContainsOpenModuleSettingsCta ) {
                $$openModuleSettingsCta.hidden = false;
              }

              if ( boolDocumentContainsLimitationsDisclaimer ) {
                $limitationsDisclaimer.hidden = false;
              }

              if ( boolDocumentContainsReadme ) {
                $readme.querySelector('a').href = objConst.strModuleReadmeUrl;
                $readme.hidden = false;
              }
            }
            else {
              // TODO: Add error handling
            }
          }
        }
    );
  } );

}() );
