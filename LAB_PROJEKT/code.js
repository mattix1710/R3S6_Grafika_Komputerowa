var gl;
var shaderProgram;
var uPMatrix;                           //INFO: uPMatrix tylko jedno!!!
var vertexPositionBuffer;
var vertexColorBuffer;
var vertexCoordsBuffer;
var vertexNormalBuffer;
var indexBuffer;

// volcano

var shaderProgramVolcano;
var vertexPositionBufferVolcano;
var vertexColorBufferVolcano;
var vertexCoordsBufferVolcano;
var vertexNormalBufferVolcano;
var indexBufferVolcano;

// volcanos plane

var shaderProgramPlane;
var vertexPositionBufferPlane;
var vertexColorBufferPlane;
var vertexCoordsBufferPlane;
var vertexNormalBufferPlane;
var indexBufferPlane;


//////////////
// particle system
var shaderProgramParticle;
var vertexPositionBufferParticle;
var vertexColorBufferParticle;
var PARTICLE_NUMBER = 10000;

var ifHaltedPointCloud = false;

function MatrixMul(a,b) //Mnożenie macierzy
{
  let c = [
  0,0,0,0,
  0,0,0,0,
  0,0,0,0,
  0,0,0,0
  ]
  for(let i=0;i<4;i++)
  {
    for(let j=0;j<4;j++)
    {
      c[i*4+j] = 0.0;
      for(let k=0;k<4;k++)
      {
        c[i*4+j]+= a[i*4+k] * b[k*4+j];
      }
    }
  }
  return c;
}

function MatrixTransposeInverse(m)
{
  let r = [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
    ];
  r[0] = m[5]*m[10]*m[15] - m[5]*m[14]*m[11] - m[6]*m[9]*m[15] + m[6]*m[13]*m[11] + m[7]*m[9]*m[14] - m[7]*m[13]*m[10];
  r[1] = -m[1]*m[10]*m[15] + m[1]*m[14]*m[11] + m[2]*m[9]*m[15] - m[2]*m[13]*m[11] - m[3]*m[9]*m[14] + m[3]*m[13]*m[10];
  r[2] = m[1]*m[6]*m[15] - m[1]*m[14]*m[7] - m[2]*m[5]*m[15] + m[2]*m[13]*m[7] + m[3]*m[5]*m[14] - m[3]*m[13]*m[6];
  r[3] = -m[1]*m[6]*m[11] + m[1]*m[10]*m[7] + m[2]*m[5]*m[11] - m[2]*m[9]*m[7] - m[3]*m[5]*m[10] + m[3]*m[9]*m[6];

  r[4] = -m[4]*m[10]*m[15] + m[4]*m[14]*m[11] + m[6]*m[8]*m[15] - m[6]*m[12]*m[11] - m[7]*m[8]*m[14] + m[7]*m[12]*m[10];
  r[5] = m[0]*m[10]*m[15] - m[0]*m[14]*m[11] - m[2]*m[8]*m[15] + m[2]*m[12]*m[11] + m[3]*m[8]*m[14] - m[3]*m[12]*m[10];
  r[6] = -m[0]*m[6]*m[15] + m[0]*m[14]*m[7] + m[2]*m[4]*m[15] - m[2]*m[12]*m[7] - m[3]*m[4]*m[14] + m[3]*m[12]*m[6];
  r[7] = m[0]*m[6]*m[11] - m[0]*m[10]*m[7] - m[2]*m[4]*m[11] + m[2]*m[8]*m[7] + m[3]*m[4]*m[10] - m[3]*m[8]*m[6];

  r[8] = m[4]*m[9]*m[15] - m[4]*m[13]*m[11] - m[5]*m[8]*m[15] + m[5]*m[12]*m[11] + m[7]*m[8]*m[13] - m[7]*m[12]*m[9];
  r[9] = -m[0]*m[9]*m[15] + m[0]*m[13]*m[11] + m[1]*m[8]*m[15] - m[1]*m[12]*m[11] - m[3]*m[8]*m[13] + m[3]*m[12]*m[9];
  r[10] = m[0]*m[5]*m[15] - m[0]*m[13]*m[7] - m[1]*m[4]*m[15] + m[1]*m[12]*m[7] + m[3]*m[4]*m[13] - m[3]*m[12]*m[5];
  r[11] = -m[0]*m[5]*m[11] + m[0]*m[9]*m[7] + m[1]*m[4]*m[11] - m[1]*m[8]*m[7] - m[3]*m[4]*m[9] + m[3]*m[8]*m[5];

  r[12] = -m[4]*m[9]*m[14] + m[4]*m[13]*m[10] + m[5]*m[8]*m[14] - m[5]*m[12]*m[10] - m[6]*m[8]*m[13] + m[6]*m[12]*m[9];
  r[13] = m[0]*m[9]*m[14] - m[0]*m[13]*m[10] - m[1]*m[8]*m[14] + m[1]*m[12]*m[10] + m[2]*m[8]*m[13] - m[2]*m[12]*m[9];
  r[14] = -m[0]*m[5]*m[14] + m[0]*m[13]*m[6] + m[1]*m[4]*m[14] - m[1]*m[12]*m[6] - m[2]*m[4]*m[13] + m[2]*m[12]*m[5];
  r[15] = m[0]*m[5]*m[10] - m[0]*m[9]*m[6] - m[1]*m[4]*m[10] + m[1]*m[8]*m[6] + m[2]*m[4]*m[9] - m[2]*m[8]*m[5];

  var det = m[0]*r[0] + m[1]*r[4] + m[2]*r[8] + m[3]*r[12];
  for (var i = 0; i < 16; i++) r[i] /= det;
  
  let rt = [ r[0], r[4], r[8], r[12],
             r[1], r[5], r[9], r[13],
             r[2], r[6], r[10], r[14],
             r[3], r[7], r[11], r[15]
             ];
  
  return rt;
}

function CreateIdentytyMatrix()
{
  return [
  1,0,0,0, //Macierz jednostkowa
  0,1,0,0,
  0,0,1,0,
  0,0,0,1
  ];
}

function CreateTranslationMatrix(tx,ty,tz)
{
  return  [
  1,0,0,0,
  0,1,0,0,
  0,0,1,0,
  tx,ty,tz,1
  ];
}

function CreateScaleMatrix(sx,sy,sz)
{
  return [
  sx,0,0,0,
  0,sy,0,0,
  0,0,sz,0,
  0,0,0,1
  ];
}

function CreateRotationZMatrix(angleZ)
{
  return [
  +Math.cos(angleZ*Math.PI/180.0),+Math.sin(angleZ*Math.PI/180.0),0,0,
  -Math.sin(angleZ*Math.PI/180.0),+Math.cos(angleZ*Math.PI/180.0),0,0,
  0,0,1,0,
  0,0,0,1
  ];
}

function CreateRotationYMatrix(angleY)
{
  return [
  +Math.cos(angleY*Math.PI/180.0),0,-Math.sin(angleY*Math.PI/180.0),0,
  0,1,0,0,
  +Math.sin(angleY*Math.PI/180.0),0,+Math.cos(angleY*Math.PI/180.0),0,
  0,0,0,1
  ];
}

