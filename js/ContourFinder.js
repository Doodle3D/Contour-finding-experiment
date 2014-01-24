function ContourFinder() {

	this.pixelsWidth; 	// pixels width
	this.pixelsHeight;	// pixels height
	this.pixels;				// pixels (single array of r,g,b,a values of image)
	this.fColor; // foreground color
	this.bColor; // background color
	this.threshold;
	//this.maxContourPoints = Infinity; //was 500*4
	this.maxContourPoints = 500*10;
	this.allContours = [];

	this.offset = function(x, y) { return (y * this.pixelsWidth + x) * 4; }
	
	this.findContours = function(image,foregroundColor,backgroundColor,threshold) {
		var w = this.pixelsWidth = image.width;
		var h = this.pixelsHeight = image.height; 
		this.fColor = foregroundColor;
		this.bColor = backgroundColor;
		this.threshold = threshold;

		// create a new pixel array
		var imageCtx = image.getContext('2d');
		var imageData = imageCtx.getImageData(0,0,w, h);
		//console.log("imageData: ",imageData);
		var pixels = this.pixels = imageData.data;
		//console.log("pixels: ",pixels);
		var prevValue = 0;

		for (var y = 0; y < h; y++) {
			for (var x = 0; x < w; x++) {
				var index = this.offset(x, y);

				/*r = pixels[index+0];
				g = pixels[index+1];
				b = pixels[index+2];
				a = pixels[index+3];*/
				var factor = ((pixels[index] *.3 + pixels[index+1]*.59 + pixels[index+2]*.11) )
				//console.log(index+": "+r+" "+" "+g+" "+b+" "+a);

				//var value = g; 
				var value = (factor > threshold)? 255 : 0; // threshold

				//console.log(" > "+value);

				pixels[index+0] = value;
				pixels[index+1] = value;
				pixels[index+2] = value;
				//pixels[index+3] = value;
			}
		}

		//console.log("pixels: ",pixels);

		// copy the image data back onto the canvas
		//imageCtx.putImageData(imageData, 0, 0); // at coords 0,0
		//return; 

		var counter = 0;

		for (var y = 0; y < h; y++) {
			for (var x = 0; x < w; x++) {
				var index = y*w*4+x*4; 

				r = pixels[index+0];
				g = pixels[index+1];
				b = pixels[index+2];
				a = pixels[index+3];

				var value = g; 
				value = (value > threshold)? 255 : 0;
				// if we enter a foreGround color and red isn't 0 (already stored as contour)
				if(prevValue == backgroundColor && value == foregroundColor && r != 0) {
					var points = this.followContour([x,y]);
					this.allContours.push(points);
					counter++;
				}

				//r = 255;
				pixels[index+0] = r;
				pixels[index+1] = g;
				pixels[index+2] = b;
				pixels[index+3] = a;
				prevValue = value;
			}
		}

		// console.log("counter: " +counter);

		//  console.log(this.getPoints(points));
		// console.log("======================================");


		/*for (var i = 0, n = pixels.length; i < n; i += 4) {
			var grayscale = pixels[i  ] * .3 + pixels[i+1] * .59 + pixels[i+2] * .11;

			alpha = pixels[i+3];
			//console.log("alpha: ",alpha);
			var value = (alpha > threshold)? 255 : 0;
			//console.log("value: ",value);		
			/*pixels[i  ] = value; 	// red
			pixels[i+1] = value; 	// green
			pixels[i+2] = value; 	// blue
			pixels[i+3] = value; 	// alpha*/
		/*
			if(alpha > threshold) {
				pixels[i  ] = 255; 	// red
			}
		}*/

		/*for (var y = 0; y < height; y++) {
			inpos = y * width * 4; // *4 for 4 ints per pixel
			outpos = inpos + w2 * 4
			for (var x = 0; x < w2; x++) {
				r = imageData.data[inpos++] / 3; // less red
				g = imageData.data[inpos++] / 3; // less green
				b = imageData.data[inpos++] * 5; // MORE BLUE
				a = imageData.data[inpos++];     // same alpha

				b = Math.min(255, b); // clamp to [0..255]

				imageData.data[outpos++] = r;
				imageData.data[outpos++] = g;
				imageData.data[outpos++] = b;
				imageData.data[outpos++] = a;
			}
		}*/

		// copy the image data back onto the canvas
		imageCtx.putImageData(imageData, 0, 0); // at coords 0,0
	}
	
	this.followContour = function(startPoint) {
		//console.log("followContour @",startPoint);
		points = []; // start new contour
		points.push(startPoint);
		var w = this.pixelsWidth;
		var h = this.pixelsHeight;

		//console.log("w :",w," h: ",h);

		var point = startPoint;
		var numPoints = 0;

		// define neighborhood (array of 4, with:
		//   x offset, y offset, index offset, next neighbourhood element to check
//		var neighborhood = [
//			[ 1,  0,  1,   7], // east
//			[ 1,  1,  w+1, 0], // south-east
//			[ 0,  1,  w,   1], // south
//			[-1,  1,  w-1, 2], // south-west
//			[-1,  0, -1,   3], // west
//			[-1, -1, -w-1, 4], // north-west
//			[ 0, -1, -w,   5], // north
//			[ 1, -1, -w+1, 6]  // north-east
//		];
//		var neighborhood = [
//			[-1, -1, -w-1, 7], // north-west
//			[ 0, -1, -w,   0], // north
//			[ 1, -1, -w+1, 1], // north-east
//			[ 1,  0,  1,   2], // east
//			[ 1,  1,  w+1, 3], // south-east
//			[ 0,  1,  w,   4], // south
//			[-1,  1,  w-1, 5], // south-west
//			[-1,  0, -1,   6]  // west
//		];

//		var neighborhood = [
//	        [-1,  0, -1,   7],
//	        [-3, -1, -w-3, 7],
//	        [-2, -1, -w-2, 1],
//	        [-1, -1, -w-1, 1],
//	        [ 1,  0,  1,   3],
//	        [ 3,  1,  w+3, 3],
//	        [ 2,  1,  w+2, 5],
//	        [ 1,  1,  w+1, 5]
//        ];
		var neighborhood = [
			[ 1,  0,  1,   3], // east
			[ 0,  1,  w,   0], // south
			[-1,  0, -1,   1], // west
			[ 0, -1, -w,   2]  // north
		];

		var prevIndex;
		var nextNeighbor = 0; // starting point for neighborhood search (index for neighborhood array)
		do {
			//console.log("  point: ",point[0],point[1]);
			var x = point[0];
			var y = point[1];


			// go clockwise trough neighbors (starting at east side)  
			var index = y*w*4+x*4;
			this.pixels[index] = 0; // r
			this.pixels[index+2] = 0; // b
			var newPoint;
			//console.log("  index: ",index);
			var i = nextNeighbor;
			//console.log("    nextNeighbor: ",nextNeighbor);
			for(var j=0;j<neighborhood.length;j++) {

				//console.log("    neighbor: ",i);
				var nIndex = index+neighborhood[i][2]*4;
				//console.log("      neighbor index: ",nIndex);
				//console.log("      neighbor g index: ",nIndex+1);
				//console.log("      value: ",this.pixels[nIndex+1]);
				// todo: check if in range
				if(this.pixels[nIndex+1] == this.fColor && nIndex != prevIndex) { 
					//console.log("      == fColor");
					newPoint = [x+neighborhood[i][0],y+neighborhood[i][1]];
					nextNeighbor = neighborhood[i][3];
					break;
				}

				i++;
				i = i%neighborhood.length;

			}
			if(newPoint == undefined) {
				break;
			} else {
				//console.log("      new point: ",newPoint[0],newPoint[1]);
				point = newPoint;
				points.push(point);
				//console.log("      points: ",this.getPoints(points));

			}

			prevIndex = index;

			//var index = y*w*4+x*4; 
			numPoints++;
			//console.log(point[0],startPoint[0],"  ",point[1],startPoint[1]);

		} while(!(point[0] == startPoint[0] && point[1] == startPoint[1]) && numPoints < this.maxContourPoints);

		this.closeContour(points);

		return points;
	}
	this.closeContour = function(points) {
		//console.log("pixels: ",this.pixels);
	}
	this.getPoints = function(points) {
		var log = "";
		for(var i=0;i<points.length;i++) {
			var point = points[i];
			log += point[0]+","+point[1]+" > ";
		}
		return log;
	}
}
