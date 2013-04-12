requirejs.config( {

    name: "background",

    paths:{
        "port": "../utils/port",
        "underscore": "../utils/underscore"
    },

    shim: {
        "../utils/underscore": {
            exports: "_",
        }
    }

});