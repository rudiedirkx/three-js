
var DEG_TO_RAD = 2 * Math.PI / 360,
	RAD_TO_DEG = 1 / DEG_TO_RAD;

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
