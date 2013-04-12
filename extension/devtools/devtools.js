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

    chrome.devtools.panels.create( 'AJUI', '/assets/icon.png', '/devtools/page.html', function( extensionPanel ){


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

            var elem = controllers[evt.message.from].querySelector( "#"+evt.message.change.name );
            setElemValue( elem, evt.message.change.value);
            log( 'UPDATED FROM: ' + evt.message.from + ". Change is, " + evt.message.change.name + " = " + evt.message.change.value );

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

        function getInputType( value ){
            return ( value === '-*ad.js function*-' ) ? 'button' :
                   ( typeof value === 'string' )    ? 'text' :
                   ( typeof value === 'number' )    ? 'range' :
                   ( typeof value === 'boolean' )   ? 'checkbox' : null;
        }

        function getElemValue( elem ){
            return  elem.type === 'checkbox' ? elem.checked :
                    elem.type === 'text' ? elem.value :
                    elem.type === 'range' ? elem.value :
                    elem.type === 'button' ? null : null
        }

        function setElemValue( elem, value ){
            if( elem.type === 'button' ) return;
            elem.type === 'checkbox' ? elem.checked = value :
            elem.type === 'text' ? elem.value  = value :
            elem.type === 'range' ? elem.value  = value : null;
        }


        function clean(){
            if( container ){
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
            }
            controllers = [];
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

                heading.innerHTML = name;

                subCont.appendChild( heading );
                container.appendChild( subCont );

                controllers[controllers.length] = subCont;


                var toots = new control.Slider( 'tits' );
                toots.value = 22;
                toots.onchange = function(obj){
                    log( obj );
                }

                container.appendChild( toots.domElement );

                var boots = new control.Button( 'Some Function' );
                boots.onchange = function(obj){
                    log( obj );
                }
                container.appendChild( boots.domElement );

                log( jQuery );
                var fruits = new control.TextInput( 'Some Text');
                fruits.onchange = function(obj){
                    log( obj );
                }
                container.appendChild( fruits.domElement );


                var pootles = new control.Color( 'some color', wind  );
                pootles.onchange = function(obj){
                    log( obj );
                }
                container.appendChild( pootles.domElement );

                def = model[i].definition;
                for( var prop in def ){

                    controllerElem = document.createElement("div");
                    label = document.createElement("Label");

                    label.for = prop;
                    label.innerHTML = def[prop] === '-*ad.js function*-' ? "Call" : prop;

                    controllerElem.class = 'controller';

                    if( isViewableProp( def[prop] )){

                        domElem = doc.createElement( "input" );
                        domElem.id = prop
                        domElem[def[prop] === '-*ad.js function*-' ? 'value' : 'innerHTML'] = prop;
                        domElem.type = getInputType( def[prop] );
                        setElemValue( domElem, def[prop] );

                        domElem[ domElem.type === 'button' ? 'onclick' : 'onchange' ] = function( elem, index, propName ){

                            port.sendMessage( 'CHANGED', {from:index, prop:propName, value:getElemValue( elem ) })

                        }.bind( this, domElem, i, prop );

                    }else{

                        domElem = doc.createElement( "div" );
                        domElem.id = prop;
                        domElem.innerHTML = "Type " + typeof def[prop] + " are not yet supported";

                    }

                    controllerElem.appendChild( label );
                    controllerElem.appendChild( domElem );
                    subCont.appendChild( controllerElem );

                }
            }

            viewReady = true;

        }



        //DO we need to use these status bare buttons
        //extensionPanel.createStatusBarButton( '/assets/icon.png', 'Test', false );

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
