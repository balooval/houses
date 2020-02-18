import * as THREE from './../../vendor/three.module.js';
import * as Core from './core.js'

const textWall = new THREE.TextureLoader().load('./assets/wall.jpg');
textWall.wrapS = textWall.wrapT = THREE.RepeatWrapping;
const textRoof = new THREE.TextureLoader().load('./assets/roof.jpg');
textRoof.wrapS = textRoof.wrapT = THREE.RepeatWrapping;
const blocHeight = 10;

function getRoofMaterial() {
	return new THREE.MeshPhysicalMaterial({color: 0xffffff, clearcoat:0, map:textRoof});
}

function getWallMaterial() {
	return new THREE.MeshPhysicalMaterial({color: 0xffffff, clearcoat:0, map:textWall});
}

function getRoofGeometry(_model) {
	if (_model == 'alone') {
		const roofShape = [
			[-0.8, -1], 
			[0.8, -1], 
			[1, -0.8], 
			[1, 0.8], 
			[0.8, 1], 
			[-0.8, 1], 
			[-1, 0.8], 
			[-1, -0.8], 
		];
		const roofPath = [
			[0.5, 0.2], 
			[1.05, -0.08], 
			[1.1, -0.03], 
			[0.5, 0.3], 
			[0.2, 0.5], 
			[0.01, 0.55], 
		];
		return buildBoxGeometry(roofShape, roofPath, 6);
	}
	if (_model == 'slope') {
		return buildRoofGeometrySlope(5);
	}
	if (_model == 'corner') {
		return buildRoofGeometryCorner(5);
	}
}

function getWallGeometry(_floor) {
	const wallsShape = [
		[-1, -1], 
		[1, -1], 
		[1, 1], 
		[-1, 1], 
	];
	const wallsPath = [
		[0.01, 0], 
		[0.54, 0], 
		[0.54, 0.2], 
		[0.5, 0.25], 
		[0.5, 0.9], 
		[0.55, 0.9], 
		[0.55, 1], 
		[0.01, 1], 
	];
	if (_floor == 0) { 
		return buildBoxGeometry(wallsShape, wallsPath);
	}
	const wallsPathB = [
		[0.01, 0], 
		[0.5, 0], 
		[0.5, 0.95], 
		[0.55, 0.95], 
		[0.55, 1], 
		[0.01, 1], 
	];
	return buildBoxGeometry(wallsShape, wallsPathB);
}

class House {
	constructor(_position, _floor) {
		this.floor = _floor;
		this.roofMesh = new THREE.Mesh(getRoofGeometry('alone'), getRoofMaterial());
		this.roofMesh.castShadow = true;
    	this.roofMesh.receiveShadow = true;
		Core.scene.add(this.roofMesh);
		let myWallGeometry = getWallGeometry(this.floor);
		this.mesh = new THREE.Mesh(myWallGeometry, getWallMaterial());
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		this.setPosition(_position[0], _position[1]);
		Core.scene.add(this.mesh);
	}

	setPosition(_x, _y) {
		this.roofMesh.position.set(_x, (this.floor + 1) * blocHeight, _y);
		this.mesh.position.set(_x, this.floor * blocHeight, _y);
	}

	highlight(_state) {
		let color = 0x000000;
		if (_state) {
			color = 0x006600;
		}
		const emissive = new THREE.Color(color)
		this.mesh.material.emissive = emissive;
		this.roofMesh.material.emissive = emissive;
	}

	showRoof(_state) {
		if (_state) {
			Core.scene.add(this.roofMesh);
		} else {
			Core.scene.remove(this.roofMesh);
		}
	}

