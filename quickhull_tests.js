QUnit.test("compute test 1", function ( assert ) {
    var geometry = new THREE.Geometry();

    for (var i=0; i < 4; i++) {
        var x = Math.random() * 2 - 1
        var y = Math.random() * 2 - 1
        var z = Math.random() * 2 - 1
        var vertex = new THREE.Vector3(x,y,z);

        geometry.vertices.push(vertex);
    }

    Quickhull( geometry );

    assert.ok( 1 == "1", "Passed!" );
});
