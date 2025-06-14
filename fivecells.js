const fs = require('fs');

const ALPHABET= ".ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const filename = process.argv[2];


var lines = fs.readFileSync(filename,"utf8").split("\n").
	filter(x=>x);

var nrow = lines.length;

var C = [];	// clues
var R = []; // regions

var ncol = 0;
for(var irow=0;irow<nrow;irow++) {
	var line = lines[irow];
	if(ncol==0)
		ncol = line.length;
	else if(line.length!=ncol)
		tilt("BAD ROW LENGTH");

	var row = [];
	for(var icol=0;icol<ncol;icol++) {
		if(".0123".indexOf(line[icol])<0) tilt("BAD VALUE ",line[icol]);
		row[icol] = line[icol]=='.'?-1:line[icol]*1;
	}
	C.push(row);

	R.push(fill(ncol,-1));
}


if((nrow*ncol)%5!=0) tilt("BAD DIMENSION");

var shapes = [];
load_shapes();

var ireg =-1;	// current region id

run();

function run() {

	ireg++;

	var c = find_free_cell();
	if(!c) {
			display();		
			process.exit(0);
	}

	var irow = c[0];
	var icol = c[1];

	for(var i=0;i<shapes.length;i++) {
		var shape = shapes[i];
		if(!fit(shape,irow,icol)) continue;	
		set_region(shape,irow,icol,ireg);

		if(check_clues(shape,irow,icol))
			run();

		set_region(shape,irow,icol,-1);	
	}

	
	ireg--;
}

function fit(shape,irow,icol) {
	for(var d of shape) {
		var jrow = irow+d[0];
		var jcol = icol+d[1];
		if(jrow<0) return false;
		if(jrow>=nrow) return false;
		if(jcol<0) return false;
		if(jcol>=ncol) return false;
		if(R[jrow][jcol]!=-1) return false;
	}
	return true;
}

function set_region(shape,irow,icol,ireg) {
	
	for(var d of shape) {
		var jrow = irow+d[0];
		var jcol = icol+d[1];
		R[jrow][jcol] = ireg;
	}
}

function display() {
	for(var row of R) {
		row = row.map(x=>ALPHABET[x+1]+" ");
		console.log(row.join(""));
	}
}


function check_clues(shape,irow,icol) {

	for(var d of shape) {

		var jrow = irow+d[0];
		var jcol = icol+d[1];

		if(C[jrow][jcol]!=-1) {
			if(count_borders(jrow,jcol)!=C[jrow][jcol])
				return false;
		}
	}
	
	return true;
}

function count_borders(irow,icol) {
	var n = 0;

	var dirs = [[0,1],[0,-1],[1,0],[-1,0]];
	for(var d of dirs)  {
		var jrow = irow+d[0];
		var jcol = icol+d[1];		
		var out = 0;
		if(jrow<0)
			out=1;
		else if(jrow>=nrow)
			out=1;
		if(jcol<0)
			out=1;
		else if(jcol>=ncol)
			out=1;
		if(out==0) {
			if(R[irow][icol]!=R[jrow][jcol])
				n++;
		}
		else
			n++;
	}	

	return n;
}


function find_free_cell() {

	for(var irow=0;irow<nrow;irow++)
		for(var icol=0;icol<ncol;icol++)
			if(R[irow][icol]==-1)
				return [irow,icol];

	return null;
}
					
function fill(n,value) {
	var a = [];
	for(var i=0;i<n;i++)
		a[i] = value;
	return a;
}

function tilt(...a) {
	console.error(...a);
	process.exit(1);
}


function load_shapes() {

	var keys = [];

	var K = [
		'....ABCDE',
		'FGHIJKLMN',
		'OPQRSTUVW',
		'XYZabcdef',
		'ghijklmno'
	]

	f(0,0,1,0,2,0,3,0,4,0,'I');
	f(0,0,1,0,1,1,2,1,3,1,'N');
	f(0,0,0,1,0,2,1,0,1,2,'U');
	f(0,0,0,1,1,0,1,-1,2,-1,'W');
	f(0,0,1,0,1,1,1,2,2,2,'Z');	
	f(0,0,1,-1,1,0,1,1,1,2,'Y');
	f(0,0,1,-2,1,-1,1,0,2,0,'T');
	f(0,0,1,0,1,1,1,2,2,1,'F');	
	f(0,0,1,0,2,0,3,0,3,1,'L');
	f(0,0,0,1,1,0,1,1,1,2,'P');
	f(0,0,1,0,2,-2,2,-1,2,0,'V');
	f(0,0,1,-1,1,0,1,1,2,0,'X');


	function f(...a) {
		var name = a[a.length-1];
		a.length--;
				
		add_shape(a);

		var b = a.slice();
		for(var i=0;i<a.length;i+=2)
			b[i+1] = -a[i+1];
		add_shape(b);

		b = a.slice();
		for(var i=0;i<a.length;i+=2)
			b[i] = -a[i];
		add_shape(b);

		b = a.slice();
		for(var i=0;i<a.length;i+=2) {
			b[i] = -a[i];
			b[i+1] = -a[i+1];	
		}
		add_shape(b);

		b = a.slice();
		for(var i=0;i<a.length;i+=2) {
			b[i] = a[i+1];
			b[i+1] = -a[i];
		}
		add_shape(b);

		b = a.slice();
		for(var i=0;i<a.length;i+=2) {
			b[i] = -a[i+1];
			b[i+1] = a[i];
		}
		add_shape(b);

		b = a.slice();
		for(var i=0;i<a.length;i+=2) {
			b[i] = -a[i+1];
			b[i+1] = -a[i];
		}
		add_shape(b);

		b = a.slice();
		for(var i=0;i<a.length;i+=2) {
			b[i] = a[i+1];
			b[i+1] = a[i];
		}
		add_shape(b);

		function add_shape(b) {
			// normalize
			var minr = 10;
			var minc = 10;
			for(var i=0;i<b.length;i+=2) {
				if(b[i]==minr) {
					if(b[i+1]<minc) minc = b[i+1];
				}
				else if(b[i]<minr) {
					minr = b[i];
					minc = b[i+1];
				}
			}
			for(var i=0;i<b.length;i+=2) {
				b[i] = b[i]-minr;
				b[i+1] = b[i+1]-minc;
			}

			var shape = [];
			for(var i=0;i<b.length;i+=2)
				shape.push([b[i],b[i+1]]);

			// to prevent duplicate shapes
			var key = compute_key(shape);
			if(keys.indexOf(key)>=0) return;
			keys.push(key);	

			shapes.push(shape);
		}
	}

	function compute_key(shape) {
		var s = "";
		for(var d of shape) {
			var irow = d[0];
			var icol = d[1];
			s += K[irow][icol+4];
		}
		s = s.split("").sort().join("");
		return s;		
	}

	
}


function debug(...a) {
	return false;
	console.log(...a);
}