	updateRoof(_siblings) {
		if (_siblings[2] > this.floor + 1) {
			this.showRoof(false);
			return true;
		}
		this.showRoof(true);

		const tests = [
			[['-1-10-1-1'], this._roofSingle, 0], 
			[['0100-1', '0101-1', '1100-1', '-110-1-1'], this._roofSlope, Math.PI / -2], 
			[['0-1001', '0-1011', '1-1001', '-1-10-11'], this._roofSlope, Math.PI / 2], 
			[['-10010', '-10011', '-11010', '-1-101-1'], this._roofSlope, Math.PI], 
			[['100-10', '110-10', '100-11', '1-10-1-1'], this._roofSlope, 0], 
			[['110-1-1', '000-1-1'], this._roofCorner, 0], 
			[['-1-1011', '-1-1000'], this._roofCorner, Math.PI], 
			[['-1101-1', '-1000-1'], this._roofCorner, Math.PI / -2], 
			[['1-10-11', '0-10-10'], this._roofCorner, Math.PI / 2], 
		];
		for (let i = 0; i < tests.length; i ++) {
			const test = tests[i];
			const success = this._checkRoof(_siblings, test[0], test[1], test[2]);
			if (success) {
				return true;
			}
		}
		console.log('NOPE');
		return false;
	}

	_roofSingle(_angle) {
		this.roofMesh.geometry = getRoofGeometry('alone');
		this.roofMesh.rotation.y = _angle;
	}
	_roofSlope(_angle) {
		this.roofMesh.geometry = getRoofGeometry('slope');
		this.roofMesh.rotation.y = _angle;
	}
	_roofCorner(_angle) {
		this.roofMesh.geometry = getRoofGeometry('corner');
		this.roofMesh.rotation.y = _angle;
	}

	_checkRoof(_siblings, _patterns, _callback, _angle) {
		for (let i = 0; i < _patterns.length; i ++) {
			if (!this._checkSiblingPattern(_siblings, _patterns[i])) continue;
			this.roofMesh.geometry.dispose();
			_callback.call(this, _angle);
			// console.log('', _patterns[i])
			return true;
		}
		return false;
	}

	_checkSiblingPattern(_siblings, _pattern) {
		const siblings = _siblings.map(floor => {
			if (floor == this.floor + 1) return '0';
			if (floor > this.floor + 1) return '1';
			if (floor < this.floor + 1) return '-1';
		}).join('');
		if (_pattern == siblings) return true;
		return false;
	}

	dispose() {
		this.roofMesh.material.dispose();
		this.mesh.material.dispose();
		Core.scene.remove(this.roofMesh);
		Core.scene.remove(this.mesh);
	}
}


function buildRoofGeometryCorner(_size) {
	const geometry = new THREE.Geometry();
	const baseSize = 1.0;
	const basePos = [
		[baseSize * -1, baseSize], 
		[baseSize, baseSize], 
		[baseSize, baseSize * -1], 
		[baseSize * -1, baseSize * -1], 
	];

	basePos.forEach(pos => {
		geometry.vertices.push(
			new THREE.Vector3(pos[0] * _size, 0, pos[1] * _size),
		);
	});

	geometry.vertices.push(
		new THREE.Vector3(baseSize * -1 * _size, blocHeight / 2, baseSize * -1 * _size),
	);

	geometry.faces.push(new THREE.Face3(0, 1, 4));
	geometry.faces.push(new THREE.Face3(1, 2, 4));
	geometry.faces.push(new THREE.Face3(2, 3, 4));
	geometry.faces.push(new THREE.Face3(3, 0, 4));

	geometry.faceVertexUvs[0].push(
		[new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(0, 1)], 
		[new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1)], 
		[new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1)], 
		[new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(0, 1)], 
	);

	geometry.computeFaceNormals();
	geometry.computeBoundingSphere();
	geometry.verticesNeedUpdate = true;
	geometry.normalsNeedUpdate = true;
	return geometry;
}

