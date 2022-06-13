"use strict"
var gl;
var shaderProgram;
var uPMatrix;
var vertexPositionBuffer;
var vertexColorBuffer;
var vertexCoordsBuffer;
var vertexNormalBuffer;
var indexBuffer;
var textureBuffer;

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

async function* makeTextFileLineIterator(fileURL) { //Odczyd pliku z serwera i podział na poszczególne linie.
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
  return [indexes, vertexPosition, vertexNormal, vertexCoord];
}

function CreateTetris()
{
  //Opis sceny 3D, położenie punktów w przestrzeni 3D w formacie X,Y,Z 
  let vertexPosition = []; //Każdy punkt 3 składowe - X1,Y1,Z1
  let vertexNormal = [];
  let indexes = [];
  
  vertexPosition.push(...[0,0,0]);//Dummy nie używany wierzchołek o indeksie 0
  vertexPosition.push(...[0.000000,2.842196,-0.946183]);
vertexPosition.push(...[-1.000000,-1.000000,0.053817]);
vertexPosition.push(...[-1.000000,1.000000,0.053817]);
vertexPosition.push(...[-1.000000,-1.000000,-1.946183]);
vertexPosition.push(...[-1.000000,1.000000,-1.946183]);
vertexPosition.push(...[1.000000,-1.000000,0.053817]);
vertexPosition.push(...[1.000000,1.000000,0.053817]);
vertexPosition.push(...[1.000000,-1.000000,-1.946183]);
vertexPosition.push(...[1.000000,1.000000,-1.946183]);
vertexPosition.push(...[-1.000000,1.000000,-3.735654]);
vertexPosition.push(...[-1.000000,-1.000000,-3.735654]);
vertexPosition.push(...[1.000000,-1.000000,-3.735654]);
vertexPosition.push(...[1.000000,1.000000,-3.735654]);
vertexPosition.push(...[-0.876560,1.109610,-5.393824]);
vertexPosition.push(...[-0.922474,-0.714158,-4.574212]);
vertexPosition.push(...[0.876560,-1.109610,-5.353374]);
vertexPosition.push(...[0.922474,0.714158,-6.172986]);
vertexPosition.push(...[3.149849,1.000000,-1.946183]);
vertexPosition.push(...[3.149849,-1.000000,-1.946183]);
vertexPosition.push(...[3.149849,1.000000,-3.735654]);
vertexPosition.push(...[3.149849,-1.000000,-3.735654]);
vertexPosition.push(...[-0.614561,2.524491,-2.291049]);
vertexPosition.push(...[0.614561,2.524491,-2.291049]);
vertexPosition.push(...[-0.614561,2.524491,-3.390788]);
vertexPosition.push(...[0.614561,2.524491,-3.390788]);
vertexPosition.push(...[-0.614561,4.149685,-2.291049]);
vertexPosition.push(...[0.614561,4.149685,-2.291049]);
vertexPosition.push(...[-0.614561,4.149685,-3.390788]);
vertexPosition.push(...[0.614561,4.149685,-3.390788]);
vertexPosition.push(...[-0.124355,4.682039,-2.729654]);
vertexPosition.push(...[0.124355,4.682039,-2.729654]);
vertexPosition.push(...[-0.124355,4.682039,-2.952183]);
vertexPosition.push(...[0.124355,4.682039,-2.952183]);
vertexPosition.push(...[-0.614561,3.267054,-3.054775]);
vertexPosition.push(...[0.614561,3.267054,-3.054775]);
vertexPosition.push(...[-0.614561,4.034309,-3.054775]);
vertexPosition.push(...[0.614561,4.034309,-3.054775]);
vertexPosition.push(...[0.614561,3.267054,-2.613038]);
vertexPosition.push(...[-0.614561,3.267054,-2.613038]);
vertexPosition.push(...[0.614561,4.034309,-2.613038]);
vertexPosition.push(...[-0.614561,4.034309,-2.613038]);
vertexPosition.push(...[0.272955,3.267054,-2.291049]);
vertexPosition.push(...[0.276415,3.267054,-2.613038]);
vertexPosition.push(...[0.284771,3.267054,-3.390788]);
vertexPosition.push(...[0.281161,3.267054,-3.054775]);
vertexPosition.push(...[0.276415,4.034309,-2.613038]);
vertexPosition.push(...[0.272955,4.034309,-2.291049]);
vertexPosition.push(...[0.284771,4.034309,-3.390788]);
vertexPosition.push(...[0.281161,4.034309,-3.054775]);
vertexPosition.push(...[0.279868,4.034309,-2.934489]);
vertexPosition.push(...[-0.165349,3.267054,-2.613038]);
vertexPosition.push(...[-0.168808,3.267054,-2.291049]);
vertexPosition.push(...[-0.160603,3.267054,-3.054775]);
vertexPosition.push(...[-0.163608,3.267054,-2.775107]);
vertexPosition.push(...[-0.156993,3.267054,-3.390788]);
vertexPosition.push(...[-0.168808,4.034309,-2.291049]);
vertexPosition.push(...[-0.165349,4.034309,-2.613038]);
vertexPosition.push(...[-0.156993,4.034309,-3.390788]);
vertexPosition.push(...[-0.160603,4.034309,-3.054775]);
vertexPosition.push(...[0.109184,4.034309,-3.054775]);
vertexPosition.push(...[0.011606,3.267054,-3.054775]);
vertexPosition.push(...[0.028871,1.000000,-1.091329]);
vertexPosition.push(...[0.000000,1.000000,-1.094173]);
vertexPosition.push(...[0.056633,1.000000,-1.082908]);
vertexPosition.push(...[0.082219,1.000000,-1.069232]);
vertexPosition.push(...[0.104645,1.000000,-1.050827]);
vertexPosition.push(...[0.123049,1.000000,-1.028401]);
vertexPosition.push(...[0.136725,1.000000,-1.002816]);
vertexPosition.push(...[0.145146,1.000000,-0.975054]);
vertexPosition.push(...[0.147990,1.000000,-0.946183]);
vertexPosition.push(...[0.145146,1.000000,-0.917311]);
vertexPosition.push(...[0.136725,1.000000,-0.889549]);
vertexPosition.push(...[0.123049,1.000000,-0.863964]);
vertexPosition.push(...[0.104645,1.000000,-0.841538]);
vertexPosition.push(...[0.082219,1.000000,-0.823134]);
vertexPosition.push(...[0.056633,1.000000,-0.809458]);
vertexPosition.push(...[0.028871,1.000000,-0.801036]);
vertexPosition.push(...[-0.000000,1.000000,-0.798193]);
vertexPosition.push(...[-0.028871,1.000000,-0.801036]);
vertexPosition.push(...[-0.056633,1.000000,-0.809458]);
vertexPosition.push(...[-0.082219,1.000000,-0.823134]);
vertexPosition.push(...[-0.104645,1.000000,-0.841538]);
vertexPosition.push(...[-0.123049,1.000000,-0.863964]);
vertexPosition.push(...[-0.136725,1.000000,-0.889550]);
vertexPosition.push(...[-0.145146,1.000000,-0.917311]);
vertexPosition.push(...[-0.147990,1.000000,-0.946183]);
vertexPosition.push(...[-0.145146,1.000000,-0.975054]);
vertexPosition.push(...[-0.136725,1.000000,-1.002816]);
vertexPosition.push(...[-0.123049,1.000000,-1.028402]);
vertexPosition.push(...[-0.104644,1.000000,-1.050828]);
vertexPosition.push(...[-0.082219,1.000000,-1.069232]);
vertexPosition.push(...[-0.056633,1.000000,-1.082908]);
vertexPosition.push(...[-0.028871,1.000000,-1.091329]);


indexes.push(...[3,4,2]);
indexes.push(...[9,22,5]);
indexes.push(...[9,6,8]);
indexes.push(...[7,2,6]);
indexes.push(...[8,2,4]);
indexes.push(...[13,14,10]);
indexes.push(...[5,11,4]);
indexes.push(...[9,20,13]);
indexes.push(...[4,12,8]);
indexes.push(...[15,17,16]);
indexes.push(...[10,15,11]);
indexes.push(...[13,16,17]);
indexes.push(...[12,15,16]);
indexes.push(...[19,20,18]);
indexes.push(...[12,19,8]);
indexes.push(...[8,18,9]);
indexes.push(...[13,21,12]);
indexes.push(...[13,23,9]);
indexes.push(...[10,25,13]);
indexes.push(...[5,24,10]);
indexes.push(...[28,30,32]);
indexes.push(...[31,32,30]);
indexes.push(...[28,33,29]);
indexes.push(...[29,31,27]);
indexes.push(...[27,30,26]);
indexes.push(...[35,38,23]);
indexes.push(...[37,27,40]);
indexes.push(...[24,22,34]);
indexes.push(...[26,36,41]);
indexes.push(...[46,42,47]);
indexes.push(...[48,45,49]);
indexes.push(...[57,52,51]);
indexes.push(...[59,55,58]);
indexes.push(...[55,53,61]);
indexes.push(...[42,51,52]);
indexes.push(...[47,57,46]);
indexes.push(...[48,49,60]);
indexes.push(...[22,23,52]);
indexes.push(...[27,56,47]);
indexes.push(...[55,44,25]);
indexes.push(...[29,58,28]);
indexes.push(...[34,59,36]);
indexes.push(...[35,49,45]);
indexes.push(...[40,43,46]);
indexes.push(...[41,51,39]);
indexes.push(...[38,45,43]);
indexes.push(...[39,51,54]);
indexes.push(...[61,53,54]);
indexes.push(...[43,45,61]);
indexes.push(...[36,57,41]);
indexes.push(...[40,46,50]);
indexes.push(...[50,60,49]);
indexes.push(...[50,57,60]);
indexes.push(...[62,63,1]);
indexes.push(...[1,64,62]);
indexes.push(...[1,65,64]);
indexes.push(...[1,66,65]);
indexes.push(...[1,67,66]);
indexes.push(...[1,68,67]);
indexes.push(...[1,69,68]);
indexes.push(...[1,70,69]);
indexes.push(...[70,1,71]);
indexes.push(...[71,1,72]);
indexes.push(...[72,1,73]);
indexes.push(...[73,1,74]);
indexes.push(...[1,75,74]);
indexes.push(...[1,76,75]);
indexes.push(...[1,77,76]);
indexes.push(...[77,1,78]);
indexes.push(...[78,1,79]);
indexes.push(...[79,1,80]);
indexes.push(...[80,1,81]);
indexes.push(...[81,1,82]);
indexes.push(...[83,82,1]);
indexes.push(...[84,83,1]);
indexes.push(...[85,84,1]);
indexes.push(...[86,85,1]);
indexes.push(...[1,87,86]);
indexes.push(...[1,88,87]);
indexes.push(...[1,89,88]);
indexes.push(...[1,90,89]);
indexes.push(...[91,90,1]);
indexes.push(...[92,91,1]);
indexes.push(...[93,92,1]);
indexes.push(...[63,93,1]);
indexes.push(...[5,93,63]);
indexes.push(...[7,77,78]);
indexes.push(...[3,5,4]);
indexes.push(...[9,23,22]);
indexes.push(...[9,7,6]);
indexes.push(...[7,3,2]);
indexes.push(...[8,6,2]);
indexes.push(...[13,17,14]);
indexes.push(...[5,10,11]);
indexes.push(...[9,18,20]);
indexes.push(...[4,11,12]);
indexes.push(...[15,14,17]);
indexes.push(...[10,14,15]);
indexes.push(...[13,12,16]);
indexes.push(...[12,11,15]);
indexes.push(...[19,21,20]);
indexes.push(...[12,21,19]);
indexes.push(...[8,19,18]);
indexes.push(...[13,20,21]);
indexes.push(...[13,25,23]);
indexes.push(...[10,24,25]);
indexes.push(...[5,22,24]);
indexes.push(...[28,26,30]);
indexes.push(...[31,33,32]);
indexes.push(...[28,32,33]);
indexes.push(...[29,33,31]);
indexes.push(...[27,31,30]);
indexes.push(...[40,27,38]);
indexes.push(...[27,23,38]);
indexes.push(...[25,29,35]);
indexes.push(...[29,37,35]);
indexes.push(...[25,35,23]);
indexes.push(...[37,29,27]);
indexes.push(...[34,36,28]);
indexes.push(...[22,26,39]);
indexes.push(...[26,41,39]);
indexes.push(...[34,28,24]);
indexes.push(...[22,39,34]);
indexes.push(...[26,28,36]);
indexes.push(...[46,43,42]);
indexes.push(...[48,44,45]);
indexes.push(...[57,56,52]);
indexes.push(...[59,53,55]);
indexes.push(...[61,45,44]);
indexes.push(...[44,55,61]);
indexes.push(...[42,43,51]);
indexes.push(...[47,56,57]);
indexes.push(...[59,58,60]);
indexes.push(...[58,48,60]);
indexes.push(...[56,26,52]);
indexes.push(...[26,22,52]);
indexes.push(...[23,27,42]);
indexes.push(...[27,47,42]);
indexes.push(...[23,42,52]);
indexes.push(...[27,26,56]);
indexes.push(...[44,48,29]);
indexes.push(...[24,28,55]);
indexes.push(...[28,58,55]);
indexes.push(...[44,29,25]);
indexes.push(...[24,55,25]);
indexes.push(...[29,48,58]);
indexes.push(...[34,53,59]);
indexes.push(...[35,37,49]);
indexes.push(...[40,38,43]);
indexes.push(...[41,57,51]);
indexes.push(...[38,35,45]);
indexes.push(...[53,34,54]);
indexes.push(...[34,39,54]);
indexes.push(...[61,54,43]);
indexes.push(...[54,51,43]);
indexes.push(...[36,59,57]);
indexes.push(...[50,49,37]);
indexes.push(...[37,40,50]);
indexes.push(...[46,57,50]);
indexes.push(...[57,59,60]);
indexes.push(...[73,74,7]);
indexes.push(...[3,82,83]);
indexes.push(...[3,83,84]);
indexes.push(...[73,7,72]);
indexes.push(...[7,9,70]);
indexes.push(...[72,7,71]);
indexes.push(...[71,7,70]);
indexes.push(...[5,3,86]);
indexes.push(...[3,84,85]);
indexes.push(...[3,85,86]);
indexes.push(...[5,86,87]);
indexes.push(...[69,70,9]);
indexes.push(...[68,69,9]);
indexes.push(...[5,87,88]);
indexes.push(...[5,88,89]);
indexes.push(...[67,68,9]);
indexes.push(...[66,67,9]);
indexes.push(...[5,89,90]);
indexes.push(...[5,90,91]);
indexes.push(...[65,66,9]);
indexes.push(...[64,65,9]);
indexes.push(...[9,5,63]);
indexes.push(...[5,91,92]);
indexes.push(...[5,92,93]);
indexes.push(...[62,64,9]);
indexes.push(...[63,62,9]);
indexes.push(...[81,82,3]);
indexes.push(...[7,74,75]);
indexes.push(...[7,75,76]);
indexes.push(...[81,3,80]);
indexes.push(...[3,7,78]);
indexes.push(...[80,3,79]);
indexes.push(...[79,3,78]);
indexes.push(...[7,76,77]);
 
  
  return [indexes, vertexPosition, vertexNormal];
}

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
    attribute vec2 aVertexCoord;
    uniform mat4 uMMatrix;
    uniform mat4 uInvMMatrix;
    uniform mat4 uVMatrix;
    uniform mat4 uPMatrix;
    varying vec3 vPos;
    varying vec3 vNormal;
    varying vec2 vCoord;
    uniform float uNormalMul;
    void main(void) {
      vPos = vec3(uMMatrix * vec4(aVertexPosition, 1.0));
      gl_Position = uPMatrix * uVMatrix * vec4(vPos,1.0); //Dokonanie transformacji położenia punktów z przestrzeni 3D do przestrzeni obrazu (2D)
      vNormal = normalize(mat3(uInvMMatrix) * uNormalMul*aVertexNormal); //Obrot wektorow normalnych
      vCoord = aVertexCoord;
    }
  `;
  const fragmentShaderSource = `
    precision highp float;
    varying vec3 vPos;
    varying vec3 vNormal;
    varying vec2 vCoord;
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
      //gl_FragColor = clamp(vec4(uColor,1.0) * vec4(brightness,brightness,brightness,1.0),0.0,1.0);
      gl_FragColor = clamp(texture2D(uSampler,vCoord) * vec4(brightness,brightness,brightness,1.0),0.0,1.0);
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
  let vertexCoord;
  let indexes;
  
  //[vertexPosition, vertexColor, vertexCoords, vertexNormal] = CreateShpere(0,0,0,2, 6, 12); 
  //[indexes, vertexPosition, vertexNormal] = CreateBox(0,0,0,1,1,1);
  //[indexes, vertexPosition, vertexNormal] = CreateTetris();
  //[indexes, vertexPosition, vertexNormal] = await LoadObj('Auto3.obj');
  //[indexes, vertexPosition, vertexNormal] = await LoadObj('person.obj');
  //[indexes, vertexPosition, vertexNormal] = await LoadObj('Ludzik.obj');
  //[indexes, vertexPosition, vertexNormal] = await LoadObj('katedra.obj');
  //[indexes, vertexPosition, vertexNormal] = await LoadObj('Ludzik2.obj');
  //[indexes, vertexPosition, vertexNormal] = await LoadObj('Ludzik3.obj');
  //[indexes, vertexPosition, vertexNormal] = await LoadObj('Ludzik4.obj');
  //[indexes, vertexPosition, vertexNormal] = await LoadObj('Ludzik5.obj');
  //[indexes, vertexPosition, vertexNormal] = await LoadObj('Tetris3.obj');
  //[indexes, vertexPosition, vertexNormal] = await LoadObj('cube.obj');
  [indexes, vertexPosition, vertexNormal, vertexCoord] = await LoadObj('Character-3.obj');
  //[indexes, vertexPosition, vertexNormal, vertexCoord] = await LoadObj('Character-3a.obj');
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

  vertexCoordsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexCoordsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexCoord), gl.STATIC_DRAW);
  vertexCoordsBuffer.itemSize = 2;
  vertexCoordsBuffer.numItems = vertexNormal.length/6;
  
  indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
  indexBuffer.numItems = indexes.length;

  textureBuffer = gl.createTexture();
  var textureImg = new Image();
  textureImg.onload = function() { //Wykonanie kodu automatycznie po załadowaniu obrazka
    gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImg); //Faktyczne załadowanie danych obrazu do pamieci karty graficznej
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Ustawienie parametrów próbkowania tekstury
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  }
  textureImg.src="pallet.png"; //Nazwa obrazka

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
  Tick();
} 
//let angle = 45.0; //Macierz transformacji świata - określenie położenia kamery 

