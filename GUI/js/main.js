define(function(require, exports, module) {

    function Main(lib){

        var self = this;
        self.LIB = lib;
    }

    Main.prototype.init = function(){

        var self = this;
        //LIB IS THE REFERENCE TO THE famousLib.js file which contains global vars
        var LIB = self.LIB;
        //CREATE MAIN CONTEXT
        self.mainContext = LIB.Engine.createContext();
        //CREATE HEADER
        self.header = new LIB.Header(LIB, self.mainContext);
        self.header.init();
        //CREATE FOOTER
        self.footer = new LIB.Footer(LIB, self.mainContext);
        self.footer.init();

    }

    return Main;
});
