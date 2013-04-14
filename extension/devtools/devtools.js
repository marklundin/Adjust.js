require([
    'port',
    'controls'
    ],function(
        connect,
        control
    ){

    var control_model,
        container, doc,
        viewReady = false,
        controllers = [], port,
        jQuery, wind, browserConfigured;


    function log( message ){
        chrome.experimental.devtools.console.addMessage( chrome.experimental.devtools.console.Severity.Log, "AD.JS: " + message );
    }

    chrome.devtools.panels.create( 'Adjs', '/assets/icon_32.png', '/devtools/page.html', function( extensionPanel ){

        //fns

        function isViewableProp( value ){

            return  value === '-*ad.js function*-' ||
                    typeof value === 'string' ||
                    typeof value === 'number' ||
                    typeof value === 'boolean';
        }

        var colorSignatures = [
            {
                r:0,
                g:0,
                b:0
            }
        ]
        function getController( name, value ){
            console.log( definesSignature( value, colorSignatures ), value, colorSignatures );
            return ( value === '-*ad.js function*-' ) ? new control.Button( name, value ) :
                   ( definesSignature( value, colorSignatures ) ) ? new control.Color( name, value, wind )  :
                   ( typeof value === 'string' )    ? new control.TextInput( name, value ) :
                   ( typeof value === 'number' )    ? new control.Slider( name, value )  :
                   ( typeof value === 'boolean' )   ? new control.CheckBox( name, value )  : null;
        }

        function getSignature( value ){
            return false;
        }


        function setElemValue( elem, value ){
            if( elem.type === 'button' ) return;
            elem.type === 'checkbox' ? elem.checked = value :
            elem.type === 'text' ? elem.value  = value :
            elem.type === 'range' ? elem.value  = value : null;
        }


        function clean(){

            //remove listeners
            if( controllers )
            {
                for( var inst in controllers )
                {
                    for( var contrs in controllers[inst] ){

                        controllers[inst][contrs].onchange = null

                    }
                }
            }

            //clean dom
            if( container ){
                while (container.firstChild) {
                    console.log( 'test' );
                    container.removeChild(container.firstChild);
                }
            }

            controllers = []

        }

        function definesSignature( obj, signatures ){

            var i = signatures.length,
                signature;

            while( i-- > 0 ){
                signature = signatures[i];
                for( var prop in signature ){
                    if( signature.hasOwnProperty( prop ) && obj.hasOwnProperty( prop ) ){
                        if( typeof obj[prop] !== typeof signature[prop]) return false;
                    }else{
                        return false;
                    }
                }
            }
            return true;
        }

        function createView( model ){

            var domElem, subCont, def,
                heading, name, label,
                controllerElem;

            console.log( model.length );

            for( var i = 0 ; i < model.length ; i++ ){

                name = model[i].name;
                log( name );

                subCont = doc.createElement( 'div' );
                heading = doc.createElement( 'h3' );

                subCont.id = name;
                subCont.className = 'adjs-instance';

                heading.innerHTML = name;

                subCont.appendChild( heading );
                container.appendChild( subCont );

                var instControllers = [];


                def = model[i].definition;
                for( var prop in def ){

                    // if( isViewableProp( def[prop] )){

                    var controllier = getController( prop, def[prop] );
                    if( controllier ){
                        controllier.domElement.id = prop;
                        controllier.domElement.className = 'controller';

                        controllier.onchange = function( c, index, propName ){
                            port.sendMessage( 'CHANGED', {from:index, prop:propName, value:c.value })

                        }.bind( this, controllier, controllers.length, prop );

                        instControllers[prop] = controllier;
                        subCont.appendChild( controllier.domElement );

                    }
                }

                controllers[controllers.length] = instControllers;

            }

            viewReady = true;

        }

        extensionPanel.onShown.addListener( function( window ){

            wind = window
            doc = window.document;

            if( !browserConfigured ){
                window.$( '#warning' ).html( "<img src='/assets/icon_32.png'></img><h1 style='display:inline; padding:15px;'>Oops...</h1><h2>You're browser is not configured correctly</h2><span>Adjust uses certain new javascript features that appear to be disable in this version of Chrome. To enable them, open the url <b><u>chrome://flags</u></b> and enable the <b>Enable Experimental JavaScript</b> setting, then restart your browser.</span>" );
                return;
            }else{
                window.$( '#warning' ).hide();
            }

            container = doc.querySelector( '#container' );
            if( control_model && !viewReady ) createView( control_model );

        });


        chrome.devtools.inspectedWindow.eval(
            "Object.observe",
            function(result, isException) {

                browserConfigured = result !== undefined;
                if( !browserConfigured  ) return;


                //Events
                //
                port = connect( 'dev_tool_'+chrome.devtools.inspectedWindow.tabId  );

                port.listen( ["CONNECTED", "PAGE_CHANGED"], function( evt ){

                    log( evt.type );
                    control_model = null;
                    port.sendMessage( 'REQUEST_OBJECT_DEF' );

                });

                port.listen( "DISCONNECTED", function(){
                    log( 'CLEANING' );
                    clean();
                });

                port.listen( 'UPDATED', function( evt ){

                    if( controllers && controllers[evt.message.from] ){
                        var controlier = controllers[evt.message.from][evt.message.change.name ];
                        if( controlier ) controlier.value = evt.message.change.value;
                    }
                    // log( 'UPDATED FROM: ' + evt.message.from + ". Change is, " + evt.message.change.name + " = " + evt.message.change.value );

                });

                port.listen( 'DELETED', function( evt ){
                    log( "DELETED" );
                    if( controllers && controllers[evt.message.from] ){
                        var controlier = controllers[evt.message.from][evt.message.change.name ];
                        controlier.onchange = null
                        wind.$( controlier.domElement ).remove();

                        //TODO :: Remove element from controller arr.

                    }
                });

                port.listen( 'OBJ_DEF', function( evt ){

                    log( 'OBJ_DEF' );
                    control_model = evt.message;
                    if( container ) createView( control_model );

                });

                port.listen( 'INIT', function( evt ){

                    log( 'INIT')
                    var model = evt.message;
                    if( container ) createView( [model] );
                    control_model[control_model.length] = evt.message;

                });



            }
        );

    });

});
