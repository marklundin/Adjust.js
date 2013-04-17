requirejs.config( {

    name: "devtools",

    paths:{
        "port": "../utils/port"
    },

    shim: {
        "js/build/three.min.js": {
            exports: "THREE",
        },
        "js/extras/controls/TrackballControls.js": {
            deps:["js/build/three.min.js"],
            exports: "TrackballControls",
        }
    }



});