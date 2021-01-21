
var DEG_TO_RAD = 2 * Math.PI / 360,
	RAD_TO_DEG = 1 / DEG_TO_RAD;

/**
 * CAMERA
 */

THREE.Camera.prototype.getABAngle = function(a, b, reference) {
	reference || (reference = this.parent.position); // THREE.Scene

	var da = this.position[a] - reference[a],
		db = this.position[b] - reference[b];

	return Math.atan2(db, da);
}

THREE.Camera.prototype.setABFromAngle = function(a, b, angle, reference) {
	reference || (reference = this.parent.position); // THREE.Scene

	var da = this.position[a] - reference[a],
		db = this.position[b] - reference[b];

	var distance = Math.sqrt(Math.pow(da, 2) + Math.pow(db, 2));

	var va = distance * Math.cos(angle),
		vb = distance * Math.sin(angle);

	this.position[a] = va;
	this.position[b] = vb;

	return this;
}

THREE.Camera.prototype.rotateAroundY = function(dangle, reference) {
	reference || (reference = this.parent.position); // THREE.Scene

	var angle = this.getABAngle('x', 'z', reference);
	this.setABFromAngle('x', 'z', angle + dangle, reference).lookAt(reference);

	return this;
}

THREE.Camera.prototype.rotateAroundZ = function(dangle, reference) {
	reference || (reference = this.parent.position); // THREE.Scene

	var angle = this.getABAngle('x', 'y', reference);
	this.setABFromAngle('x', 'y', angle + dangle, reference).lookAt(reference);

	return this;
}

/**
 * SCENE
 */

THREE.Scene.prototype.makeAxes = function(length) {
	length || (length = 5000);

	function v(x,y,z) {
		return new THREE.Vector3(x,y,z);
	}

	var colors = [0xFF0000, 0x00FF00, 0x0000FF]
	for ( var axis=0; axis<3; axis++ ) {
		var lineGeo = new THREE.Geometry();
		var from = [0, 0, 0], to = [0, 0, 0];
		from[axis] = -length;
		to[axis] = length;
		lineGeo.vertices.push(v.apply(null, from), v.apply(null, to));
		var lineMat = new THREE.LineBasicMaterial({
			color: colors[axis],
			linewidth: 1
		});
		var line = new THREE.Line(lineGeo, lineMat);
		line.type = THREE.Lines;
		this.add(line);
	}
};

/**
 * RENDERER
 */

THREE.WebGLRenderer.prototype.addHoverPointer = function(camera, container) {
	var mouse2D = new THREE.Vector2;
	var rayCaster = new THREE.Raycaster();

	this.domElement.addEventListener('mousemove', function(e) {
		mouse2D.x = e.clientX / this.width * 2 - 1;
		mouse2D.y = e.clientY / this.height * -2 + 1;

		rayCaster.setFromCamera(mouse2D.clone(), camera);
		var objects = rayCaster.intersectObjects(container.children);

		if ( objects.length ) {
			this.classList.add('pointing');
		}
		else {
			this.classList.remove('pointing');
		}
	});

};

THREE.WebGLRenderer.prototype.addScrollZoom = function(camera) {
	var onmousewheel = function(e) {
		var d = e.wheelDelta || -e.detail;
		var zoom = 0 < d ? 1.1 : 0.9;
		camera.zoom *= zoom;
		camera.updateProjectionMatrix();
	};

	this.domElement.addEventListener('DOMMouseScroll', onmousewheel);
	this.domElement.addEventListener('mousewheel', onmousewheel);
};

THREE.WebGLRenderer.prototype.keepRendering = function(scene, camera) {
	var renderer = this;
	var render = function(t) {
		renderer.render(scene, camera);

		window.stats && stats.update();

		requestAnimationFrame(render);
	}

	render();
};

THREE.WebGLRenderer.prototype.addDragRotation = function(scene, camera, buttons) {

	camera.dragging = false;
	camera.moving = false;
	var lastLeft;
	var lastTop;

	buttons || (buttons = [THREE.MOUSE.RIGHT]);

	this.domElement.addEventListener('mousedown', function(e) {
		if ( buttons.indexOf(e.button) != -1 ) {
			e.preventDefault();

			lastLeft = e.clientX;
			lastTop = e.clientY;
			camera.dragging = true;
		}
		else {
			camera.moving = false;
			camera.dragging = false;
		}
	});

	this.domElement.addEventListener('mousemove', function(e) {
		if ( !camera.dragging ) return;

		camera.moving = true;

		// horizontal
		var left = e.clientX;
		var dx = left - lastLeft;
		lastLeft = left;
		camera.rotateAroundY(dx * .25 * DEG_TO_RAD);

		// vertical
		// @todo stop at 1deg, because 0deg flips out
		var top = e.clientY;
		var dy = top - lastTop;
		lastTop = top;
		var rotation = camera.getABAngle('x', 'z');
		camera.rotateAroundY(-rotation);
		camera.rotateAroundZ(dy * .25 * DEG_TO_RAD); // rotate 2 deg per px
		camera.rotateAroundY(rotation);

		// camera.lookAt(scene.position);
	});

	this.domElement.addEventListener('mouseup', function(e) {
		e.preventDefault();

		camera.dragging = false;
		camera.moving = false;
	});

	this.domElement.addEventListener('mouseout', function(e) {
		e.preventDefault();

		camera.dragging = false;
		camera.moving = false;
	});

	this.domElement.addEventListener('contextmenu', function(e) {
		e.preventDefault();
	});

};

/**
 * TOOLS
 */

window.requestAnimationFrame || (window.requestAnimationFrame = (function(){
	return
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( callback ){
			window.setTimeout(callback, 1000 / 60);
		};
})());
