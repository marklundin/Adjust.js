define(function(){

    return {


        Slider : function( name, value ){

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
                    label.innerText = v;
                },

                get value (){
                    return input.value;
                }
            }

            api.value = value;

            return api;
        },

        Button : function( name, value ){

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
                onchange: function(){},
            }

            return api;
        },

        TextInput : function( name, value ){

            var domElement = document.createElement( 'div' ),
                label = document.createElement( 'label' ),
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
                input = document.createElement( 'div' ),
                api;


            domElement.appendChild( picker );
            domElement.appendChild( input );

            picker.id = "picker";
            picker.innerText = picker.id;
            input.type = 'text';


            window.$(document).ready(function() {
                window.$.farbtastic( picker, function( color ){
                     input.value = color;
                     api.onchange( parseInt( color.split('#')[1], 16 ));
                } );
            });

            api = {
                domElement: domElement,
                onchange: function(){},
                set value ( v ){
                    input.value = "#"+ v.toString( 16 );
                },

                get value (){
                    return parseInt( input.value.split('#')[1], 16 )
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
