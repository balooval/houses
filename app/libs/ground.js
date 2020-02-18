import * as THREE from './../../vendor/three.module.js';
import * as Core from './core.js';

let groundMesh;
const textDecalDisplacement = new THREE.TextureLoader().load('./assets/ground-displacement.png');
const textGround = new THREE.TextureLoader().load('./assets/ground.jpg');
textGround.wrapS = textGround.wrapT = THREE.RepeatWrapping;
// textGround.repeat.set(4, 4);


const ctx = document.createElement('canvas').getContext('2d');
ctx.canvas.width = 512;
ctx.canvas.height = 512;
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

const textCanvas = new THREE.CanvasTexture(ctx.canvas);

function init() {
    const gridSize = 100;
    const gridDefinition = 100;
    var geometry = new THREE.PlaneGeometry(gridSize, gridSize, gridDefinition, gridDefinition);
    var material = new THREE.MeshPhysicalMaterial({color: 0x453f2f, clearcoat:0, map:textGround, displacementMap:textCanvas, displacementScale:3});
    groundMesh = new THREE.Mesh(geometry, material);
    groundMesh.position.y = 0.5;
    groundMesh.rotation.x = Math.PI * -0.5;
    groundMesh.castShadow = true;
    groundMesh.receiveShadow = true;
    Core.scene.add(groundMesh);
}

function plane(_tile) {
    // return;
    const ratio = 512 / 100;
    const posX = (_tile.worldPosition[0] + 50) * ratio;
    const posY = (_tile.worldPosition[1] + 50) * ratio;
    ctx.globalCompositeOperation = 'source-over';
    // ctx.globalCompositeOperation = 'source-in';
    const gradient = ctx.createRadialGradient(posX, posY, 0, posX, posY, 60);
    gradient.addColorStop(0.4, "rgba(0, 0, 0, 1)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.2)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    textCanvas.needsUpdate = true;
}

function deform(_tile) {
    // console.log(textDecalDisplacement.image);
    const ratio = 512 / 100;
    const posX = (_tile.worldPosition[0] + 50) * ratio;
    const posY = (_tile.worldPosition[1] + 50) * ratio;


    const decalSize = 80;
    // ctx.drawImage(textDecalDisplacement.image, 0, 0, 16, 16, posX - (decalSize / 2), posY - (decalSize / 2), decalSize, decalSize);
    
    const srcDecalSize = 16;
    const rotation = Math.random() * 6;
    const scale = 4 + Math.random() * 2;
    const dX = posX;
    const dY = posY;
    ctx.save();
    ctx.translate(dX, dY);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.drawImage(textDecalDisplacement.image, -srcDecalSize / 2, -srcDecalSize / 2);
    ctx.restore();



    textCanvas.needsUpdate = true;
    return;

    // ctx.globalCompositeOperation = 'lighter';
    ctx.globalCompositeOperation = 'source-over';
    const gradient = ctx.createRadialGradient(posX, posY, 0, posX, posY, 50);
    gradient.addColorStop(0, "#000000");
    gradient.addColorStop(0.3, "#000000");
    gradient.addColorStop(0.6, "rgba(255, 255, 255, 0.8)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    textCanvas.needsUpdate = true;
}



export {init, deform, plane};