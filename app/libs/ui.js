import { House } from './meshHouse.js';

let meshCursor;

function init() {
	meshCursor = new House([0, 0], 0);
	// meshCursor.mesh.material.emissive = emissive;
	// meshCursor.roofMesh.material.emissive = emissive;
}

function update(_tile) {
	if (!_tile) return;
	meshCursor.setPosition(_tile.worldPosition[0], _tile.worldPosition[1]);
}


export {init, update};