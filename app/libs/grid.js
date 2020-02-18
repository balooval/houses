import * as MeshHouse from './meshHouse.js'

const grid = [];
const width = 10;
const height = 10;


class Tile {
	constructor(_posX, _posY) {
		this.highlighted = false;
		this.position = [_posX, _posY];
		this.houses = [];
		this.size = 10;
		const padding = 0.5;
		this.innerSize = (this.size / 2) - padding;
		this.worldPosition = [_posX * this.size, _posY * this.size];
		this.verts = [
			[-1, 1], 
			[1, 1], 
			[1, -1], 
			[-1, -1], 
		];
		this.box = this.verts
			.map(coord => [coord[0] * this.size / 2, coord[1] * this.size / 2])
			.map(coord => [coord[0] + this.worldPosition[0], coord[1] + this.worldPosition[1]]);
		this.verts = this.verts
			.map(coord => [coord[0] * this.innerSize, coord[1] * this.innerSize])
			.map(coord => [coord[0] + this.worldPosition[0], coord[1] + this.worldPosition[1]]);
	}

	highlight(_state) {
		this.highlighted = _state;
		this.houses.forEach(house => house.highlight(this.highlighted));
	}

	checkSiblings() {
		const offsets = [
			[-1, 0], 
			[0, -1], 
			[0, 0], 
			[1, 0], 
			[0, 1], 
		];
		const siblings = offsets.map(offset => {
			const sibling = getTileByPosition(this.position[0] + offset[0], this.position[1] + offset[1]);
			if (!sibling) return 0;
			return sibling.getHouseLevel();
		});
		return siblings;
	}

	getHouseLevel() {
		return this.houses.length;
	}

	updateSiblings() {
		const offsets = [
			[-1, 0], 
			[0, -1], 
			[1, 0], 
			[0, 1], 
		];
		const siblings = offsets.map(offset => {
			const sibling = getTileByPosition(this.position[0] + offset[0], this.position[1] + offset[1]);
			return sibling;
		})
		.filter(sibling => sibling)
		.forEach(sibling => sibling._updateLastHouse());
	}

	addHouse() {
		const lastHouse = this._getLastHouse();
		const house = new MeshHouse.House(this.worldPosition, this.houses.length);
		this.houses.push(house);
		const siblings = this.checkSiblings();
		// console.log('siblings', siblings);
		house.updateRoof(siblings);
		house.highlight(this.highlighted)
		if (lastHouse) {
			lastHouse.updateRoof(siblings);
		}
		this.updateSiblings();
		return this.houses.length;
	}

	removeHouse() {
		const house = this.houses.pop();
		if (!house) return false;
		house.dispose();
		this._updateLastHouse();
		this.updateSiblings();
		return this.houses.length;
	}

	_updateLastHouse() {
		const lastHouse = this._getLastHouse();
		if (!lastHouse) return false;
		const siblings = this.checkSiblings();
		lastHouse.updateRoof(siblings);
	}

	_getLastHouse() {
		if (!this.houses.length) return null;
		return this.houses[this.houses.length - 1];
	}
	
}

function init() {
	for (let x = 0; x < width; x ++) {
		for (let y = 0; y < height; y ++) {
			const tile = new Tile(x - width / 2, y - height / 2);
			grid.push(tile);
		}
	}
}

function getTileByPosition(_x, _y) {
	const res = grid.filter(tile => {
		if (tile.position[0] != _x) return false;
		if (tile.position[1] != _y) return false;
		return true;
	});
	return res.pop();
}

function getTile(_x, _y) {
	const res = grid.filter(tile => {
		if (tile.box[0][0] > _x) return false;
		if (tile.box[1][0] < _x) return false;
		if (tile.box[0][1] < _y) return false;
		if (tile.box[2][1] > _y) return false;
		return true;
	});
	return res.pop();
}
	
export {Tile, init, getTile};