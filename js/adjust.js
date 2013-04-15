
(function(){

    all = [],
    version = "0.0.01"

    var Event = function( type, message ){
      this.type     = type || 'GENERIC';
      this.from     = 'Adjust';
      this.message  = message || {};
    }

    window.addEventListener( "message", function( e ) {

        if( e.data.type === "REQUEST_OBJECT_DEF" ){

            var i = 0;
            var l = all.length;
            var manifest = [];
            while( i < l ){
                manifest.push( {
                    name: all[i].name,
                    id: i,
                    definition: makesafe( all[i].api )
                });
                i++;
            }
            var evt = new Event( "OBJ_DEF", manifest );
            window.postMessage( evt, "*");

        }else if( e.data.type == 'CHANGED' ){

            var change = e.data.message;
            if( typeof all[change.from].api[change.prop] === 'function' ){
                all[change.from].api[change.prop].call( null );
            }

            Object.unobserve( all[change.from].api, all[change.from].changeHandler );
            all[change.from].api[change.prop] = change.value;
            Object.observe( all[change.from].api, all[change.from].changeHandler );
        }
    });

    var Adjust = function( apiObjOrString, apiObj ){

        var nameDefined = typeof apiObjOrString === 'string';
        this.name = nameDefined ? apiObjOrString : "ADJS " + ( all.length + 1 );
        this.api = nameDefined ? apiObj : apiObjOrString;

        this.changeHandler = changeHandler.bind( this );
        all.push( this );
        Object.observe( this.api, this.changeHandler );

        this.remove = function(){

            window.postMessage( new Event( "REMOVE", {from:all.indexOf( this ) } ), "*" );
            all.splice( all.indexOf( this ), 1 );

        }
        init( this );
    }


    function init( adjs )
    {
        var message = {
            name: adjs.name,
            id: all.indexOf( adjs ),
            definition: makesafe( adjs.api )
        }

        var evt = new Event( "INIT", message );
        window.postMessage( evt, "*" );
    }

    function makesafe( api ){
        var clone = {};
        for (var i in api) {
            if (api.hasOwnProperty(i)) {
                clone[i] = getValue( api[i] );
            }
        }
       return clone;
    }

    function getValue( value ){
        return typeof value  === 'function' ? "-*ad.js function*-" : value ;
    }

    function changeHandler( changes ) {

        var changed = false;
        changes.forEach(function( change ) {

            changed = ( change.oldValue !== change.object[ change.name ] );

            if ( changed || change.type === 'new' ) {
                var evt = new Event(
                    change.type,
                    {
                        from: all.indexOf( this ),
                        change:{
                            name: change.name,
                            value: getValue( change.object[change.name] )
                        }
                    }
                );

                window.postMessage( evt, "*" );

            }
        }, this );
    }

    ( typeof require === 'undefined'  ) ? window.Adjust = Adjust : define( function(){return Adjust } );

}());