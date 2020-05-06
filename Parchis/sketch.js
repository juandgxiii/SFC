const width = 800;
let colors = ["yellow", "blue", "red", "green"];
let Pieces = [];
let starts = [true] * 4; // 1 place * 4 colors

class Piece {
    constructor(color) {
        this.color = color;
        this.place = 0;
        Pieces.push(this)
    }
    draw() {
        let pieceDiameter = 5;
        let tile = getPieceTile(this);
        let [x, y] = getTilePosition(tile);
        fill(this.color);
        circle(x, y, pieceDiameter)
        noFill();
    }
}

function getQuadrant(t) {
    if ((1 <= t && t <= 4) || (56 <= t && t <= 68)) {return 1}
    else if (5 <= t && t <= 21) {return 2}
    else if (22 <= t && t <= 38) {return 3}
    else if (39 <= t && t <= 71) {return 4}
    else {console.log("Error getting quadrant of tile number ", t); return -1}
}

function getTilePosition(t) {

    // start
    


    // outside
    


    // inside color



    // finish



    // https://en.wikipedia.org/wiki/Transformation_matrix#Rotation
    x_ = x * Math.cos(angle) - y * Math.sin(angle);
    y_ = x * Math.sin(angle) - y * Math.cos(angle);
    return [x_, y_]
}

// 4 start tiles, one per color (0-3) (zero-index)
// 68 outside tiles (4-71)
// 28 inside color tiles (72-99)
// 4  finish tiles (100-103)
let globalTiles = new Array(4 + 68 + 7 * 4 + 4); // 4 starts + 68 outside tiles + 7*4 inside color + 4 finish = 104

function getPieceTile(piece) {
    let p = piece.place;
    let c = piece.color;
    if (p == 0) { // piece is at the start
        return c
    } else if (1 <= p && p <= 64) { // outside tiles
        return p + c * 17 // 17 tiles shift between colors
    } else if (64 < p && p <= 71) { // inside color
        return 72 + (p - 64) * c // inside colors start at 72
    } else if (p == 72) { // finished
        return 100 + c // finish tile for the color
    } else {
        console.log("Error: piece.place out of bounds for ", piece)
    }
}

function drawBoard() {
    background(255);
    let bigSquareWidth = width * 0.3;
    let tileWidth = width * 0.4 / 3;
    let tileHeight = bigSquareWidth / 8;
    stroke(0);
    for (let c = 0; c < 1; c++) {
        for (let i = 0; i < 3; i++) {
            //big square
            fill(colors[(c+1)%4]);
            square(-width/2, width * 0.2, bigSquareWidth);
            noFill();
            // tiles
            if (i == 1) {fill(colors[(c+1)%4])} else {noFill()} // inside color tiles
            for (let j = 0; j < 8; j++) {
                rect(-width/2 + tileHeight * j, -width/2 + bigSquareWidth + tileWidth * i, tileHeight, tileWidth);
            }
        }
        rotate(-HALF_PI);
    }
}

function drawPieces() {
    for (p in Pieces) {
        // p.draw();
    }
}

function setup() {
    createCanvas(width, width);
    translate(width/2, width/2);
    for (let i = 0; i < 16; i++) {
        new Piece(i % 4);
    }
    drawBoard();
    drawPieces();
}

function draw() {
    // drawBoard();
    // drawPieces();
}