function CreateRotationXMatrix(angleX)
{
  return [
  1,0,0,0,
  0,+Math.cos(angleX*Math.PI/180.0),+Math.sin(angleX*Math.PI/180.0),0,
  0,-Math.sin(angleX*Math.PI/180.0),+Math.cos(angleX*Math.PI/180.0),0,
  0,0,0,1
  ];
}

function createRect(mx,my,mz,dax,day,daz,dbx,dby,dbz)
{
  p1x = mx;             p1y = my;             p1z = mz;
  p2x = mx + dax;       p2y = my + day;       p2z = mz + daz;
  p3x = mx + dbx;       p3y = my + dby;       p3z = mz + dbz;
  p4x = mx + dax + dbx; p4y = my + day + dby; p4z = mz + daz + dbz;
  
  let vertexPosition = [p1x,p1y,p1z, p2x,p2y,p2z, p4x,p4y,p4z,  //Pierwszy trójkąt
                        p1x,p1y,p1z, p4x,p4y,p4z, p3x,p3y,p3z]; //Drugi trójkąt
                        
  return vertexPosition;
}

function createNormal(p1x,p1y,p1z,p2x,p2y,p2z,p3x,p3y,p3z) //Wyznaczenie wektora normalnego dla trójkąta
{
  let v1x = p2x - p1x;
  let v1y = p2y - p1y;
  let v1z = p2z - p1z;
  
  let v2x = p3x - p1x;
  let v2y = p3y - p1y;
  let v2z = p3z - p1z;
  
  let v3x =  v1y*v2z - v1z*v2y;
  let v3y =  v1z*v2x - v1x*v2z;
  let v3z =  v1x*v2y - v1y*v2x;
  
  vl = Math.sqrt(v3x*v3x+v3y*v3y+v3z*v3z); //Obliczenie długości wektora
   
  v3x/=vl; //Normalizacja na zakreś -1 1
  v3y/=vl;
  v3z/=vl;
  
  let vertexNormal = [v3x,v3y,v3z, v3x,v3y,v3z, v3x,v3y,v3z];
  return vertexNormal;
}

function CreateBox(x,y,z,dx,dy,dz)
{
  //Opis sceny 3D, położenie punktów w przestrzeni 3D w formacie X,Y,Z 
  let vertexPosition = []; //Każdy punkt 3 składowe - X1,Y1,Z1
  let vertexNormal = [];
  let indexes = [];
  
  vertexPosition.push(...[-1,-1,+1]);
  vertexNormal.push(...[-1,-1,+1]);

  vertexPosition.push(...[+1,-1,+1]);
  vertexNormal.push(...[+1,-1,+1]);

  vertexPosition.push(...[+1,+1,+1]);
  vertexNormal.push(...[+1,+1,+1]);

  vertexPosition.push(...[-1,+1,+1]);
  vertexNormal.push(...[-1,+1,+1]);
  
  vertexPosition.push(...[-1,-1,-1]);
  vertexNormal.push(...[-1,-1,-1]);
  
  vertexPosition.push(...[+1,-1,-1]);
  vertexNormal.push(...[+1,-1,-1]);
  
  vertexPosition.push(...[+1,+1,-1]);
  vertexNormal.push(...[+1,+1,-1]);

  vertexPosition.push(...[-1,+1,-1]);
  vertexNormal.push(...[-1,+1,-1]);

  indexes.push(...[0,1,2]); //Pierwszy trójkąt
  indexes.push(...[0,2,3]); //Drugi trójkąt

  indexes.push(...[1,5,6]);
  indexes.push(...[1,6,2]);

  indexes.push(...[3,2,6]);
  indexes.push(...[3,6,7]);

  //Dodaj pozostałe trójkąty pudełka

  return [indexes, vertexPosition, vertexNormal];
}

async function* makeTextFileLineIterator(fileURL) {
  const utf8Decoder = new TextDecoder('utf-8');
  const response = await fetch(fileURL);
  const reader = response.body.getReader();
  let { value: chunk, done: readerDone } = await reader.read();
  chunk = chunk ? utf8Decoder.decode(chunk) : '';

  const re = /\n|\r|\r\n/gm;
  let startIndex = 0;
  let result;

  for (;;) {
    let result = re.exec(chunk);
    if (!result) {
      if (readerDone) {
        break;
      }
      let remainder = chunk.substr(startIndex);
      ({ value: chunk, done: readerDone } = await reader.read());
      chunk = remainder + (chunk ? utf8Decoder.decode(chunk) : '');
      startIndex = re.lastIndex = 0;
      continue;
    }
    yield chunk.substring(startIndex, result.index);
    startIndex = re.lastIndex;
  }
  if (startIndex < chunk.length) {
    // last line didn't end in a newline char
    yield chunk.substr(startIndex);
  }
}

async function LoadObj(filename)
{
  //const response = await fetch('Auto3.obj');
  //console.log(response.body);

  let rawVertexPosition = [0,0,0]; //Dodana 0 pozycja która nie będzie uzywana
  let rawVertexNormal = [0,0,0];//Dodana 0 pozycja która nie będzie uzywana
  let rawVertexCoords = [0,0];//Dodana 0 pozycja która nie będzie uzywana

  //Opis sceny 3D, położenie punktów w przestrzeni 3D w formacie X,Y,Z 
  let vertexPosition = []; //Każdy punkt 3 składowe - X1,Y1,Z1
  let vertexNormal = [];
  let vertexCoord = [];
  let indexes = [];


  let aa = new Map();
  for await (let line of makeTextFileLineIterator(filename)) {
    const lineArray = line.split(' ');
    switch(lineArray[0]) {
      case "v": { //Położenie wierzchołków
        const x = parseFloat(lineArray[1]);
        const y = parseFloat(lineArray[2]);
        const z = parseFloat(lineArray[3]);
        rawVertexPosition.push(...[x,y,z]);
        break;
      };
      case "vn": { //Wektor normalny
        const xn = parseFloat(lineArray[1]);
        const yn = parseFloat(lineArray[2]);
        const zn = parseFloat(lineArray[3]);
        rawVertexNormal.push(...[xn,yn,zn]);
        break;
      }
      case "vt": { //Współrzędne tekstury
        const u = parseFloat(lineArray[1]);
        const v = parseFloat(lineArray[2]);
        rawVertexCoords.push(...[u,v]);
        break;
      }
      case "f": { //Indeksy trójkątów
        const i0 = lineArray[1];
        const i1 = lineArray[2];
        const i2 = lineArray[3];
        for(let ii of [i0,i1,i2]) {
          if(!aa.has(ii)) { //Ten indeks nie był jeszcze przemapowany
            //console.log(ii);
            const iia = ii.split('/');
            const indexVertexPosition = parseInt(iia[0]);//Indeks w tablicy położeń wierzchołków
            const indexVertexCoord = parseInt(iia[1]); //Indeks w tablicy wspołrzędnych tekstur
            const indexVertexNormal = parseInt(iia[2]); //Indeks w tablicy wektorów normalnych
            const index = vertexPosition.length/3;
            //console.log(index);
            //Skopiuj wartości
            vertexPosition.push(rawVertexPosition[indexVertexPosition*3+0]); //Skopiowanie położenia X
            vertexPosition.push(rawVertexPosition[indexVertexPosition*3+1]); //Skopiowanie położenia Y
            vertexPosition.push(rawVertexPosition[indexVertexPosition*3+2]); //Skopiowanie położenia Z

            vertexNormal.push(rawVertexNormal[indexVertexNormal*3+0]); //Skopiowanie składowej X wektora normalnego
            vertexNormal.push(rawVertexNormal[indexVertexNormal*3+1]); //Skopiowanie składowej Y wektora normalnego
            vertexNormal.push(rawVertexNormal[indexVertexNormal*3+2]); //Skopiowanie składowej Z wektora normalnego

            vertexCoord.push(rawVertexCoords[indexVertexCoord*2+0]); //Skopiowanie składowej U wspołrzędnej tekstury
            vertexCoord.push(rawVertexCoords[indexVertexCoord*2+1]); //Skopiowanie składowej V wspołrzędnej tekstury
            aa.set(ii,index);
          }
          //console.log(aa.get(ii));
          indexes.push(aa.get(ii)) //Dodaj jego wynikowy indeks do tablicy indeksów
        }
        //rawVertexCoords.push(...[u,v]);
        break;
      }
    }
  }

  console.log(`Wczytano ${rawVertexPosition.length/3-1} wierzchołków`);
  console.log(`Wczytano ${rawVertexNormal.length/3-1} wektorów normalnych`);
  console.log(`Wczytano ${rawVertexCoords.length/2-1} współrzędnych tekstury`);

  console.log(`W efekcie mapowania stworzono ${vertexPosition.length/3} wierzchołków`);
  console.log(`W efekcie mapowania stworzono ${indexes.length} indeksów`);
 
  //console.log(indexes);
  //console.log(vertexPosition);
  return [indexes, vertexPosition, vertexNormal];
}

