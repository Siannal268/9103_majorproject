//We need a variable to hold our image
//We need a variable to hold our image
let baseImg; 

let layerImgs = []; 

let layerSegments = [];

//We will divide the image into segments
let layerAngles = [-10, 0, 90, 0, 90,30];
let numSegments = 90;

let movingLayers = [0, 1, 2];


//Let's make an object to hold the draw properties of the image
let imgDrwPrps = {aspect: 0, width: 0, height: 0, xOffset: 0, yOffset: 0};

//And a variable for the canvas aspect ratio
let canvasAspectRatio = 0;

//let's load the image from disk
function preload() {

  baseImg = loadImage('assets/Edvard_Munch_The_Scream.jpeg');  

  layerImgs[0] = loadImage('assets/firesky.png');
  layerImgs[1] = loadImage('assets/bluesky.png');
  layerImgs[2] = loadImage('assets/greensky.png');
  layerImgs[3] = loadImage('assets/bridge.png');
  layerImgs[4] = loadImage('assets/screamer.png');
  layerImgs[5] = loadImage('assets/couple.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imgDrwPrps.aspect = baseImg.width / baseImg.height; // ⭐ 用底板图算比例
  calculateImageDrawProps();
  for (let i = 0; i < layerImgs.length; i++) {
    let segArray = [];                         // 存这一张图的小格子
    createSegmentsFromImage(layerImgs[i], segArray, i);
    layerSegments.push(segArray);              // 丢进大数组里
  }

  for (const segArray of layerSegments) {
    for (const segment of segArray) {
      segment.calculateSegDrawProps();
    }
  }
}

function draw() {
   background(0);

  // ⭐ 先画“底板”图片（在最底层）
  image(
    baseImg,
    imgDrwPrps.xOffset,
    imgDrwPrps.yOffset,
    imgDrwPrps.width,
    imgDrwPrps.height
  );

  
    //let's draw the segments to the canvas
    for (const segArray of layerSegments) {
    for (const segment of segArray) {
      segment.update();
      segment.draw();
    }
  }
} 


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateImageDrawProps();
  for (const segArray of layerSegments) {
    for (const segment of segArray) {
      segment.calculateSegDrawProps();
    }
  }
}

function createSegmentsFromImage(srcImg, targetArray, layerIndex) {
  let segmentWidth = srcImg.width / numSegments;
  let segmentHeight = srcImg.height / numSegments;

  let positionInColumn = 0;
  for (let segYPos = 0; segYPos < srcImg.height; segYPos += segmentHeight) {
    let positionInRow = 0;
    for (let segXPos = 0; segXPos < srcImg.width; segXPos += segmentWidth) {

      let segmentColour = srcImg.get(
        segXPos + segmentWidth / 2,
        segYPos + segmentHeight / 2
      );

      let angleForThisLayer = layerAngles[layerIndex];

      let segment = new ImageSegment(
        positionInColumn,
        positionInRow,
        segmentColour,
        angleForThisLayer,
        layerIndex // 这个 segment 属于哪一层
      );

      // ⭐⭐ 这一行一定要有：把 segment 丢进这个图层的数组里
      targetArray.push(segment);

      positionInRow++;
    }
    positionInColumn++;
  }
}

function calculateImageDrawProps() {
  //Calculate the aspect ratio of the canvas
  canvasAspectRatio = width / height;
  //if the image is wider than the canvas
  if (imgDrwPrps.aspect > canvasAspectRatio) {
    //then we will draw the image to the width of the canvas
    imgDrwPrps.width = width;
    //and calculate the height based on the aspect ratio
    imgDrwPrps.height = width / imgDrwPrps.aspect;
    imgDrwPrps.yOffset = (height - imgDrwPrps.height) / 2;
    imgDrwPrps.xOffset = 0;
  } else if (imgDrwPrps.aspect < canvasAspectRatio) {
    //otherwise we will draw the image to the height of the canvas
    imgDrwPrps.height = height;
    //and calculate the width based on the aspect ratio
    imgDrwPrps.width = height * imgDrwPrps.aspect;
    imgDrwPrps.xOffset = (width - imgDrwPrps.width) / 2;
    imgDrwPrps.yOffset = 0;
  }
  else if (imgDrwPrps.aspect == canvasAspectRatio) {
    //if the aspect ratios are the same then we can draw the image to the canvas size
    imgDrwPrps.width = width;
    imgDrwPrps.height = height;
    imgDrwPrps.xOffset = 0;
    imgDrwPrps.yOffset = 0;
  }
}
//Here is our class for the image segments, we start with the class keyword
class ImageSegment {

