(function() {
  var AUDIO_URL, TOTAL_BANDS, analyser, analyserDataArray, arrCircles, audio, build, buildCircles, changeMode, changeTheme, circlesContainer, cp, createCircleTex, gui, hammertime, init, initAudio, initGUI, initGestures, k, modes, mousePt, mouseX, mouseY, params, renderer, resize, stage, startAnimation, texCircle, themes, themesNames, update, v, windowH, windowW;

  AUDIO_URL = "http://204.45.41.186/35/music/english/artist/o/one_republic/native/Counting-Stars_(webmusic.in).mp3";

  modes = ["cubic", "conic"];

  themes = {
    pinkBlue: [0xFF0032, 0xFF5C00, 0x00FFB8, 0x53FF00],
    yellowGreen: [0xF7F6AF, 0x9BD6A3, 0x4E8264, 0x1C2124, 0xD62822],
    yellowRed: [0xECD078, 0xD95B43, 0xC02942, 0x542437, 0x53777A],
    blueGray: [0x343838, 0x005F6B, 0x008C9E, 0x00B4CC, 0x00DFFC],
    blackWhite: [0xFFFFFF, 0x000000, 0xFFFFFF, 0x000000, 0xFFFFFF]
  };

  themesNames = [];

  for (k in themes) {
    v = themes[k];
    themesNames.push(k);
  }

  params = {
    mode: modes[0],
    theme: themesNames[0],
    radius: 3,
    distance: 600,
    size: .5,
    numParticles: 5000,
    sizeW: 1,
    sizeH: 1,
    radiusParticle: 60,
    themeArr: themes[this.theme]
  };

  TOTAL_BANDS = 256;

  cp = new PIXI.Point();

  mouseX = 0;

  mouseY = 0;

  mousePt = new PIXI.Point();

  windowW = 0;

  windowH = 0;

  stage = null;

  renderer = null;

  texCircle = null;

  circlesContainer = null;

  arrCircles = [];

  hammertime = null;

  audio = null;

  analyser = null;

  analyserDataArray = null;

  gui = null;

  init = function() {
    initGestures();
    initAudio();
    resize();
    build();
    resize();
    mousePt.x = cp.x;
    mousePt.y = cp.y;
    $(window).resize(resize);
    startAnimation();
    return initGUI();
  };

  initGUI = function() {
    var modeController, sizeController, themeController;
    gui = new dat.GUI();
    modeController = gui.add(params, 'mode', modes);
    modeController.onChange(function(value) {
      return changeMode(value);
    });
    themeController = gui.add(params, 'theme', themesNames);
    themeController.onChange(function(value) {
      return changeTheme(params.theme);
    });
    gui.add(params, 'radius', 1, 8);
    gui.add(params, 'distance', 100, 1000);
    sizeController = gui.add(params, 'size', 0, 1);
    return sizeController.onChange(function(value) {
      return resize(value);
    });
  };

  initAudio = function() {
    var context, source;
    context = new (AudioContext || webkitAudioContext)();
    analyser = context.createAnalyser();
    source = null;
    audio = new Audio();
    audio.src = AUDIO_URL;
    audio.addEventListener('canplay', function() {
      var bufferLength;
      console.log('audio canplay');
      source = context.createMediaElementSource(audio);
      source.connect(analyser);
      source.connect(context.destination);
      analyser.fftSize = TOTAL_BANDS * 2;
      bufferLength = analyser.frequencyBinCount;
      console.log('bufferLength', bufferLength);
      return analyserDataArray = new Uint8Array(bufferLength);
    });
    return audio.play();
  };

  startAnimation = function() {
    return requestAnimFrame(update);
  };

  initGestures = function() {
    return $(window).on('mousemove', function(e) {
      mouseX = e.clientX;
      return mouseY = e.clientY;
    });
  };

  build = function() {
    stage = new PIXI.Stage(0x000000);
    renderer = PIXI.autoDetectRenderer($(window).width(), $(window).height());
    $(document.body).append(renderer.view);
    texCircle = createCircleTex();
    return buildCircles();
  };

  buildCircles = function() {
    var circle, i, _i, _ref;
    circlesContainer = new PIXI.DisplayObjectContainer();
    stage.addChild(circlesContainer);
    for (i = _i = 0, _ref = params.numParticles - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      circle = new PIXI.Sprite(texCircle);
      circle.anchor.x = 0.5;
      circle.anchor.y = 0.5;
      circle.position.x = circle.xInit = cp.x;
      circle.position.y = circle.yInit = cp.y;
      circle.mouseRad = Math.random();
      circlesContainer.addChild(circle);
      arrCircles.push(circle);
    }
    return changeTheme(params.theme);
  };

  createCircleTex = function() {
    var gCircle;
    gCircle = new PIXI.Graphics();
    gCircle.beginFill(0xFFFFFF);
    gCircle.drawCircle(0, 0, params.radiusParticle);
    gCircle.endFill();
    return gCircle.generateTexture();
  };

  resize = function() {
    windowW = $(window).width();
    windowH = $(window).height();
    cp.x = windowW * .5;
    cp.y = windowH * .5;
    params.sizeW = windowH * params.size;
    params.sizeH = windowH * params.size;
    changeMode(params.mode);
    if (renderer) {
      return renderer.resize(windowW, windowH);
    }
  };

  changeTheme = function(name) {
    var circle, group, i, indexColor, padColor, _i, _ref, _results;
    params.themeArr = themes[name];
    indexColor = 0;
    padColor = Math.ceil(params.numParticles / params.themeArr.length);
    _results = [];
    for (i = _i = 0, _ref = params.numParticles - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      circle = arrCircles[i];
      group = indexColor * padColor / params.numParticles;
      circle.blendMode = params.theme === "blackWhite" ? PIXI.blendModes.NORMAL : PIXI.blendModes.ADD;
      circle.indexBand = Math.round(group * (TOTAL_BANDS - 56)) - 1;
      circle.s = (Math.random() + (params.themeArr.length - indexColor) * 0.2) * 0.1;
      circle.scale = new PIXI.Point(circle.s, circle.s);
      if (i % padColor === 0) {
        indexColor++;
      }
      _results.push(circle.tint = params.themeArr[indexColor - 1]);
    }
    return _results;
  };

  changeMode = function(value) {
    var angle, circle, i, _i, _ref, _results;
    if (!arrCircles || arrCircles.length === 0) {
      return;
    }
    if (!value) {
      value = modes[Math.floor(Math.random() * modes.length)];
    }
    params.mode = value;
    _results = [];
    for (i = _i = 0, _ref = params.numParticles - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      circle = arrCircles[i];
      switch (params.mode) {
        case modes[0]:
          circle.xInit = cp.x + (Math.random() * params.sizeW - params.sizeW / 2);
          _results.push(circle.yInit = cp.y + (Math.random() * params.sizeH - params.sizeH / 2));
          break;
        case modes[1]:
          angle = Math.random() * (Math.PI * 2);
          circle.xInit = cp.x + (Math.cos(angle) * params.sizeW);
          _results.push(circle.yInit = cp.y + (Math.sin(angle) * params.sizeH));
          break;
        default:
          _results.push(void 0);
      }
    }
    return _results;
  };

  update = function() {
    var angle, circle, dist, dx, dy, i, n, r, scale, xpos, ypos, _i, _ref;
    requestAnimFrame(update);
    if (analyserDataArray) {
      analyser.getByteFrequencyData(analyserDataArray);
    }
    if (mouseX > 0 && mouseY > 0) {
      mousePt.x += (mouseX - mousePt.x) * 0.03;
      mousePt.y += (mouseY - mousePt.y) * 0.03;
    }
    for (i = _i = 0, _ref = params.numParticles - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      circle = arrCircles[i];
      if (analyserDataArray) {
        n = analyserDataArray[circle.indexBand];
        scale = (n / 256) * circle.s * 2;
      } else {
        scale = circle.s * .1;
      }
      scale *= params.radius;
      circle.scale.x += (scale - circle.scale.x) * 0.3;
      circle.scale.y = circle.scale.x;
      dx = mousePt.x - circle.xInit;
      dy = mousePt.y - circle.yInit;
      dist = Math.sqrt(dx * dx + dy * dy);
      angle = Math.atan2(dy, dx);
      r = circle.mouseRad * params.distance + 30;
      xpos = circle.xInit - Math.cos(angle) * r;
      ypos = circle.yInit - Math.sin(angle) * r;
      circle.position.x += (xpos - circle.position.x) * 0.1;
      circle.position.y += (ypos - circle.position.y) * 0.1;
    }
    return renderer.render(stage);
  };

  init();

}).call(this);
