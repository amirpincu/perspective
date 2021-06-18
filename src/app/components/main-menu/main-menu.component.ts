import { ThrowStmt } from '@angular/compiler';
import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { saveAs } from 'file-saver';

const defaultColors = {
  rightPointColor: "rgba(255, 0, 0, 0.5)",
  leftPointColor: "rgba(0, 175, 0, 0.5)",
  heightPointColor: "rgba(0, 0, 255, 0.5)"
}

@Component({
  selector: 'main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export default class MainMenuComponent implements AfterViewInit {

  /** Template reference to the canvas element */
  private canvas: HTMLCanvasElement;

  pointsType: number = 1;
  zAngle: number = 45;
  yAngle: number = 90;
  xAngle: number = 0;
  isTopPoint: boolean = true;
  scale: number = 1;

  canvasSize = 1000;

  constructor() {
  }
  ngAfterViewInit(): void {
    this.canvas = document.getElementById('stage') as HTMLCanvasElement;
    this.canvas.width = Math.min( window.innerHeight, window.innerWidth ) * 0.95;
    this.canvas.height = Math.min( window.innerHeight, window.innerWidth ) * 0.95;
    this.refresh();
  }


  flipZAngle() {
    this.zAngle = 90 - this.zAngle;
    this.refresh();
  }
  changeZAngle() {
    this.refresh();
  }
  flipYAngle() {
    this.isTopPoint = !this.isTopPoint;
    this.refresh();
  }
  changeYAngle() {
    this.refresh();
  }
  changeXAngle() {
    this.refresh();
  }
  
  
  private drawPointsOnCanvas(canvas: HTMLCanvasElement) {

    const coneRadius = canvas.width * 0.95 * 0.5;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawConeOfVision(canvas, coneRadius);

    const halfCanvas = canvas.width / 2;
    const zAngle = this.zAngle * (Math.PI / 180);
    const yAngle = this.yAngle * (Math.PI / 180);
    const xAngle = this.xAngle * (Math.PI / 180);
    const noOfLines = 250 * this.scale;

    const rightPointShipuaa = Math.tan(zAngle);
    const leftPointShipuaa = Math.tan(zAngle + Math.PI * 1.5);;
    const topPointShipuaa = Math.tan(yAngle);
    const bottomPointShipuaa = Math.tan(yAngle + Math.PI * 1.5);

    const rightPointX = (-1 * coneRadius / rightPointShipuaa) * this.scale;
    const leftPointX = (-1 * coneRadius / leftPointShipuaa) * this.scale;
    const topPointY = (-1 * coneRadius / topPointShipuaa) * this.scale;
    const bottomPointY = (-1 * coneRadius / bottomPointShipuaa) * this.scale;

    const rightLeftHeight = this.isTopPoint ? topPointY : bottomPointY;
    const heightPointHeight = !this.isTopPoint ? topPointY : bottomPointY;

    switch (this.pointsType) {
      case 1:
        console.log(this.pointsType);
        this.drawVanishingPoint(canvas, rightPointX + halfCanvas, halfCanvas, noOfLines, defaultColors.rightPointColor);
        this.drawVanishingPoint(canvas, leftPointX + halfCanvas, halfCanvas, noOfLines, defaultColors.leftPointColor);
        this.drawHorizonLine(canvas, rightPointX + halfCanvas, halfCanvas, leftPointX + halfCanvas, halfCanvas);
        break;
      case 2:
        console.log(this.pointsType);
        this.drawVanishingPoint(canvas, rightPointX + halfCanvas, rightLeftHeight + halfCanvas, noOfLines, defaultColors.rightPointColor);
        this.drawVanishingPoint(canvas, leftPointX + halfCanvas, rightLeftHeight + halfCanvas, noOfLines, defaultColors.leftPointColor);
        this.drawVanishingPoint(canvas, halfCanvas, heightPointHeight + halfCanvas, noOfLines, defaultColors.heightPointColor);
        this.drawHorizonLine(canvas, rightPointX + halfCanvas, rightLeftHeight + halfCanvas, leftPointX + halfCanvas, rightLeftHeight + halfCanvas);
        break;
      case 3:
        console.log(this.pointsType);
        const rotatedRightPoint = this.rotateAroundAxisOrigin(rightPointX, rightLeftHeight, xAngle);
        const rotatedLeftPoint = this.rotateAroundAxisOrigin(leftPointX, rightLeftHeight, xAngle);
        const rotatedHeightPoint = this.rotateAroundAxisOrigin(0, heightPointHeight, xAngle);

        this.drawVanishingPoint(canvas, rotatedRightPoint[0] + halfCanvas, rotatedRightPoint[1] + halfCanvas, noOfLines, defaultColors.rightPointColor);
        this.drawVanishingPoint(canvas, rotatedLeftPoint[0] + halfCanvas, rotatedLeftPoint[1] + halfCanvas, noOfLines, defaultColors.leftPointColor);
        this.drawVanishingPoint(canvas, rotatedHeightPoint[0] + halfCanvas, rotatedHeightPoint[1] + halfCanvas, noOfLines, defaultColors.heightPointColor);
        this.drawHorizonLine(canvas, rotatedRightPoint[0] + halfCanvas, rotatedRightPoint[1] + halfCanvas, rotatedLeftPoint[0] + halfCanvas, rotatedLeftPoint[1] + halfCanvas);
      default:
        break;
    }
  }
  private drawConeOfVision(canvas: HTMLCanvasElement, coneRadius: number) {
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#666";
    ctx.fillStyle = "#666";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.width / 2, coneRadius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }
  private drawVanishingPoint(canvas: HTMLCanvasElement, centerX: number, centerY: number, noOfLines: number, color?: string) {
    const finalColor = color ? color : "#CCC";
    const ctx = canvas.getContext('2d');
    const radiusSize = 100000;
    const centerRadiusSize = 25;

    ctx.lineWidth = 2;
    ctx.strokeStyle = finalColor;
    ctx.fillStyle = finalColor;

    const slope = (centerY - canvas.height / 2) / (centerX - canvas.width / 2)
    const angleToCenter = Math.tanh(slope);

    for (let i = 0; i < noOfLines; i++) {
      let angle = angleToCenter + (Math.PI * 2 / noOfLines) * i;
      let x = centerX + radiusSize * Math.cos(angle);
      let y = centerY + radiusSize * Math.sin(angle);

      let offSetX = centerX + centerRadiusSize * Math.cos(angle);
      let offSetY = centerY + centerRadiusSize * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(offSetX, offSetY);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

  }
  private drawHorizonLine(canvas: HTMLCanvasElement, x1: number, y1: number, x2: number, y2: number) {
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#666";

    const slope = (y2 - y1) / (x2 - x1);
    const intercept = y2 - (slope * x2);

    function getY(x) { return (slope * x) + intercept; }
    function getX(y) { return (y - intercept) / slope; }

    ctx.beginPath();

    if (x1 == x2) {
      ctx.moveTo(x1, 0);
      ctx.lineTo(x1, canvas.height);
    }
    else if (y1 == y2) {
      ctx.moveTo(0, y1);
      ctx.lineTo(canvas.width, y1);
    }
    else {
      // draw a line between two points
      ctx.moveTo(getX(0), 0);
      ctx.lineTo(getX(canvas.height), canvas.height);
    }
    ctx.closePath();
    ctx.stroke();

  }
  private rotateAroundAxisOrigin(x: number, y: number, angle: number): number[] {
    let s = Math.sin(angle);
    let c = Math.cos(angle);

    // rotate point
    let xnew = x * c - y * s;
    let ynew = x * s + y * c;

    return [xnew, ynew];
  }


  public refresh() {
    console.log(this.pointsType);
    this.drawPointsOnCanvas(this.canvas);
  }
  public download() {

    const tempCanvas = document.createElement("canvas");
    const tCtx = tempCanvas.getContext("2d");
    const descriptiveText = `X: ${this.xAngle.toFixed(2)}°\nY: ${this.yAngle.toFixed(2)}°\nZ: ${this.zAngle.toFixed(2)}°\nScale: ${this.scale.toFixed(2)}`;
    tempCanvas.width = 5000;
    tempCanvas.height = 5000;

    this.drawPointsOnCanvas(tempCanvas);

    tCtx.font = "30px Arial"; tCtx.fillStyle = "black";
    tCtx.fillText(descriptiveText,50,50);

    var dataURL = tempCanvas.toDataURL("image/png");    
    saveAs( dataURL, `generatedGrid.png`);
  }

  public open() {

    const tempCanvas = document.createElement("canvas");
    const tCtx = tempCanvas.getContext("2d");
    const descriptiveText = `X: ${this.xAngle.toFixed(2)}°\nY: ${this.yAngle.toFixed(2)}°\nZ: ${this.zAngle.toFixed(2)}°\nScale: ${this.scale.toFixed(2)}`;
    tempCanvas.width = 3000;
    tempCanvas.height = 3000;

    this.drawPointsOnCanvas(tempCanvas);

    tCtx.font = "30px Arial"; tCtx.fillStyle = "black";
    tCtx.fillText(descriptiveText,50,50);

    var dataURL = tempCanvas.toDataURL("image/png");
    var newTab = window.open('about:blank', `img ${Math.random()}`);
    newTab.document.write("<img src='" + dataURL + "' alt='from canvas'/>");

  }

}
