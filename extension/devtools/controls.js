define(function(){

    return {


        Slider : function( name ){

            var domElement = document.createElement( 'div' ),
                input = document.createElement('input'),
                label = document.createElement('span'),
                title = document.createElement('span'),
                api;

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
                    label.innerHTML = v;
                },

                get value (){
                    return input.value;
                }
            }

            return api;
        },

        Button : function( name ){

            var domElement = document.createElement( 'div' ),
                innerButton = document.createElement( 'input' ),
                api;

            domElement.appendChild( innerButton );

            innerButton.type = 'button';
            innerButton.value = name;
            innerButton.onclick = function(){
                api.onchange( innerButton.value );
            };

            api = {
                domElement: domElement,
                onchange: function(){}
            }

            return api;
        },

        TextInput : function( name ){

            var domElement = document.createElement( 'div' ),
                label = document.createElement( 'div' ),
                input = document.createElement( 'input' ),
                api;

            domElement.appendChild( label );
            domElement.appendChild( input );

            label.innerText = name;
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
                onchange: function(){}
            }

            return api;
        },


        Color : function( name, window ){

            var domElement = document.createElement( 'div' ),
                picker = document.createElement( 'div' ),
                input = document.createElement( 'div' ),
                api;


            domElement.appendChild( picker );
            domElement.appendChild( input );

            picker.id = "picker";
            picker.innerText = picker.id;


            input.type = 'text';
            input.value = "#111111";



            window.$(document).ready(function() {
                window.$.farbtastic( picker, function( color ){
                    console.log( color, input.value )
                     input.value = color;
                     api.onchange( parseInt( "#112233".split('#')[1], 16 ));
                } );
            });

            api = {
                domElement: domElement,
                onchange: function(){}
            }

            return api;
        }



    }


});
