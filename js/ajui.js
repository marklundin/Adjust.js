A = {
	all: []
};

(function( global ){


    if( !Object.observe ){
        console.error( "ADJS cannot run without certain javascript features. You do not seem to have these enabled. These can be enabled by right-clicking this link, chrome://flags/ then click enable on the <b>Enable Experimental JavaScript</b> setting. You will then to restart you browser")
        return;
    }

    var Event = function( type, message ){
      this.type     = type || 'GENERIC';
      this.from     = 'JUI';
      this.message  = message || {};
    }

    window.addEventListener( "message", function( e ) {


        if( e.data.type === "REQUEST_OBJECT_DEF" ){

            var i = 0;
            var l = A.all.length;
            var manifest = [];
            while( i < l ){
                manifest.push( {
                    name: A.all[i].name,
                    id: A.all[i].id,
                    definition: makesafe( A.all[i].api )
                });
                i++;
            }

            var evt = new Event( "OBJ_DEF", manifest );
            window.postMessage( evt, "*");

        }else if( e.data.type == 'CHANGED' ){

            var change = e.data.message;

            // handle functions
            if( typeof A.all[change.from].api[change.prop] === 'function' ){
                A.all[change.from].api[change.prop].call( null );
            }


            Object.unobserve( A.all[change.from].api, A.all[change.from].changeHandler );
            A.all[change.from].api[change.prop] = change.value;
            // console.log(  A.all[change.from].api[change.prop] )
            Object.observe( A.all[change.from].api, A.all[change.from].changeHandler );
        }
    });

    var JUI = function( apiObjOrString, apiObj ){

        var nameDefined = typeof apiObjOrString === 'string';
        this.name = nameDefined ? apiObjOrString : "ADJS " + ( A.all.length + 1 );
        this.api = nameDefined ? apiObj : apiObjOrString;
        this.id = A.all.length;
        this.changeHandler = changeHandler.bind( this, this.id );
        A.all.push( this );
        Object.observe( this.api, this.changeHandler );

        init( this );
    }


    function init( adjs )
    {
        var message = {
            name: adjs.name,
            id: adjs.id,
            definition: makesafe( adjs.api )
        }

        // console.log( message );

        var evt = new Event( "INIT", message );
        window.postMessage( evt, "*" );
    }

    function makesafe( api ){
        var clone = {};
        for (var i in api) {
            if (api.hasOwnProperty(i)) {
                clone[i] = typeof api[i] === 'function' ? "-*ad.js function*-" : api[i];
            }
        }
       return clone;
    }

	function changeHandler( index, changes ) {

        var changed = false;
	    changes.forEach(function( change ) {

			changed = ( change.oldValue !== change.object[ change.name ] );

	    	if ( changed ) {

                var evt = new Event(
                    change.type,
                    {
                        from:index,
                        change:{
                            name: change.name,
                            value: change.object[change.name]
                        }
                    }
                );

                window.postMessage( evt, "*" );

			}
		}, this );
	}

    global.JUI = JUI;

}( A ))