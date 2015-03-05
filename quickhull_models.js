// These are polluting the global namespace.

// Extend vector class
function QPoint ( x, y, z, face ) {

    THREE.Vector3.call( this, x, y, z );
    this.face = face;

    this.isSeenByFace = function ( face, geometry ) {

        var outwardNormal = face.normal,
            pointOnFace = geometry.vertices[ face.a ],
            segmentFaceToPoint = new QPoint();

        segmentFaceToPoint.subVectors( this, pointOnFace );

        if ( segmentFaceToPoint.isSameDirection( outwardNormal ) ) return true;

        return false;

    }

    this.isSameDirection = function ( vector ) {

        if ( this.dot( vector ) > 0 ) return true;

        return false;

    }

}

QPoint.prototype = Object.create( THREE.Vector3.prototype );
QPoint.prototype.constructor = QPoint;

// Extend face class
function QFace ( a, b, c, normal, color, materialIndex, points ) {

    THREE.Face3.call( this, a, b, c, normal, color, materialIndex );
    this.points = points || [];

    this.setNormalOutwards = function ( geometry ) {

        var normal = this.normal,
            insidePoint = geometry.insidePoint,
            pointOnFace = geometry.vertices[ this.a ],
            outwardVector = new QPoint();

        outwardVector.subVectors( pointOnFace, insidePoint );

        if (! outwardVector.isSameDirection( normal ) ) {

            this.normal = normal.negate();
        }
        return;
    };

    this.mostDistantPoint = function ( geometry ) {

        var farthest, constant, plane,
            normal = this.normal,
            pointA = geometry.vertices[ this.a ];

        constant = normal.dot( pointA );

        plane = new THREE.Plane( normal, constant );

        farthest =  _.max( this.points, distanceFromFace, plane );

        return farthest;
    };

    function distanceFromFace ( point ) {

        var plane = this;

        return plane.distanceToPoint( point );
    }

}

QFace.prototype = Object.create( THREE.Face3.prototype );
QFace.prototype.constructor = QFace;

// Extend geometry class.
function ConvexHullGeometry ( ) {

    THREE.Geometry.call( this );
    var insidePoint = new QPoint(0,0,0);

    this.computeCentroid = function () {



        var average_x, average_y, average_z,
            vertices = this.vertices,
            centroid;

        average_x = _.mean( _.pluck( vertices, 'x' ) )
        average_y = _.mean( _.pluck( vertices, 'y' ) )
        average_z = _.mean( _.pluck( vertices, 'z' ) )

        centroid = new THREE.Vector3( average_x, average_y, average_z );

        return centroid;

    }

    this.setInsidePoint = function () {

        this.insidePoint = this.computeCentroid();

    }

    this.computeOutwardFaceNormals = function() {

        this.computeFaceNormals();

        this.faces.forEach( function ( face )  {

            face.setNormalOutwards( this );


        }, this);

    }

}

ConvexHullGeometry.prototype = Object.create( THREE.Geometry.prototype );
ConvexHullGeometry.prototype.constructor = ConvexHullGeometry;