var camera, scene, renderer;
var effect, controls;
var element, container;

var clock = new THREE.Clock();

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  element = renderer.domElement;
  container = document.getElementById('example');
  container.appendChild(element);

  effect = new THREE.StereoEffect(renderer);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(90, 1, 0.001, 10000);
  camera.position.set(1640, 1300, -700);
  scene.add(camera);

  controls = new THREE.OrbitControls(camera, element);
  controls.target.set( 1500, 1500, 0 );
  controls.noRotate = false;
  controls.noZoom = false;
  controls.noPan = false;

  function setOrientationControls(e) {
    // if (!e.alpha) {
    //   return;
    // }

    controls = new THREE.DeviceOrientationControls(camera, true);
    controls.connect();
    controls.update();

    window.freeze = controls.freeze;

    element.addEventListener('click', fullscreen, false);

    window.removeEventListener('deviceorientation', setOrientationControls);
  }
  window.addEventListener('deviceorientation', setOrientationControls, true);



  headlight = new THREE.PointLight( 0xFFFFFF ,3, 3000 );
  headlight.position.copy( camera.position );
  scene.add( headlight );

  //Add Selection box
  var gui = new dat.GUI({
      height : 5 * 32 - 1
  });
  var params = {mRNA: "#ffff00", Antisense_RNA: "#ff00ff", Ribosomal_RNA: "#00ffff", Nuclei: "#C0C0C0"};
  gui.addColor(params, 'mRNA');
  gui.addColor(params, 'Antisense_RNA');
  gui.addColor(params, 'Ribosomal_RNA');
  gui.addColor(params, 'Nuclei');

  var geomReads = new THREE.Geometry();
   //Adds RNA reads to the scene as spheres -- yellow dots
  d3.csv("data/R1_results3.csv")
    .row(function(data) { return data; })
    .get(function(error, reads) { 
      reads.forEach(function(read) {
        var rna_class = read.string_rna_class;
        var x = read.centroid_y;
        var y = read.centroid_x;
        var z = Math.floor( (Math.random() * 100) - 10 ); //Random int from -10 to 90.
        var vertex = new THREE.Vector3( x, y, z);
        var color = new THREE.Color( "#FFFFFF " );
        if (rna_class === "+NM") { color = new THREE.Color( "#ffff00" ); }
        if (rna_class === "-NM") { color = new THREE.Color( "#ff00ff" ); }
        if (!!rna_class.match(/\+RIBO/)) { color = new THREE.Color( "#00ffff" ); }
        geomReads.vertices.push( vertex );
        geomReads.colors.push( color );
      });
      var material = new THREE.PointCloudMaterial({ size: 3, vertexColors: THREE.VertexColors, sizeAttenuation: true });
      var pointCloud = new THREE.PointCloud( geomReads, material );
      scene.add( pointCloud );

    });

  // Nuclei object maps a nucleusNum to a nucleus
  var nuclei = {};
  var nucleusNum = 0;

  //Adds vertices to the nuclei object.
  var nucleus;   
  var nucleusVertices = [];

  //Grabs nuclei mask data and represents it -- the white blobs.
  d3.csv('data/vertices.csv')
    .row(function(data) {return data;})
    .get(function(error, vertices) {
      vertices.forEach(function(vertex) {

        // Starts new object
        if ( Number(vertex.Var1_1 ) === -1 ) {
          nucleus = {'vertices': [], 'faces': []};
          nucleus.vertices = nucleusVertices;
          nuclei[nucleusNum] = nucleus;
          nucleusVertices = [];
          nucleusNum = vertex.Var1_2;

          //creates three.js nucleus if vertices exist
          if (nucleus.vertices.length !== 0) {
            var path = nucleus.vertices;
            var shapeGeom = new THREE.Shape( path )
                            .extrude({ amount: 80 });
            var shapeMaterial = new THREE.MeshLambertMaterial({ side:THREE.DoubleSide, transparent:true, opacity:0.4 });
            var shapeMesh = new THREE.Mesh( shapeGeom, shapeMaterial );
            scene.add( shapeMesh );
          }

        //populates a nucleus object with its verticies
        } else {
          x = Number(vertex.Var1_1);
          y = Number(vertex.Var1_2);
          nucleusVertices.push( new THREE.Vector2( x, y ) );
        }
      });
    });

  window.addEventListener('resize', resize, false);
  setTimeout(resize, 1);

}

function resize() {
  var width = container.offsetWidth;
  var height = container.offsetHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  effect.setSize(width, height);
}

function update(dt) {
  resize();

  camera.updateProjectionMatrix();

  controls.update(dt);

  // headlight.update(dt);
  headlight.position.copy( camera.position );
}

function render(dt) {
  effect.render(scene, camera);
}

function animate(t) {
  requestAnimationFrame(animate);

  update(clock.getDelta());
  render(clock.getDelta());
}

function fullscreen() {
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
  } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
  }
}
