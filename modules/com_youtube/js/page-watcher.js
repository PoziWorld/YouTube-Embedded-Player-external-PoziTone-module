/* =============================================================================

  Product: PoziTone module for YouTube embedded player
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

  Table of Contents:

    PageWatcher
      init()
      addRuntimeOnMessageListener()
      onPlayerReady()
      onPlayerStateChange()
      convertNotificationLogoUrl()
      setActiveWidget()
      getActiveWidget()
      getInitedWidget()
      onPlay()
      onPause()
      sendMediaEvent()
      triggerPlayerAction_next()
      triggerPlayerAction_previous()
      triggerPlayerAction_playStop()
      triggerPlayerAction_mute()
      triggerPlayerAction_unmute()
      triggerPlayerAction_muteUnmute()
      triggerPlayerAction_volumeUp()
      triggerPlayerAction_volumeDown()
      triggerVolumeChange()
      triggerPlayerAction_showNotification()
      initObserver()
      initBodyObserver()
      createWidgetsArray()
      getPlayerVolume()

 ============================================================================ */

( function() {
  'use strict';

  function PageWatcher() {
    var _this = this;
    const strModule = 'com_youtube';
    const strImgPath = 'modules/' + strModule + '/img/';

    this.DisconnectableObserver = null;
    this.widgets = [];
    this.initedWidgets = [];

    this.objSettings = {
        boolIsUserLoggedIn : false
      , boolHadPlayedBefore : false
      , boolDisregardSameMessage : true
    };

    this.objPlayerInfo = {
        strModule : strModule
      , boolIsReady : false
      , boolIsPlaying : false
      , boolIsMuted : false
      , intVolume : 0
      , intVolumeBeforeMuted : 0
      , boolCanPlayNextTrackLoggedOut : true
      , boolCanPlayPreviousTrackLoggedOut : true
    };

    this.objStationInfo = {
        strStationName : document.title // TODO: Change
      , strStationNamePlusDesc : document.title // TODO: Change
      , strLogoUrl : '/' + strImgPath + 'youtube-embed-pozitone-module-icon-32.png'
      , strLogoDataUri : strImgPath + 'youtube-embed-pozitone-module-icon-80.png'
      , strTrackInfo : ''
      , strAdditionalInfo : ''
      , boolHasAddToPlaylistButton : false
    };

    var promise = new Promise( function( funcResolve, funcReject ) {
      _this.convertNotificationLogoUrl( funcResolve, funcReject );
    } );

    this.strYoutubeIframeSelector = 'iframe[src*="youtube.com"]';
    var $$youtubeIframes = document.querySelectorAll( this.strYoutubeIframeSelector );

    // Have to be exposed to window, otherwise won't work
    window.onYouTubeIframeAPIReady = function (  ) {
      promise
        .then( function () {
          // TODO: Move to onPlayerReady?
          _this.objPlayerInfo.boolIsReady = true;

          if ( ! $$youtubeIframes.length ) {
            _this.initBodyObserver();

            return;
          }

          _this.createWidgetsArray( $$youtubeIframes, _this.widgets );
          _this.init();
          _this.initBodyObserver();
        } )
        ;
    };
  }

  /**
   * Set event listeners, initialize API.
   *
   * @type    method
   * @param   arrWidgets
   *            Optional. Array of YouTube embeds.
   * @return  void
   **/

  PageWatcher.prototype.init = function ( arrWidgets ) {
    var _this = this;
    var widgets = arrWidgets || _this.widgets;
    var initedWidgets = _this.initedWidgets;

    // This is to run only once
    if ( ! initedWidgets.length ) {
      _this.addRuntimeOnMessageListener();
      pozitoneModule.api.init( objConst.strPozitoneEdition, _this, boolConstIsOperaAddon );
    }

    for ( let i = 0, intWidgetsCount = widgets.length; i < intWidgetsCount; i++ ) {
      let widget = widgets[ i ];

      // TODO: Fix cause, not effect
      let initedWidget = this.getInitedWidget( widget );

      if ( pozitoneModule.api.isEmpty( initedWidget ) ) {
        initedWidgets.push( widget );

        let initedWidgetElementNumber = initedWidgets.length - 1;

        // Per widget settings, player & station info
        // Otherwise, wrong buttons may be displayed when there are multiple widgets on one page
        widget.objSettings = Object.assign( {}, _this.objSettings );
        widget.objPlayerInfo = Object.assign( {}, _this.objPlayerInfo );
        widget.objStationInfo = Object.assign( {}, _this.objStationInfo );
      }
    }

    if ( ! arrWidgets ) {
      delete _this.widgets;
    }
  };

  /**
   * Listen for commands sent from Background and/or PoziTone.
   * If requested function found, call it.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.addRuntimeOnMessageListener = function () {
    var _this = this;

    /**
     * Listens for command sent from Background.
     * If requested function found, call it.
     *
     * @type    method
     * @param   objMessage
     *            Message received.
     * @param   objSender
     *            Sender of the message.
     * @param   funcSendResponse
     *            Function used for callback.
     * @return  void
     **/

    chrome.runtime.onMessage.addListener(
      function( objMessage, objSender, funcSendResponse ) {
        pozitoneModule.api.processRequest(
            objMessage
          , objSender
          , funcSendResponse
          , _this
        );

        // Indicate that the response function will be called asynchronously
        return true;
      }
    );
  };

  /**
   * Listen for commands sent from Background and/or PoziTone.
   * If requested function found, call it.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.onPlayerReady = function ( objEvent ) {
    var target = objEvent.target;
    var cachedWidget = this.getInitedWidget( target );

    cachedWidget.objPlayerInfo.boolIsReady = true;

    var cachedWidgetElementNumber = 0;

    this.initedWidgets.filter( function( initedWidget, index ) {
      var boolIsEqualNode = initedWidget.a.isEqualNode( cachedWidget.a );

      if ( boolIsEqualNode ) {
        cachedWidgetElementNumber = index;
      }

      return boolIsEqualNode;
    } );

    // Once widget is ready, it receives many new properties, update cached version
    this.initedWidgets[ cachedWidgetElementNumber ] = Object.assign( this.initedWidgets[ cachedWidgetElementNumber ], target );
  };

  /**
   * Listen for commands sent from Background and/or PoziTone.
   * If requested function found, call it.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.onPlayerStateChange = function ( objEvent ) {
    var target = objEvent.target;
    var cachedWidget = this.getInitedWidget( target );
    var objPlayerState = YT.PlayerState;
    var cachedWidgetElementNumber = 0;

    this.initedWidgets.filter( function( initedWidget, index ) {
      var boolIsEqualNode = initedWidget.a.isEqualNode( cachedWidget.a );

      if ( boolIsEqualNode ) {
        cachedWidgetElementNumber = index;
      }

      return boolIsEqualNode;
    } );

    // Update player status in cached version
    this.initedWidgets[ cachedWidgetElementNumber ] = Object.assign( this.initedWidgets[ cachedWidgetElementNumber ], target );

    switch ( objEvent.data ) {
      case objPlayerState.PLAYING:
        this.onPlay( cachedWidget );
        break;
      case objPlayerState.PAUSED:
      case objPlayerState.ENDED:
        this.onPause( cachedWidget );
        break;
    }
  };

  /**
   * Provide relative notification logo URL/src, get data URL.
   *
   * PoziTone can't access image files from other extensions.
   * Thus, image URLs have to be data URLs.
   *
   * @type    method
   * @param   funcResolve
   * @param   funcReject
   * @return  void
   **/

  PageWatcher.prototype.convertNotificationLogoUrl = function ( funcResolve, funcReject ) {
    var _this = this;

    pozitoneModule.api.convertImageSrcToDataUrl(
        chrome.runtime.getURL( _this.objStationInfo.strLogoDataUri )
      , function ( strDataUri ) {
          _this.objStationInfo.strLogoDataUri = strDataUri;
          funcResolve();
        }
      , 5
    );
  };

  /**
   * Save the provided widget as the last active, so that when a command is sent
   * it's applied to the appropriate widget.
   *
   * @type    method
   * @param   widget
   *            The currently active widget.
   * @return  void
   **/

  PageWatcher.prototype.setActiveWidget = function ( widget ) {
    this.widget = widget;
  };

  /**
   * Get the last active widget (the one the last event occurred on).
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  object
   **/

  PageWatcher.prototype.getActiveWidget = function () {
    var widget = this.widget;

    if ( widget ) {
      return widget;
    }
    else {
      var widgets = this.initedWidgets;

      if ( widgets.length ) {
        this.setActiveWidget( widgets[ 0 ] );

        return this.getActiveWidget();
      }
      else {
        return null;
      }
    }
  };

  /**
   * Get the last active widget (the one the last event occurred on).
   *
   * @type    method
   * @param   notInitedWidget
   *            This widget was cached before it got inited.
   * @return  object
   **/

  PageWatcher.prototype.getInitedWidget = function ( notInitedWidget ) {
    var arrInitedWidgets = this.initedWidgets.filter( function( initedWidget ) {
      return initedWidget.a.isEqualNode( notInitedWidget.a );
    } );

    if ( arrInitedWidgets.length ) {
      return arrInitedWidgets[ 0 ];
    }
    else {
      return {};
    }
  };

  /**
   * Fired when the sound begins to play.
   *
   * @type    method
   * @param   notInitedWidget
   *            This widget was cached before it got inited.
   * @return  void
   **/

  PageWatcher.prototype.onPlay = function ( notInitedWidget ) {
    var widget = this.getInitedWidget( notInitedWidget );
    var objVideoData = widget.getVideoData();

    widget.objPlayerInfo.boolIsPlaying = true;
    widget.objPlayerInfo.boolIsMuted = widget.isMuted();
    widget.objPlayerInfo.intVolume = widget.getVolume();
    widget.objStationInfo.strTrackInfo = pozitoneModule.api.setMediaInfo( objVideoData.author, objVideoData.title );

    if ( ! widget.objSettings.boolHadPlayedBefore ) {
      this.sendMediaEvent( 'onFirstPlay', widget );
      widget.objSettings.boolHadPlayedBefore = true;
    }
    else {
      this.sendMediaEvent( 'onPlay', widget );
    }
  };

  /**
   * Fired when the sound pauses.
   *
   * @type    method
   * @param   notInitedWidget
   *            This widget was cached before it got inited.
   * @return  void
   **/

  PageWatcher.prototype.onPause = function ( notInitedWidget ) {
    var widget = this.getInitedWidget( notInitedWidget );

    widget.objPlayerInfo.boolIsPlaying = false;
    this.sendMediaEvent( 'onPause', widget );
  };

  /**
   * Send media event information to PoziTone.
   *
   * @type    method
   * @param   strFeedback
   *            Optional. Feedback for main actions (play/stop, mute/unmute).
   * @param   widget
   *            Optional. The widget the event occured on.
   * @return  void
   **/

  PageWatcher.prototype.sendMediaEvent = function ( strFeedback, widget ) {
    if ( widget ) {
      this.setActiveWidget( widget );
    }
    else {
      widget = this.getActiveWidget();
    }

    widget.objStationInfo.strAdditionalInfo =
      ( typeof strFeedback === 'string' && strFeedback !== '' )
        ? strFeedback
        : ''
        ;

    var objData = {
        boolIsUserLoggedIn : widget.objSettings.boolIsUserLoggedIn
      , boolDisregardSameMessage : widget.objSettings.boolDisregardSameMessage
      , objPlayerInfo : widget.objPlayerInfo
      , objStationInfo : widget.objStationInfo
      , strCommand : ''
    };

    pozitoneModule.api.sendMediaEvent( objData );
  };

  /**
   * Simulate "Next" method.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_next = function() {
    this.getActiveWidget().nextVideo();
  };

  /**
   * Simulate "Previous" method.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_previous = function() {
    this.getActiveWidget().previousVideo();
  };

  /**
   * Toggle playback.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_playStop = function() {
    var widget = this.getActiveWidget();
    var objPlayerState = YT.PlayerState;

    switch ( widget.getPlayerState() ) {
      case objPlayerState.PLAYING:
        widget.pauseVideo();
        break;
      case objPlayerState.CUED:
      case objPlayerState.PAUSED:
      case objPlayerState.ENDED:
        widget.playVideo();
        break;
    }
  };

  /**
   * Simulate "Mute" player method
   *
   * @type    method
   * @param   widget
   *            Optional. The currently active widget.
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_mute = function( widget ) {
    widget = widget || this.getActiveWidget();

    widget.objPlayerInfo.intVolumeBeforeMuted = widget.getVolume();
    widget.objPlayerInfo.boolIsMuted = true;
    widget.mute();

    this.sendMediaEvent( 'onMute', widget );
  };

  /**
   * Simulate "Unmute" player method
   *
   * @type    method
   * @param   widget
   *            Optional. The currently active widget.
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_unmute = function( widget ) {
    widget = widget || this.getActiveWidget();
    var intVolumeBeforeMuted = widget.objPlayerInfo.intVolumeBeforeMuted;

    widget.objPlayerInfo.boolIsMuted = false;
    widget.objPlayerInfo.intVolume = intVolumeBeforeMuted;
    widget.unMute();

    this.sendMediaEvent( 'onUnmute', widget );
  };

  /**
   * If volume is not 0, then mute. Otherwise, unmute.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_muteUnmute = function() {
    var widget = this.getActiveWidget();

    if ( widget.isMuted() ) {
      this.triggerPlayerAction_unmute( widget );
    }
    else {
      this.triggerPlayerAction_mute( widget );
    }
  };

  /**
   * Simulate "volume up" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_volumeUp = function() {
    this.triggerVolumeChange( 'up' );
  };

  /**
   * Simulate "volume down" player method
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_volumeDown = function() {
    this.triggerVolumeChange( 'down' );
  };

  /**
   * Simulate "volume up/down" player method
   *
   * @type    method
   * @param   strDirection
   *            'up' or 'down'.
   * @return  void
   **/

  PageWatcher.prototype.triggerVolumeChange = function( strDirection ) {
    var _this = this;
    var widget = this.getActiveWidget();

    this.getPlayerVolume( widget );

    pozitoneModule.api.changeVolume(
        strDirection
      , widget.objPlayerInfo.intVolume
      , function ( intVolume ) {
          if ( typeof intVolume !== 'number' || intVolume < 0 || intVolume > 100 ) {
            return;
          }

          widget.objPlayerInfo.intVolume = intVolume;
          widget.setVolume( intVolume );

          _this.sendMediaEvent( 'onVolumeChange', widget );
        }
    );
  };

  /**
   * Show the last shown notification again.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.triggerPlayerAction_showNotification = function() {
    this.sendMediaEvent( 'onShowNotification' );
  };

  /**
   * Init MutationObserver.
   *
   * @type    method
   * @param   $target
   *            The Node on which to observe DOM mutations.
   * @param   objOptions
   *            A MutationObserverInit object, specifies what DOM mutations should be reported.
   * @param   funcCallback
   *            A function which will be called on each DOM mutation.
   * @param   boolIsDisconnectable
   *            Optional. Whether this observer should be disconnected later.
   * @return  void
   **/

  PageWatcher.prototype.initObserver = function( $target, objOptions, funcCallback, boolIsDisconnectable ) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    if (  typeof boolIsDisconnectable === 'undefined'
      &&  ! boolIsDisconnectable
    ) {
      var observer = new MutationObserver( funcCallback );

      observer.observe( $target, objOptions );
    }
    else {
      // Disconnect the one set previously
      if ( this.DisconnectableObserver ) {
        this.DisconnectableObserver.disconnect();
      }

      this.DisconnectableObserver = new MutationObserver( funcCallback );
      this.DisconnectableObserver.observe( $target, objOptions );
    }
  };

  /**
   * Init <body /> observer
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/

  PageWatcher.prototype.initBodyObserver = function() {
    var _this = this;
    var $target = document.body;
    var objOptions = {
        childList : true
      , subtree : true
    };
    var funcCallback = function( arrMutations ) {
      for ( var i = 0, l = arrMutations.length; i < l; i++ ) {
        var objMutationRecord = arrMutations[ i ]
          , arrAddedNodes = objMutationRecord.addedNodes
          ;

        if ( arrAddedNodes.length ) {
          for ( let i = arrAddedNodes.length - 1; i >= 0; i-- ) {
            var $node = arrAddedNodes[ i ];
            var $parentNode = $node.parentNode;

            if ( ! $parentNode ) {
              continue;
            }

            var $$youtubeIframes = $parentNode.querySelectorAll( _this.strYoutubeIframeSelector );

            if ( $$youtubeIframes && $$youtubeIframes.length ) {
              _this.init( _this.createWidgetsArray( $$youtubeIframes ) );
            }
          }
        }
      }
    };

    _this.initObserver( $target, objOptions, funcCallback, true );
  };

  /**
   * Init <body /> observer
   *
   * @type    method
   * @param   $$youtubeIframes
   *            YouTube iframe player nodes.
   * @param   arrayWidgets
   *            Array to push initialized widget into.
   * @return  array
   **/

  PageWatcher.prototype.createWidgetsArray = function( $$youtubeIframes, arrayWidgets ) {
    var _this = this;

    if ( ! arrayWidgets ) {
      arrayWidgets = [];
    }

    for ( let i = 0, intWidgetsCount = $$youtubeIframes.length; i < intWidgetsCount; i++ ) {
      var $$youtubeIframe = $$youtubeIframes[ i ];
      var strSrc = $$youtubeIframe.src;

      // http://stackoverflow.com/a/8498668/561712
      var $a = document.createElement( 'a' );
      $a.href = strSrc;
      var strSearch = $a.search;
      var intSearchLength = strSearch.length;

      // Enable JS API only if not enabled already
      // TODO: Don't respect 0/false? Otherwise, users may start complaining
      // TODO: -nocookie
      if ( strSearch.indexOf( 'enablejsapi=' ) === -1 ) {
        // https://www.youtube.com/embed/M7lc1UVf-VE
        if ( strSearch === '' ) {
          // Don't append "?" if https://www.youtube.com/embed/M7lc1UVf-VE?
          if ( strSrc.lastIndexOf( '?' ) !== strSrc.length - 1 ) {
            strSearch += '?';
          }

          strSearch += 'enablejsapi=1';
        }
        // https://www.youtube.com/embed/XYZ?rel=0& / https://www.youtube.com/embed/XYZ?rel=0&amp;
        else if ( strSearch.lastIndexOf( '&' ) === intSearchLength - 1
              ||  strSearch.lastIndexOf( '&amp;' ) === intSearchLength - 5
        ) {
          strSearch += 'enablejsapi=1';
        }
        else {
          strSearch += '&enablejsapi=1';
        }

        $$youtubeIframe.setAttribute( 'src', $a.protocol + '//' + $a.hostname + $a.pathname + strSearch );
      }

      arrayWidgets.push( new YT.Player( $$youtubeIframe, {
        events: {
          'onReady': _this.onPlayerReady.bind( _this ),
          'onStateChange': _this.onPlayerStateChange.bind( _this )
        }
    } ) );
    }

    return arrayWidgets;
  };

  /**
   * Gets player volume.
   *
   * @type    method
   * @param   $player
   *            HTML5 media node.
   * @return  void
   **/

  PageWatcher.prototype.getPlayerVolume = function ( widget ) {
    var intVolume = widget.getVolume();

    if ( typeof intVolume === 'number' && intVolume >= 0 && intVolume <= 100 ) {
      widget.objPlayerInfo.intVolume = intVolume;
    }
  };

  if ( typeof pozitoneModule === 'undefined' ) {
    window.pozitoneModule = {};
  }

  pozitoneModule.pageWatcher = new PageWatcher();
}() );
