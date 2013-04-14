// const CONTENT_CONNECTION = { name: 'JUI' };
// const VERSION = 1;

// var port = PORTS()( "content" );
var port;

function onMessage( e ) {

    if ( event.source != window || event.data.from !== 'JUI' ) return;
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

// console.log('CONTENT SCRIPT' );

// function loop(){
//     console.log('loop');
//     requestAnimationFrame( loop );
// }

// loop();



// port.listen( "CONNECTED", function(){
//     console.log( "CONNECTED" );



// })




// // Events
// var Event = function( type, message )
// {
//   return{
//     type : type || 'GENERIC',
//     message : message || {}
//   }
// }



// var port = chrome.runtime.connect( { name: 'JUI' } );
// port.onMessage.addListener(function( evt ) {
//     console.log(evt)
//     //handleMessage( evt );
// });

// // console.log('test');



// //Message Handling
// var channels = [];
// function handleMessage( evt )
// {
//     evt.type = evt.type.toUpperCase();
//     var c = channels.length,
//         channelList,
//         i;
//     for(var type in channels){
//         channelList = channels[type];
//         i = channelList.length;
//         if( evt.type === type ){
//             while (i-- > 0) {
//                 channelList[i]( evt.message );
//             };
//         }
//     };
// }


// function registerChannel( channel, callback )
// {
//     channel = channel.toUpperCase();
//     if( channels[ channel ] === undefined )channels[ channel ] = [];
//     channels[ channel ].push( callback );
// }


// //Register channel listeners
// var updated = new Event( 'UPDATED' ),
//     connected = false;

// registerChannel( 'CONNECTED', function ( message ){
//     if( !connected ){

//         window.addEventListener( "message", function( e ) {

//             if ( event.source != window || event.data.from !== 'JUI' ) return;
//             port.postMessage( new Event( event.data.type, event.data ));

//         });

//         connected = true;
//         console.log('CONTENT SCRIPT CONNECTED');
//         window.postMessage( {type:'REQUEST_INIT' }, "*" );
//     }
// });

