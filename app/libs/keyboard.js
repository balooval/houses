let ctrlPressed = false;

function init(_callback) {
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
}

function onKeyDown(_evt) {
    if (_evt.key == 'Control') {
        ctrlPressed = true;
    }
}
function onKeyUp(_evt) {
    if (_evt.key == 'Control') {
        ctrlPressed = false;
    }
}

export {init, ctrlPressed};