require([ 'underscore' ], function( ){

        var contentscripts = [];

        function injectScripts( tab, callback ){

            if( contentscripts[tab.id] ){
                callback();
            }else{

                contentscripts[tab.id] = true;

                chrome.tabs.executeScript( tab.id, {file:'/utils/port.js'}, function(){

                    chrome.tabs.executeScript( tab.id, {file:'/injected/contentscript.js'}, callback );

                });
            }


        }


        chrome.runtime.onConnect.addListener( function( devport ) {

            console.log( devport.name );
            if( devport.name.indexOf( 'dev_tool_' ) === 0 ){

                chrome.tabs.get( Number( devport.name.split( 'dev_tool_')[1] )|0, function( aTab ) {

                    var tab = aTab,
                        tabUrl = tab.url,
                        contentport;

                    if( tabUrl.indexOf( "chrome-devtools://") !== -1 ) return;

                    injectScripts( tab, function(){



                        function connectContentPort(){

                            if( !contentport.messageHandler && !contentport.disconnectHandler ){

                                contentport.messageHandler = function( evt ) {
                                    devport.postMessage({ type: evt.type , message:evt.message });
                                }

                                contentport.disconnectHandler = function() {
                                    // delete contentport;
                                    contentscripts[tab.id] = false;
                                    contentport.onMessage.removeListener( contentport.messageHandler );
                                    contentport.onDisconnect.removeListener( contentport.disconnectHandler );
                                    devport.postMessage({type:"DISCONNECTED"});
                                }

                                contentport.onMessage.addListener( contentport.messageHandler );
                                contentport.onDisconnect.addListener( contentport.disconnectHandler );
                            }

                        }


                        // TODO :: Add RegExp for file:// schema check
                        //^[^:]+

                        chrome.tabs.onUpdated.addListener( function( tabID, info, tabRef ){

                            if( tabID !== tab.id ) return;
                            if(  tabRef.status === 'complete'){

                                tabUrl = tabRef.url;
                                //We've lost the content script, so need to re-establish a connection


                                injectScripts( tab.id, function(){
                                    contentport = chrome.tabs.connect( tab.id, {name:'content' });

                                    chrome.extension.isAllowedFileSchemeAccess( function( allowed ){
                                        connectContentPort();
                                        devport.postMessage({type:"PAGE_CHANGED", fileAccess:allowed});
                                    });
                                });

                            }
                        });


                        contentport = chrome.tabs.connect( tab.id, {name:'content' });


                        devport.messageHandler = function( evt ) {
                            if( contentport ) contentport.postMessage({ type: evt.type , message:evt.message });
                        };

                        devport.onMessage.addListener( devport.messageHandler );


                        devport.onDisconnect.addListener( function() {

                            devport.onMessage.removeListener( devport.messageHandler )
                            // console.log( 'DISCONNECTED DEVTOOLS' );

                        });


                        chrome.extension.isAllowedFileSchemeAccess( function( allowed ){
                            connectContentPort();
                            devport.postMessage({type:"CONNECTED", fileAccess:allowed});
                        });

                    });
                });


            }

        });




});


// chrome.runtime.onStartup.addListener(function() {
//             console.log( 'startup' );
//         });

//         chrome.runtime.onInstalled.addListener(function() {
//             console.log( 'installed' );
//         });

//         chrome.runtime.onSuspend.addListener(function() {
//             console.log( 'suspend' );
//         });

//         chrome.runtime.onSuspendCanceled.addListener(function() {
//             console.log( 'suspend canceled' );
//         });

//         chrome.runtime.onUpdateAvailable.addListener(function() {
//             console.log( 'update available' );
//         });