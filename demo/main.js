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

        //Adjust it
        var controller = new adjust( 'YourClass Adjustment', new YourClass() );
        document.onclick = function(){
            controller.constrain( 'someInteger', {min:10, max:300, step: 10 } );
        }

        controller.onchange(function( change ){
            console.log( change );
        })

        var i = 0;
        function loop(){

            i += 0.001;
            apiClassInstance.number = Math.sin( i ) * 20 + 10;
            requestAnimationFrame( loop );

        }

        // loop();


})