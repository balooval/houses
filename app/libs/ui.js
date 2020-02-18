import * as THREE from './../../vendor/three.module.js';
import * as Core from './core.js';
import { House } from './meshHouse.js';

const textCursor = new THREE.TextureLoader().load('./assets/cursor.png');
let meshCursor;

function init() {
    const gridSize = 10;
	const gridDefinition = 1;
	meshCursor = new House([0, 0], 0);
	meshCursor.
	/*
    var geometry = new THREE.PlaneGeometry(gridSize, gridSize, gridDefinition, gridDefinition);
    var material = new THREE.MeshBasicMaterial({color: 0xffffff, map:textCursor, depthTest:false, depthWrite:false, transparent:true});
    meshCursor = new THREE.Mesh(geometry, material);
    meshCursor.renderOrder = 999;
    meshCursor.position.y = 1;
    meshCursor.rotation.x = Math.PI * -0.5;
	Core.scene.add(meshCursor);
	*/
}

function update(_tile) {
	if (!_tile) return;
	meshCursor.setPosition(_tile.worldPosition[0], _tile.worldPosition[1]);
}


export {init, update};