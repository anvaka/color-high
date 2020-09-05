import createLayout from 'ngraph.forcelayout';

export default function createForceLayout(graph) {
  return createLayout(graph, {
    // Yup, that simple. Run 6D layout:
    dimensions: 6,

    // The rest is just physics settings:
    timeStep: 0.5,
    springLength: 10,
    springCoeff: 0.8,
    gravity: -12,
    dragCoeff: 0.9,
  });
}

