const InfiniteFlight = require('./../libs/InfiniteFlight');

module.exports = {
    init(success, failed, end) {
        InfiniteFlight.init(() => {
            success();
            this.isOK = true;
            InfiniteFlight.sendCmd('NetworkJoystick.SetNetworkJoystickAxes', []);
        }, () => {
            this.isOK = false;
            failed();
        }, () => {
            this.isOK = false;
            end();
        })
    },
    sendCmd(cmd, args) {
        InfiniteFlight.sendCmd(cmd, args);
    },
    isOK: false
}
