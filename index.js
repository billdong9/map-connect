const {
    app,
    BrowserWindow,
    ipcMain,
    Menu,
    shell
} = require('electron');

const fs = require('fs'),
    path = require('path');

const connection = require('./connection/connection');

// init
const appDataPath = path.join(app.getPath('appData'), 'Map Connect');
fs.mkdirSync(appDataPath, {
    recursive: true
})

// start
global.joysticksConfig = {};
if (fs.existsSync(path.join(appDataPath, './joysticksConfig.json'))) {
    global.joysticksConfig = JSON.parse(fs.readFileSync(path.join(appDataPath, './joysticksConfig.json')).toString());
}

// menu
const isMac = process.platform === 'darwin';
const template = [
    ...(isMac ? [{
        label: app.name,
        submenu: [{
                role: 'about'
            },
            {
                type: 'separator'
            },
            {
                role: 'hide'
            },
            {
                type: 'separator'
            },
            {
                role: 'unhide'
            },
            {
                type: 'separator'
            },
            {
                role: 'quit'
            }
        ]
    }] : []),
    {
        role: 'help',
        submenu: [{
            label: 'Learn More',
            click: async () => {
                await shell.openExternal('http://connect.map-flight.com')
            }
        }]
    }
]

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

ipcMain.on('saveJoysticksConfig', (sys, msg) => {
    fs.writeFileSync(path.join(appDataPath, './joysticksConfig.json'), JSON.stringify(msg));
})

