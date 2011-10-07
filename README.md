# Whiteboard
Whiteboard is a collaborative workspace, providing a drawing surface and
text chat to multiple simultaneous users.

The drawing surface is built using HTML5 canvas and SVG. The overall user interface is powered by
[Raphael](http://raphaeljs.com),
[jQuery](http://jquery.com),
[jQuery UI](http://jqueryui.com),
[jQuery miniColors](http://abeautifulsite.net/blog/2011/02/jquery-minicolors-a-color-selector-for-input-controls/),
[fileinput](http://plugins.jquery.com/project/fileinput),
[spinner](http://www.jqueryin.com/projects/spinner-jquery-preloader-plugin/), and
[jquery.event.drag](http://threedubmedia.com/code/event/drag).
Client and server communication for the chat and canvas is powered by [Socket.IO](http://socket.io/).
File serving is powered by [Express](http://expressjs.com). Data sanitization is powered by
[node-validator](https://github.com/chriso/node-validator).

## Usage
* First, install [node.js](http://nodejs.org) (this project was developed using
the unstable v0.5.8 Windows binary).
* Start the server by running `node server.js [PORT]`. If not specified, `PORT` defaults to `8080`.
Remember to open the port in your firewall if you're looking to accept outside connections.
* In Chrome (there is a pending issue in Firefox and IE), visit `http://server:port`
(eg. `http://localhost:8080`).

## Interface Notes
* History starts from the first action taken.
* The Line, Rectangle, and Image tools can be snapped (as in Photoshop) by holding `Shift`. Try it out!
* In preview mode, the Rectangle and Image tools can only be resized to the bottom-right.
* Actions in preview mode are not shown in history nor are they shown to other users. In other words,
when sizing a Rectangle, other users will only see the final result.
* Please specify unique names other than "Server". I'm still deciding how/if I will reserve names.

## Issues
* To allow the canvas to be updated simultaneously by multiple users, pen strokes are
drawn as two-point paths, which prevents stroke opacity from displaying as expected.
* The eraser tool seems to break in Firefox and IE.

## Licensing
Raphael, jQuery, jQuery UI, jQuery miniColors, fileinput, Spinner, jquery.event.drag, Socket.IO, Express,
and node-validator (included dependencies of this project) and their included dependencies
are licensed under their own respective terms, which are listed in the relevant subdirectories.

All other code and assets are licensed under the MIT License as follows:

    Copyright (c) 2011 Vinson Chuong

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is furnished
    to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
    FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
    COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
    IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
