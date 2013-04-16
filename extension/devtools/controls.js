define(function(){

    return {


        Slider : function( name, value, constraints ){

            var domElement = document.createElement( 'div' ),
                input = document.createElement('input'),
                label = document.createElement('span'),
                title = document.createElement('span'),
                api;

            label.className = 'floatRight';
            input.type = 'range';
            input.step = 0.1;
            title.innerText = name;

            domElement.appendChild( title );
            domElement.appendChild( label );
            domElement.appendChild( input );

            domElement.onchange = function(){
                label.innerText = input.value;
                api.onchange( input.value );
            };

            api = {

                domElement: domElement,
                onchange : function(){},

                set value ( v ){
                    input.value = v;
                    label.innerText = v;
                },

                set constraint ( v ){
                    v = v || {};
                    input.max = v.max || 100;
                    input.min = v.min || 0;
                    input.step = v.step || 0.1;
                },

                get value (){
                    return Number( input.value );
                }
            }

            api.value       = value;
            api.constraint = constraints;

            return api;
        },

        Button : function( name, value, constraints ){

            var domElement = document.createElement( 'div' ),
                label = document.createElement( 'span' ),
                innerButton = document.createElement( 'input' ),
                api;

            domElement.appendChild( label );
            domElement.appendChild( innerButton );

            innerButton.type = 'button';
            label.innerText = 'Execute ';
            innerButton.value = name;
            innerButton.onclick = function(){
                console.log( 'click' );
                api.onchange();
            };

            api = {
                domElement: domElement,
                onchange: function(){},
            }

            return api;
        },

        TextInput : function( name, value, constraints ){

            var domElement = document.createElement( 'div' ),
                label = document.createElement( 'label' ),
                input = document.createElement( 'input' ),
                api;

            label.style = 'padding-right: 10px';
            input.className = 'floatRight';
            domElement.appendChild( label );
            domElement.appendChild( input );

            label.innerText = name + " ";
            input.type = 'text';


            input.onchange = function(){
                api.onchange(input.value)
            };

            input.onkeypress = function(){
                api.onchange(input.value)
            };

            input.onkeyup = function(){
                api.onchange(input.value)
            };

            api = {
                domElement: domElement,
                onchange: function(){},

                set value ( v ){
                    input.value = v;
                },

                set constraint ( v ){
                },

                get value (){
                    return input.value;
                }
            }

            api.value = value;
            api.constraint = constraints;

            return api;
        },


        Color : function( name, value, constraints, window ){

            var domElement = document.createElement( 'div' ),
                picker = document.createElement( 'div' ),
                label = document.createElement( 'div' ),
                input = document.createElement( 'div' ),
                pValue = {r:0,g:0, b:0},
                api;


            domElement.appendChild( label );
            domElement.appendChild( input );
            domElement.appendChild( picker );


            picker.id = "picker";
            label.innerText = name;
            picker.innerText = picker.id;
            input.type = 'text';

            var cpicker;
            cpicker = window.$.farbtastic( picker, function( color ){
                 input.innerText = color;
                 api.onchange( parseInt( color.split('#')[1], 16 ));
            } );

            api = {
                domElement: domElement,
                onchange: function(){},
                set value ( v ){
                    pValue = v;

                    input.innerText = "#"+ Number( v.r << 16 | v.g << 8 | v.b ).toString( 16 );
                    cpicker.setColor( input.innerText );

                },

                set constraint ( v ){
                },

                get value (){
                    var hex = parseInt( input.innerText.split('#')[1], 16 );
                    pValue.r = hex >> 16;
                    pValue.g = hex >> 8 & 0xFF;
                    pValue.b = hex & 0xFF;
                    return pValue;
                }
            }

            api.value = value;
            api.constraint = constraints;

            return api;
        },


        CheckBox : function( name, value, constraints ){

            var domElement = document.createElement( 'div' ),
                input = document.createElement( 'input' ),
                label = document.createElement( 'label' ),
                api;

            domElement.appendChild( label );
            domElement.appendChild( input );

            input.type = 'checkbox';
            label.innerText = name;

            input.onchange = function(){
                api.onchange(input.value)
            };


            api = {
                domElement: domElement,
                onchange: function(){},
                set value ( v ){
                    input.checked = v;
                },

                set constraint ( v ){
                },

                get value (){
                    return input.checked;
                }
            }

            api.value = value;
            api.constraint = constraints;

            return api;
        },

        Vector3: function( name, value, constraints, w ){


            "use strict";



            var camera      = new THREE.OrthographicCamera( -1, 1, -1, 1 ),
                scene       = new THREE.Scene(),
                domElement  = document.createElement( 'div' ),
                renderer    = new THREE.WebGLRenderer(),
                init        = false;

            // Constants
            var pixelRatio      = window.devicePixelRatio || 1,
                SCREEN_WIDTH    = domElement.clientWidth * pixelRatio,
                SCREEN_HEIGHT   = domElement.clientHeight * pixelRatio;

            domElement.appendChild( renderer.domElement );
            domElement.className = 'vec3';
            domElement.id = name;


            // Position camera
            camera.position.z = 1;
            // camera.position.y = 350;
            camera.lookAt( scene.position );


            // Add test Cube
            var sphere = new THREE.Mesh( new THREE.SphereGeometry( 1, 100, 100), new THREE.MeshNormalMaterial() );
            // scene.add( sphere );
            var axis = new THREE.AxisHelper();
            scene.add( axis );


            //Event Listeners
            function onWindowResize( event ) {

                if( !init ) init = true;

                domElement.style.height = domElement.clientWidth+"px";
                // console.log( domElement.outerWidth, domElement.width, domElement.innerWidth );

                var pixelRatio  = w.devicePixelRatio || 1;
                SCREEN_WIDTH    = domElement.clientWidth * pixelRatio;
                SCREEN_HEIGHT   = domElement.clientHeight * pixelRatio;

                renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

                camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
                camera.updateProjectionMatrix();

            }

            function render()
            {
                if( domElement.parentNode && !init ) onWindowResize();
                axis.rotation.x += 0.1;
                renderer.render( scene, camera );
                requestAnimationFrame( render );
            }

            //Add Listeners
            w.addEventListener( 'resize', onWindowResize );

            //Begin Render

            // w.$(w.document).ready(function(){
                // onWindowResize();
                render();
            // });


            var api = {
                domElement: domElement
            }

            return api;

        }

    }
});
