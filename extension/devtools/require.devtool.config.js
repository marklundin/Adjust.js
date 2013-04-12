requirejs.config( {

    name: "devtools",

    paths:{
        "port": "../utils/port"
    },

    shim: {
        "../utils/underscore": {
            exports: "_",
        }
    }

});