function buildRoofGeometrySlope(_size) {
	const geometry = new THREE.Geometry();
	const baseSize = 1.0;
	const basePos = [
		[baseSize * -1, baseSize], 
		[baseSize, baseSize], 
		[baseSize, baseSize * -1], 
		[baseSize * -1, baseSize * -1], 
	];

	basePos.forEach(pos => {
		geometry.vertices.push(
			new THREE.Vector3(pos[0] * _size, 0, pos[1] * _size),
		);
	});

	const edgePos = [
		[baseSize * -1, baseSize * 1], 
		[baseSize * -1, baseSize * -1], 
	];

	edgePos.forEach(pos => {
		geometry.vertices.push(
			new THREE.Vector3(pos[0] * _size, blocHeight / 2, pos[1] * _size),
		);
	});

	geometry.faces.push(new THREE.Face3(0, 1, 4));
	geometry.faces.push(new THREE.Face3(1, 5, 4));
	geometry.faces.push(new THREE.Face3(1, 2, 5));
	geometry.faces.push(new THREE.Face3(2, 3, 5));
	geometry.faces.push(new THREE.Face3(5, 3, 4));
	geometry.faces.push(new THREE.Face3(3, 0, 4));

	geometry.faceVertexUvs[0].push(
		[new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(0, 1)], 
		[new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1)], 
		[new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1)], 
		[new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1)],
		[new THREE.Vector2(0, 1), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1)], 
		[new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(0.5, 1)], 
	);

	geometry.computeFaceNormals();
	geometry.computeBoundingSphere();
	geometry.verticesNeedUpdate = true;
	geometry.normalsNeedUpdate = true;
	return geometry;
}

function buildBoxGeometry(_shape, _path, _scaleW = 10) {
	const geometry = new THREE.Geometry();
	const _scaleH = 10;
	_path.forEach(step => {
		_shape.forEach(pos => {
			geometry.vertices.push(
				new THREE.Vector3(pos[0] * step[0] * _scaleW, step[1] * _scaleH, pos[1] * step[0] * _scaleW),
			);
		});
	});

	const shapeCount = _shape.length;
	const rows = _path.length;
	for (let pathStep = 0; pathStep < _path.length - 1; pathStep ++) {
		const lowerCount = (pathStep * shapeCount) + shapeCount;
		const upperLimit = ((pathStep + 1) * shapeCount) + shapeCount;
		for (let i = 0; i < shapeCount; i ++) {
			const startIndex = i + (pathStep * shapeCount);
			let siblingIndex = startIndex + 1;
			if (siblingIndex >= lowerCount) siblingIndex -= shapeCount;
			let topIndex = lowerCount + i;
			let siblingTopIndex = topIndex + 1;
			if (siblingTopIndex >= upperLimit) {
				siblingTopIndex = lowerCount;
			}
			geometry.faces.push(new THREE.Face3(startIndex, topIndex, siblingIndex));
			geometry.faces.push(new THREE.Face3(siblingIndex, topIndex, siblingTopIndex));
		}
	}
	for (let pathStep = 0; pathStep < _path.length - 1; pathStep ++) {
		const curUvY = _path[pathStep][1];
		const nextUvY = _path[pathStep + 1][1];
		const posLoop = [..._shape];
		posLoop.push(_shape[0]);
		for (let i = 0; i < posLoop.length - 1; i ++) {
			const curPos = posLoop[i];
			const nextPos = posLoop[i + 1];
			let curAngle = (Math.atan2(curPos[1], curPos[0]) + Math.PI) / 2 / Math.PI;
			let nextAngle = (Math.atan2(nextPos[1], nextPos[0]) + Math.PI) / 2 / Math.PI;
			const vectA = new THREE.Vector3(curPos[0], curPos[1], 1);
			const vectB = new THREE.Vector3(nextPos[0], nextPos[1], 1);
			nextAngle = curAngle + vectA.angleTo(vectB);
			geometry.faceVertexUvs[0].push(
				[new THREE.Vector2(curAngle, curUvY), new THREE.Vector2(curAngle, nextUvY), new THREE.Vector2(nextAngle, curUvY)], 
				[new THREE.Vector2(nextAngle, curUvY), new THREE.Vector2(curAngle, nextUvY), new THREE.Vector2(nextAngle, nextUvY)], 
			);
		}
	}

	geometry.computeFaceNormals();
	geometry.computeBoundingSphere();
	geometry.verticesNeedUpdate = true;
	geometry.normalsNeedUpdate = true;
	return geometry;
}

export {House};