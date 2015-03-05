// Quickhull implementation in THREE.js
//
// Algorithm details: http://thomasdiewald.com/blog/?p=1888

var Quickhull = function () {

    /////
    //            
    //  CLASSES   
    //            
    /////

    // Extend THREE.vector3 class
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

    // Extend THREE.face3 class
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

    // Extend THREE.geometry class.
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

    /////
    //            
    //  IMPLEMENTATION   
    //            
    /////

    var convexHull = new ConvexHullGeometry(),
        stack = [];

    return function ( geometry ) {

        init( geometry );
        expandHull( convexHull );

        return convexHull;

    };

    function init ( geometry ) {

        var points = convert_to_QPoints ( geometry.vertices );

        convexHull = initialize_hull( points );

        convexHull.setInsidePoint();
        convexHull.computeOutwardFaceNormals();

        _.each( points, assign_to_face );

        stack = pushFacesOnStack ( convexHull.faces );

    }

        function convert_to_QPoints ( points ) {

            var qpoints = []

            points.forEach( function(p) { 
                qpoints.push( new QPoint( p.x, p.y, p.z ) )
             } );

            return qpoints;
        }

        function initialize_hull ( points ) {

            var extremes, line, p1, p2, p3;

            extremes = find_extremes( points );

            line = farthest_apart( extremes );

            p1 = line.start;
            p2 = line.end;

            p3 = farthest_from_line( extremes, line );

            convexHull = build_hull( points, p1, p2, p3 );

            return convexHull;

        }


        function find_extremes ( points ) {

            var extremes = [ points[0], points[0],
                             points[0], points[0],
                             points[0], points[0] ];

            points.forEach( function ( point ) {

                if ( point.x < extremes[0].x ) extremes[0] = point;
                if ( point.x > extremes[1].x ) extremes[1] = point;

                if ( point.y < extremes[2].y ) extremes[2] = point;
                if ( point.y > extremes[3].y ) extremes[3] = point;

                if ( point.z < extremes[4].z ) extremes[4] = point;
                if ( point.z > extremes[5].z ) extremes[5] = point;

            } );

            return extremes;

        }

        function farthest_apart ( extremes ) {

            var line, start, stop,
                point1, point2,
                distance_apart = Number.NEGATIVE_INFINITY ;

            for ( var i = 0; i < extremes.length; i ++ ) {
                for ( var j = i + 1; j < extremes.length; j++ ) {

                    point1 = extremes[ i ];
                    point2 = extremes[ j ];

                    if ( point1.distanceToSquared( point2 ) > distance_apart) {

                        distance_apart = distance_apart;
                        start = point1;
                        stop = point2;

                    }

                }
            }

            line = new THREE.Line3(start, stop);

            return line;

        }

        function farthest_from_line ( extremes, line ) {

            var distance, closest_point,
                farthest, farthest_distance = Number.NEGATIVE_INFINITY;

            extremes.forEach( function ( extreme ) {

                closest_point = line.closestPointToPoint( extreme );
                distance = closest_point.distanceToSquared( extreme );

                if ( distance > farthest_distance ) {

                    farthest_distance = distance;
                    farthest = extreme;

                }

            });

            return farthest;

        }

        function build_hull ( points, p1, p2, p3 ) {

            var plane, p4, f1, f2, f3, f4;

            plane = build_plane( p1, p2, p3 );

            p4 = farthest_from_plane( points, plane );

            f1 = new QFace( 0, 1, 2 );
            f2 = new QFace( 0, 1, 3 );
            f3 = new QFace( 0, 2, 3 );
            f4 = new QFace( 1, 2, 3 );

            convexHull.vertices = [ p1, p2, p3, p4 ];
            convexHull.faces = [ f1, f2, f3, f4 ];

            return convexHull;

        }

        function build_plane ( p1, p2, p3 ) {

            var plane,
                normal = new THREE.Vector3(),
                constant;

            normal = getNormal( p1, p2, p3 );
            constant = normal.dot( p1 );

            plane = new THREE.Plane( normal, constant );

            return plane;

        }

        function getNormal ( pointA, pointB, pointC ) {

            var segmentAB = new THREE.Vector3(),
                segmentAC = new THREE.Vector3(),
                normal = new THREE.Vector3();

            segmentAB.subVectors( pointB, pointA );
            segmentAC.subVectors( pointC, pointA );

            normal.crossVectors( segmentAB, segmentAC ); 

            return normal;

        }

        function farthest_from_plane ( points, plane ) {

            var distance, farthest, 
                farthest_distance = Number.NEGATIVE_INFINITY;

            points.forEach( function( point ) {

                distance = plane.distanceToPoint( point );

                if ( distance > farthest_distance ) {

                    farthest_distance = distance;
                    farthest = point;

                }

            });

            return farthest;

        }

        function pushFacesOnStack ( faces ) {

            faces = _.filter( faces, hasPoints )
            stack = stack.concat( faces );

            return stack;

        }

        function hasPoints ( face ) {

            return !! face.points.length;

        }

        function assign_to_face ( point ) {

            var faces = this.faces || convexHull.faces;
            var i = faces.length;

            while (! point.face && i-- ) {

                var face = faces[ i ];

                if ( point.isSeenByFace( face, convexHull ) ) {

                    point.face = face;
                    face.points.push( point );

                }
            }

            return;
        }

    function expandHull ( convexHull ) {

        var face, lightFaces, lightPoint,
            horizonEdges, newFaces;

        while (!! stack.length) {

            face = stack.pop();

            lightPoint = face.mostDistantPoint( convexHull );

            lightFaces = facesSeenFromPoint( lightPoint );

            horizonEdges = getHorizonEdges ( lightFaces );

            newFaces = updateFaces( lightPoint, horizonEdges, lightFaces );

            stack = pushFacesOnStack( newFaces );

        }

    }

        // TODO :: change from all faces to just adjacent faces.
        function facesSeenFromPoint( point ) {

            var facesSeem,
                context = {'point': point, 'convexHull': convexHull};
                faces = convexHull.faces;

            facesSeen = _.filter( faces, isSeenByPoint, context);

            return facesSeen;

        }

        function isSeenByPoint ( face ) {

            var point = this.point,
                convexHull = this.convexHull;

            return point.isSeenByFace( face, convexHull );

        }

        function getHorizonEdges ( lightFaces ) {

            var lightEdges, horizonEdges;

            lightEdges = _.flatten( _.map( lightFaces, getEdges ) ); 

            horizonEdges = _.filter( 
                                _.map( lightEdges, occursOnce ),
                                function ( bool ) { return !! bool }
                                );

            return horizonEdges;

        }

        function getEdges ( face ) {

            var edge1, edge2, edge3;

            edge1 = { 'v1': face.a, 'v2': face.b };
            edge2 = { 'v1': face.a, 'v2': face.c };
            edge3 = { 'v1': face.b, 'v2': face.c };

            return [ edge1, edge2, edge3 ];

        };

        function occursOnce ( edge1, index, list) {

            var occurances = 0;

            _.each( list, function ( edge2 ) {
                if ( hasEqualValues( edge1, edge2 ) ) occurances++;
            });

            if ( occurances === 1 ) return edge1;

            return false;

        }

        function hasEqualValues( obj1, obj2 ) {

            return _.difference( 
                        _.values( obj1 ), 
                        _.values( obj2 ) 
                    ).length === 0; 

        }

        function updateFaces ( lightPoint, horizonEdges, lightFaces ) {

            removeOldFaces( lightFaces );

            buildNewFaces( lightPoint, horizonEdges );

            reassignPoints( _.flatten( _.pluck( lightFaces, 'points' ) ) );

        }

        function removeOldFaces ( lightFaces ) {

            convexHull.faces = _.difference( convexHull.faces, lightFaces )

        }

        function buildNewFaces ( lightPoint, horizonEdges ) {

            var context, pointIndex;

            convexHull.vertices.push( lightPoint );
            pointIndex = convexHull.vertices.length - 1;

            context = { 'pointIndex': pointIndex, 'convexHull': convexHull };

            _.each( horizonEdges, buildFace, context );

        }

        function buildFace ( edge ) {

            var pointIndex = this.pointIndex,
                convexHull = this.convexHull,
                face;

            face = new QFace( edge.v1, edge.v2, pointIndex );

            convexHull.faces.push( face );

        }

        function isPoint( point1 ) {

            var point2 = this;

            if ( point1.x === point2.x &&
                 point1.y === point2.y &&
                 point1.z === point2.z ) return true;

            return false;

        }

        function reassignPoints ( points ) {

            _.each( points, assign_to_face );
        }

}.call( this );