var angleZ = 0.0;
var angleY = 0.0;
var angleX = 0.0;
var KameraPositionZ = -8.0;

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
var LightPositionY = 0;
var LightPositionZ = 3;


function Tick()
{ 
  let uMMatrix0 = CreateIdentytyMatrix(); 
  let uMMatrix1 = CreateIdentytyMatrix();
  let uMMatrix2 = CreateIdentytyMatrix();
  let uMMatrix3 = CreateIdentytyMatrix();
  
  let uVMatrix = CreateIdentytyMatrix();
  
  
  uVMatrix = MatrixMul(uVMatrix,CreateRotationXMatrix(angleX));
  uVMatrix = MatrixMul(uVMatrix,CreateRotationYMatrix(angleY));
  uVMatrix = MatrixMul(uVMatrix,CreateRotationZMatrix(angleZ));
  uVMatrix = MatrixMul(uVMatrix,CreateTranslationMatrix(0,0,KameraPositionZ));
  
  uMMatrix1 = MatrixMul(uMMatrix1,CreateScaleMatrix(Object1Sizedx,Object1Sizedy,Object1Sizedz));
  uMMatrix1 = MatrixMul(uMMatrix1,CreateTranslationMatrix(Object1Sizedx,0.0,0.0)); 
  uMMatrix1 = MatrixMul(uMMatrix1,CreateRotationZMatrix(Object1AngleZ));
  uMMatrix1 = MatrixMul(uMMatrix1,CreateTranslationMatrix(Object1PositionX,Object1PositionY,Object1PositionZ));  
  
  uMMatrix2 = MatrixMul(uMMatrix2,CreateScaleMatrix(Object2Sizedx,Object2Sizedy,Object2Sizedz));
  uMMatrix2 = MatrixMul(uMMatrix2,CreateTranslationMatrix(Object2Sizedx,0.0,0.0)); 
  uMMatrix2 = MatrixMul(uMMatrix2,CreateRotationZMatrix(Object2AngleZ));
  uMMatrix2 = MatrixMul(uMMatrix2,CreateTranslationMatrix(Object2PositionX,Object2PositionY,Object2PositionZ));
  
  uMMatrix2 = MatrixMul(uMMatrix2,CreateTranslationMatrix(Object1Sizedx,0.0,0.0)); 
  uMMatrix2 = MatrixMul(uMMatrix2,CreateRotationZMatrix(Object1AngleZ));
  uMMatrix2 = MatrixMul(uMMatrix2,CreateTranslationMatrix(Object1PositionX,Object1PositionY,Object1PositionZ));
  
  uMMatrix3 = MatrixMul(uMMatrix3,CreateScaleMatrix(Object3Sizedx,Object3Sizedy,Object3Sizedz));
  uMMatrix3 = MatrixMul(uMMatrix3,CreateTranslationMatrix(Object3Sizedx,0.0,0.0)); 
  uMMatrix3 = MatrixMul(uMMatrix3,CreateRotationZMatrix(Object3AngleZ));
  uMMatrix3 = MatrixMul(uMMatrix3,CreateTranslationMatrix(Object3PositionX,Object3PositionY,Object3PositionZ));
  
  uMMatrix3 = MatrixMul(uMMatrix3,CreateTranslationMatrix(Object2Sizedx,0.0,0.0)); 
  uMMatrix3 = MatrixMul(uMMatrix3,CreateRotationZMatrix(Object2AngleZ));
  uMMatrix3 = MatrixMul(uMMatrix3,CreateTranslationMatrix(Object2PositionX,Object2PositionY,Object2PositionZ));
  
  uMMatrix3 = MatrixMul(uMMatrix3,CreateTranslationMatrix(Object1Sizedx,0.0,0.0)); 
  uMMatrix3 = MatrixMul(uMMatrix3,CreateRotationZMatrix(Object1AngleZ));
  uMMatrix3 = MatrixMul(uMMatrix3,CreateTranslationMatrix(Object1PositionX,Object1PositionY,Object1PositionZ));
  
  uMMatrix0 = MatrixMul(uMMatrix0,CreateScaleMatrix(LightSize,LightSize,LightSize));
  uMMatrix0 = MatrixMul(uMMatrix0,CreateTranslationMatrix(LightPositionX,LightPositionY,LightPositionZ));
  
  //alert(uPMatrix);
  
  //Render Scene
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); 
  gl.clearColor(1.0,0.0,0.0,1.0); //Wyczyszczenie obrazu kolorem czerwonym
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
  
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexCoord"));  //Przekazywanie wektorów normalnych
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexCoordsBuffer);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexCoord"), vertexCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
  
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMMatrix"), false, new Float32Array(uMMatrix1));
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uInvMMatrix"), false, new Float32Array(MatrixTransposeInverse(uMMatrix1)));
  gl.uniform3f(gl.getUniformLocation(shaderProgram, "uColor"),0.5,0.0,0.0);  
  //gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania
  gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  
  //Drugi Obiekt
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMMatrix"), false, new Float32Array(uMMatrix2));
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uInvMMatrix"), false, new Float32Array(MatrixTransposeInverse(uMMatrix2)));
  gl.uniform3f(gl.getUniformLocation(shaderProgram, "uColor"),0.0,1.0,0.0);
  //gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania
  gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  
  //Trzeci Obiekt
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMMatrix"), false, new Float32Array(uMMatrix3));
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uInvMMatrix"), false, new Float32Array(MatrixTransposeInverse(uMMatrix3)));
  gl.uniform3f(gl.getUniformLocation(shaderProgram, "uColor"),0.0,0.0,1.0);
  //gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania
  gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  
  //Obiekt Światła
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMMatrix"), false, new Float32Array(uMMatrix0));
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uInvMMatrix"), false, new Float32Array(MatrixTransposeInverse(uMMatrix0)));
  gl.uniform3f(gl.getUniformLocation(shaderProgram, "uColor"),1.0,1.0,0.0);
  gl.uniform1f(gl.getUniformLocation(shaderProgram, "uNormalMul"),-1.0);  
  //gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania
  gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  
  setTimeout(Tick,100);
}
function handlekeydown(e)
{
 // Q W E A S D
 if(e.keyCode==87) angleX=angleX+1.0; //W
 if(e.keyCode==83) angleX=angleX-1.0; //S
 if(e.keyCode==68) angleY=angleY+1.0;
 if(e.keyCode==65) angleY=angleY-1.0;
 if(e.keyCode==81) angleZ=angleZ+1.0;
 if(e.keyCode==69) angleZ=angleZ-1.0;
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
}