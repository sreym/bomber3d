$(document).ready(function() {
    var keys = new Keys(document);
    var socket = io.connect('http://localhost');
    socket.on('news', function (data) {
     player.position.x = data.x;
     player.position.y = data.y;
     player.position.z = data.z;

    });

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    var materials = [];			
    materials.push( new THREE.MeshLambertMaterial( { color: 0xdddddd, shading: THREE.FlatShading } ) );
    materials.push( new THREE.MeshPhongMaterial( { ambient: 0x030303, color: 0xdddddd, specular: 0x009900, shininess: 30, shading: THREE.FlatShading } ) );
    materials.push( new THREE.MeshNormalMaterial( ) );
    materials.push( new THREE.MeshBasicMaterial( { color: 0xffaa00, transparent: true, blending: THREE.AdditiveBlending } ) );
    materials.push( new THREE.MeshLambertMaterial( { color: 0xdddddd, shading: THREE.SmoothShading } ) );
    materials.push( new THREE.MeshNormalMaterial( { shading: THREE.SmoothShading } ) );
    materials.push( new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } ) );
    materials.push( new THREE.MeshDepthMaterial() );
    materials.push( new THREE.MeshLambertMaterial( { color: 0x666666, emissive: 0xff0000, ambient: 0x000000, shading: THREE.SmoothShading } ) );
    materials.push( new THREE.MeshPhongMaterial( { color: 0x000000, specular: 0x666666, emissive: 0xff0000, ambient: 0x000000, shininess: 10, shading: THREE.SmoothShading, opacity: 0.9, transparent: true } ) );

    var player_geometry = new THREE.CubeGeometry(1,1,1);
    var player_material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    var player = new THREE.Mesh(player_geometry, player_material);

    var floor_material = materials[2];
    var floor_geometry = new THREE.Geometry();

    floor_geometry.vertices.push( new THREE.Vector3(  -5,  0, -5 ) );
    floor_geometry.vertices.push( new THREE.Vector3(  -5, 0, 5 ) );
    floor_geometry.vertices.push( new THREE.Vector3(  5, 0, 5 ) );
    floor_geometry.vertices.push( new THREE.Vector3(  5, 0, -5 ) );

    floor_geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
    floor_geometry.faces.push( new THREE.Face3( 0, 2, 3 ) );

    floor_geometry.computeBoundingSphere();

    var floorplane = new THREE.Mesh(floor_geometry, floor_material);

    scene.add(player);
    scene.add(floorplane);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    camera.position.z = 10;
    camera.position.y = 5;
    camera.position.x = 1;
    camera.rotation.x -= 0.3;

    setInterval( function() {
      socket.emit('keys refresh', keys);
    }, 100);
    var render = function () {
        requestAnimationFrame(render);

        //cube.rotation.x += 0.1;
        //cube.rotation.y += 0.1;

        renderer.render(scene, camera);
    };

    render();
});