/////////////////////////////
// PARTICLES
//

function CreatePointCloud(sx,ex,sy,ey,sz,ez,svx,evx,svy,evy,svz,evz,sa,ea,n)
{
  let vertexPos   = [];
  let vertexVelocity = []; 
  let vertexColor = [];
  let vertexAge = [];
  for(let i=0;i<n;i++)
  {
    //Position randomization
    // let px = sx + Math.random()*(ex-sx);
    // let py = sy + Math.random()*(ey-sy);
    // let pz = sz + Math.random()*(ez-sz);

    // POSITION - randomize within a circle
    // ex, ey, ez --> used as r-adius
    //
    let a = Math.random() * 2 * Math.PI;

    let px = (ex * Math.cos(a)) * Math.random();
    let py = 0.4;
    let pz = (ez * Math.sin(a)) * Math.random();

    //Velocity randomization
    //
    // at the beginning: only vy, while vx = vz = 0
    // in updatePointCloud, when vy == 0.8? <- update vx and vz


    let vx = 0;//svx + Math.random()*(evx-svx);
    let vy = Math.abs(svy + Math.random()*(evy-svy));   //ABSOLUTE value - particles only goes UP
    let vz = 0;//svz + Math.random()*(evz-svz);
    
    let age = sa + Math.random()*(ea-sa);
    
    vertexPos.push(...[px,py,pz]);
    vertexVelocity.push(...[vx,vy,vz]);
    vertexColor.push(...[1.0,1.0,0.0]);
    
    vertexAge.push(age);
  }
  return [vertexPos,vertexVelocity,vertexColor,vertexAge];
}
//Opis sceny 3D, położenie punktów w przestrzeni 3D w formacie X,Y,Z 
let vertexPosition; //3 punkty po 3 składowe - X1,Y1,Z1, X2,Y2,Z2, X3,Y3,Z3 - 1 trójkąt
let vertexVelocity;
let vertexColor;
let vertexAge;

let savedVertexAge = [];       //maximum vertexAge of given particle

let scale = 0.2;
let particleSpeed = 2;
let particleHorizontalSpeed = 4;

//////////////////////
// POSITION - down the volcano with 
// s... starting point
// e... ending point
//
// starting X & Z on plane of a circle
//
let sx = -scale; //Położenie cząsteczek
let ex =  scale;
let sy = 0.2;
let ey =  scale;
let sz = -scale;
let ez =  scale;

let svx = -particleSpeed; //Predkości cząsteczek
let evx =  particleSpeed;
let svy = -particleSpeed;
let evy =  particleSpeed;
let svz = -particleSpeed;
let evz =  particleSpeed;
let sa = 1;//0.2; //Czas życia nowych cząsteczek
let ea = 1.6;//0.8;
function updatePointCloud(vertexPosition,vertexVelocity,vertexColor,vertexAge,n,dt, sx,ex,sy,ey,sz,ez,svx,evx,svy,evy,svz,evz,sa,ea)
{
  for(let i=0;i<n;i++)
  {
    vertexPosition[i*3+0] = vertexPosition[i*3+0] + vertexVelocity[i*3+0]*dt;
    vertexPosition[i*3+1] = Math.abs(vertexPosition[i*3+1] + vertexVelocity[i*3+1]*dt);   
    vertexPosition[i*3+2] = vertexPosition[i*3+2] + vertexVelocity[i*3+2]*dt;
    
    ///////////////////////
    // CHANGING color of the particle, based on its TTL
    //
    if(i%2 == 0){
      if(vertexAge[i] < savedVertexAge[i]*0.25){   //from red to black
        vertexColor[i*3+0] = vertexAge[i]/(savedVertexAge[i]*0.25);       // (1/4) of a whole time to get from 1.0 to 0.0
        vertexColor[i*3+1] = 0.0;
        vertexColor[i*3+2] = 0.0;
      }
      else{   //from yellow to red
        vertexColor[i*3+0] = 1.0;
        vertexColor[i*3+1] = vertexAge[i]/(savedVertexAge[i]*1.33);       // (3/4) of a whole time --> *(4/3) to get 0.0
        vertexColor[i*3+2] = 0.0;
      }
    }else{
      if(vertexAge[i] < savedVertexAge[i]*0.25){
        vertexColor[i*3+0] = vertexAge[i]/(savedVertexAge[i]*0.25);       // (1/4) of a whole time to get from 1.0 to 0.0
        vertexColor[i*3+1] = 0.0;
        vertexColor[i*3+2] = 0.0;
      }
      else if(vertexAge[i] < savedVertexAge[i]*0.75){
        vertexColor[i*3+0] = 1.0;
        vertexColor[i*3+1] = vertexAge[i]/(savedVertexAge[i]*1.33);       // (3/4) of a whole time --> *(4/3) to get 0.0
        vertexColor[i*3+2] = 0.0;
      }
      else{
        vertexColor[i*3+0] = vertexAge[i]/(savedVertexAge[i]*0.25);       // (1/4) of a whole time to get from 1.0 to 0.0
        vertexColor[i*3+1] = 0.0;
        vertexColor[i*3+2] = 0.0;
      }
    }

    //
    // EOF CHANGING color
    ///////////////////////

    // above the certain height, draw a plume - gradually
    if(vertexPosition[i*3+1] > 1.2){
      vertexVelocity[i*3+0] = (svx + Math.random()*(evx-svx)) * particleHorizontalSpeed;    // more movement SIDEWARDS
      vertexVelocity[i*3+1] = Math.abs(svy + Math.random()*(evy-svy)) /2;                   // less movement UPWARDS
      vertexVelocity[i*3+2] = (svz + Math.random()*(evz-svz)) * particleHorizontalSpeed;    // more movement SIDEWARS
    }
    else if(vertexPosition[i*3+1] > 0.8){
      vertexVelocity[i*3+0] = (svx + Math.random()*(evx-svx)) * particleHorizontalSpeed *0.75;    // more movement SIDEWARDS
      vertexVelocity[i*3+1] = Math.abs(svy + Math.random()*(evy-svy)) /1.33;                   // less movement UPWARDS
      vertexVelocity[i*3+2] = (svz + Math.random()*(evz-svz)) * particleHorizontalSpeed *0.75;    // more movement SIDEWARS
    }

    
    vertexAge[i] = vertexAge[i] - dt;
    if(vertexAge[i]<0)
    {
      // vertexPosition[i*3+0] = sx + Math.random()*(ex-sx);
      // vertexPosition[i*3+1] = sy + Math.random()*(ey-sy);
      // vertexPosition[i*3+2] = sz + Math.random()*(ez-sz);

      // POSITION - randomize within a circle
      // ex, ey, ez --> used as r-adius
      //
      let a = Math.random() * 2 * Math.PI;
      vertexPosition[i*3+0] = (ex * Math.cos(a)) * Math.random();
      vertexPosition[i*3+1] = 0.4;
      vertexPosition[i*3+2] = (ez * Math.sin(a)) * Math.random();

      //Velocity randomization
      vertexVelocity[i*3+0] = 0;//svx + Math.random()*(evx-svx);
      vertexVelocity[i*3+1] = Math.abs(svy + Math.random()*(evy-svy))*2;    //more movement UPWARDS
      vertexVelocity[i*3+2] = 0;//svz + Math.random()*(evz-svz);
      
      vertexAge[i] = sa + Math.random()*(ea-sa);
      savedVertexAge[i] = vertexAge[i];                               //IMPORTANT: needs to be updated, if new particle created
    }    
  }
  return [vertexPosition,vertexVelocity,vertexColor,vertexAge];
}