  constructor(
    columnPositionInPrm,
    rowPostionInPrm,
    srcImgSegColourInPrm,
    angleInPrm,
    layerIndexInPrm   // ← 把它加到这里
  ) {
    this.columnPosition = columnPositionInPrm;
    this.rowPostion = rowPostionInPrm;
    this.srcImgSegColour = srcImgSegColourInPrm;

    this.angle = angleInPrm;

    // 现在这个变量就有了，从参数里来的
    this.layerIndex = layerIndexInPrm;

    this.drawXPos = 0;
    this.drawYPos = 0;
    this.drawWidth = 0;
    this.drawHeight = 0;

    this.currentY = 0;

    this.phase = random(TWO_PI);
  }

  calculateSegDrawProps() {
    this.drawWidth = imgDrwPrps.width / numSegments;
    this.drawHeight = imgDrwPrps.height / numSegments;
    
    
    //The x position is the row position multiplied by the width of the segment plus the x offset we calculated for the image
    this.drawXPos = this.rowPostion * this.drawWidth + imgDrwPrps.xOffset;
    //The y position is the column position multiplied by the height of the segment plus the y offset we calculated for the image
    this.drawYPos = this.columnPosition * this.drawHeight + imgDrwPrps.yOffset;

    this.currentY = this.drawYPos;
  }

  update() {
  this.currentX = this.drawXPos;
  this.currentY = this.drawYPos;
  // layer 4：screamer → 上下移动

  


  if (this.layerIndex === 0) {
      let speed = 0.03;                     // 移动速度
      let amplitude = this.drawWidth;       // 移动幅度（可调）

      let waveOffset = sin(
      frameCount * speed + this.columnPosition * 0.3 + this.phase
    ) * amplitude;

    this.currentX = this.drawXPos + waveOffset; // 只改 X
    this.currentY = this.drawYPos;    
    }

  // 绿色 layer（layerIndex = 2）：上下动
  if (this.layerIndex === 2) {
    let speed = 0.05;
    let amplitude = this.drawHeight;

    let waveOffset = sin(frameCount * speed + this.rowPostion * 0.3 + this.phase) * amplitude;

    this.currentY = this.drawYPos + waveOffset;
  }

  // 蓝色 layer（layerIndex = 1）：沿 135° 摆动
  if (this.layerIndex === 1) {
    let speed = 0.08;                    // 移动速度
    let amplitude = this.drawWidth;      // 左右移动距离（可以改小点比如 *0.5）

    let waveOffset = sin(
      frameCount * speed + this.columnPosition * 0.3 + this.phase
    ) * amplitude;

    this.currentX = this.drawXPos + waveOffset; // 只改 X
    this.currentY = this.drawYPos;              // Y 保持不变
  }
}

    draw() {
    stroke(this.srcImgSegColour);
    strokeWeight(3);

    let cx = this.currentX + this.drawWidth / 2;
    let cy = this.currentY + this.drawHeight / 2;

    let halfLen = min(this.drawWidth, this.drawHeight) * 0.5;
    let rad = this.angle * PI / 180;

    let dx = cos(rad) * halfLen;
    let dy = sin(rad) * halfLen;

    let x1 = cx - dx;
    let y1 = cy - dy;
    let x2 = cx + dx;
    let y2 = cy + dy;

    line(x1, y1, x2, y2);
  }
}