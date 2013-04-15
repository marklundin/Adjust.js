define(function(){

    return {


        Slider : function( name, value ){

            var domElement = document.createElement( 'div' ),
                input = document.createElement('input'),
                label = document.createElement('span'),
                title = document.createElement('span'),
                api;

            // title.style = '{padding-right: 10px}';
            input.type = 'range';
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

                get value (){
                    return Number( input.value );
                }
            }

            api.value = value;

            return api;
        },

        Button : function( name, value ){

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

        TextInput : function( name, value ){

            var domElement = document.createElement( 'div' ),
                label = document.createElement( 'label' ),
                input = document.createElement( 'input' ),
                api;

            label.style = 'padding-right: 10px';
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

                get value (){
                    return input.value;
                }
            }

            api.value = value;

            return api;
        },


        Color : function( name, value, window ){

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

                get value (){
                    var hex = parseInt( input.innerText.split('#')[1], 16 );
                    pValue.r = hex >> 16;
                    pValue.g = hex >> 8 & 0xFF;
                    pValue.b = hex & 0xFF;
                    return pValue;
                }
            }

            api.value = value

            return api;
        },


        CheckBox : function( name, value ){

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

                get value (){
                    return input.checked;
                }
            }

            api.value = value;

            return api;
        }

    }
});
