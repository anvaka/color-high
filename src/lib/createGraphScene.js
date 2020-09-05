import {createScene, createGuide} from 'w-gl';
import LineCollection from './LineCollection';
import PointCollection from './PointCollection';
import bus from './bus';
import createHighLayout from 'ngraph.hde'
import createForceLayout from './createForceLayout';
import findLargestComponent from './findLargestComponent';
import {hsl, lab} from 'd3-color'
import createGraph from 'ngraph.graph';

export default function createGraphScene(canvas) {
  let drawLinks = true;

  // Since graph can be loaded dynamically, we have these uninitialized
  // and captured into closure. loadGraph will do the initialization
  let graph, layout;
  let scene, nodes, lines, guide;

  let layoutName;
  let layoutSteps = 0; // how many frames shall we run layout?
  let rafHandle;

  bus.on('load-graph', loadGraph);

  return {
    dispose,
    runLayout,
    selectLayout
  };

  function loadGraph(newGraph, desiredLayout) {
    if (scene) {
      scene.dispose();
      scene = null
      layoutSteps = 0;
      cancelAnimationFrame(rafHandle);
    }
    scene = initScene();

    graph = findLargestComponent(newGraph, 1)[0];

    if (desiredLayout && desiredLayout !== layoutName) {
      layoutName = desiredLayout;
    }
    let showGuide = true;
    if (showGuide) {
      guide = createGuide(scene, {showGrid: true, lineColor: 0xffffff10, maxAlpha: 0x10});
    }
    // this is a standard force layout
    layout = createForceLayout(graph, layoutName);

    // to get good initial positions, we use ngraph.hde: https://github.com/anvaka/ngraph.hde
    let hde = createHighLayout(graph, {dimensions: 6}); 

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    let scale = 2.5;
    graph.forEachNode(node => {
      let pos = hde.getNodePosition(node.id);
      let x = pos[0] * scale;
      let y = pos[1] * scale;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;

      layout.setNodePosition(node.id, pos[0], pos[1], pos[2], pos[3], pos[4], pos[5])
    });

    setSceneSize(Math.max(maxX - minX, maxY - minY));
    initUIElements();

    rafHandle = requestAnimationFrame(frame);
  }

  function setSceneSize(sceneSize) {
    scene.setViewBox({
      left:  -sceneSize,
      top:   -sceneSize,
      right:  sceneSize,
      bottom: sceneSize,
    });
  }

  function runLayout(stepsCount) {
    layoutSteps += stepsCount;
  }

  function selectLayout(newLayoutName) {
    layoutSteps = 0;
    layoutName = newLayoutName;
    loadGraph(graph)
  }

  function initScene() {
    let scene = createScene(canvas);
    scene.setClearColor(12/255, 41/255, 82/255, 1)
    return scene;
  }
  
  function initUIElements() {
    nodes = new PointCollection(scene.getGL(), {
      capacity: graph.getNodesCount()
    });

    graph.forEachNode(node => {
      var point = layout.getNodePosition(node.id);
      let size = 0;
      if (node.data && node.data.size) {
        size = node.data.size;
      } else {
        if (!node.data) node.data = {};
        node.data.size = size;
      }
      node.ui = {size, position: [point.x, point.y, point.z || 0], color: 0x90f8fcff};
      node.uiId = nodes.add(node.ui);
    });

    lines = new LineCollection(scene.getGL(), { capacity: graph.getLinksCount() });

    graph.forEachLink(link => {
      var from = layout.getNodePosition(link.fromId);
      var to = layout.getNodePosition(link.toId);
      var line = { from: [from.x, from.y, from.z || 0], to: [to.x, to.y, to.z || 0], color: 0xFFFFFF10 };
      link.ui = line;
      link.uiId = lines.add(link.ui);
    });
    // lines.add({from: [0, 0, 0], to: [0, 2, 0], color: 0xFF0000FF})

    scene.appendChild(lines);
    scene.appendChild(nodes);
  }

  function frame() {
    rafHandle = requestAnimationFrame(frame);

    if (layoutSteps > 0) {
      layoutSteps -= 1;
      layout.step();
    }
    drawGraph();
    scene.renderFrame();
  }

  function drawGraph() {
    let names = ['x', 'y', 'z']
    let minR = Infinity; let maxR = -minR;
    let minG = Infinity; let maxG = -minG;
    let minB = Infinity; let maxB = -minB;
    graph.forEachNode(node => {
      let pos = layout.getNodePosition(node.id);
      if (pos.c4 < minR) minR = pos.c4;
      if (pos.c4 > maxR) maxR = pos.c4;

      if (pos.c5 < minG) minG = pos.c5;
      if (pos.c5 > maxG) maxG = pos.c5;

      if (pos.c6 < minB) minB = pos.c6;
      if (pos.c6 > maxB) maxB = pos.c6;
    });

    graph.forEachNode(node => {
      let pos = layout.getNodePosition(node.id);
      let uiPosition = node.ui.position;
      for (let i = 0; i < 3; ++i) {
        uiPosition[i] = pos[names[i]] || 0;
      }

      let r = Math.floor(255 * (pos.c4 - minR) / (maxR - minR)) << 24;
      let g = Math.floor(255 * (pos.c5 - minG) / (maxG - minG)) << 16;
      let b = Math.floor(255 * (pos.c6 - minB) / (maxB - minB)) << 8;
      // If you want to play with other color spaces, uncomment this line:
      // [r, g, b] = lab2rgb(
      //   (pos.c4 -  minR) / (maxR - minR),
      //   (pos.c5 - minG) / (maxG - minG),
      //   (pos.c6 - minB) / (maxB - minB)
      // );
      node.ui.color = (0x000000FF | r | g | b);
      nodes.update(node.uiId, node.ui)
    });

    if (drawLinks) {
      graph.forEachLink(link => {
        var fromPos = layout.getNodePosition(link.fromId);
        var toPos = layout.getNodePosition(link.toId);
        let {from, to} = link.ui;

        for (let i = 0; i < 3; ++i) {
          from[i] = fromPos[names[i]] || 0;
          to[i] = toPos[names[i]] || 0;
        }
        link.ui.color = lerp(graph.getNode(link.fromId).ui.color, graph.getNode(link.toId).ui.color);
        lines.update(link.uiId, link.ui);
      })
    }
  }

function lab2rgb(l, a, b){
  // let rgb = lab(
  //     Math.round(l*150),
  //     Math.round((a - 0.5) * 100),
  //     Math.round((b - 0.5) * 100)
  // ).rgb();
  let rgb = hsl(
      42 + l * 60,
      //l * 360,
      a,
      b * 0.5 + 0.5
  ).rgb();

  return [
    Math.floor(rgb.r) << 24,
    Math.floor(rgb.g) << 16,
    Math.floor(rgb.b) << 8
  ]
}

  function lerp(aColor, bColor) {
    let ar = (aColor >> 24) & 0xFF;
    let ag = (aColor >> 16) & 0xFF;
    let ab = (aColor >> 8)  & 0xFF;
    let br = (bColor >> 24) & 0xFF;
    let bg = (bColor >> 16) & 0xFF;
    let bb = (bColor >> 8)  & 0xFF;
    let r = Math.floor((ar + br) / 2);
    let g = Math.floor((ag + bg) / 2);
    let b = Math.floor((ab + bb) / 2);
    return (r << 24) | (g << 16) | (b << 8) | 0xF0;
  }

  function dispose() {
    cancelAnimationFrame(rafHandle);

    scene.dispose();
    bus.off('load-graph', loadGraph);
  }
}