function haltPointCloud(vertexPosition, vertexVelocity, vertexColor, vertexAge, n){
  for(let i = 0; i < n; i++){
    vertexPosition[i*3+0] = 0;
    vertexPosition[i*3+1] = 0;
    vertexPosition[i*3+2] = 0;

    vertexAge[i] = -1;
  }
  return [vertexPosition, vertexVelocity, vertexColor, vertexAge];
}

//
// EOF PARTICLES
/////////////////////////////

async function startGL() 
{
  alert("StartGL");
  let canvas = document.getElementById("canvas3D"); //wyszukanie obiektu w strukturze strony 
  gl = canvas.getContext("experimental-webgl"); //pobranie kontekstu OpenGL'u z obiektu canvas
  gl.viewportWidth = canvas.width; //przypisanie wybranej przez nas rozdzielczości do systemu OpenGL
  gl.viewportHeight = canvas.height;
  
    //Kod shaderów
  const vertextShaderSource = ` //Znak akcentu z przycisku tyldy - na lewo od przycisku 1 na klawiaturze
    precision highp float;
    attribute vec3 aVertexPosition; 
    attribute vec3 aVertexNormal;
    uniform mat4 uMMatrix;
    uniform mat4 uInvMMatrix;
    uniform mat4 uVMatrix;
    uniform mat4 uPMatrix;
    varying vec3 vPos;
    varying vec3 vNormal;
    uniform float uNormalMul;
    void main(void) {
      vPos = vec3(uMMatrix * vec4(aVertexPosition, 1.0));
      gl_Position = uPMatrix * uVMatrix * vec4(vPos,1.0); //Dokonanie transformacji położenia punktów z przestrzeni 3D do przestrzeni obrazu (2D)
      vNormal = normalize(mat3(uInvMMatrix) * uNormalMul*aVertexNormal); //Obrot wektorow normalnych
    }
  `;
  const fragmentShaderSource = `
    precision highp float;
    varying vec3 vPos;
    varying vec3 vNormal;
    uniform sampler2D uSampler;
    uniform vec3 uLightPosition;
    uniform vec3 uColor;
    void main(void) {
      vec3 lightDirection = normalize(uLightPosition - vPos);
      float brightness = max(dot(vNormal,lightDirection), 0.0);
      //gl_FragColor = vec4(vColor,1.0); //Ustalenie stałego koloru wszystkich punktów sceny
      //gl_FragColor = texture2D(uSampler,vTexUV)*vec4(vColor,1.0); //Odczytanie punktu tekstury i przypisanie go jako koloru danego punktu renderowaniej figury
      //gl_FragColor = vec4((vNormal+vec3(1.0,1.0,1.0))/2.0,1.0); 
      //gl_FragColor = clamp(texture2D(uSampler,vTexUV) * vec4(brightness,brightness,brightness,1.0),0.0,1.0);
      gl_FragColor = clamp(vec4(uColor,1.0) * vec4(brightness,brightness,brightness,1.0),0.0,1.0);
      //gl_FragColor = clamp(vec4(uColor,1.0) ,0.0,1.0);
    }
  `;
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); //Stworzenie obiektu shadera 
  let vertexShader   = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource); //Podpięcie źródła kodu shader
  gl.shaderSource(vertexShader, vertextShaderSource);
  gl.compileShader(fragmentShader); //Kompilacja kodu shader
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) { //Sprawdzenie ewentualnych błedów kompilacji
    alert(gl.getShaderInfoLog(fragmentShader));
    return null;
  }
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader));
    return null;
  }
  
  shaderProgram = gl.createProgram(); //Stworzenie obiektu programu 
  gl.attachShader(shaderProgram, vertexShader); //Podpięcie obu shaderów do naszego programu wykonywanego na karcie graficznej
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) alert("Could not initialise shaders");  //Sprawdzenie ewentualnych błedów
  
  //Opis sceny 3D, położenie punktów w przestrzeni 3D w formacie X,Y,Z 
  let vertexPosition; //3 punkty po 3 składowe - X1,Y1,Z1, X2,Y2,Z2, X3,Y3,Z3 - 1 trójkąt
  let vertexNormal;
  let indexes;
  
  //[vertexPosition, vertexColor, vertexCoords, vertexNormal] = CreateShpere(0,0,0,2, 6, 12); 
  //[indexes, vertexPosition, vertexNormal] = CreateBox(0,0,0,1,1,1);
  //[indexes, vertexPosition, vertexNormal] = CreateTetris();
  [indexes, vertexPosition, vertexNormal] = await LoadObj('./lightSrc/lightSrc.obj');
  //[indexes, vertexPosition, vertexNormal] = await LoadObj('katedra.obj');
  //[indexes, vertexPosition, vertexNormal] = await LoadObj('Tetris3.obj');
  //[indexes, vertexPosition, vertexNormal] = await LoadObj('cube.obj');
  //const ret = LoadObj('Auto3.obj');
  //ret.value
  
  vertexPositionBuffer = gl.createBuffer(); //Stworzenie tablicy w pamieci karty graficznej
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition), gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3; //zdefiniowanie liczby współrzednych per wierzchołek
  vertexPositionBuffer.numItems = vertexPosition.length/9; //Zdefinoiowanie liczby trójkątów w naszym buforze
  
  vertexNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormal), gl.STATIC_DRAW);
  vertexNormalBuffer.itemSize = 3;
  vertexNormalBuffer.numItems = vertexNormal.length/9;
  
  indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
  indexBuffer.numItems = indexes.length;

  //Macierze opisujące położenie wirtualnej kamery w przestrzenie 3D
  let aspect = gl.viewportWidth/gl.viewportHeight;
  let fov = 45.0 * Math.PI / 180.0; //Określenie pola widzenia kamery
  let zFar = 100.0; //Ustalenie zakresów renderowania sceny 3D (od obiektu najbliższego zNear do najdalszego zFar)
  let zNear = 0.1;
  uPMatrix = [
   1.0/(aspect*Math.tan(fov/2)),0                           ,0                         ,0                            ,
   0                         ,1.0/(Math.tan(fov/2))         ,0                         ,0                            ,
   0                         ,0                           ,-(zFar+zNear)/(zFar-zNear)  , -1,
   0                         ,0                           ,-(2*zFar*zNear)/(zFar-zNear) ,0.0,
  ];

  ///////////////////////////////////////////////////
  // 2nd SHADER PROGRAM - volcano
  //

  //Kod shaderów
  const vertexShaderSourceVolcano = ` //Znak akcentu z przycisku tyldy - na lewo od przycisku 1 na klawiaturze
    precision highp float;
    attribute vec3 aVertexPosition; 
    attribute vec3 aVertexNormal;
    uniform mat4 uMMatrix;
    uniform mat4 uInvMMatrix;
    uniform mat4 uVMatrix;
    uniform mat4 uPMatrix;
    varying vec3 vPos;
    varying vec3 vNormal;
    uniform float uNormalMul;
    void main(void) {
      vPos = vec3(uMMatrix * vec4(aVertexPosition, 1.0));
      gl_Position = uPMatrix * uVMatrix * vec4(vPos,1.0); //Dokonanie transformacji położenia punktów z przestrzeni 3D do przestrzeni obrazu (2D)
      vNormal = normalize(mat3(uInvMMatrix) * uNormalMul*aVertexNormal); //Obrot wektorow normalnych
    }
  `;
  const fragmentShaderSourceVolcano = `
    precision highp float;
    varying vec3 vPos;
    varying vec3 vNormal;
    uniform sampler2D uSampler;
    uniform vec3 uLightPosition;
    uniform vec3 uColor;
    void main(void) {
      vec3 lightDirection = normalize(uLightPosition - vPos);
      float brightness = max(dot(vNormal,lightDirection), 0.0);
      //gl_FragColor = vec4(vColor,1.0); //Ustalenie stałego koloru wszystkich punktów sceny
      //gl_FragColor = texture2D(uSampler,vTexUV)*vec4(vColor,1.0); //Odczytanie punktu tekstury i przypisanie go jako koloru danego punktu renderowaniej figury
      //gl_FragColor = vec4((vNormal+vec3(1.0,1.0,1.0))/2.0,1.0); 
      //gl_FragColor = clamp(texture2D(uSampler,vTexUV) * vec4(brightness,brightness,brightness,1.0),0.0,1.0);
      gl_FragColor = clamp(vec4(uColor,1.0) * vec4(brightness,brightness,brightness,1.0),0.0,1.0);
      //gl_FragColor = clamp(vec4(uColor,1.0) ,0.0,1.0);
    }
  `;

  let fragmentShaderVolcano = gl.createShader(gl.FRAGMENT_SHADER); //Stworzenie obiektu shadera 
  let vertexShaderVolcano   = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(fragmentShaderVolcano, fragmentShaderSourceVolcano); //Podpięcie źródła kodu shader
  gl.shaderSource(vertexShaderVolcano, vertexShaderSourceVolcano);
  gl.compileShader(fragmentShaderVolcano); //Kompilacja kodu shader
  gl.compileShader(vertexShaderVolcano);
  if (!gl.getShaderParameter(fragmentShaderVolcano, gl.COMPILE_STATUS)) { //Sprawdzenie ewentualnych błedów kompilacji
    alert(gl.getShaderInfoLog(fragmentShaderVolcano));
    return null;
  }
  if (!gl.getShaderParameter(vertexShaderVolcano, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShaderVolcano));
    return null;
  }
  
  shaderProgramVolcano = gl.createProgram(); //Stworzenie obiektu programu 
  gl.attachShader(shaderProgramVolcano, vertexShaderVolcano); //Podpięcie obu shaderów do naszego programu wykonywanego na karcie graficznej
  gl.attachShader(shaderProgramVolcano, fragmentShaderVolcano);
  gl.linkProgram(shaderProgramVolcano);
  if (!gl.getProgramParameter(shaderProgramVolcano, gl.LINK_STATUS)) alert("Could not initialise shaders");  //Sprawdzenie ewentualnych błedów
  
  //Opis sceny 3D, położenie punktów w przestrzeni 3D w formacie X,Y,Z 
  let vertexPositionVolcano; //3 punkty po 3 składowe - X1,Y1,Z1, X2,Y2,Z2, X3,Y3,Z3 - 1 trójkąt
  let vertexNormalVolcano;
  let indexesVolcano;

  [indexesVolcano, vertexPositionVolcano, vertexNormalVolcano] = await LoadObj('./wulkan_src/wulkan.obj');

  vertexPositionBufferVolcano = gl.createBuffer(); //Stworzenie tablicy w pamieci karty graficznej
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBufferVolcano);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionVolcano), gl.STATIC_DRAW);
  vertexPositionBufferVolcano.itemSize = 3; //zdefiniowanie liczby współrzednych per wierzchołek
  vertexPositionBufferVolcano.numItems = vertexPositionVolcano.length/9; //Zdefinoiowanie liczby trójkątów w naszym buforze
  
  vertexNormalBufferVolcano = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBufferVolcano);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormalVolcano), gl.STATIC_DRAW);
  vertexNormalBufferVolcano.itemSize = 3;
  vertexNormalBufferVolcano.numItems = vertexNormalVolcano.length/9;
  
  indexBufferVolcano = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferVolcano);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexesVolcano), gl.STATIC_DRAW);
  indexBufferVolcano.numItems = indexesVolcano.length;

  /////////////////////////////
  // 3rd shaderProgram - plane under the volcano
  //

  //Kod shaderów
  const vertexShaderSourcePlane = ` //Znak akcentu z przycisku tyldy - na lewo od przycisku 1 na klawiaturze
    precision highp float;
    attribute vec3 aVertexPosition; 
    attribute vec3 aVertexNormal;
    uniform mat4 uMMatrix;
    uniform mat4 uInvMMatrix;
    uniform mat4 uVMatrix;
    uniform mat4 uPMatrix;
    varying vec3 vPos;
    varying vec3 vNormal;
    uniform float uNormalMul;
    void main(void) {
      vPos = vec3(uMMatrix * vec4(aVertexPosition, 1.0));
      gl_Position = uPMatrix * uVMatrix * vec4(vPos,1.0); //Dokonanie transformacji położenia punktów z przestrzeni 3D do przestrzeni obrazu (2D)
      vNormal = normalize(mat3(uInvMMatrix) * uNormalMul*aVertexNormal); //Obrot wektorow normalnych
    }
  `;
  const fragmentShaderSourcePlane = `
    precision highp float;
    varying vec3 vPos;
    varying vec3 vNormal;
    uniform sampler2D uSampler;
    uniform vec3 uLightPosition;
    uniform vec3 uColor;
    void main(void) {
      vec3 lightDirection = normalize(uLightPosition - vPos);
      float brightness = max(dot(vNormal,lightDirection), 0.0);
      //gl_FragColor = vec4(vColor,1.0); //Ustalenie stałego koloru wszystkich punktów sceny
      //gl_FragColor = texture2D(uSampler,vTexUV)*vec4(vColor,1.0); //Odczytanie punktu tekstury i przypisanie go jako koloru danego punktu renderowaniej figury
      //gl_FragColor = vec4((vNormal+vec3(1.0,1.0,1.0))/2.0,1.0); 
      //gl_FragColor = clamp(texture2D(uSampler,vTexUV) * vec4(brightness,brightness,brightness,1.0),0.0,1.0);
      gl_FragColor = clamp(vec4(uColor,1.0) * vec4(brightness,brightness,brightness,1.0),0.0,1.0);
      //gl_FragColor = clamp(vec4(uColor,1.0) ,0.0,1.0);
    }
  `;

  let fragmentShaderPlane = gl.createShader(gl.FRAGMENT_SHADER); //Stworzenie obiektu shadera 
  let vertexShaderPlane   = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(fragmentShaderPlane, fragmentShaderSourcePlane); //Podpięcie źródła kodu shader
  gl.shaderSource(vertexShaderPlane, vertexShaderSourcePlane);
  gl.compileShader(fragmentShaderPlane); //Kompilacja kodu shader
  gl.compileShader(vertexShaderPlane);
  if (!gl.getShaderParameter(fragmentShaderPlane, gl.COMPILE_STATUS)) { //Sprawdzenie ewentualnych błedów kompilacji
    alert(gl.getShaderInfoLog(fragmentShaderPlane));
    return null;
  }
  if (!gl.getShaderParameter(vertexShaderPlane, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShaderPlane));
    return null;
  }
  
  shaderProgramPlane = gl.createProgram(); //Stworzenie obiektu programu 
  gl.attachShader(shaderProgramPlane, vertexShaderPlane); //Podpięcie obu shaderów do naszego programu wykonywanego na karcie graficznej
  gl.attachShader(shaderProgramPlane, fragmentShaderPlane);
  gl.linkProgram(shaderProgramPlane);
  if (!gl.getProgramParameter(shaderProgramPlane, gl.LINK_STATUS)) alert("Could not initialise shaders");  //Sprawdzenie ewentualnych błedów
  
  //Opis sceny 3D, położenie punktów w przestrzeni 3D w formacie X,Y,Z 
  let vertexPositionPlane; //3 punkty po 3 składowe - X1,Y1,Z1, X2,Y2,Z2, X3,Y3,Z3 - 1 trójkąt
  let vertexNormalPlane;
  let indexesPlane;

  [indexesPlane, vertexPositionPlane, vertexNormalPlane] = await LoadObj('./wulkan_src/plane.obj');

  vertexPositionBufferPlane = gl.createBuffer(); //Stworzenie tablicy w pamieci karty graficznej
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBufferPlane);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionPlane), gl.STATIC_DRAW);
  vertexPositionBufferPlane.itemSize = 3; //zdefiniowanie liczby współrzednych per wierzchołek
  vertexPositionBufferPlane.numItems = vertexPositionPlane.length/9; //Zdefinoiowanie liczby trójkątów w naszym buforze
  
  vertexNormalBufferPlane = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBufferPlane);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormalPlane), gl.STATIC_DRAW);
  vertexNormalBufferPlane.itemSize = 3;
  vertexNormalBufferPlane.numItems = vertexNormalPlane.length/9;
  
  indexBufferPlane = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferPlane);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexesPlane), gl.STATIC_DRAW);
  indexBufferPlane.numItems = indexesPlane.length;


  /////////////////////////////
  // PARTICLES
  //

  //Kod shaderów
  const vertexShaderSourceParticle = ` //Znak akcentu z przycisku tyldy - na lewo od przycisku 1 na klawiaturze
    precision highp float;
    attribute vec3 aVertexPosition; 
    attribute vec3 aVertexColor;
    uniform mat4 uMMatrix;
    uniform mat4 uVMatrix;
    uniform mat4 uPMatrix;
    varying vec3 vPos;
    varying vec3 vColor;
    void main(void) {
      vPos = vec3(uMMatrix * vec4(aVertexPosition, 1.0));
      gl_Position = uPMatrix * uVMatrix * vec4(vPos,1.0); //Dokonanie transformacji położenia punktów z przestrzeni 3D do przestrzeni obrazu (2D)
      vColor = aVertexColor;
      gl_PointSize = 5.0;
    }
  `;
  const fragmentShaderSourceParticle = `
    precision highp float;
    varying vec3 vPos;
    varying vec3 vColor;
    void main(void) {
      gl_FragColor = vec4(vColor,1.0);
    }
  `;
  let fragmentShaderParticle = gl.createShader(gl.FRAGMENT_SHADER); //Stworzenie obiektu shadera 
  let vertexShaderParticle   = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(fragmentShaderParticle, fragmentShaderSourceParticle); //Podpięcie źródła kodu shader
  gl.shaderSource(vertexShaderParticle, vertexShaderSourceParticle);
  gl.compileShader(fragmentShaderParticle); //Kompilacja kodu shader
  gl.compileShader(vertexShaderParticle);
  if (!gl.getShaderParameter(fragmentShaderParticle, gl.COMPILE_STATUS)) { //Sprawdzenie ewentualnych błedów kompilacji
    alert(gl.getShaderInfoLog(fragmentShaderParticle));
    return null;
  }
  if (!gl.getShaderParameter(vertexShaderParticle, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShaderParticle));
    return null;
  }
  
  shaderProgramParticle = gl.createProgram(); //Stworzenie obiektu programu 
  gl.attachShader(shaderProgramParticle, vertexShaderParticle); //Podpięcie obu shaderów do naszego programu wykonywanego na karcie graficznej
  gl.attachShader(shaderProgramParticle, fragmentShaderParticle);
  gl.linkProgram(shaderProgramParticle);
  if (!gl.getProgramParameter(shaderProgramParticle, gl.LINK_STATUS)) alert("Could not initialise shaders");  //Sprawdzenie ewentualnych błedów
  
  //[vertexPosition, vertexColor, vertexCoords, vertexNormal] = CreateShpere(0,0,0,2, 6, 12); 
  [vertexPositionParticle, vertexVelocityParticle, vertexColorParticle, vertexAge] = CreatePointCloud(sx,ex,sy,ey,sz,ez,svx,evx,svy,evy,svz,evz,sa,ea,PARTICLE_NUMBER);
  
  // INFO: copy array contents, NOT pointer
  //
  savedVertexAge = [...vertexAge];

  //console.log(vertexCoords);
  vertexPositionBufferParticle = gl.createBuffer(); //Stworzenie tablicy w pamieci karty graficznej
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBufferParticle);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionParticle), gl.STATIC_DRAW);
  vertexPositionBufferParticle.itemSize = 3; //zdefiniowanie liczby współrzednych per wierzchołek
  vertexPositionBufferParticle.numItems = vertexPositionParticle.length/9; //Zdefinoiowanie liczby punktów w naszym buforze
  
  vertexColorBufferParticle = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBufferParticle);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColorParticle), gl.STATIC_DRAW);
  vertexColorBufferParticle.itemSize = 3;
  vertexColorBufferParticle.numItems = vertexColorParticle.length/9;

  //
  // EOF PARTICLES
  /////////////////////////////


  Tick();
} 
//let angle = 45.0; //Macierz transformacji świata - określenie położenia kamery 

