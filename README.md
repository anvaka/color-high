# color high

This is [a simple demo](https://anvaka.github.io/color-high/?graph=HB%2Fcan_838) of `ngraph.forcelayout` performing layout in 6D space.

![demo](https://i.imgur.com/Sf7CqtM.png)

First 3 coordinates of the layout are assigned to X, Y, Z coordinates, and the last
3 coordinates are assigned to R, G, B color space.

If you drop any `.dot` file into the browser window the demo will attempt to visualize it.


This is a source code behind [this tweet](https://twitter.com/anvaka/status/1301401315692617729).


Happy exploration!

### Compiles and hot-reloads for development

```
npm start
```

This should render a simple graph and you can do some basic layout. You can drop `.dot` files into it
to load new graphs.

## Compiling it locally

Checkout and setup the dependencies: 

```
git clone https://github.com/anvaka/color-high
cd color-high
npm install
```

Run the dev server:

```
npm start
```

## What's inside?

* [ngraph.graph](https://github.com/anvaka/ngraph.graph) as a graph data structure
* [ngraph.forcelayout](https://github.com/anvaka/ngraph.forcelayout) for the graph layout
* [ngraph.hde](https://github.com/anvaka/ngraph.hde) for initial positions of nodes
* [w-gl](https://github.com/anvaka/w-gl) - super duper obscure (and fast) WebGL renderer.
* vue.js powered UI and dev tools.

## Thanks!

* Stay tuned for updates: https://twitter.com/anvaka
* If you like my work and would like to support it - https://www.patreon.com/anvaka