(function() {
    var loader = new THREE.JSONLoader(true);

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

        loader.load('/models/character_base.js', function(geometry) {
            d.resolve({
                wall: new THREE.CubeGeometry(this_.blockWidth, this_.blockHeight, this_.blockWidth),
                bomb: new THREE.SphereGeometry(this_.blockWidth / 3, 32, 32),
                floor: floorGeometry,
                player: geometry
            }, {
                staticWall: new THREE.MeshLambertMaterial({ color: 0xe2ce6e, ambient: 0x111111, specular: 0xffffff, shininess: 30, shading: THREE.FlatShading }),
                wall: new THREE.MeshLambertMaterial({ color: 0xaff0ed, ambient: 0x111111, specular: 0xffffff, shininess: 30, shading: THREE.FlatShading }),
                bomb: new THREE.MeshLambertMaterial({ color: 0x473113, ambient: 0x111111, specular: 0xffffff, shininess: 30, shading: THREE.FlatShading }),
                floor: new THREE.MeshNormalMaterial(),
                //floor: new THREE.MeshLambertMaterial( { color: 0x473113, ambient: 0x111111, specular: 0xffffff, shininess: 30, shading: THREE.FlatShading } ),
                player: new THREE.MeshLambertMaterial({ color: 0x55ff55, ambient: 0x111111, specular: 0xffffff, shininess: 30, shading: THREE.SmoothShading })
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