ipcMain.on('sendCmd', (sys, msg) => {
    if (connection.isOK) {
        switch (msg.type) {
            case 'roll':
                connection.sendCmd('NetworkJoystick.SetAxisValue', [{
                    Name: 1,
                    Value: msg.value * 1024
                }])
                break;
            case 'pitch':
                connection.sendCmd('NetworkJoystick.SetAxisValue', [{
                    Name: 0,
                    Value: msg.value * 1024
                }])
                break;
            case 'yaw':
                connection.sendCmd('NetworkJoystick.SetAxisValue', [{
                    Name: 2,
                    Value: msg.value * 1024
                }])
                break;
            case 'throttle':
                connection.sendCmd('NetworkJoystick.SetAxisValue', [{
                    Name: 3,
                    Value: msg.value * 1024
                }])
                break;

            case 'parkingbrakes':
                connection.sendCmd('Commands.ParkingBrakes', []);
                break;
            case 'flapsdown':
                connection.sendCmd('Commands.FlapsDown', []);
                break;
            case 'flapsup':
                connection.sendCmd('Commands.FlapsUp', []);
                break;
            case 'flapsfulldown':
                connection.sendCmd('Commands.FlapsFullDown', []);
                break;
            case 'flapsfullup':
                connection.sendCmd('Commands.FlapsFullUp', []);
                break;
            case 'spoilers':
                connection.sendCmd('Commands.Spoilers', []);
                break;
            case 'landinggear':
                connection.sendCmd('Commands.LandingGear', []);
                break;
            case 'pushback':
                connection.sendCmd('Commands.Pushback', []);
                break;
            case 'reversethrust':
                connection.sendCmd('Commands.ReverseThrust', [{
                    Name: "KeyAction",
                    Value: msg.value
                }])
                break;
            case 'elevatortrimup':
                connection.sendCmd('Commands.ElevatorTrimUp', []);
                break;
            case 'elevatortrimdown':
                connection.sendCmd('Commands.ElevatorTrimDown', []);
                break;

            case 'landinglights':
                connection.sendCmd('Commands.LandingLights', []);
                break;
            case 'taxilights':
                connection.sendCmd('Commands.TaxiLights', []);
                break;
            case 'strobelights':
                connection.sendCmd('Commands.StrobeLights', []);
                break;
            case 'beaconlights':
                connection.sendCmd('Commands.BeaconLights', []);
                break;
            case 'navlights':
                connection.sendCmd('Commands.NavLights', []);
                break;

            case 'togglehud':
                connection.sendCmd('Commands.ToggleHUD', []);
                break;
            case 'nextcamera':
                connection.sendCmd('Commands.NextCamera', []);
                break;
            case 'prevcamera':
                connection.sendCmd('Commands.PrevCamera', []);
                break;
            case 'cameramoveleft':
                connection.sendCmd('NetworkJoystick.SetPOVState', [{
                        "Name": "X",
                        "Value": -1
                    },
                    {
                        "Name": "Y",
                        "Value": 0
                    }
                ])
                break;
            case 'cameramoveright':
                connection.sendCmd('NetworkJoystick.SetPOVState', [{
                        "Name": "X",
                        "Value": 1
                    },
                    {
                        "Name": "Y",
                        "Value": 0
                    }
                ])
                break;
            case 'cameramovedown':
                connection.sendCmd('NetworkJoystick.SetPOVState', [{
                        "Name": "X",
                        "Value": 0
                    },
                    {
                        "Name": "Y",
                        "Value": -1
                    }
                ])
                break;
            case 'cameramoveup':
                connection.sendCmd('NetworkJoystick.SetPOVState', [{
                        "Name": "X",
                        "Value": 0
                    },
                    {
                        "Name": "Y",
                        "Value": 1
                    }
                ])
                break;
            case 'camerastopmove':
                connection.sendCmd('NetworkJoystick.SetPOVState', [{
                        "Name": "X",
                        "Value": 0
                    },
                    {
                        "Name": "Y",
                        "Value": 0
                    }
                ])
                break;
            case 'setcockpitcamera':
                connection.sendCmd('Commands.SetCockpitCamera', []);
                break;
            case 'setvirtualcockpitcamera':
                connection.sendCmd('Commands.SetVirtualCockpitCameraCommand', []);
                break;
            case 'setfollowcamera':
                connection.sendCmd('Commands.SetFollowCameraCommand', []);
                break;
            case 'setflybycamera':
                connection.sendCmd('Commands.SetFlyByCamera', []);
                break;
            case 'setonboardcamera':
                connection.sendCmd('Commands.SetOnboardCameraCommand', []);
                break;
            case 'settowercamera':
                connection.sendCmd('Commands.SetTowerCameraCommand', []);
                break;

            case 'showatcwindow':
                connection.sendCmd('Commands.ShowATCWindowCommand', []);
                break;
            case 'atcentry1':
                connection.sendCmd('Commands.ATCEntry1', []);
                break;
            case 'atcentry2':
                connection.sendCmd('Commands.ATCEntry2', []);
                break;
            case 'atcentry3':
                connection.sendCmd('Commands.ATCEntry3', []);
                break;
            case 'atcentry4':
                connection.sendCmd('Commands.ATCEntry4', []);
                break;
            case 'atcentry5':
                connection.sendCmd('Commands.ATCEntry5', []);
                break;
            case 'atcentry6':
                connection.sendCmd('Commands.ATCEntry6', []);
                break;
            case 'atcentry7':
                connection.sendCmd('Commands.ATCEntry7', []);
                break;
            case 'atcentry8':
                connection.sendCmd('Commands.ATCEntry8', []);
                break;
            case 'atcentry9':
                connection.sendCmd('Commands.ATCEntry9', []);
                break;
            case 'atcentry10':
                connection.sendCmd('Commands.ATCEntry10', []);
                break;

            case 'toggleautopilot':
                connection.sendCmd('Commands.Autopilot.Toggle', []);
                break;
            case 'toggleheading':
                connection.sendCmd('Commands.Autopilot.SetHeadingState', [{
                    Value: msg.value
                }])
                break;
            case 'togglealtitude':
                connection.sendCmd('Commands.Autopilot.SetAltitudeState', [{
                    Value: msg.value
                }])
                break;
            case 'togglevs':
                connection.sendCmd('Commands.Autopilot.SetVSState', [{
                    Value: msg.value
                }])
                break;
            case 'togglespeed':
                connection.sendCmd('Commands.Autopilot.SetSpeedState', [{
                    Value: msg.value
                }])
                break;
            case 'toggleapproachmode':
                connection.sendCmd('Commands.Autopilot.SetApproachModeState', [{
                    Value: msg.value
                }])
                break;

            case 'togglepause':
                connection.sendCmd('Commands.TogglePause', []);
                break;
        }
    }
})

function createWindow() {
    const win = new BrowserWindow({
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.loadFile('./view/index.html');

    // DEBUG
    // win.webContents.openDevTools();

    connection.init(() => {
        console.log('connected');
        win.webContents.executeJavaScript(`document.querySelector('#connection-status').innerText = 'Connected'`);
    }, () => {
        console.log('connect failed');
        win.webContents.executeJavaScript(`document.querySelector('#connection-status').innerText = 'Connect failed'`);
    }, () => {
        win.webContents.executeJavaScript(`document.querySelector('#connection-status').innerText = 'The connection is invalid, please reload the connection'`);
    })
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    app.quit();
})
