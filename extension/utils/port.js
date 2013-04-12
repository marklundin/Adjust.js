if( define == undefined ) var define = function(){};

define( PORTS = function(){


    var Event = function( type, message ){
      this.type     = type || 'GENERIC';
      this.message  = message || {};
    }


    function handleMessage( evt, channels )
    {

        evt.type = evt.type.toUpperCase();
        var c = channels.length,
            channelList,
            i;

        for(var type in channels){
            channelList = channels[type];
            if( evt.type === type ){
                i = channelList.length;
                while (i-- > 0) {
                    channelList[i]( evt );
                };
            }
        };
    }


    return function( nameOrPort, connInfo ){

        var channels = [];
        if( !connInfo ) connInfo = {};
        connInfo.name = nameOrPort;
        var port = ( typeof nameOrPort === 'string' ) ? chrome.runtime.connect(connInfo) : nameOrPort;

        port.onMessage.addListener( function( evt ) {
            handleMessage( evt, channels );
        });

        var channel = {
            port: port,
            sendMessage : function( type, data ){
                port.postMessage( new Event( type, data ));
            },
            listen: function ( typeOrTypeArr, callback )
            {
                if( typeOrTypeArr instanceof Array ){
                  var i = typeOrTypeArr.length;
                  while( i-- > 0 ) channel.listen( typeOrTypeArr[i], callback );
                  return;
                }

                typeOrTypeArr = typeOrTypeArr.toUpperCase();
                if( channels[ typeOrTypeArr ] === undefined ) channels[ typeOrTypeArr ] = [];
                channels[ typeOrTypeArr ].push( callback );
            }

        }

        return channel;
    }

})