$(document).ready(function() {
    var keys = new Keys(document);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    var geometry = new THREE.CubeGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    var m2 = new THREE.MeshBasicMaterial({color: 0x0000FF});

    var cube = new THREE.Mesh(geometry, material);

    var geometry1 = new THREE.Geometry();

    geometry1.vertices.push(new THREE.Vector3(-5, 0, -5));
    geometry1.vertices.push(new THREE.Vector3(-5, 0, 5));
    geometry1.vertices.push(new THREE.Vector3(5, 0, 5));
    geometry1.vertices.push(new THREE.Vector3(5, 0, -5));

    geometry1.faces.push(new THREE.Face3(0, 1, 2));
    geometry1.faces.push(new THREE.Face3(0, 2, 3));

    geometry1.computeBoundingSphere();
    var z1 = new THREE.Mesh(geometry1, m2);

    scene.add(cube);
    scene.add(z1);

    camera.position.z = 10;
    camera.position.y = 5;
    camera.position.x = 1;
    camera.rotation.x -= 0.3;

    var render = function () {
        requestAnimationFrame(render);

        //cube.rotation.x += 0.1;
        //cube.rotation.y += 0.1;

        renderer.render(scene, camera);
    };

    render();
});