var angleZ = 0.0;
var angleY = -30.0;
var angleX = 0.0;
var KameraPositionZ = -5.0;
var KameraPositionY = -1;

var Object1PositionX = 0.0;
var Object1PositionY = 0.0;
var Object1PositionZ = 0.0;

var Object1AngleZ = 0.0;

var Object2PositionX = 1.0;
var Object2PositionY = 0.0;
var Object2PositionZ = 0.0;

var Object2AngleZ = 0.0;

var Object3PositionX = 1.0;
var Object3PositionY = 0.0;
var Object3PositionZ = 0.0;

var Object3AngleZ = 0.0;

var LightSize = 0.1;
var Object1Sizedx = 0.5;
var Object1Sizedy = 0.5;
var Object1Sizedz = 0.5;
var Object2Sizedx = 0.2;
var Object2Sizedy = 0.2;
var Object2Sizedz = 0.2;
var Object3Sizedx = 0.4;
var Object3Sizedy = 0.4;
var Object3Sizedz = 0.4;

var LightPositionX = 0;
var LightPositionY = 20;
var LightPositionZ = +4;

var volcanoSize = 1;
var LightPosX2 = 0;
var LightPosY2 = 0;
var LightPosZ2 = 0;

/////////////////////
// PLANE
//
var planeSize = 1;


