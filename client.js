/* Global State */
var
    serverName = 'http://localhost:4792',
    chatServer = initChatServerAdapter(serverName),

    brush = initBrushModel({
        type:'pen',
        color:{r:0, g:0, b:0},
        size:3,
        opacity:1
    }),
    chat = initChatModel(),

    brushController = initBrushController(),
    chatController = initChatController(),
    canvasController = initCanvasController()
;

/* Models */
function initChatServerAdapter(serverName) {
    var
        server = io.connect(serverName + '/chat'),
        receiveCallbacks = []
    ;

    function callReceiveCallbacks(sender, message) {
        for (
            var
                funcNo = -1,
                numFuncs = receiveCallbacks.length
            ;
            ++funcNo < numFuncs;
        )
            receiveCallbacks[funcNo](sender, message)
    }

    server.on('receive', function(message) {
        var
            sanitizedSender = $('<div />').text(message.sender).html(),
            sanitizedMessage = $('<div />').text(message.message).html()
        ;
        callReceiveCallbacks(sanitizedSender, sanitizedMessage);
    });

    return {
        setName:function(name) {server.emit('setName', name)},
        send:function(message) {server.emit('send', message)},
        onreceive:function(callback) {receiveCallbacks.push(callback)}
    }
}

function initBrushModel(properties) {
    var
        toolProperties = {
            pen:{color:1, size:1, opacity:1},
            eraser:{size:1}
        },

        type = properties.type,
        typeChangeCallbacks = [],
        color = properties.color,
        colorChangeCallbacks = [],
        size = properties.size,
        sizeChangeCallbacks = [],
        opacity = properties.opacity,
        opacityChangeCallbacks = []
    ;

    function getProperties() {
        var
            validPropertyLookup = toolProperties[type],
            properties = {type:type}
        ;
        if (validPropertyLookup.color)
            properties.color = color;
        if (validPropertyLookup.size && size)
            properties.size = size;
        if (validPropertyLookup.opacity && opacity)
            properties.opacity = opacity;
        return properties;
    }

    function getProperty(name) {
        return getProperties()[name];
    }

    function runFunctions(functions) {
        for (var funcNo = -1, numFuncs = functions.length; ++funcNo < numFuncs;)
            functions[funcNo]();
    }

    function setProperties(properties) {
        if (properties.type) {
            type = properties.type;
            runFunctions(typeChangeCallbacks);
        }

        var validPropertyLookup = toolProperties[type];
        if (validPropertyLookup.color && properties.color) {
            color = properties.color;
            runFunctions(colorChangeCallbacks);
        }
        if (validPropertyLookup.size && properties.size) {
            size = properties.size;
            runFunctions(sizeChangeCallbacks);
        }
        if (validPropertyLookup.opacity && properties.opacity) {
            opacity = properties.opacity;
            runFunctions(opacityChangeCallbacks);
        }
    }

    function setProperty(name, value) {
        var properties = {};
        properties[name] = value;
        setProperties(properties);
    }

    return {
        get:function (name) {
            return name ? getProperty(name) : getProperties()
        },
        set:function (x, y) {
            typeof x == 'object' ? setProperties(x) : setProperty(x, y);
        },
        onchange:function(property, callback) {
            if (property == 'type')
                typeChangeCallbacks.push(callback);
            if (property == 'color')
                colorChangeCallbacks.push(callback);
            if (property == 'size')
                sizeChangeCallbacks.push(callback);
            if (property == 'opacity')
                opacityChangeCallbacks.push(callback);
        }
    };
}

function initChatModel() {
    var
        name,
        messages = [{
            sender:'Server',
            message:'Welcome to Whiteboard, a shared drawing surface ' +
                'supporting multiple simultaneous users.'
        }],
        messageAddCallbacks = []
    ;

    function getMessages() {
        return messages;
    }

    function getName() {
        return name;
    }

    function setName(newName) {
        name = newName;
        chatServer.setName(name);
    }

    function runAddCallbacks() {
        for (
            var
                funcNo = -1,
                numFuncs = messageAddCallbacks.length;
            ++funcNo < numFuncs;
        )
            messageAddCallbacks[funcNo]();
    }

    function receive(sender, message) {
        messages.push({
            sender:sender,
            message:message
        });
        runAddCallbacks();
    }

    function send(message) {
        if (name) {
            receive(name, message);
            chatServer.send(message);
        }
    }

    function onadd(callback) {
        messageAddCallbacks.push(callback);
    }

    chatServer.onreceive(receive);

    return {
        getName:getName,
        setName:setName,
        getMessages:getMessages,
        receive:receive,
        send:send,
        onadd:onadd
    }
}

