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

    $.when(game.initGeometries(), game.initMaterials(), game.initLights()).done(function(geometries, materials, lights) {
        var meshes = game.getMeshes(geometries, materials);

        socket.on('init game', function (data) {
            setInterval( function() {
                socket.emit('keys refresh', keys);
            }, 100);

            game.update(data);

            //init walls
            for (var i = 0; i < game.height; i++) {
                meshes.walls.push([]);
                for (var j = 0; j < game.width; j++) {
                    var wall = new WallEmpty();
                    switch (game.world.walls[i][j]) {
                        case 1:
                            wall = new THREE.Mesh(geometries.wall, materials.staticWall);
                            break;
                        case 2:
                            wall = new THREE.Mesh(geometries.wall, materials.wall);
                            break;
                    }
                    meshes.walls[i].push(wall);
                    if (wall.wallType !== 0) {
                        wall.wallType = game.world.walls[i][j];
                        wall.position.x = j * game.blockWidth;
                        wall.position.z = -i * game.blockWidth;
                        wall.position.y = game.blockHeight / 2 - 0.5;
                        scene.add(wall);
                    }
                }
            }

            meshes.player.position.x = game.world.players[0].x * game.blockWidth;
            meshes.player.position.y = 0;
            meshes.player.position.z = -game.world.players[0].y * game.blockWidth;

            scene.add(meshes.player);
            scene.add(meshes.floor);
            for(var i = 0; i < lights.length; i++) scene.add(lights[i]);

            render();
        });

        socket.on('update world', function (data) {
            game.world.update(data);

            // update walls' meshes
            for (var i = 0; i < game.height; i++) {
                for (var j = 0; j < game.width; j++) {
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

            // update player's mesh
            meshes.player.position.x = game.world.players[0].x * game.blockWidth;
            meshes.player.position.z = -game.world.players[0].y * game.blockWidth;
            switch(keys.lastKey) {
                case 'left': meshes.player.rotation.y = -Math.PI / 2; break;
                case 'right': meshes.player.rotation.y = Math.PI / 2; break;
                case 'up': meshes.player.rotation.y = Math.PI; break;
                case 'down': meshes.player.rotation.y = 0.0; break;
            }
        });

        camera.position.z = 3;
        camera.position.y = 10;
        camera.position.x = 6;
        camera.rotation.x -= 0.8;
    });
});
