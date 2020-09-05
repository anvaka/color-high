# color high

This is a simple demo of `ngraph.forcelayout` performing layout in 6D space.

![demo](https://i.imgur.com/Sf7CqtM.png)

First 3 coordinates of the layout are assigned to X, Y, Z coordinates, and the last
3 coordinates are assigned to R, G, B color space.

If you drop any `.dot` file into the browser window the demo will attempt to visualize it.

Note: This is super basic example, created in couple hours. The primary purpose of it to get you playing
with the main idea.

Happy exploration!

### Compiles and hot-reloads for development

```
npm start
```

This should render a simple graph and you can do some basic layout. You can drop `.dot` files into it
to load new graphs.

### Compiles and minifies for production

```
npm run build
```

## What's inside?

* [ngraph.graph](https://github.com/anvaka/ngraph.graph) as a graph data structure
* [ngraph.forcelayout](https://github.com/anvaka/ngraph.forcelayout) for the graph layout
* [w-gl](https://github.com/anvaka/w-gl) - super duper obscure (and fast) WebGL renderer.
* vue.js powered UI and dev tools.

## Thanks!

* Stay tuned for updates: https://twitter.com/anvaka
* If you like my work and would like to support it - https://www.patreon.com/anvaka