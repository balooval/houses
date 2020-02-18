import * as THREE from './../../vendor/three.module.js';
import * as Control from './../../vendor/OrbitControls.js';
import * as Mouse from './mouse.js'

let renderer;
let scene;
let camera;
let raycaster;
let groundMesh;

let control;

function init() {
    raycaster = new THREE.Raycaster();
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x505050, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    control = new Control.OrbitControls(camera, renderer.domElement);

    var backLight = new THREE.PointLight(0xffaa66, 0.3);
    backLight.position.set(-10, 10, -10);
    scene.add(backLight);

    var geometry = new THREE.PlaneGeometry(100, 100, 20, 20);
    var material = new THREE.MeshPhysicalMaterial({color: 0x909090, clearcoat:0});
    
    groundMesh = new THREE.Mesh(geometry, material);
    groundMesh.position.y = 0;
    groundMesh.rotation.x = Math.PI * -0.5;
    groundMesh.castShadow = true;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    camera.position.y = 80;
    camera.position.z = 50;
    camera.lookAt(groundMesh.position);

    var ambiant = new THREE.AmbientLight(0x404040);
    scene.add(ambiant);

    var light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 200;
    light.shadow.camera.left = -50;
    light.shadow.camera.right = 50;
    light.shadow.camera.top = 50;
    light.shadow.camera.bottom = -50;
    light.target = groundMesh;

    light.position.set(50, 100, 10);
    light.castShadow = true;
    scene.add(light);
    // var helper = new THREE.CameraHelper( light.shadow.camera );
    // scene.add( helper );

    animate();
}

function animate() {
    control.update();
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

function getClickPosition() {
    raycaster.setFromCamera(Mouse.position, camera);
    var intersects = raycaster.intersectObject(groundMesh);
	for (let i = 0; i < intersects.length; i++) {
        return intersects[i].point;
    }
    return null;
}

export {init, getClickPosition, scene};