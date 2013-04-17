
var port;

function onMessage( e ) {

    if ( event.source != window || event.data.from !== 'Adjust' ) return;
    if( port ) port.sendMessage( event.data.type, event.data.message );

}


var onConnect = function( p){

    if( p.name !== 'content' ) return;

    port = PORTS()( p );

    port.listen( ["REQUEST_OBJECT_DEF", "UPDATED", "CHANGED" ], function( evt ){
        window.postMessage( {type:evt.type, message:evt.message }, "*" );
    })

    port.port.onDisconnect.addListener( function( ){
        console.log('CONTENT DISCONNECTED' );
        port = null;
        chrome.runtime.onConnect.removeListener( onConnect );
        window.removeEventListener( "message", onMessage );
    })

    window.addEventListener( "message", onMessage );

};

chrome.runtime.onConnect.addListener( onConnect );
