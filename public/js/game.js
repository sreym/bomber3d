$(document).ready(function() {
    var keys = new Keys(document);
    var game = new Game();
    var staticWalls = [];
    var walls = [];
    var bombs = [];
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var player;
    var floorPlane;
    var floorGeometry;
    var bombGeometry;
    var wallGeometry;
    var staticWallMaterial = new THREE.MeshLambertMaterial( { color: 0xe2ce6e, ambient: 0x111111, specular: 0xffffff, shininess: 30, shading: THREE.FlatShading } );
    var wallMaterial = new THREE.MeshLambertMaterial( { color: 0xaff0ed, ambient: 0x111111, specular: 0xffffff, shininess: 30, shading: THREE.FlatShading } );
    var bombMaterial = new THREE.MeshLambertMaterial( { color: 0x473113, ambient: 0x111111, specular: 0xffffff, shininess: 30, shading: THREE.FlatShading } );
    var floorMaterial =  new THREE.MeshNormalMaterial( );
    //var floorMaterial = new THREE.MeshLambertMaterial( { color: 0x473113, ambient: 0x111111, specular: 0xffffff, shininess: 30, shading: THREE.FlatShading } );
    var playerMaterial = new THREE.MeshLambertMaterial( { color: 0x55ff55, ambient: 0x111111, specular: 0xffffff, shininess: 30, shading: THREE.SmoothShading } );


    var socket = io.connect('http://localhost');

    var render = function () {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    };

    window.addEventListener( 'resize', function() {
        if (camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }, false );

    socket.on('init game', function (data) {


        game.update(data);
        var i, j, c = 0, d = 0;
        wallGeometry = new THREE.CubeGeometry(game.blockWidth, game.blockHeight, game.blockWidth);

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

        {
            floorGeometry = new THREE.Geometry();
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

            floorPlane = new THREE.Mesh(floorGeometry, floorMaterial);
            scene.add(floorPlane);
        }//init floor plane

        var loader = new THREE.JSONLoader(true);

        scene.add( new THREE.AmbientLight( 0x404040 ) );

        var light = new THREE.PointLight( 0xffffff, 1, 100 );
        light.position.set( 20, 20, 0 );
        scene.add( light );

        var light2 = new THREE.PointLight( 0xccffcc, 0.5, 100 );
        light.position.set( 0, 20, 0 );
        scene.add( light2 );


        loader.load('/models/character_base.js', function(geometry) {
            player = new THREE.Mesh(geometry, playerMaterial);
            player.position.x = game.world.players[0].x * game.blockWidth;
            player.position.y = 0;
            player.position.z = -game.world.players[0].y * game.blockWidth;

            scene.add(player);
            render();
        });
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
        switch(keys.lastKey) {
            case 'left': player.rotation.y = -Math.PI / 2; break;
            case 'right': player.rotation.y = Math.PI / 2; break;
            case 'up': player.rotation.y = Math.PI; break;
            case 'down': player.rotation.y = 0.0; break;
        }
//        camera.position.x = player.position.x;
//        camera.position.y = player.position.y;
//        camera.position.z = player.position.z;
//        camera.rotation.x = 0;
//
//        camera.position.x = player.position.x + 1;
//        camera.position.y = player.position.y + 2;
//        camera.position.z = player.position.z + 4;

    });

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
});
