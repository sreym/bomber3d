$(document).ready(function() {
    var keys = new Keys(document);
    var game = new Game();
    var staticWalls = [];
    var walls = [];
    var bombs = [];
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var materials = [];
    var playerGeometry;
    var playerMaterial;
    var player;
    var floorPlane;
    var floorMaterial;
    var floorGeometry = new THREE.Geometry();
    var bombMaterial;
    var bombGeometry;
    var wallMaterial;
    var wallGeometry;
    var staticWallMaterial;

    var socket = io.connect('http://localhost');
    socket.on('init game', function (data) {
        game.update(data);
        var i, j, c = 0, d = 0;
        wallGeometry = new THREE.CubeGeometry(game.blockWidth, game.blockHeight, game.blockWidth);
        staticWallMaterial = materials[5];

        wallMaterial = materials[3];
        bombMaterial = materials[5];
        bombGeometry = new THREE.SphereGeometry(game.blockWidth / 3, 32, 32);
        for (i = 0; i < game.height; i++) {
            for (j = 0; j < game.width; j++) {
                if (game.world.walls[i][j] == 1) {
                    staticWalls.push(new THREE.Mesh(wallGeometry, staticWallMaterial));
                    staticWalls[c].position.x = j * game.blockWidth;
                    staticWalls[c].position.z = -i * game.blockWidth;
                    staticWalls[c].position.y = game.blockHeight / 2 - 0.5;
                    scene.add(staticWalls[c]);
                    c++;
                }
                if (game.world.walls[i][j] == 2) {
                    walls.push(new THREE.Mesh(wallGeometry, wallMaterial));
                    walls[d].position.x = j * game.blockWidth;
                    walls[d].position.z = -i * game.blockWidth;
                    walls[d].position.y = game.blockHeight / 2 - 0.5;
                    scene.add(walls[d]);
                    d++;
                }

            }
        }//init static walls
        playerGeometry = new THREE.CubeGeometry(game.player.width, 1, game.player.width);
        playerMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
        {
            floorGeometry.vertices.push(new THREE.Vector3(
                0,
                -game.blockWidth,
                    -game.height * game.blockWidth
            ));
            floorGeometry.vertices.push(new THREE.Vector3(
                0,
                    -game.blockWidth / 2,
                0
            ));
            floorGeometry.vertices.push(new THREE.Vector3(
                    game.width * game.blockWidth,
                    -game.blockWidth / 2,
                0
            ));
            floorGeometry.vertices.push(new THREE.Vector3(
                    game.width * game.blockWidth,
                    -game.blockWidth / 2,
                    -game.height * game.blockWidth
            ));
            floorGeometry.faces.push(new THREE.Face3(0, 1, 2));
            floorGeometry.faces.push(new THREE.Face3(0, 2, 3));
            floorGeometry.computeBoundingSphere();
            floorMaterial = materials[2];
            floorPlane = new THREE.Mesh(floorGeometry, floorMaterial);
        }//init floor plane
        player = new THREE.Mesh(playerGeometry, playerMaterial);
        player.position.x = game.world.players[0].x * game.blockWidth;
        player.position.y = 0;
        player.position.z = -game.world.players[0].y * game.blockWidth;
        scene.add(player);
        scene.add(floorPlane);
    });
    socket.on('update world', function (data) {
        game.world.update(data);
        var i;
        for (i = 0; i < bombs.length; i++) {
            scene.remove(bombs[i]);
        }
        bombs = [];
        for (i = 0; i < game.world.bombs.length; i++) {
            var newBomb = new THREE.Mesh(bombGeometry, bombMaterial);
            newBomb.position.x = game.world.bombs[i].x * game.blockWidth;
            newBomb.position.y = 0;
            newBomb.position.z = -game.world.bombs[i].y * game.blockWidth;
            bombs.push(newBomb);
            scene.add(bombs[bombs.length - 1]);
        }
        player.position.x = game.world.players[0].x * game.blockWidth;
        player.position.z = -game.world.players[0].y * game.blockWidth;
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
