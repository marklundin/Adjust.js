


require([
    'port',
    'controls',
    'js/build/three.min',
    'js/extras/controls/TrackballControls'
    ],function(
        connect,
        control
    ){

    var VERSION = "0.0.01";

    var control_model,
        container, doc,
        viewReady = false,
        controllers = [], port, fileAccessFail = false,
        jQuery, wind, browserConfigured;


    function log( message ){
        chrome.experimental.devtools.console.addMessage( chrome.experimental.devtools.console.Severity.Log, "AD.JS: " + message );
    }

    // function error( message ){
    //     chrome.experimental.devtools.console.addMessage( chrome.experimental.devtools.console.Severity.Error, "AD.JS: " + message );
    // }

    chrome.devtools.panels.create( 'Adjust', '/assets/icon_32.png', '/devtools/page.html', function( extensionPanel ){

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
        function getController( name, value, constraints ){

            console.log( name, value, definesSignature( value, colorSignatures ));
            return ( value === '-*ad.js function*-' ) ? new control.Button( name, value , constraints) :
                   ( definesSignature( value, colorSignatures ) ) ? new control.Color( name, value, constraints, wind )  :
                   ( typeof value === 'string' )    ? new control.TextInput( name, value, constraints ) :
                   ( typeof value === 'number' )    ? new control.Slider( name, value, constraints )  :
                   ( typeof value === 'boolean' )   ? new control.CheckBox( name, value, constraints )  : null;
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


            for( var i = 0 ; i < model.length ; i++ ){

                name = model[i].name;
                //log( name );

                subCont        = doc.createElement( 'div' );
                heading        = doc.createElement( 'h3' );
                foldButton     = doc.createElement( 'div' );
                controllerCont = doc.createElement( 'div' );


                subCont.id = name;
                subCont.className = 'adjs-instance';
                foldButton.className = "fold-button floatRight";
                heading.className = "heading";
                controllerCont.className = "controller-cont";

                heading.innerHTML = name;

                subCont.appendChild( heading );
                subCont.appendChild( foldButton );
                subCont.appendChild( controllerCont );
                container.appendChild( subCont );

                wind.$( foldButton ).click(function(){
                    wind.$( controllerCont ).toggle();
                })

                var instControllers = [];

                def = model[i].definition;
                for( var prop in def ){

                    var controllier = getController( prop, def[prop], model[i].constraints ? model[i].constraints[prop] : {} );
                    if( controllier ){
                        controllier.domElement.id = prop;
                        controllier.domElement.className = 'controller';
                        instControllers[prop] = controllier;

                        controllier.onchange = function( c, pgroup, propName ){
                            port.sendMessage( 'CHANGED', {from:controllers.indexOf( pgroup ), prop:propName, value:c.value })

                        }.bind( this, controllier, instControllers, prop );


                        controllerCont.appendChild( controllier.domElement );

                    }
                }

                controllers[controllers.length] = instControllers;

            }

            viewReady = true;

        }

        extensionPanel.onShown.addListener( function( w ){

            wind = w
            doc = w.document;

            if( !browserConfigured ){
                w.$( '#warning' ).html( "<img src='/assets/icon_32.png'></img><h1 style='display:inline; padding:15px;'>Oops...</h1><h2>You're browser is not configured correctly</h2><span>Adjust uses certain new javascript features that appear to be disable in this version of Chrome. To enable them, open the url <b><u>chrome://flags</u></b> and enable the <b>Enable Experimental JavaScript</b> setting, then restart your browser.</span>" );
                return;
            }else if( fileAccessFail ){
                w.$( '#warning' ).show();
                wind.$('#warning').html("<img src='/assets/icon_32.png'></img><h1 style='display:inline; padding:15px;'>Oops...</h1><h2>You seem to be accessing a page using the <b>file://</b> schema.</h2><span> In order to to use this you need to grant Adjust permission to use local files. Open <b>chrome://extensions</b>, find the Adjust extension and check the <b>'Allow access to file URLs'</b> box.</span>");
            }else{
                w.$( '#warning' ).hide();
            }

            container = doc.querySelector( '#container' );
            if( control_model && !viewReady ) createView( control_model );

        });


        chrome.devtools.inspectedWindow.eval(
            "Object.observe",
            function(result, isException) {

                browserConfigured = result !== undefined;
                if( !browserConfigured  ) return;

                // chrome.devtools.inspectedWindow.eval(
                //     "A.version",
                //     function(result, isException) {

                //         // log( result );
                //         if( result < VERSION || isException )
                //         {
                //             log( "Incompatible version of Adjust.js being used. Please update "+ result );
                //             //return;
                //         }


                        var tID = chrome.devtools.inspectedWindow.tabId;
                        if( isNaN( tID )) return;

                        port = connect( 'dev_tool_'+chrome.devtools.inspectedWindow.tabId  );

                        port.listen( ["CONNECTED", "PAGE_CHANGED"], function( evt ){

                            console.log( evt.type );
                            control_model = null;
                            if( !evt.fileAccess ){
                                chrome.devtools.inspectedWindow.eval( "document.URL",
                                    function(result, isException) {
                                        fileAccessFail = result.indexOf( 'file://') == 0 || isException;
                                        if( fileAccessFail ){
                                            if( wind ) wind.$('#warning').html("<img src='/assets/icon_32.png'></img><h1 style='display:inline; padding:15px;'>Oops...</h1><h2>You seem to be accessing a page using <b>file://</b></h2><span> In order to to this page you need to grant Adjust permission to use local files. Open <b>chrome://extensions</b>, find the Adjust extension and check the <b>'Allow access to file URLs'</b> box.</span>");
                                        }else{
                                            port.sendMessage( 'REQUEST_OBJECT_DEF' );
                                        }
                                    }
                                );
                            }else{
                                port.sendMessage( 'REQUEST_OBJECT_DEF' );
                            }

                        });

                        port.listen( "DISCONNECTED", function(){
                            clean();
                        });

                        port.listen( "CONSTRAIN", function( evt ){
                            if( controllers && controllers[evt.message.from] ){
                                var controlier = controllers[evt.message.from][evt.message.name ];
                                if( controlier ) controlier.constraint = evt.message.constraint;
                            }else if( control_model ){
                                control_model[evt.message.from].constraints[evt.message.name ] = evt.message.constraint;
                            }
                        });

                        port.listen( 'UPDATED', function( evt ){

                            if( controllers && controllers[evt.message.from] ){
                                var controlier = controllers[evt.message.from][evt.message.change.name ];
                                if( controlier ) controlier.value = evt.message.change.value;
                            }else if ( control_model ){
                                control_model[evt.message.from].definition[evt.message.change.name ] = evt.message.change.value;
                            }
                            // log( 'UPDATED FROM: ' + evt.message.from + ". Change is, " + evt.message.change.name + " = " + evt.message.change.value );

                        });

                        port.listen( 'DELETED', function( evt ){

                            if( controllers && controllers[evt.message.from] ){
                                var controlier = controllers[evt.message.from][evt.message.change.name ];
                                controlier.onchange = null;
                                if( wind )wind.$( controlier.domElement ).remove();
                            }

                            delete control_model[evt.message.from].definition[evt.message.change.name ];
                        });

                        port.listen( 'NEW', function( evt ){

                            var obj = evt.message;

                            control_model[obj.from].definition[obj.change.name] = obj.change.value;

                            if( wind ){

                                var controllier = getController( obj.change.name, obj.change.value );

                                if( controllier ){
                                    controllier.domElement.id = obj.change.name;
                                    controllier.domElement.className = 'controller';
                                    var group = controllers[obj.from];
                                    group[obj.change.name] = controllier;

                                    controllier.onchange = function( c, pgroup, propName ){

                                        port.sendMessage( 'CHANGED', {from:controllers.indexOf( pgroup ), prop:propName, value:c.value })

                                    }.bind( this, controllier, group, obj.change.name );

                                    //subCont.appendChild( controllier.domElement );

                                    // TODO :: what if panel isnt show yet
                                    container.childNodes[obj.from].childNodes[1].appendChild( controllier.domElement );

                                }
                            }else{

                            }
                        });

                        port.listen( 'OBJ_DEF', function( evt ){

                            console.log( 'OBJ_DEF' );
                            control_model = evt.message;
                            if( container ) createView( control_model );

                        });

                        port.listen( 'INIT', function( evt ){

                            var model = evt.message;
                            if( container ) createView( [model] );
                            control_model[control_model.length] = evt.message;

                        });

                        port.listen( 'REMOVE', function( evt ){

                            for( var i in controllers[evt.message.from] ){
                                controllers[evt.message.from][i].onchange = null
                            }

                            if( container ) container.removeChild( container.childNodes[ evt.message.from ] );
                            control_model.splice( evt.message.from, 1 );
                            controllers.splice( evt.message.from, 1 );


                        });
                    // }
                // );
            }
        );
    });
});
