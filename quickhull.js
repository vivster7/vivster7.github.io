// Quickhull implementation in THREE.js
//
// Algorithm details: http://thomasdiewald.com/blog/?p=1888


var Quickhull = function () {

    /*
        CLASSES
    */

    // Extend vector class with associated face
    var QPoint = function ( x, y, z, face ) {

        THREE.Vector3.call( this, x, y, z );
        this.face = face;

    }

    QPoint.prototype = Object.create( THREE.Vector3.prototype );
    QPoint.prototype.constructor = THREE.QPoint;

    // Extend face class with point list
    var QFace = function ( a, b, c, normal, color, materialIndex, pointList ) {

        THREE.Face3.call( this, a, b, c, normal, color, materialIndex );
        this.pointList = pointList || [];

    }

    QFace.prototype = Object.create( THREE.Face3.prototype );
    QFace.prototype.constructor = THREE.QFace;

    /*
        QUICKHULL IMPLEMENTATION
    */

    var convex_hull = new THREE.Geometry(),
        stack;

    var init = function ( geometry ) {

        var points =  _.each( geometry.vertices, convert_to_QPoints );

        convex_hull = initialize_hull( points );

        // assign_points_to_faces ( points, convex_hull )

        stack = convex_hull.faces;

    }

        var convert_to_QPoints = function( point ) {

            var x = point.x, y = point.y, z = point.z;

            return QPoint( x, y, z );

        };

        var initialize_hull = function ( points ) {

            var extremes, line, p1, p2, p3;

            extremes = find_extremes( points );

            line = farthest_apart( extremes );

            p1 = line.start;
            p2 = line.end;

            p3 = farthest_from_line( extremes, line );

            convex_hull = build_hull( points, p1, p2, p3 );

            return convex_hull;

        };


        var find_extremes = function ( points ) {

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

        };

        var farthest_apart = function ( extremes ) {

            var line, start, stop,
                point1, point2,
                distance_apart = 0 ;

            for ( var i = 0; i < extremes.length; i ++ ) {
                for ( var j = i + 1; j < extremes.length; j++ ) {

                    point1 = extremes[ i ];
                    point2 = extremes[ j ];

                    if ( point1.distanceTo( point2 ) > distance_apart) {

                        distance_apart = distance_apart;
                        start = point1;
                        stop = point2;

                    }

                }
            }

            line = new THREE.Line3(start, stop);

            return line;

        };

        var farthest_from_line = function ( extremes, line ) {

            var distance, closest_point,
                farthest, farthest_distance = 0;

            extremes.forEach( function ( extreme ) {

                closest_point = line.closestPointToPoint( extreme );
                distance = closest_point.distanceTo( extreme );

                if ( distance > farthest_distance ) {

                    farthest_distance = distance;
                    farthest = extreme;

                }

            });

            return farthest;

        };


        var build_hull = function ( points, p1, p2, p3 ) {

            var plane, p4, f1, f2, f3, f4;

            plane = build_plane( p1, p2, p3 );

            p4 = farthest_from_plane( points, plane );

            f1 = new QFace( 0, 1, 2 );
            f2 = new QFace( 0, 1, 3 );
            f3 = new QFace( 0, 2, 3 );
            f4 = new QFace( 1, 2, 3 );

            convex_hull.vertices = [ p1, p2, p3, p4 ];
            convex_hull.faces = [ f1, f2, f3, f4 ];

            return convex_hull;

        };

        var build_plane = function ( p1, p2, p3 ) {

            var plane,
                normal = new THREE.Vector3(),
                constant;

            normal = getNormal( p1, p2, p3 );
            constant = normal.dot( p1 );

            plane = new THREE.Plane( normal, constant );

            return plane;

        };

        var getNormal = function ( pointA, pointB, pointC ) {

            var segmentAB = new THREE.Vector3(),
                segmentAC = new THREE.Vector3(),
                normal = new THREE.Vector3();

            segmentAB.subVectors( pointB, pointA );
            segmentAC.subVectors( pointC, pointA );

            normal.crossVectors( segmentAB, segmentAC ); 

            return normal;

        };

        var farthest_from_plane = function ( points, plane ) {

            var distance, farthest, 
                farthest_distance = 0;

            points.forEach( function( point ) {

                distance =  plane.distanceToPoint( point );

                if ( distance > farthest_distance ) {

                    farthest_distance = distance;
                    farthest = point;

                }

            });

            return farthest;

        };

    var expand_hull = function ( convex_hull ) {

    }

    // TODO :: Move to top (?)
    return function ( geometry ) {

        init( geometry );
        expand_hull( convex_hull );

        return convex_hull;

    };

}.call( this );