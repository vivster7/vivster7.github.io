var scene, camera, renderer;

init();
animate();

function init() {

  // Scene
  scene = new THREE.Scene();
  var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;

  // Renderer
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(WIDTH, HEIGHT);
  document.body.appendChild(renderer.domElement);

  // Camera
  camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 20000);
  camera.position.set(0,0,5);
  scene.add(camera);

  // Resize listener
  window.addEventListener("resize", function() {
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
  });

  // Set the background color of the scene.
  renderer.setClearColor(0x333F47, 1);

  // Light
  var light = new THREE.AmbientLight( 0x404040 );
  scene.add(light);

  // Add OrbitControls so that we can pan around with the mouse.
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  //Demo

  var geometry = new THREE.Geometry();

  for (var i = 0; i < 200 ; i ++) {

    var x = Math.random() * 200 - 100;
    var y = Math.random() * 200 - 100;
    var z = Math.random() * 200 - 100;

    geometry.vertices.push( new THREE.Vector3( x,y,z ) );

  }

  var pointCloudMaterial = new THREE.PointCloudMaterial({ color: 0xff0000 });

  var pointCloud = new THREE.PointCloud( geometry, pointCloudMaterial );

  scene.add( pointCloud );

  var convex_hull = Quickhull( geometry );

  convex_hull.faces.forEach( function(face) {

    face.color.setRGB( Math.random(), Math.random(), Math.random() );

  });

  var hull_material = new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors, side: THREE.DoubleSide, transparent:true, opacity:0.5 });
  var mesh = new THREE.Mesh( convex_hull, hull_material );

  scene.add( mesh );

}


// Renders the scene and updates the render as needed.
function animate() {

  requestAnimationFrame(animate);
  
  // Render the scene.
  renderer.render(scene, camera);
  controls.update();

}
