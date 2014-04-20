$(document).ready(function() {
    var keys = new Keys(document),
        game = new Game(),
        scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
        socket = io.connect('http://localhost');

    // common routine
    function render() {
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

    function WallEmpty() {
        this.wallType = 0;
    };

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    $.when(game.initGeometriesAndMaterials(), game.initLights()).done(function(geometriesAndMaterials, lights) {
        var geometries = geometriesAndMaterials[0];
        var materials = geometriesAndMaterials[1];
        var meshes = game.getMeshes(geometries, materials);
        var playerName, playerNum;

        socket.on('init game', function (data) {
            playerName = data.playerName;

            game.update(data);

            //init walls
            for (var i = 0; i < game.width; i++) {
                meshes.walls.push([]);
                for (var j = 0; j < game.height; j++) {
                    var wall = new WallEmpty();
                    switch (game.world.walls[i][j]) {
                        case 1:
                            wall = new THREE.Mesh(geometries.staticWall, materials.staticWall);
                            break;
                        case 2:
                            wall = new THREE.Mesh(geometries.wall, materials.wall);
                            break;
                    }
                    meshes.walls[i].push(wall);
                    if (wall.wallType !== 0) {
                        wall.wallType = game.world.walls[i][j];
                        wall.position.x = i * game.blockWidth;
                        wall.position.z = -j * game.blockWidth;
                        wall.position.y = game.blockHeight / 2 - 0.5;
                        scene.add(wall);
                    }
                }
            }

            // init players' meshes
            game.world.players.forEach(function(player, i) {
                meshes.players.push(new THREE.Mesh(geometries.player, materials.player));
                meshes.players[i].position.x = game.world.players[i].x * game.blockWidth;
                meshes.players[i].position.y = 0;
                meshes.players[i].position.z = -game.world.players[i].y * game.blockWidth;
                scene.add(meshes.players[i]);

                if (player.name == playerName) {
                    meshes.player = meshes.players[i];
                    playerNum = i;
                }
            });

            scene.add(meshes.floor);
            for(var i = 0; i < lights.length; i++) scene.add(lights[i]);

            setInterval( function() {
                socket.emit('keys refresh', {
                    keys: keys,
                    playerNum: playerNum
                });
            }, 100);

            render();
        });

        socket.on('update world', function (data) {
            game.world.update(data);

            // update walls' meshes
            for (var i = 0; i < game.width; i++) {
                for (var j = 0; j < game.height; j++) {
                    if(game.world.walls[i][j] !== meshes.walls[i][j].wallType) {
                        switch(game.world.walls[i][j]) {
                            case 0:
                                scene.remove(meshes.walls[i][j]);
                                break;
                            default: console.error("Uncaught wallType value " + game.world.walls[i][j]);
                        }
                    }
                }
            }

            // update bombs' meshes
            for (var i = 0; i < meshes.bombs.length; i++) {
                scene.remove(meshes.bombs[i]);
            }
            meshes.bombs = [];
            for (i = 0; i < game.world.bombs.length; i++) {
                var newBomb = new THREE.Mesh(geometries.bomb, materials.bomb);
                newBomb.position.x = game.world.bombs[i].x * game.blockWidth;
                newBomb.position.y = 0;
                newBomb.position.z = -game.world.bombs[i].y * game.blockWidth;
                meshes.bombs.push(newBomb);
                scene.add(newBomb);
            }

            // update players' meshes
            while (game.world.players.length > meshes.players.length) {
                var newPlayer = new THREE.Mesh(geometries.player, materials.player);
                meshes.players.push(newPlayer);
                scene.add(newPlayer);
            }
            game.world.players.forEach(function(player, i) {
                meshes.players[i].position.x = game.world.players[i].x * game.blockWidth;
                meshes.players[i].position.y = 0.0;
                meshes.players[i].position.z = -game.world.players[i].y * game.blockWidth;
                meshes.players[i].rotation.y = game.world.players[i].rotation.y;
            });
        });

        camera.position.z = 3;
        camera.position.y = 10;
        camera.position.x = 6;
        camera.rotation.x -= 0.8;
    });
});
