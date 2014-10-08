define(function(require, exports, module) {

    function Button(lib, context){
        var self = this;
        self.context = context;
        self.LIB = lib;
        self.initDone = false;
    }

    Button.prototype.initButtonWithText = function(text, id, translate){
        var self = this;
        var LIB = self.LIB;

        if(self.initDone){
            return;
        }
        if(id == null){
            console.log("cssClass not defined in class Button");
            return;
        }
        //ADD NEW TEXT BUTTON
        self.button = new LIB.Surface({
            size: [ 180 , LIB.buttonSize.height],
            content: text,
            classes: ['button', id],
            properties: {
                fontSize: LIB.buttonFontSize + "px",
                padding: LIB.buttonPadding.top +"px " + LIB.buttonPadding.left + "px " + LIB.buttonPadding.bottom + "px " + LIB.buttonPadding.right + "px" 
            }
        });
        self.modifier = new LIB.StateModifier({
            origin: [0, 0.5],
            align: [0.05, 0.5]
        });
        //ADD TO CONTAINER
        self.context.add(self.modifier).add(self.button);
        self.initDone = true;
    }

    Button.prototype.initButtonWithIcon = function(filename, id, translate){
        var self = this;
        var LIB = self.LIB;

        if(self.initDone){
            return;
        }
        if(id == null){
            console.log("id not defined in class Button");
            return;
        }
        //ADD NEW ICON BUTTON
        self.button = new LIB.ImageSurface({
            size: [LIB.buttonSize.height, LIB.buttonSize.height],
            content: filename,
            classes: ['iconButton', id]
        });
        self.modifier = new LIB.StateModifier({
            origin: [1, 0.5],
            align: [0, 0.5],
            transform: translate
        });
        //ADD TO CONTAINER
        self.context.add(self.modifier).add(self.button);
        self.initDone = true;
    }

    return Button;
});
