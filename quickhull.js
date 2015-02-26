/*

A three.js 3D quickhull implementation. Computes a convex hull for a 
THREE.Geometry object. Average O(n lg n) runtime

@author - Vivek Dasari

*/

var quickhull = function(geometry) {

    var convexHull,
        boundingBox,
        faceStack,
        line,
        face,
        tetrahedron;


    /////
    // Calculates minimum distance from vertex to line.
    //
    // Vertex is a THREE.Vector3
    // Line is an object {'begin': THREE.Vector3, 'direction': THREE.Vector3}
    //
    // Formula is (line.begin - vertex) - ((line.begin - vertex) • line.direction) * line.direction
    // Source: http://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
    //
    var distFromVertexToLine = function( vertex, line ) {

        var vector_from_vertex_to_line = 
            new THREE.Vector3().subVectors( line.begin - vertex );

        var projection_onto_line = 
            vector_from_vertex_to_line.dot( line.direction ) * line.direction; 

        var distance_to_line = vector_from_vertex_to_line
                                .sub( projection_onto_line )
                                .length()

        return distance_to_line;

    }; 

    convexHull = new THREE.Geometry();

    boundingBox = geometry.computeBoundingBox().boundingBox;
    convexHull.vertices.push( boundingBox.min )
    convexHull.vertices.push( boundingBox.max )
    // preprocessing
    removeVerticesInside(  ); 

    faceStack = getFaces( boundingBox );

    while ( faceStack ):
        face = faceStack.pop();
        point = findFurthest( face );


    return convexHull;

}