/* Controllers */
function initBrushController() {
    var
        colorPicker,
        sizePicker,
        sizeValue,
        opacityPicker,
        opacityValue,
        toolPicker,

        enableOpacityChangeEvent = true
    ;

    function initUi() {
        colorPicker = $('#color');
        sizePicker = $('#size');
        sizeValue = $('#sizeValue');
        opacityPicker = $('#opacity');
        opacityValue = $('#opacityValue');
        toolPicker = $('#tools');

        colorPicker.miniColors({
            change:function(hex, rgb) {
                brush.set('color', rgb)
            }
        });

        sizePicker.slider({
            range:'min',
            min:1,
            max:50,
            slide:function(event, ui) {
                var size = ui.value;
                brush.set('size', size);
                sizeValue.text(size + 'px');
            }
        });

        opacityPicker.slider({
            range:'min',
            min:0,
            max:1,
            step:0.01,
            slide:function(event, ui) {
                var opacity = ui.value;
                brush.set('opacity', opacity);
                opacityValue.text(Math.round(opacity * 100) + '%');
            }
        });

        toolPicker.buttonset();
        toolPicker.change(function() {
            enableOpacityChangeEvent &&
                brush.set('type', $('#tools input[name=tools]:checked').attr('id'))
        });
    }

    function updateUi() {
        updateColor();
        updateSize();
        updateOpacity();
        updateTool();
    }

    function updateColor() {
        var color = brush.get('color');
        colorPicker.miniColors(
            'value',
            '#' + color.r.toString(16) + color.g.toString(16) +
                color.b.toString(16)
        );
    }

    function updateSize() {
        var size = brush.get('size');
        sizePicker.slider('option', 'value', size);
        sizeValue.text(size + 'px');
    }

    function updateOpacity() {
        var opacity = brush.get('opacity');
        opacityPicker.slider('option', 'value', opacity);
        opacityValue.text(Math.round(opacity * 100) + '%');
    }

    function updateTool() {
        enableOpacityChangeEvent = false;
        $('#tools input[id=' + brush.get('type') + ']').attr('checked', 'checked');
        $('#tools').buttonset('refresh');
        enableOpacityChangeEvent = true;
    }

    brush.onchange('color', updateColor);
    brush.onchange('size', updateSize);
    brush.onchange('opacity', updateOpacity);
    brush.onchange('type', updateTool);

    $(document).ready(initUi);
    $(document).ready(updateUi);

    return {
        initUi:initUi,
        updateUi:updateUi,
        updateColor:updateColor,
        updateSize:updateSize,
        updateOpacity:updateOpacity,
        updateTool:updateTool
    };
}

function initChatController() {
    var
        history,
        input,
        button,
        signInDialog,
        nameInput
    ;

    function initUi() {
        history = $('#chatHistory');
        input = $('#chatText');
        button = $('#chatSubmit');
        signInDialog = $('#signInDialog');
        nameInput = $('#name');

        function signIn() {
            chat.setName(nameInput.val());
            signInDialog.dialog('close');
        }
        signInDialog.dialog({
            modal:true,
            width:280,
            buttons:{
                'Sign In':signIn
            }
        });
        nameInput.keydown(function(event) {
            if (event.which == 13)
                signIn()
        });

        function sendMessage() {
            chat.send(input.val());
            input.val('');
            input.focus();
        }

        button.button();
        button.click(sendMessage);

        input.keydown(function(event) {
            if (event.which == 13)
                sendMessage()
        });
    }

    function updateUi() {
        var messages = chat.getMessages();
        if (messages && messages.length) {
            var message = messages[messages.length - 1];
            if (message.sender == 'Server') {
                history.prepend('<li class="system"><p>' + message.message +
                    '</p></li>');
            } else {
                history.prepend('<li><h2>' + message.sender + '</h2><p>' +
                    message.message + '</p></li>');
            }
        }
    }

    chat.onadd(updateUi);

    $(document).ready(initUi);
    $(document).ready(updateUi);

    return {
        initUi:initUi,
        updateUi:updateUi
    };
}

function initCanvasController() {
    var
        container,
        canvas,

        context
    ;

    function initUi() {
        container = $('#drawingSurface');
        canvas = $('#canvas');

        context = canvas[0].getContext('2d');

        container.live('drag dragstart dragend', function(event) {
            console.log('foo');
            var
                offset = container.offset(),
                x = event.layerX - offset.left,
                y = event.layerY - offset.top,
                type = event.handleObj.type
            ;
            if (type == 'dragstart') {
                context.beginPath();
                context.moveTo(x,y);
            } else if (type == 'drag') {
                context.lineTo(x,y);
                context.stroke();
            } else { // type == 'dragend'
                context.closePath();
            }
        });
    }

    function updateUi() {
        updateBrush();
    }

    function updateBrush() {
        if (context) {
            var brushProperties = brush.get();
            if (brushProperties.type == 'eraser') {
                context.globalCompositeOperation = 'copy';
                context.strokeStyle = 'rgba(0,0,0,0)';
                context.fillStyle = 'rgba(0,0,0,0)';
            } else { // brushProperties.type == 'pen'
                var color = brushProperties.color;
                context.globalCompositeOperation = 'source-over';
                context.strokeStyle = 'rgba(' + color.r + ',' + color.g + ',' +
                    color.b + ',' + brushProperties.opacity + ')';
                context.fillStyle = 'rgba(' + color.r + ',' + color.g + ',' +
                    color.b + ',' + brushProperties.opacity + ')';
            }
            context.lineWidth = brushProperties.size;
            context.lineCap = 'round';
            context.lineJoin = 'round';
        }
    }

    $(document).ready(initUi);
    $(document).ready(updateUi);

    brush.onchange('color', updateBrush);
    brush.onchange('size', updateBrush);
    brush.onchange('opacity', updateBrush);
    brush.onchange('type', updateBrush);

    return {
        initUi:initUi,
        updateUi:updateUi,
        updateBrush:updateBrush
    };
}
