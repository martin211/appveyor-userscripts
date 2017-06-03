// ==UserScript==
// @name         AppVeyor powershell editor
// @namespace    https://github.com/martin211
// @version      1.1
// @description  Adds powershell editor instead standard inputs
// @author       mail4evgeniy@gmail.com
// @match        https://ci.appveyor.com/*
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/martin211/appveyor-userscripts/master/appveyor-powershell-editor.js
// @downloadURL  https://raw.githubusercontent.com/martin211/appveyor-userscripts/master/appveyor-powershell-editor.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @require      http://codemirror.net/lib/codemirror.js
// @require      http://codemirror.net/mode/powershell/powershell.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/addon/display/fullscreen.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/addon/search/search.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/addon/search/searchcursor.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/addon/dialog/dialog.min.js
// @resource     codemirror_css https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/codemirror.css
// @resource     codemirror_dialog https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/addon/dialog/dialog.min.css
// ==/UserScript==

var cssTxt = GM_getResourceText("codemirror_css");
GM_addStyle(cssTxt);
GM_addStyle(".CodeMirror-fullscreen { position: fixed; top: 50px; left: 0; right: 0; bottom: 0; height: auto; z-index: 9;}");

var dialogCss = GM_getResourceText("codemirror_dialog");
GM_addStyle(dialogCss);

(function() {
    'use strict';

    function Init() {
        window.iniTimerId = null;
        const divs = $('textarea');
        divs.each((i, block) => {
            const element = $(block);
            if (element.attr('codemirror')) {
                return;
            }

            var codeBlock = $('<pre><code><div id="code_' + i + '"></div></code></pre>');
            var toolbar = $('<div class="clearfix"></div>');
            var refreshCodeButton = $('<input type="button" value="Refresh" />');
            var toolbarHint = $("<p><b>F11</b> - full screen mode</br><b>Ctrl-F / Alt-F</b> Start searching</br><b>Ctrl-G / Cmd-G</b> Find next</br><b>Shift-Ctrl-G / Shift-Cmd-G</b> Find previous</br><b>Shift-Ctrl-F / Cmd-Option-F</b> Replace</p>");

            toolbar.append(refreshCodeButton);
            toolbar.append(toolbarHint);

            var currentState = element.parent().find("ul.switch-buttons .active").text();

            if (currentState.toLowerCase() === "off" || currentState === "") {
                codeBlock.hide();
            }

            // subscribe to language buttons
            element.parent().find("ul.switch-buttons").click((e) => {
                var value = $(e.target).text();
                if (value.toLowerCase() === "off") {
                    codeBlock.hide();
                }
                else {
                    codeBlock.show();
                }
            });

            element.parent().append(codeBlock);
            codeBlock.find('div').append(element);
            codeBlock.append(toolbar);

            var myCodeMirror = CodeMirror.fromTextArea(block, {
                lineNumbers: true,
                mode: "powershell",
                indentUnit: 4,
                tabMode: "shift",
                matchBrackets: true,
                extraKeys: {
                    "F11": function(cm) {
                        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                    },
                    "Esc": function(cm) {
                        if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                    },
                    "Alt-F": "findPersistent"
                }
            });
            element.attr('codemirror', 'true');

            myCodeMirror.on('change', () => {
                var value = myCodeMirror.getValue();
                element.val(value);
                angular.element(element).triggerHandler('input');
                angular.element(element).triggerHandler('change');
            });
            refreshCodeButton.click(() => {
                myCodeMirror.setValue(element.val());
            });

            /*$('.vertical-tabs > li > a').click(() => {
                window.isInitialized = null;
                setTimeout(() => {
                    Init();
                }, 1500);
            });*/
        });
    }

    function addXMLRequestCallback(callback){
        var origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function() {
            this.addEventListener('load', function() {
                if (window.iniTimerId) {
                    clearTimeout(window.iniTimerId);
                }

                window.iniTimerId = setTimeout(() => {
                    Init();
                }, 500);
            });
            origOpen.apply(this, arguments);
        };
    }

    addXMLRequestCallback( function( xhr ) { 
    });
    addXMLRequestCallback( function( xhr ) {
    });
})();
