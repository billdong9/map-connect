(function() {

    const ipc = require('electron').ipcRenderer;

    window.gamepads = {};
    window.controls = {};
    window.nowSelectedAxisSetting = null;
    window.nowSelectedBtnSetting = null;

    const apStatus = {
        heading: false,
        altitude: false,
        vs: false,
        speed: false,
        appr: false
    }

    window.selectAxis = function(type) {
        if (nowSelectedAxisSetting !== type) {
            nowSelectedAxisSetting = type;
            document.querySelector('#select-axis-prompt').style.display = 'block';
        } else {
            nowSelectedAxisSetting = null;
            window.controls[type] = null;
            document.querySelector('#sel-' + type).innerText = 'Select axis';
            document.querySelector('#select-axis-prompt').style.display = 'none';
            saveJoysticksConfig();
        }
    }

    window.selectBtn = function(type) {
        if (nowSelectedBtnSetting !== type) {
            nowSelectedBtnSetting = type;
            document.querySelector('#select-btn-prompt').style.display = 'block';
        } else {
            nowSelectedBtnSetting = null;
            window.controls[type] = null;
            document.querySelector('#sel-' + type).innerText = 'Select button';
            document.querySelector('#select-btn-prompt').style.display = 'none';
            saveJoysticksConfig();
        }
    }

    window.onAxisClicked = function(gamepadIndex, axisNumber) {
        if (window.nowSelectedAxisSetting) {
            window.controls[window.nowSelectedAxisSetting] = {
                index: gamepadIndex,
                axisNum: axisNumber,
                lastVal: null
            }

            document.querySelector('#sel-' + window.nowSelectedAxisSetting).innerText = gamepadIndex + ',' + (axisNumber + 1);
            document.querySelector('#select-axis-prompt').style.display = 'none';

            window.nowSelectedAxisSetting = null;
            saveJoysticksConfig();
        }
    }

    window.onButtonsClicked = function(gamepadIndex, btnNumber) {
        if (window.nowSelectedBtnSetting) {
            window.controls[window.nowSelectedBtnSetting] = {
                index: gamepadIndex,
                btnNum: btnNumber,
                lastVal: null
            }

            document.querySelector('#sel-' + window.nowSelectedBtnSetting).innerText = gamepadIndex + ',' + (btnNumber + 1);
            document.querySelector('#select-btn-prompt').style.display = 'none';

            window.nowSelectedBtnSetting = null;
            saveJoysticksConfig();
        }
    }

    function saveJoysticksConfig() {
        const config = {};

        for (let i in window.controls) {
            if (!window.controls[i]) continue;
            config[i] = JSON.parse(JSON.stringify(window.controls[i]));
            config[i].index = window.gamepads[config[i].index].id;
            delete config[i].lastVal;
        }

        ipc.send('saveJoysticksConfig', config);
    }

    function gamepadHandler(event, connecting) {
        const gamepad = event.gamepad;
        if (connecting) {
            gamepads[gamepad.index] = gamepad;

            let allAxesHTML = '';
            for (let i = 0; i < gamepad.axes.length; i++) {
                allAxesHTML += '<li class="axesOrBtnLi" onclick="onAxisClicked(' + gamepad.index + ', ' + i + ')" id="joysticks-axis-' + gamepad.index + '-' + i + '">' + gamepad.axes[i] + '</li>';
            }
            let allButtonsHTML = '';
            for (let i = 0; i < gamepad.buttons.length; i++) {
                allButtonsHTML += '<li class="axesOrBtnLi" onclick="onButtonsClicked(' + gamepad.index + ', ' + i + ')" id="joysticks-button-' + gamepad.index + '-' + i + '">' + Boolean(gamepad.buttons[i].value) + '</li>';
            }

            document.querySelector('#joysticks').innerHTML += "<li id='joysticks-" + gamepad.index + "'><span class='joysticks-heading'>" + gamepad.id + "</span><br><b>Axes:</b><ol>" + allAxesHTML + "</ol><b>Buttons:</b><ol>" + allButtonsHTML + "</ol></li>";

            // apply config
            const joysticksConfig = JSON.parse(JSON.stringify(require('electron').remote.getGlobal('joysticksConfig')));
            for (let i in joysticksConfig) {
                if (joysticksConfig[i].index === gamepad.id) {
                    if (!document.querySelector('#sel-' + i) || window.controls[i]) continue;

                    const config = joysticksConfig[i];
                    window.controls[i] = {
                        index: gamepad.index,
                        axisNum: config.axisNum,
                        btnNum: config.btnNum,
                        lastVal: null
                    }

                    document.querySelector('#sel-' + i).innerText = gamepad.index + ',' + ((window.controls[i].axisNum !== undefined && window.controls[i].axisNum !== null) ? (window.controls[i].axisNum + 1) : (window.controls[i].btnNum + 1));
                }
            }
        } else {
            delete gamepads[gamepad.index];
            document.querySelector('#joysticks-' + gamepad.index).remove();
        }
    }

    window.addEventListener("gamepadconnected", function(e) {
        gamepadHandler(e, true);
    }, false);

    window.addEventListener("gamepaddisconnected", function(e) {
        gamepadHandler(e, false);
    }, false);

    window.gamepadTimerFn = () => {
        for (let i in gamepads) {
            let allAxesHTML = '',
                gamepad = navigator.getGamepads()[i];

            // axes
            for (let a = 0; a < gamepad.axes.length; a++) {
                // set view
                document.querySelector('#joysticks-axis-' + gamepad.index + '-' + a).innerText = gamepad.axes[a];

                // call infinite flight
                if (controls.roll && controls.roll.index == gamepad.index && controls.roll.axisNum == a && controls.roll.lastVal !== gamepad.axes[a]) {
                    ipc.send('sendCmd', {
                        type: 'roll',
                        value: gamepad.axes[a]
                    })
                    controls.roll.lastVal = gamepad.axes[a];
                }
                if (controls.pitch && controls.pitch.index == gamepad.index && controls.pitch.axisNum == a && controls.pitch.lastVal !== gamepad.axes[a]) {
                    ipc.send('sendCmd', {
                        type: 'pitch',
                        value: gamepad.axes[a]
                    })
                    controls.pitch.lastVal = gamepad.axes[a];
                }
                if (controls.yaw && controls.yaw.index == gamepad.index && controls.yaw.axisNum == a && controls.yaw.lastVal !== gamepad.axes[a]) {
                    ipc.send('sendCmd', {
                        type: 'yaw',
                        value: gamepad.axes[a]
                    })
                    controls.yaw.lastVal = gamepad.axes[a];
                }
                if (controls.throttle && controls.throttle.index == gamepad.index && controls.throttle.axisNum == a && controls.throttle.lastVal !== gamepad.axes[a]) {
                    ipc.send('sendCmd', {
                        type: 'throttle',
                        value: gamepad.axes[a]
                    })
                    controls.throttle.lastVal = gamepad.axes[a];
                }
            }

            // buttons
            for (let a = 0; a < gamepad.buttons.length; a++) {
                // set view
                document.querySelector('#joysticks-button-' + gamepad.index + '-' + a).innerText = Boolean(gamepad.buttons[a].value);

                // call infinite flight
                if (controls.parkingbrakes && controls.parkingbrakes.index == gamepad.index && controls.parkingbrakes.btnNum == a) {
                    if (controls.parkingbrakes.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'parkingbrakes'
                        })
                    }
                    controls.parkingbrakes.lastVal = gamepad.buttons[a].value;
                }
                if (controls.flapsdown && controls.flapsdown.index == gamepad.index && controls.flapsdown.btnNum == a) {
                    if (controls.flapsdown.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'flapsdown'
                        })
                    }
                    controls.flapsdown.lastVal = gamepad.buttons[a].value;
                }
                if (controls.flapsup && controls.flapsup.index == gamepad.index && controls.flapsup.btnNum == a) {
                    if (controls.flapsup.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'flapsup'
                        })
                    }
                    controls.flapsup.lastVal = gamepad.buttons[a].value;
                }
                if (controls.flapsfulldown && controls.flapsfulldown.index == gamepad.index && controls.flapsfulldown.btnNum == a) {
                    if (controls.flapsfulldown.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'flapsfulldown'
                        })
                    }
                    controls.flapsfulldown.lastVal = gamepad.buttons[a].value;
                }
                if (controls.flapsfullup && controls.flapsfullup.index == gamepad.index && controls.flapsfullup.btnNum == a) {
                    if (controls.flapsfullup.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'flapsfullup'
                        })
                    }
                    controls.flapsfullup.lastVal = gamepad.buttons[a].value;
                }
                if (controls.spoilers && controls.spoilers.index == gamepad.index && controls.spoilers.btnNum == a) {
                    if (controls.spoilers.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'spoilers'
                        })
                    }
                    controls.spoilers.lastVal = gamepad.buttons[a].value;
                }
                if (controls.landinggear && controls.landinggear.index == gamepad.index && controls.landinggear.btnNum == a) {
                    if (controls.landinggear.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'landinggear'
                        })
                    }
                    controls.landinggear.lastVal = gamepad.buttons[a].value;
                }
                if (controls.pushback && controls.pushback.index == gamepad.index && controls.pushback.btnNum == a) {
                    if (controls.pushback.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'pushback'
                        })
                    }
                    controls.pushback.lastVal = gamepad.buttons[a].value;
                }
                if (controls.reversethrust && controls.reversethrust.index == gamepad.index && controls.reversethrust.btnNum == a) {
                    if (controls.reversethrust.lastVal !== gamepad.buttons[a].value) {
                        if (gamepad.buttons[a].value) {
                            ipc.send('sendCmd', {
                                type: 'reversethrust',
                                value: 'Down'
                            })
                        } else {
                            ipc.send('sendCmd', {
                                type: 'reversethrust',
                                value: 'Up'
                            })
                        }
                    }
                    controls.reversethrust.lastVal = gamepad.buttons[a].value;
                }
                if (controls.elevatortrimup && controls.elevatortrimup.index == gamepad.index && controls.elevatortrimup.btnNum == a) {
                    if (controls.elevatortrimup.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'elevatortrimup'
                        })
                    }
                    controls.elevatortrimup.lastVal = gamepad.buttons[a].value;
                }
                if (controls.elevatortrimdown && controls.elevatortrimdown.index == gamepad.index && controls.elevatortrimdown.btnNum == a) {
                    if (controls.elevatortrimdown.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'elevatortrimdown'
                        })
                    }
                    controls.elevatortrimdown.lastVal = gamepad.buttons[a].value;
                }

                // lights
                if (controls.landinglights && controls.landinglights.index == gamepad.index && controls.landinglights.btnNum == a) {
                    if (controls.landinglights.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'landinglights'
                        })
                    }
                    controls.landinglights.lastVal = gamepad.buttons[a].value;
                }
                if (controls.taxilights && controls.taxilights.index == gamepad.index && controls.taxilights.btnNum == a) {
                    if (controls.taxilights.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'taxilights'
                        })
                    }
                    controls.taxilights.lastVal = gamepad.buttons[a].value;
                }
                if (controls.strobelights && controls.strobelights.index == gamepad.index && controls.strobelights.btnNum == a) {
                    if (controls.strobelights.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'strobelights'
                        })
                    }
                    controls.strobelights.lastVal = gamepad.buttons[a].value;
                }
                if (controls.beaconlights && controls.beaconlights.index == gamepad.index && controls.beaconlights.btnNum == a) {
                    if (controls.beaconlights.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'beaconlights'
                        })
                    }
                    controls.beaconlights.lastVal = gamepad.buttons[a].value;
                }
                if (controls.navlights && controls.navlights.index == gamepad.index && controls.navlights.btnNum == a) {
                    if (controls.navlights.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'navlights'
                        })
                    }
                    controls.navlights.lastVal = gamepad.buttons[a].value;
                }

                // camera
                if (controls.togglehud && controls.togglehud.index == gamepad.index && controls.togglehud.btnNum == a) {
                    if (controls.togglehud.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'togglehud'
                        })
                    }
                    controls.togglehud.lastVal = gamepad.buttons[a].value;
                }
                if (controls.nextcamera && controls.nextcamera.index == gamepad.index && controls.nextcamera.btnNum == a) {
                    if (controls.nextcamera.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'nextcamera'
                        })
                    }
                    controls.nextcamera.lastVal = gamepad.buttons[a].value;
                }
                if (controls.prevcamera && controls.prevcamera.index == gamepad.index && controls.prevcamera.btnNum == a) {
                    if (controls.prevcamera.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'prevcamera'
                        })
                    }
                    controls.prevcamera.lastVal = gamepad.buttons[a].value;
                }
                if (controls.cameramoveleft && controls.cameramoveleft.index == gamepad.index && controls.cameramoveleft.btnNum == a) {
                    if (controls.cameramoveleft.lastVal !== gamepad.buttons[a].value) {
                        if (gamepad.buttons[a].value) {
                            ipc.send('sendCmd', {
                                type: 'cameramoveleft'
                            })
                        } else {
                            ipc.send('sendCmd', {
                                type: 'camerastopmove'
                            })
                        }
                    }
                    controls.cameramoveleft.lastVal = gamepad.buttons[a].value;
                }
                if (controls.cameramoveright && controls.cameramoveright.index == gamepad.index && controls.cameramoveright.btnNum == a) {
                    if (controls.cameramoveright.lastVal !== gamepad.buttons[a].value) {
                        if (gamepad.buttons[a].value) {
                            ipc.send('sendCmd', {
                                type: 'cameramoveright'
                            })
                        } else {
                            ipc.send('sendCmd', {
                                type: 'camerastopmove'
                            })
                        }
                    }
                    controls.cameramoveright.lastVal = gamepad.buttons[a].value;
                }
                if (controls.cameramovedown && controls.cameramovedown.index == gamepad.index && controls.cameramovedown.btnNum == a) {
                    if (controls.cameramovedown.lastVal !== gamepad.buttons[a].value) {
                        if (gamepad.buttons[a].value) {
                            ipc.send('sendCmd', {
                                type: 'cameramovedown'
                            })
                        } else {
                            ipc.send('sendCmd', {
                                type: 'camerastopmove'
                            })
                        }
                    }
                    controls.cameramovedown.lastVal = gamepad.buttons[a].value;
                }
                if (controls.cameramoveup && controls.cameramoveup.index == gamepad.index && controls.cameramoveup.btnNum == a) {
                    if (controls.cameramoveup.lastVal !== gamepad.buttons[a].value) {
                        if (gamepad.buttons[a].value) {
                            ipc.send('sendCmd', {
                                type: 'cameramoveup'
                            })
                        } else {
                            ipc.send('sendCmd', {
                                type: 'camerastopmove'
                            })
                        }
                    }
                    controls.cameramoveup.lastVal = gamepad.buttons[a].value;
                }
                if (controls.setcockpitcamera && controls.setcockpitcamera.index == gamepad.index && controls.setcockpitcamera.btnNum == a) {
                    if (controls.setcockpitcamera.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'setcockpitcamera'
                        })
                    }
                    controls.setcockpitcamera.lastVal = gamepad.buttons[a].value;
                }
                if (controls.setvirtualcockpitcamera && controls.setvirtualcockpitcamera.index == gamepad.index && controls.setvirtualcockpitcamera.btnNum == a) {
                    if (controls.setvirtualcockpitcamera.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'setvirtualcockpitcamera'
                        })
                    }
                    controls.setvirtualcockpitcamera.lastVal = gamepad.buttons[a].value;
                }
                if (controls.setfollowcamera && controls.setfollowcamera.index == gamepad.index && controls.setfollowcamera.btnNum == a) {
                    if (controls.setfollowcamera.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'setfollowcamera'
                        })
                    }
                    controls.setfollowcamera.lastVal = gamepad.buttons[a].value;
                }
                if (controls.setflybycamera && controls.setflybycamera.index == gamepad.index && controls.setflybycamera.btnNum == a) {
                    if (controls.setflybycamera.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'setflybycamera'
                        })
                    }
                    controls.setflybycamera.lastVal = gamepad.buttons[a].value;
                }
                if (controls.setonboardcamera && controls.setonboardcamera.index == gamepad.index && controls.setonboardcamera.btnNum == a) {
                    if (controls.setonboardcamera.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'setonboardcamera'
                        })
                    }
                    controls.setonboardcamera.lastVal = gamepad.buttons[a].value;
                }
                if (controls.settowercamera && controls.settowercamera.index == gamepad.index && controls.settowercamera.btnNum == a) {
                    if (controls.settowercamera.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'settowercamera'
                        })
                    }
                    controls.settowercamera.lastVal = gamepad.buttons[a].value;
                }

                // atc
                if (controls.showatcwindow && controls.showatcwindow.index == gamepad.index && controls.showatcwindow.btnNum == a) {
                    if (controls.showatcwindow.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'showatcwindow'
                        })
                    }
                    controls.showatcwindow.lastVal = gamepad.buttons[a].value;
                }
                if (controls.atcentry1 && controls.atcentry1.index == gamepad.index && controls.atcentry1.btnNum == a) {
                    if (controls.atcentry1.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'atcentry1'
                        })
                    }
                    controls.atcentry1.lastVal = gamepad.buttons[a].value;
                }
                if (controls.atcentry2 && controls.atcentry2.index == gamepad.index && controls.atcentry2.btnNum == a) {
                    if (controls.atcentry2.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'atcentry2'
                        })
                    }
                    controls.atcentry2.lastVal = gamepad.buttons[a].value;
                }
                if (controls.atcentry3 && controls.atcentry3.index == gamepad.index && controls.atcentry3.btnNum == a) {
                    if (controls.atcentry3.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'atcentry3'
                        })
                    }
                    controls.atcentry3.lastVal = gamepad.buttons[a].value;
                }
                if (controls.atcentry4 && controls.atcentry4.index == gamepad.index && controls.atcentry4.btnNum == a) {
                    if (controls.atcentry4.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'atcentry4'
                        })
                    }
                    controls.atcentry4.lastVal = gamepad.buttons[a].value;
                }
                if (controls.atcentry5 && controls.atcentry5.index == gamepad.index && controls.atcentry5.btnNum == a) {
                    if (controls.atcentry5.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'atcentry5'
                        })
                    }
                    controls.atcentry5.lastVal = gamepad.buttons[a].value;
                }
                if (controls.atcentry6 && controls.atcentry6.index == gamepad.index && controls.atcentry6.btnNum == a) {
                    if (controls.atcentry6.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'atcentry6'
                        })
                    }
                    controls.atcentry6.lastVal = gamepad.buttons[a].value;
                }
                if (controls.atcentry7 && controls.atcentry7.index == gamepad.index && controls.atcentry7.btnNum == a) {
                    if (controls.atcentry7.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'atcentry7'
                        })
                    }
                    controls.atcentry7.lastVal = gamepad.buttons[a].value;
                }
                if (controls.atcentry8 && controls.atcentry8.index == gamepad.index && controls.atcentry8.btnNum == a) {
                    if (controls.atcentry8.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'atcentry8'
                        })
                    }
                    controls.atcentry8.lastVal = gamepad.buttons[a].value;
                }
                if (controls.atcentry9 && controls.atcentry9.index == gamepad.index && controls.atcentry9.btnNum == a) {
                    if (controls.atcentry9.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'atcentry9'
                        })
                    }
                    controls.atcentry9.lastVal = gamepad.buttons[a].value;
                }
                if (controls.atcentry10 && controls.atcentry10.index == gamepad.index && controls.atcentry10.btnNum == a) {
                    if (controls.atcentry10.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'atcentry10'
                        })
                    }
                    controls.atcentry10.lastVal = gamepad.buttons[a].value;
                }

                // ap & fpl
                if (controls.toggleautopilot && controls.toggleautopilot.index == gamepad.index && controls.toggleautopilot.btnNum == a) {
                    if (controls.toggleautopilot.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'toggleautopilot'
                        })
                    }
                    controls.toggleautopilot.lastVal = gamepad.buttons[a].value;
                }
                if (controls.toggleheading && controls.toggleheading.index == gamepad.index && controls.toggleheading.btnNum == a) {
                    if (controls.toggleheading.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        apStatus.heading = !apStatus.heading;
                        ipc.send('sendCmd', {
                            type: 'toggleheading',
                            value: apStatus.heading
                        })
                    }
                    controls.toggleheading.lastVal = gamepad.buttons[a].value;
                }
                if (controls.togglealtitude && controls.togglealtitude.index == gamepad.index && controls.togglealtitude.btnNum == a) {
                    if (controls.togglealtitude.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        apStatus.altitude = !apStatus.altitude;
                        ipc.send('sendCmd', {
                            type: 'togglealtitude',
                            value: apStatus.altitude
                        })
                    }
                    controls.togglealtitude.lastVal = gamepad.buttons[a].value;
                }
                if (controls.togglevs && controls.togglevs.index == gamepad.index && controls.togglevs.btnNum == a) {
                    if (controls.togglevs.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        apStatus.vs = !apStatus.vs;
                        ipc.send('sendCmd', {
                            type: 'togglevs',
                            value: apStatus.vs
                        })
                    }
                    controls.togglevs.lastVal = gamepad.buttons[a].value;
                }
                if (controls.togglespeed && controls.togglespeed.index == gamepad.index && controls.togglespeed.btnNum == a) {
                    if (controls.togglespeed.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        apStatus.speed = !apStatus.speed;
                        ipc.send('sendCmd', {
                            type: 'togglespeed',
                            value: apStatus.speed
                        })
                    }
                    controls.togglespeed.lastVal = gamepad.buttons[a].value;
                }
                if (controls.toggleapproachmode && controls.toggleapproachmode.index == gamepad.index && controls.toggleapproachmode.btnNum == a) {
                    if (controls.toggleapproachmode.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        apStatus.appr = !apStatus.appr;
                        ipc.send('sendCmd', {
                            type: 'toggleapproachmode',
                            value: apStatus.appr
                        })
                    }
                    controls.toggleapproachmode.lastVal = gamepad.buttons[a].value;
                }

                // simulator
                if (controls.togglepause && controls.togglepause.index == gamepad.index && controls.togglepause.btnNum == a) {
                    if (controls.togglepause.lastVal !== gamepad.buttons[a].value && gamepad.buttons[a].value) {
                        ipc.send('sendCmd', {
                            type: 'togglepause'
                        })
                    }
                    controls.togglepause.lastVal = gamepad.buttons[a].value;
                }
            }
        }
    }

    // loop
    window.gamepadTimer = setInterval(gamepadTimerFn, document.querySelector('#timer-polling-delay-input').value);

}());
