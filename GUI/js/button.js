define(function(require, exports, module) {

    function Button(app, context){
        var self = this;
        self.LIB = app.LIB;
        self.context = context;
        self.initDone = false;

        if(app == null){
            console.log("app is null in Button constructor");
            return;
        }
        self.app = app;
    }

    Button.prototype.initButtonWithText = function(text, id, translate){
        var self = this;
        var LIB = self.LIB;
        self.id = id;

        if(self.initDone){
            return;
        }
        if(id == null){
            console.log("cssClass not defined in class Button");
            return;
        }
        //ADD NEW TEXT BUTTON
        self.button = new LIB.Surface({
            size: [ 160 , LIB.buttonSize.height],
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
        self.id = id;

        if(self.initDone){
            return;
        }
        if(id == null){
            console.log("id not defined in class Button");
            return;
        }
        //STORE THE INITIAL POSITION
        self.initTransision = translate;
        //ADD NEW ICON BUTTON
        var iconSize = LIB.buttonSize.height*0.8
        self.button = new LIB.ImageSurface({
            size: [iconSize, iconSize],
            content: filename,
            classes: ['iconButton', id + "B"]
        });
        self.modifier = new LIB.StateModifier({
            origin: [0.5, 0.5],
            align: [0.5, 0.5],
            opacity: 0.5,
            transform: translate
        });
        //ADD TO CONTAINER
        self.context.add(self.modifier).add(self.button);
        self.initDone = true;
    }

    Button.prototype.setContentRef = function(content){
        if(content == null){
            console.log("Content is null that means no parameter was set in setContentRef class Button");
            return;
        }
        this.contentRef = content;
    }

    Button.prototype.restoreInitPosition = function(){
        var self = this;
        var LIB = self.LIB;

        self.modifier.setTransform(
            self.initTransision,
            {duration: 1000, curve: LIB.Easing.inOutBack});
    }

    Button.prototype.setTransform = function(x, y, z){
        var self = this;
        var LIB = self.LIB;

        self.modifier.setTransform(
            LIB.Transform.translate(x,y,z),
            {duration: 1000, curve: LIB.Easing.inOutBack});
    }

    Button.prototype.addEventListener = function(){
        var self = this;
        var LIB = self.LIB;

        self.button.on('click', function(){
            if(self.id == LIB.newGame){
                self.app.dismissContentViews();
                return;
            }
            else {
                if(self.contentRef == null){
                    console.log("ContentRef is null in addEventListener class Button -> make sure to call setContentRef(content)");
                    return;
                }
                if(self.LIB == null){
                    console.log("Self.LIB is null in addEventListener class Button");
                    return;
                }
                //DISMISS CURRENT VIEW
                if(self.contentRef.isVisible == true){
                    return;
                }
                self.app.footer.hideButtons(self.id);
                self.contentRef.isVisible = true;
                console.log(self.id);
                self.contentRef.setTransform(0, 0, 0);
            }
        });
    }

    return Button;
});
