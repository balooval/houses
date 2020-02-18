import * as Core from './libs/core.js'
import * as Mouse from './libs/mouse.js'
import * as Grid from './libs/grid.js'
import * as Ground from './libs/ground.js'
import * as Ui from './libs/ui.js'

let curTile;

const app = {
    start : function() {
        Core.init();
        Mouse.register(onClick);
        Mouse.registerMove(onMouseMove);
        Ground.init();
        Grid.init();
        Ui.init();
    }, 
};

function onMouseMove(_x, _y) {
	const point = Core.getClickPosition();
    if (!point) return;
    const foundedTile = Grid.getTile(point.x, point.z);
    if (!foundedTile) return;
    if (foundedTile == curTile) return;
    foundedTile.highlight(true);
    if (curTile) curTile.highlight(false);
    curTile = foundedTile;
    Ui.update(curTile);
}

function onClick(_evt) {
    if (!curTile) return false;
    if (_evt.button == 0) {
        const housesNb = curTile.addHouse();
        if (housesNb == 1) {
            Ground.deform(curTile);
        }
    } else if (_evt.button == 2) {
        const housesNb = curTile.removeHouse();
        if (housesNb == 0) {
            Ground.plane(curTile);
        }
    }
}


window.App = app;