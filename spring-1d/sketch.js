// ver3.5
// full screen colored version 
// spring and mass
// 1 dimenstion x M
//

// 定数
const K = 1.1;           // ばね定数
const L = 20;            // ばねの半分の長さ
const DT = 0.1;          // シミュレーションの時間の粒度
const N = 31;            // I系の球の数
const M = 29;            // II系内のI系の数
const RADIUS = 10;       // 球の重さ
const SPRING_WIDTH = 0;  // バネ描画時の線の太さ
const INITIAL_DX = 20;   // 球の初期位置の変位
const VX = 0;            // 球の初期速度
const AX = 0;            // 球の初期加速度
const LEFT_GAP = RADIUS * 0.5;   // 左側の余白
const COLORED = true;   // 色をつけるかどうか
const ADD_RANDOM = false;

let systems = []; // 系の配列
let envelope;
let count=0;
let sounfOfFreq;
let interval=100;
let deltaFreq=0;
let filterFreq;

// 質量のクラス
class Mass {
    constructor(x, v, a, dx, m, radius, color) {
        this.x = x; // 位置
        this.v = v; // 速度
        this.a = a; // 加速度
        this.dx = dx; // 初期変位
        this.m = m; // 質量
        this.f = 0; // 力
        this.radius = radius; // 半径
        this.color = color; // 色
    }
}

// バネのクラス
class Spring {
    constructor(k, length, color, weight) {
        this.k = k; // バネ定数
        this.length = length; // バネの半分の長さ
        this.color = color; // 色
        this.weight = weight; // 線の太さ
    }
}
/*
// 乱数を加える関数
function addRandomness(obj, prop, min, max) {
    let r = random(min, max);
    obj[prop] += r;
}

function Randomness() {
    // 球の初期変位に乱数を加える
    for (let j = 0; j < M; j++) {
        for (let i = 0; i < N; i++) {
            addRandomness(systems[j][i], 'dx', -10, 10);
            addRandomness(systems[j][i], 'radius', -1, 3);
            addRandomness(systems[j][i], 'x', -5, 5); // 球の位置に乱数を加える
        }
    }
    // バネの太さに乱数を加える
    for (let j = 0; j < M; j++) {
        for (let i = N; i < systems[j].length; i++) {
            addRandomness(systems[j][i], 'weight', -1, 1);
        }
    }
}
function tryRandomness(obj, prop, min, max){
    let r;
    for (let j = 0; j < M; j++) {
        for (let i = 0; i < N; i++) {
	    r=random(min,max);
	    systems[j][i][prop] += r;
	}
    }
}
*/
let random_input= {
    "mass": [
	{
	    "prop": "dx",
	    "min":  -30,
	    "max":   30
	},
	{
	    "prop": "radius",
	    "min":  -10,
	    "max":   10
	}
    ],
    "spring":[
	{
	    "prop": "k",
	    "min":  3,
	    "max":  -3
	}
    ]
}

function execRandomness() {
    let r;

    for (let k = 0; k < random_input.mass.length; k++) {
	for (let j = 0; j < M; j++) {
            for (let i = 0; i < N; i++) {
		r=random(random_input.mass[k].min,  random_input.mass[k].max);
		systems[j][i][random_input.mass[k].prop] += r;
	    }
	}
    }
    for (let k = 0; k < random_input.spring.length; k++) {
	for (let j = 0; j < M; j++) {
            for (let i = 0; i < N; i++) {
		r=random(random_input.spring[k].min,  random_input.spring[k].max);
		systems[j][i][random_input.spring[k].prop] += r;
	    }
	}
    }
}


