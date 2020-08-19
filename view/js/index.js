(function() {
    const app = require("electron").remote.app;

    window.reloadConnection = function() {
        app.relaunch();
        app.exit(0);
    }

    window.changePage = function(id) {
        switch (id) {
            case 'main':
                document.querySelector('#menu-main').style.display = 'block';
                document.querySelector('#menu-settings').style.display = 'none';
                document.querySelector('#menu-joysticks').style.display = 'none';
                document.querySelector('#menu-more').style.display = 'none';
                break;
            case 'settings':
                document.querySelector('#menu-main').style.display = 'none';
                document.querySelector('#menu-settings').style.display = 'block';
                document.querySelector('#menu-joysticks').style.display = 'none';
                document.querySelector('#menu-more').style.display = 'none';
                break;
            case 'joysticks':
                document.querySelector('#menu-main').style.display = 'none';
                document.querySelector('#menu-settings').style.display = 'none';
                document.querySelector('#menu-joysticks').style.display = 'block';
                document.querySelector('#menu-more').style.display = 'none';
                break;
            case 'more':
                document.querySelector('#menu-main').style.display = 'none';
                document.querySelector('#menu-settings').style.display = 'none';
                document.querySelector('#menu-joysticks').style.display = 'none';
                document.querySelector('#menu-more').style.display = 'block';
                break;
        }
    }

    // timer delay setting
    // init
    document.querySelector('#timer-polling-delay-show').innerText = document.querySelector('#timer-polling-delay-input').value;

    document.querySelector('#timer-polling-delay-input').oninput = function() {
        document.querySelector('#timer-polling-delay-show').innerText = this.value;
    }

    document.querySelector('#timer-polling-delay-input').onchange = function() {
        clearInterval(window.gamepadTimer);
        window.gamepadTimer = setInterval(window.gamepadTimerFn, this.value);
    }
}());
