import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
import { WEBGL } from 'three/examples/jsm/WebGL.js';
import { noise } from './perlin.js';
//import HDR from '../static/sky.hdr';

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { BleachBypassShader } from "three/examples/jsm/shaders/BleachBypassShader.js";
import { ColorCorrectionShader } from "three/examples/jsm/shaders/ColorCorrectionShader.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

//import { HDR } from '../static/sky.hdr'
const HDR = 'sky.hdr';

var objects = [];

let renderer;
let container;
let scene;
let camera;
let controls;
var composer;
var bloomPass;
let lightup;
var nino;
let nino_moving = false;
var player = document.getElementById('audio');
var playbttn = document.getElementById('playnorah');
var stopbttn = document.getElementById('stopnorah');

playbttn.addEventListener("click", function(){
    console.log("playing")
    player.play()
})

stopbttn.addEventListener("click",function(){
    player.pause()
})
//const gui = new dat.GUI();
const params = {
    color: 0xffffff,
    transmission: 1,
    opacity: 1,
    metalness: 0,
    roughness: 0,
    ior: 1.52,
    thickness: 0.1,
    specularIntensity: 1,
    specularColor: 0xffffff,
    lightIntensity: 1,
    exposure: 1
  };

  var params_bloom = {
    exposure: 0.3,
    bloomStrength: 1.2,
    bloomThreshold: 0.57,
    bloomRadius: 0.1
};

// gui.add(params_bloom, 'exposure', 0, 3)
// gui.add(params_bloom, 'bloomStrength', 0, 3)
// gui.add(params_bloom, 'bloomThreshold', 0, 1)
// gui.add(params_bloom, 'bloomRadius', 0, 1)





console.log(HDR);
console.log("going inside");        
const hdrEquirect = new RGBELoader()
  //.setDataType(THREE.UnsignedByteType)
  .load( HDR, function () {

    console.log(HDR);
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
    hdrEquirect.encoding = THREE.sRGBEncoding;
    
    init();
    //createComposer();
    animate();

  } 
);

function init() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 80000);
    camera.position.x = 5178.324821516374
    camera.position.y = 68.19826638441215
    camera.position.z = -768.2749219407596

    scene = new THREE.Scene();

    scene.background = hdrEquirect;
    scene.environment = hdrEquirect;

    //const norahsong = document.querySelector("#welcome");
    //norahsong.play();

    if (WEBGL.isWebGLAvailable())
        renderer = new THREE.WebGLRenderer({ antialias: true });
    else
        renderer = new THREE.CanvasRenderer(); 
    //projector = new THREE.Projector();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.phisicallyCorrectLights = true;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = params.exposure * 0.41;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container = document.getElementById('ThreeJS');
    container.appendChild(renderer.domElement);
    //document.addEventListener('mousedown',mousedown,false);
    //document.addEventListener('mousemove',mousedmove,false);
    //document.addEventListener('mouseup',mouseup,false);
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('scroll',()=>{
        console.log('scrolling')
    });


    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    renderer.setClearColor (0xffffff, 1);

    var renderScene = new RenderPass(scene, camera);

    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), params_bloom.bloomStrength, params_bloom.bloomRadius,  params_bloom.bloomThreshold);
    bloomPass.renderToScreen = true;
    // bloomPass.threshold = params.bloomThreshold;
    // bloomPass.strength = params.bloomStrength;
    // bloomPass.radius = params.bloomRadius;

    composer = new EffectComposer( renderer );
    composer.setSize(window.innerWidth,  window.innerHeight);
    composer.addPass( renderScene );
    composer.addPass( bloomPass );

    var myElements = document.getElementsByClassName("quotes"); for(var counter = 0; counter < myElements.length; counter++){
        myElements[counter].style.top = Math.random() * (window.innerHeight - window.innerHeight/20)  + 'px';
        myElements[counter].style.left = Math.random() * (2*window.innerWidth + 2*window.innerWidth + 1) - 2*window.innerWidth + 'px';
     }

}

    function onWindowResize() {
            
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        
    }

    // var isMouseDown=false;
    // function mousedown(){
    //     isMouseDown=true
    // }

    // var previousX = window.innerWidth/2;
    // var diffX;
    // function mousedmove(event){
    //         //do stuff
    //         diffX = event.clientX - previousX;
    //         previousX = event.clientX;


    //         var myElements = document.getElementsByClassName("quotes"); 
    //         //myElement.style.left = parseInt(myElement.style.left, 10) + 7.5*diffX + 'px';
    //         for(var counter = 0; counter < myElements.length; counter++){
    //             console.log(parseInt(myElements[counter].style.left, 10));
    //             myElements[counter].style.left = parseInt(myElements[counter].style.left, 10) + 7.5*diffX + 'px';
    //          }
        
    // }
    
    // function mouseup(){
    //     isMouseDown=false
    // }

    function createComposer() {
        renderer.autoClear = false;
      
        const renderModel = new RenderPass(scene, camera);
        const effectBleach = new ShaderPass(BleachBypassShader);
        const effectColor = new ShaderPass(ColorCorrectionShader);
        effectFXAA = new ShaderPass(FXAAShader);
        const gammaCorrection = new ShaderPass(GammaCorrectionShader);
      
        effectFXAA.uniforms["resolution"].value.set(
          1 / window.innerWidth,
          1 / window.innerHeight
        );
      
        effectBleach.uniforms["opacity"].value = 0.8;
        effectColor.uniforms["powRGB"].value.set(1.4, 1.45, 1.45);
        effectColor.uniforms["mulRGB"].value.set(1.1, 1.1, 1.1);
      
        composer = new EffectComposer(renderer);
      
        composer.addPass(renderModel);
        composer.addPass(effectFXAA);
        composer.addPass(effectBleach);
        composer.addPass(effectColor);
        composer.addPass(gammaCorrection);
      }

    var a = Date.now();
    function animate() {
  
        requestAnimationFrame(animate);    
        update();
        
    }

    function update() {
        
        controls.update();
        render(a); 
        a = Date.now();
        //console.log(camera.rotation);
        //stats.update();

    }

    function render(a) {
    

        var myElements = document.getElementsByClassName("quotes"); 
        //myElement.style.left = parseInt(myElement.style.left, 10) + 7.5*diffX + 'px';
        for(var counter = 0; counter < myElements.length; counter++){
  
            const noiseX = (noise.simplex2(0, a*0.000001*counter + Math.random()*0.0005) + 1) / 2;
            // We get another noise value for the y axis but because we don't want the same value than x, we need to use another value for the first parameter
            const noiseY = (noise.simplex2(1, a*0.000005*counter + Math.random()*0.0005) + 1) / 2;
        
            // Convert the noise values from [0, 1] to the size of the window
            const x = noiseX * window.innerWidth * 3;
            const y = noiseY * window.innerHeight/3;

            myElements[counter].style.transform = `translate(${x}px, ${y}px)`;
        }
        renderer.render(scene, camera);
        composer.render();
    }

            