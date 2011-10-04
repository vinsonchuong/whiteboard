/* State */
var
    brush = initBrushModel({
        type:'pen',
        color:'000000',
        size:3,
        opacity:1
    }),
    brushController = initBrushController(),
    chatController = initChatController()
;

/* Models */
function initBrushModel(properties) {
    var
        toolProperties = {
            pen:{color:1, size:1, opacity:1},
            eraser:{size:1}
        },

        type = properties.type,
        typeChangeEvents = [],
        color = properties.color,
        colorChangeEvents = [],
        size = properties.size,
        sizeChangeEvents = [],
        opacity = properties.opacity,
        opacityChangeEvents = []
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
            runFunctions(typeChangeEvents);
        }

        var validPropertyLookup = toolProperties[type];
        if (validPropertyLookup.color && properties.color) {
            color = properties.color;
            runFunctions(colorChangeEvents);
        }
        if (validPropertyLookup.size && properties.size) {
            size = properties.size;
            runFunctions(sizeChangeEvents);
        }
        if (validPropertyLookup.opacity && properties.opacity) {
            opacity = properties.opacity;
            runFunctions(opacityChangeEvents);
        }
    }

    function change(property, callback) {
        if (property == 'type')
            typeChangeEvents.push(callback);
        if (property == 'color')
            colorChangeEvents.push(callback);
        if (property == 'size')
            sizeChangeEvents.push(callback);
        if (property == 'opacity')
            opacityChangeEvents.push(callback);
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
        change:change
    };
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
                brush.set('color', hex.substr(1))
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
        colorPicker.miniColors('value', brush.get('color'));
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

    brush.change('color', updateColor);
    brush.change('size', updateSize);
    brush.change('opacity', updateOpacity);
    brush.change('type', updateTool);

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
        button
    ;

    function initUi() {
        history = $('#chatHistory');
        input = $('#chatText');
        button = $('#chatSubmit');

        button.button();
    }

    $(document).ready(initUi);

    return {};
}