function setup() {
    let MASS_COLOR = color(255, 0, 0);   // 球の色 関数内部に定義しないとエラーが出る
    let WHITE_COLOR = color(255, 255, 255);  // 白色　関数内部に定義しないとエラーが出る
   
    createCanvas(1800, 900);
    textSize(16);
    textFont('Open Sans', 16);
    textStyle(NORMAL);
    
    // 初期状態
    for (let j = 0; j < M; j++) {
        let system = [];
        for (let i = 0; i < N; i++) {
            let x = LEFT_GAP + (i - (N - 1) / 2) * 2 * L; // 質量の初期位置を調整
            let radius = RADIUS; // 半径の初期値
            let color = MASS_COLOR; // 色の初期値
            system.push(new Mass(x, VX, AX, INITIAL_DX, 1, radius, color));
        }
        systems.push(system);
    }

    // バネの初期化
    for (let j = 0; j < M; j++) {
        for (let i = 0; i < N - 1; i++) {
            let color = MASS_COLOR; // 色の初期値
            let weight = SPRING_WIDTH; // 線の太さの初期値
            systems[j].push(new Spring(K, L, color, weight));
        }
    }
    
    //  if (ADD_RANDOM)   Randomness();
    
    // バネと球の初期状態に対してランダムさを追加
    execRandomness();
    
    // 初期変位を適用
    for (let j = 0; j < M; j++) {
        for (let i = 0; i < N; i++) {
            systems[j][i].x += (i === 0) ? -systems[j][i].dx : ((i === N - 1) ? systems[j][i].dx : 0);
        }
    }
    osc      = new p5.SinOsc();
    envelope = new p5.Env();
    delay= new p5.Delay();    
    reverb   = new p5.Reverb();
    filter = new p5.BandPass()
    
    envelope.setADSR(0.01, 0.9, 0.1, 100.0);
    envelope.setRange(2,1);
    osc.amp(0.5);
    delay.process(osc, 0.4, .39, 230);
    reverb.process(osc, 5,10);
    //osc.freq(440);
    //osc.start();    
}

function draw() {
    let MASS_COLOR = color(255, 0, 0);   // 球の色 関数内部に定義しないとエラーが出る
    let WHITE_COLOR = color(255, 255, 255);  // 白色 関数内部に定義しないとエラーが出る
    background(255);
    translate(width / 2, height / (2 * M));
    
    for (let j = 0; j < M; j++) {
        // 運動方程式
        for (let i = 0; i < N - 1; i++) {
	    // バネ定数とバネの長さを使用
            let force = systems[j][N + i].k * (systems[j][i + 1].x - systems[j][i].x - 2 * systems[j][N + i].length);
            systems[j][i].f += force;
            systems[j][i + 1].f -= force;
        }
	
        // 速度と位置の更新
        for (let i = 0; i < N; i++) {
            systems[j][i].a = systems[j][i].f / systems[j][i].m;
            systems[j][i].v += systems[j][i].a * DT;
            systems[j][i].x += systems[j][i].v * DT;
            systems[j][i].f = 0; // 力をリセット
        }
	
        // ばねの描画
        for (let i = 0; i < N - 1; i++) {
            let x1 = systems[j][i].x;
            let x2 = systems[j][i + 1].x;
            let spring = systems[j][N + i];
            
            if (COLORED) {
                let springLength = abs(x2 - x1);
                let maxLength = 2 * spring.length + systems[j][i].dx + systems[j][i + 1].dx;
                let minLength = 2 * spring.length - systems[j][i].dx - systems[j][i + 1].dx;
                let ratio = (springLength - minLength) / (maxLength - minLength);
                let color = lerpColor(spring.color, WHITE_COLOR, ratio);
                stroke(color);
            } else {
                stroke(0);
            }
            strokeWeight(spring.weight);
            line(x1, j * height / M / 0.8, x2, j * height / M / 0.8);
        }
	
        // 質量の描画
        strokeWeight(1);
        for (let i = 0; i < N; i++) {
            let mass = systems[j][i];
            
            if (COLORED) {
                let springLength = (i === 0) ? mass.x - systems[j][i + 1].x + 2 * L : (i === N - 1) ? systems[j][i - 1].x - mass.x + 2 * L : abs(systems[j][i - 1].x - mass.x) + abs(mass.x - systems[j][i + 1].x);
                let maxLength = 4 * L + mass.dx;
                let minLength = 4 * L - mass.dx;
                let ratio = (springLength - minLength) / (maxLength - minLength);
                let color = lerpColor(mass.color, WHITE_COLOR, ratio);
                fill(color);
            } else {
                fill(255);
            }
            ellipse(mass.x, j * height / M / 0.8, mass.radius, mass.radius);
        }
    }


    if (count>interval) {
	count=0;
	interval=random(10,400);	
	osc.start();
	deltaFreq=random(10,40);
    }
    else {
	osc.stop();
	soundOfFreq=midiToFreq(floor(random(60,100)))
	osc.freq(soundOfFreq);
	//envelope.play(osc,2.0,4.0);
	filter.freq(soundOfFreq-deltaFreq);
	filter.res(100-constrain(count,10,100))
	count++;
    }
}

function mouseClicked() {
    setup(); // マウスクリック時に新しい初期状態に戻る
}