// PARTICLES

var CloudPositionX = 0.0;
var CloudPositionY = 0.0;
var CloudPositionZ = 0.0;


function Tick()
{ 
  let uMMatrix0 = CreateIdentytyMatrix(); 
  let uMMatrix1 = CreateIdentytyMatrix();

  let uMMatrixVolcano = CreateIdentytyMatrix(); 
  let uMMatrixPlane = CreateIdentytyMatrix();
  let uMMatrixParticles = CreateIdentytyMatrix();
  
  let uVMatrix = CreateIdentytyMatrix();
  
  
  uVMatrix = MatrixMul(uVMatrix,CreateRotationXMatrix(angleX));
  uVMatrix = MatrixMul(uVMatrix,CreateRotationYMatrix(angleY));
  uVMatrix = MatrixMul(uVMatrix,CreateRotationZMatrix(angleZ));
  uVMatrix = MatrixMul(uVMatrix,CreateTranslationMatrix(0,KameraPositionY,KameraPositionZ));
  
  uMMatrix1 = MatrixMul(uMMatrix1,CreateScaleMatrix(Object1Sizedx,Object1Sizedy,Object1Sizedz));
  uMMatrix1 = MatrixMul(uMMatrix1,CreateTranslationMatrix(Object1Sizedx,0.0,0.0)); 
  uMMatrix1 = MatrixMul(uMMatrix1,CreateRotationZMatrix(Object1AngleZ));
  uMMatrix1 = MatrixMul(uMMatrix1,CreateTranslationMatrix(Object1PositionX,Object1PositionY,Object1PositionZ));  
  


  
  uMMatrix0 = MatrixMul(uMMatrix0,CreateScaleMatrix(LightSize,LightSize,LightSize));
  uMMatrix0 = MatrixMul(uMMatrix0,CreateTranslationMatrix(LightPositionX,LightPositionY,LightPositionZ));

  uMMatrixVolcano = MatrixMul(uMMatrixVolcano, CreateScaleMatrix(volcanoSize, volcanoSize, volcanoSize));
  uMMatrixVolcano = MatrixMul(uMMatrixVolcano, CreateTranslationMatrix(LightPosX2, LightPosY2, LightPosZ2));

  uMMatrixPlane = MatrixMul(uMMatrixPlane, CreateScaleMatrix(planeSize, planeSize, planeSize));  

  /////////////////////////////////
  // PARTICLE SYSTEM
  //

  uMMatrixParticles = MatrixMul(uMMatrixParticles, CreateTranslationMatrix(CloudPositionX, CloudPositionY, CloudPositionZ));

  //
  // EOF PARTICLES
  /////////////////////////////////
  
  //alert(uPMatrix);
  
  //Render Scene
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); 
  gl.clearColor(0.549,0.745,0.8392,1.0); //Wyczyszczenie obrazu kolorem           //INFO: background color
  gl.clearDepth(1.0);             //Wyczyścienie bufora głebi najdalszym planem
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(shaderProgram)   //Użycie przygotowanego programu shaderowego
  
  gl.enable(gl.DEPTH_TEST);           // Włączenie testu głębi - obiekty bliższe mają przykrywać obiekty dalsze
  gl.depthFunc(gl.LEQUAL);            // 
  
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uPMatrix"), false, new Float32Array(uPMatrix)); //Wgranie macierzy kamery do pamięci karty graficznej
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uVMatrix"), false, new Float32Array(uVMatrix));
  gl.uniform1f(gl.getUniformLocation(shaderProgram, "uNormalMul"),1.0);
  gl.uniform3f(gl.getUniformLocation(shaderProgram, "uLightPosition"),LightPositionX,LightPositionY,LightPositionZ);
  
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexPosition"));  //Przekazanie położenia
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexPosition"), vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexNormal"));  //Przekazywanie wektorów normalnych
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexNormal"), vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  
  //Obiekt Światła
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMMatrix"), false, new Float32Array(uMMatrix0));
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uInvMMatrix"), false, new Float32Array(MatrixTransposeInverse(uMMatrix0)));
  gl.uniform3f(gl.getUniformLocation(shaderProgram, "uColor"),1.0,1.0,0.0);
  gl.uniform1f(gl.getUniformLocation(shaderProgram, "uNormalMul"),-1.0);  
  //gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania
  gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


  //////////////////////////////////////////
  // VOLCANO model
  //
  // SUPER PRO-TIP!!!!!! <-- for new objects, create new "program" - here it is shaderProgramVolcano
  //
  gl.useProgram(shaderProgramVolcano);
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgramVolcano, "uPMatrix"), false, new Float32Array(uPMatrix)); //Wgranie macierzy kamery do pamięci karty graficznej
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgramVolcano, "uVMatrix"), false, new Float32Array(uVMatrix));
  gl.uniform1f(gl.getUniformLocation(shaderProgramVolcano, "uNormalMul"),1.0);
  gl.uniform3f(gl.getUniformLocation(shaderProgramVolcano, "uLightPosition"),LightPositionX,LightPositionY,LightPositionZ);
  
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgramVolcano, "aVertexPosition"));  //Przekazanie położenia
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBufferVolcano);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgramVolcano, "aVertexPosition"), vertexPositionBufferVolcano.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgramVolcano, "aVertexNormal"));  //Przekazywanie wektorów normalnych
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBufferVolcano);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgramVolcano, "aVertexNormal"), vertexNormalBufferVolcano.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferVolcano);

  //Obiekt Światła - jak nie ma gl.uniform1f to traktowany jako zwykły obiekt, działa mi światło z pierwszego "shaderProgram"
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgramVolcano, "uMMatrix"), false, new Float32Array(uMMatrixVolcano));
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgramVolcano, "uInvMMatrix"), false, new Float32Array(MatrixTransposeInverse(uMMatrixVolcano)));
  gl.uniform3f(gl.getUniformLocation(shaderProgramVolcano, "uColor"),0.39,0.26,0.13);
  //gl.uniform1f(gl.getUniformLocation(shaderProgramVolcano, "uNormalMul"),-1.0);  
  //gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania
  gl.drawElements(gl.TRIANGLES, indexBufferVolcano.numItems, gl.UNSIGNED_SHORT, 0);

  //////////////////////////////////////////
  // VOLCANOs PLANE model
  //
  // SUPER PRO-TIP!!!!!! <-- for new objects, create new "program" - here it is shaderProgramPlane
  //
  gl.useProgram(shaderProgramPlane);
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgramPlane, "uPMatrix"), false, new Float32Array(uPMatrix)); //Wgranie macierzy kamery do pamięci karty graficznej
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgramPlane, "uVMatrix"), false, new Float32Array(uVMatrix));
  gl.uniform1f(gl.getUniformLocation(shaderProgramPlane, "uNormalMul"),1.0);
  gl.uniform3f(gl.getUniformLocation(shaderProgramPlane, "uLightPosition"),LightPositionX,LightPositionY,LightPositionZ);
  
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgramPlane, "aVertexPosition"));  //Przekazanie położenia
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBufferPlane);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgramPlane, "aVertexPosition"), vertexPositionBufferPlane.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgramPlane, "aVertexNormal"));  //Przekazywanie wektorów normalnych
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBufferPlane);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgramPlane, "aVertexNormal"), vertexNormalBufferPlane.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferPlane);

  //Obiekt Światła - jak nie ma gl.uniform1f to traktowany jako zwykły obiekt, działa mi światło z pierwszego "shaderProgram"
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgramPlane, "uMMatrix"), false, new Float32Array(uMMatrixPlane));
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgramPlane, "uInvMMatrix"), false, new Float32Array(MatrixTransposeInverse(uMMatrixPlane)));
  gl.uniform3f(gl.getUniformLocation(shaderProgramPlane, "uColor"),0.25,0.3725,0.149);
  //gl.uniform1f(gl.getUniformLocation(shaderProgramVPlane, "uNormalMul"),-1.0);  
  //gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania
  gl.drawElements(gl.TRIANGLES, indexBufferPlane.numItems, gl.UNSIGNED_SHORT, 0);

  ///////////////////////////
  // PARTICLE system data here
  //

  // PARTICLE update position
  if(ifHaltedPointCloud)
    [vertexPositionParticle, vertexVelocityParticle, vertexColorParticle, vertexAge] = haltPointCloud(vertexPositionParticle, vertexVelocityParticle, vertexColorParticle, vertexAge, PARTICLE_NUMBER);
  else
    [vertexPositionParticle, vertexVelocityParticle, vertexColorParticle, vertexAge] = updatePointCloud(vertexPositionParticle,vertexVelocityParticle,vertexColorParticle,vertexAge,PARTICLE_NUMBER,0.01, sx,ex,sy,ey,sz,ez,svx,evx,svy,evy,svz,evz,sa,ea);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBufferParticle);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionParticle), gl.STATIC_DRAW);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBufferParticle);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColorParticle), gl.STATIC_DRAW);

  // rest of PARTICLE appearance

  gl.useProgram(shaderProgramParticle);
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgramParticle, "uPMatrix"), false, new Float32Array(uPMatrix)); //Wgranie macierzy kamery do pamięci karty graficznej
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgramParticle, "uVMatrix"), false, new Float32Array(uVMatrix));  
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgramParticle, "uMMatrix"), false, new Float32Array(uMMatrixParticles));
  
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgramParticle, "aVertexPosition"));  //Przekazanie położenia
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBufferParticle);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgramParticle, "aVertexPosition"), vertexPositionBufferParticle.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgramParticle, "aVertexColor"));  //Przekazywanie wektorów colorów
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBufferParticle);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgramParticle, "aVertexColor"), vertexColorBufferParticle.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.drawArrays(gl.POINTS, 0, vertexPositionBufferParticle.numItems*vertexPositionBufferParticle.itemSize); //Faktyczne wywołanie rendrowania

  //
  // EOF PARTICLE system
  ///////////////////////////
  
  setTimeout(Tick,33);
}
function handlekeydown(e)
{
//  // Q W E A S D
//  if(e.keyCode==87) angleX=angleX+1.0; //W
//  if(e.keyCode==83) angleX=angleX-1.0; //S
//  if(e.keyCode==68) angleY=angleY+1.0;
//  if(e.keyCode==65) angleY=angleY-1.0;
//  if(e.keyCode==81) angleZ=angleZ+1.0;
//  if(e.keyCode==69) angleZ=angleZ-1.0;
 //alert(e.keyCode);
 //alert(angleX);
 
 //U I O J K L
 if(e.keyCode==76) LightPositionX=LightPositionX+0.1;
 if(e.keyCode==74) LightPositionX=LightPositionX-0.1;
 if(e.keyCode==73) LightPositionY=LightPositionY+0.1;
 if(e.keyCode==75) LightPositionY=LightPositionY-0.1;
 if(e.keyCode==85) LightPositionZ=LightPositionZ+0.1;
 if(e.keyCode==79) LightPositionZ=LightPositionZ-0.1;
 
 //Z X
 if(e.keyCode==88) Object1AngleZ=Object1AngleZ-0.1;
 if(e.keyCode==90) Object1AngleZ=Object1AngleZ+0.1;
 
 //C V
 if(e.keyCode==67) Object2AngleZ=Object2AngleZ-0.1;
 if(e.keyCode==86) Object2AngleZ=Object2AngleZ+0.1;
 
 //B N
 if(e.keyCode==66) Object3AngleZ=Object3AngleZ-0.1;
 if(e.keyCode==78) Object3AngleZ=Object3AngleZ+0.1;

 // enabling/disabling cloud
 if(e.keyCode==87) ifHaltedPointCloud = false;
 if(e.keyCode==83) ifHaltedPointCloud = true;

}