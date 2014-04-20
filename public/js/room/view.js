(function() {
    var loader = new THREE.JSONLoader(true);

    function defferedLoad(url) {
        var d = $.Deferred();

        loader.load(url, function(geometry, material) {
            d.resolve(geometry, material);
        });

        return d.promise();
    }

    Game.prototype.initLights = function() {
        var d = $.Deferred();

        var light = new THREE.PointLight( 0xffffff, 1, 100 );
        light.position.set( 20, 20, 0 );

        var light2 = new THREE.PointLight( 0xccffcc, 0.5, 100 );
        light.position.set( 0, 20, 0 );

        d.resolve([
            new THREE.AmbientLight( 0x404040 ),
            light,
            light2
        ]);

        return d.promise();
    };

    Game.prototype.initGeometriesAndMaterials = function() {
        var this_ = this;
        var d = $.Deferred();

        var floorGeometry = new THREE.Geometry();
        floorGeometry.vertices.push(new THREE.Vector3(0, -this_.blockWidth, -this_.height * this_.blockWidth));
        floorGeometry.vertices.push(new THREE.Vector3(0, -this_.blockWidth / 2, 0));
        floorGeometry.vertices.push(new THREE.Vector3(this_.width * this_.blockWidth, -this_.blockWidth / 2, 0));
        floorGeometry.vertices.push(new THREE.Vector3(this_.width * this_.blockWidth, -this_.blockWidth / 2, -this_.height * this_.blockWidth));
        floorGeometry.faces.push(new THREE.Face3(0, 1, 2));
        floorGeometry.faces.push(new THREE.Face3(0, 2, 3));
        floorGeometry.computeBoundingSphere();

        $.when(
            defferedLoad('/models/character_base.js'),
            defferedLoad('/models/wall_static.js'),
            defferedLoad('/models/wall.js'),
            defferedLoad('/models/bomb.js')
        ).done(function(character, wallStatic, wall, bomb) {
            d.resolve({
                wall: wall[0],
                staticWall: wallStatic[0],
                bomb: bomb[0],
                floor: floorGeometry,
                player: character[0]
            }, {
                staticWall: new THREE.MeshFaceMaterial(wallStatic[1]),
                wall: new THREE.MeshFaceMaterial(wall[1]),
                bomb: new THREE.MeshFaceMaterial(bomb[1]),
                floor: new THREE.MeshNormalMaterial(),
                //floor: new THREE.MeshLambertMaterial( { color: 0x473113, ambient: 0x111111, specular: 0xffffff, shininess: 30, shading: THREE.FlatShading } ),
                //player: new THREE.MeshLambertMaterial({ color: 0x55ff55, ambient: 0x111111, specular: 0xffffff, shininess: 30, shading: THREE.SmoothShading })
                player: new THREE.MeshFaceMaterial(character[1])
            });
        });

        return d.promise();
    };

    Game.prototype.getMeshes = function(geometries, materials) {
        return {
            walls: [],
            bombs: [],
            player: new THREE.Mesh(geometries.player, materials.player),
            floor: new THREE.Mesh(geometries.floor, materials.floor)
        };
    };
})();
