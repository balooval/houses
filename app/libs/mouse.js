import * as THREE from './../../vendor/three.module.js';

let lastPosition = new THREE.Vector2();
let position = new THREE.Vector2();

function registerMove(_callback) {
    window.addEventListener('mousemove', evt => {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = - (event.clientY / window.innerHeight) * 2 + 1;
        _callback(x, y);
    }, false);
}

function register(_callback) {
    window.addEventListener('mousemove', onMouseMove, false);

    document.addEventListener('contextmenu', evt => {
        evt.preventDefault();
    });
    document.addEventListener('mousedown', evt => {
        lastPosition.x = position.x;
        lastPosition.y = position.y;
    });
    document.addEventListener('mouseup', evt => {
        if (hasMoved()) return false;
        _callback(evt);
    });
}

function hasMoved() {
    if (lastPosition.x != position.x) return true;
    if (lastPosition.y != position.y) return true;
    return false;
}

function onMouseMove(event) {
    position.x = (event.clientX / window.innerWidth) * 2 - 1;
    position.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

export {register, position, registerMove};