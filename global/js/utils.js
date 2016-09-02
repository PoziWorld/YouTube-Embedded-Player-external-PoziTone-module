/* =============================================================================

  Product: PoziTone module for YouTube embedded player
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

  Table of Contents:

    Utils
      checkForRuntimeError()
      getStorageItems()
      setStorageItems()
      createTabOrUpdate()
      openOptionsPage()

 ============================================================================ */

( function() {
  'use strict';

  function Utils() {
    this.strOptionsUiUrlPrefix = 'chrome://extensions?options=';
  }

  /**
   * Runtime sets an error variable when some calls fail.
   *
   * @type    method
   * @param   funcCallback
   *            Do when runtime error is not set.
   * @param   funcErrorCallback
   *            Optional. Callback on error.
   * @param   objErrorLogDetails
   *            Optional. Data to be passed on error.
   * @return  void
   **/

  Utils.prototype.checkForRuntimeError = function(
      funcCallback
    , funcErrorCallback
    , objErrorLogDetails
  ) {
    if ( chrome.runtime.lastError ) {
      if ( typeof objErrorLogDetails !== 'object' ) {
        objErrorLogDetails = {};
      }

      var strErrorMessage = chrome.runtime.lastError.message;

      if ( typeof strErrorMessage === 'string' ) {
        objErrorLogDetails.strErrorMessage = strErrorMessage;
      }

      if ( typeof funcErrorCallback === 'function' ) {
        funcErrorCallback();
      }
    }
    else if ( typeof funcCallback === 'function' ) {
      funcCallback();
    }
  };

  /**
   * Get the requested data from StorageArea.
   *
   * @type    method
   * @param   Storage
   *            Target storage.
   * @param   miscGet
   *            A single key to get, list of keys to get, or a dictionary
   *            specifying default values (see description of the object).
   *            An empty list or object will return an empty result object.
   *            Pass in null to get the entire contents of storage.
   * @param   funcSuccessCallback
   *            Optional. Function to run on success.
   * @param   funcErrorCallback
   *            Optional. Function to run on error.
   * @param   objErrorLogDetails
   *            Optional. Data to be passed on error.
   * @return  void
   **/

  Utils.prototype.getStorageItems = function(
      Storage
    , miscGet
    , funcSuccessCallback
    , funcErrorCallback
    , objErrorLogDetails
  ) {
    var self = this;

    Storage.get( miscGet, function( objReturn ) {
      self.checkForRuntimeError(
          function() {
            if ( typeof funcSuccessCallback === 'function' ) {
              funcSuccessCallback( objReturn );
            }
          }
        , funcErrorCallback
        , objErrorLogDetails
      );
    } );
  };

  /**
   * Set multiple items in StorageArea.
   *
   * @type    method
   * @param   Storage
   *            Target storage.
   * @param   objItems
   *            An object which gives each key/val pair to update storage with.
   * @param   funcSuccessCallback
   *            Optional. Function to run on success.
   * @param   funcErrorCallback
   *            Optional. Function to run on error.
   * @param   objErrorLogDetails
   *            Optional. Data to be passed on error.
   * @return  void
   **/

  Utils.prototype.setStorageItems = function(
      Storage
    , objItems
    , funcSuccessCallback
    , funcErrorCallback
    , objErrorLogDetails
  ) {
    var self = this;

    Storage.set( objItems, function() {
      self.checkForRuntimeError(
          function() {
            if ( typeof funcSuccessCallback === 'function' ) {
              funcSuccessCallback();
            }
          }
        , funcErrorCallback
        , objErrorLogDetails
      );
    } );
  };

  /**
   * Create tab if it is not open or makes it active.
   *
   * @type    method
   * @param   strUrl
   *            URL to open.
   * @return  void
   **/

  Utils.prototype.createTabOrUpdate = function ( strUrl ) {
    var objUrl = { url: strUrl };

    if ( ~~ strUrl.indexOf( this.strOptionsUiUrlPrefix ) ) {
      chrome.tabs.query( objUrl, function( objTabs ) {
        if ( objTabs.length ) {
          chrome.tabs.update( objTabs[ 0 ].id, { active: true } );
        }
        else {
          chrome.tabs.create( objUrl );
        }
      } );
    }
    else {
      chrome.tabs.create( objUrl );
    }
  };

  /**
   * Open Options page.
   *
   * @type    method
   * @param   strCaller
   *            Where this was called from (action or event name).
   * @return  void
   **/

  Utils.prototype.openOptionsPage = function( strCaller ) {
    var self = this;

    if ( boolConstIsBowserAvailable && strConstChromeVersion >= '42.0' ) {
      chrome.runtime.openOptionsPage( function() {
        self.checkForRuntimeError(
            undefined
          , undefined
          , { strCaller : strCaller || '' }
        );
      } );
    }
    else {
      // Link to new Options UI for 40+
      var strOptionsUrl =
            boolConstUseOptionsUi
              ? 'chrome://extensions?options=' + strConstExtensionId
              : chrome.extension.getURL( 'options/index.html' )
              ;

      self.createTabOrUpdate( strOptionsUrl );
    }
  };

  if ( typeof pozitoneModule === 'undefined' ) {
    window.pozitoneModule = {};
  }

  pozitoneModule.utils = new Utils();
}() );
