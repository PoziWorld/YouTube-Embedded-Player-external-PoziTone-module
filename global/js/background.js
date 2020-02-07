/* =============================================================================

  Product: PoziTone module for YouTube embedded player
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

  Table of Contents:

    Listeners
      runtime.onInstalled
      runtime.onMessageExternal

 ============================================================================ */

( function() {
  'use strict';

/* =============================================================================

  Listeners

 ============================================================================ */

  /**
   * Fired when the extension is first installed, 
   * when the extension is updated to a new version, 
   * and when Chrome is updated to a new version.
   *
   * @type    method
   * @param   objDetails
   *            Reason - install/update/chrome_update - 
   *            and (optional) previous version.
   * @return  void
   **/

  chrome.runtime.onInstalled.addListener(
    function( objDetails ) {
      if ( objDetails.reason === 'install' ) {
        pozitoneModule.utils.openOptionsPage( 'background' );
      }
    }
  );

  /**
   * Listens for commands sent from PoziTone.
   * If requested function found, call it.
   *
   * @type    method
   * @param   objMessage
   *            Message received.
   * @param   objSender
   *            Sender of the message.
   * @param   funcSendResponse
   *            Used to send a response.
   * @return  void
   **/

  chrome.runtime.onMessageExternal.addListener(
    function( objMessage, objSender, funcSendResponse ) {
      pozitoneModule.sdk.processRequest(
          objMessage
        , objSender
        , funcSendResponse
      );

      // Indicate that the response function will be called asynchronously
      return true;
    }
  );

}() );
