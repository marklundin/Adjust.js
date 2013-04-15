require.config({
    paths:{
        adjust : "../js/adjust"
    }
})

require(['adjust'],function( adjust ){

        var YourClass = function()
        {
            this.someNumber = 50.5;
            this.someInteger = 2.0;
            this.someColor = {r:255, g:138,b:0};
            this.someString = "Hey I'm a string";
        }

        var apiClassInstance = new YourClass();


        //Adjust

        var apiJUI = new adjust( 'YourClass Adjustment', apiClassInstance ),
            ajui = new adjust( {
                bool: true,
                float: 1.0,
                int: 0,
                fn: function(){console.log( 'CALLED' )},
                str: 'A string',
            });


        var i = 0;
        function loop(){

            i += 0.001;
            apiClassInstance.number = Math.sin( i ) * 20 + 10;
            requestAnimationFrame( loop );

        }

        // loop();


})