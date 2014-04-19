$(document).ready(function() {
    var keys = new Keys(document);
    var game = new Game();
    var staticWalls = [];
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var materials = [];
    var playerGeometry;
    var playerMaterial;
    var player;
    var floorPlane;
    var floorMaterial;
    var floorGeometry = new THREE.Geometry();

    var socket = io.connect('http://localhost');
    socket.on('init game', function (data) {
        game.update(data);
        var i, j, c = 0;
        var wall_geometry = new THREE.CubeGeometry(game.staticWorld.blockWidth, game.staticWorld.blockHeight, game.staticWorld.blockWidth);
        var wall_material = materials[5];
        for (i = 0; i < game.height; i++) {
            for (j = 0; j < game.width; j++) {
                if (game.staticWorld.walls[i][j] == 1) {
                    staticWalls.push(new THREE.Mesh(wall_geometry, wall_material));
                    staticWalls[c].position.x = j * game.staticWorld.blockWidth;
                    staticWalls[c].position.z = -i * game.staticWorld.blockWidth;
                    staticWalls[c].position.y = game.staticWorld.blockHeight / 2 - 0.5;
                    scene.add(staticWalls[c]);
                    c++;
                }

            }
        }//init static walls
        playerGeometry = new THREE.CubeGeometry(game.player.width, 1, game.player.width);
        playerMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
        {
            floorGeometry.vertices.push(new THREE.Vector3(
                0,
                -game.staticWorld.blockWidth,
                    -game.height * game.staticWorld.blockWidth
            ));
            floorGeometry.vertices.push(new THREE.Vector3(
                0,
                    -game.staticWorld.blockWidth / 2,
                0
            ));
            floorGeometry.vertices.push(new THREE.Vector3(
                    game.width * game.staticWorld.blockWidth,
                    -game.staticWorld.blockWidth / 2,
                0
            ));
            floorGeometry.vertices.push(new THREE.Vector3(
                    game.width * game.staticWorld.blockWidth,
                    -game.staticWorld.blockWidth / 2,
                    -game.height * game.staticWorld.blockWidth
            ));
            floorGeometry.faces.push(new THREE.Face3(0, 1, 2));
            floorGeometry.faces.push(new THREE.Face3(0, 2, 3));
            floorGeometry.computeBoundingSphere();
            floorMaterial = materials[2];
            floorPlane = new THREE.Mesh(floorGeometry, floorMaterial);
        }//init floor plane
        player = new THREE.Mesh(playerGeometry, playerMaterial);
        player.position.x = game.world.players[0].x * game.staticWorld.blockWidth;
        player.position.y = 0;
        player.position.z = -game.world.players[0].y * game.staticWorld.blockWidth;
        scene.add(player);
        scene.add(floorPlane);
    });
    socket.on('update world', function (data) {
        game.world.update(data);
        player.position.x = game.world.players[0].x * game.staticWorld.blockWidth;
        player.position.z = -game.world.players[0].y * game.staticWorld.blockWidth;
//        camera.position.x = player.position.x;
//        camera.position.y = player.position.y;
//        camera.position.z = player.position.z;
//        camera.rotation.x = 0;
//
//        camera.position.x = player.position.x + 1;
//        camera.position.y = player.position.y + 2;
//        camera.position.z = player.position.z + 4;

    });

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

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera.position.z = 3;
    camera.position.y = 10;
    camera.position.x = 6;
    camera.rotation.x -= 0.8;

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
