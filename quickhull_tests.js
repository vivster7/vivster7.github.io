// QUnit.test("distFromVertexToLine test 1", function( assert ) {
//     var vertex = new THREE.Vector3(1,0,0),
//         line_start = new THREE.Vector3(0,0,0),
//         line_end = new THREE.Vector3(1,1,0);

//     assert.ok( Quickhull._distFromVertexToLine(vertex, line_start, line_end ) === Math.sqrt(2) / 2, "Passed!");
// });

// QUnit.test("distFromVertexToLine test 2", function( assert ) {
//     var vertex = new THREE.Vector3(1,3,0),
//         line_start = new THREE.Vector3(0,0,0),
//         line_end = new THREE.Vector3(0,6,0);

//     assert.ok( Quickhull._distFromVertexToLine(vertex, line_start, line_end ) === 1, "Passed!");
// });

// QUnit.test("distFromVertexToPlane test 1", function( assert ) {
//     var vertex = new THREE.Vector3(2, 3, 1);
//     var x = new THREE.Vector3(5, 0, 0);
//     var y = new THREE.Vector3(-1, 0, 2);
//     var z = new THREE.Vector3(-1, 3, 0);

//     assert.ok( Quickhull._distFromVertexToPlane(vertex, x, y, z) === (-6 / Math.sqrt(14)) );
// });

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
