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
        controllers = [],
        jQuery, wind;


    function log( message ){
        chrome.experimental.devtools.console.addMessage( chrome.experimental.devtools.console.Severity.Log, "AD.JS: " + message );
    }

    chrome.devtools.panels.create( 'Adjs', '/assets/icon_32.png', '/devtools/page.html', function( extensionPanel ){


        //Events
        //
        var port = connect( 'dev_tool_'+chrome.devtools.inspectedWindow.tabId  );

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

            var controlier = controllers[evt.message.from][evt.message.change.name ];
            controlier.value = evt.message.change.value;
            // log( 'UPDATED FROM: ' + evt.message.from + ". Change is, " + evt.message.change.name + " = " + evt.message.change.value );

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


        //fns

        function isViewableProp( value ){

            return  value === '-*ad.js function*-' ||
                    typeof value === 'string' ||
                    typeof value === 'number' ||
                    typeof value === 'boolean';
        }


        function getController( name, value ){
            return ( value === '-*ad.js function*-' ) ? new control.Button( name, value ) :
                   ( getSignature( value ) === 'color' ) ? new control.Color( name, value )  :
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



        function createView( model ){

            var domElem, subCont, def,
                heading, name, label,
                controllerElem;


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

                    if( isViewableProp( def[prop] )){

                        var controllier = getController( prop, def[prop] );
                        controllier.domElement.id = prop;
                        controllier.domElement.className = 'controller';

                        controllier.onchange = function( c, index, propName ){
                            port.sendMessage( 'CHANGED', {from:index, prop:propName, value:c.value })

                        }.bind( this, controllier, controllers.length, prop );

                    }


                    instControllers[prop] = controllier;

                    subCont.appendChild( controllier.domElement );

                }

                controllers[controllers.length] = instControllers;

            }

            viewReady = true;

        }


        extensionPanel.onShown.addListener( function( window ){

            // if( document.readyState === 'complete'){

                wind = window

                doc = window.document;
                container = doc.querySelector( '#container' );
                if( control_model && !viewReady ) createView( control_model );
            // }

            // window.onload = function(){

            // }


        });

        // extensionPanel.onHidden.addListener( function(  ){
        //     container = null;
        // });


        // extensionPanel.onShown.addListener(function( w ) {



        // });

        // UTILS


        // function getSignature( obj )
        // {
        //     var ser = {};
        //     for( var i in obj ){
        //         log( i + " :: " +obj[i] );
        //         ser[i] = obj[i] ===  "-*ad.js function*-" ? 'function' : typeof( obj[i] );

        //     }
        //     return ser;
        // }



    });

});
