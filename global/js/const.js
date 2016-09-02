/* =============================================================================

  Product: PoziTone module for YouTube embedded player
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

  Table of Contents:

    Constants
    Storage

 ============================================================================ */

/* =============================================================================

  Constants

 ============================================================================ */

const
    // Extension
    strConstExtensionId = chrome.runtime.id
  , objConstExtensionManifest = chrome.runtime.getManifest()
  , strConstExtensionName = objConstExtensionManifest.name
  , strConstExtensionVersion = objConstExtensionManifest.version

    // Browser & UI
  , boolConstIsBowserAvailable = typeof bowser === 'object'
  , boolConstIsOpera = boolConstIsBowserAvailable && bowser.name === 'Opera'
  , boolConstIsYandex = boolConstIsBowserAvailable && bowser.name === 'Yandex.Browser'
  , boolConstIsOperaAddon = boolConstIsOpera || boolConstIsYandex
  , strConstChromeVersion = boolConstIsBowserAvailable ? bowser.chromeVersion : ''
  , boolConstUseOptionsUi = strConstChromeVersion >= '40.0' && ! boolConstIsOpera

  , objConst = {
        strPozitoneEdition : 'test' // TODO: Use proper edition
      , strModuleId : 'com_youtube'
      , strModuleReadmeUrl : 'https://github.com/PoziWorld/YouTube-Embedded-Player-external-PoziTone-module/blob/master/README.md'
      , strHostApiVersionVar : 'strHostApiVersion'
      , strPozitoneInstallationUrl : ( ! boolConstIsOperaAddon
          ? 'https://chrome.google.com/webstore/detail/pozitone/bdglbogiolkffcmojmmkipgnpkfipijm'
          : 'https://addons.opera.com/extensions/details/pozitone/'
        )
    }
  ;

/* =============================================================================

  Storage

 ============================================================================ */

var StorageApi = chrome.storage
  , StorageLocal = StorageApi.local
  , StorageSync = StorageApi.sync || StorageLocal
  ;
