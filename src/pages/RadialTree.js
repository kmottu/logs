import React, { Component } from 'react';
import * as d3 from 'd3'

class RadialTree extends Component {
  constructor() {
    super();

    this.createRadialTree = this.createRadialTree.bind(this);
    this.autoBox = this.autoBox.bind(this);
  }

  componentDidMount() {
    fetch('data.json', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).then(res => {
      return res.json()
    }).then(root => {
      
      const groupByKeys = (data, key) => {
        return Object.values(data.reduce((result, obj)=>{
          let objKey = obj[key]
          result[objKey] = result[objKey] || {key: key, count: 0, value: objKey};
          result[objKey].count += 1;
          return result
        },{}))
      }

      function recursive(data, json) {
        if (json.children.length === 0) return data
        let data_ = {
          name: json.name.slice(0,10),
          children: []
        }
        let noChilds = json.children.filter(o => o.children.length === 0)
        let grouped = groupByKeys(noChilds, 'name')
        grouped.map(o => {
          if (o.count > 1) data_.children.push({ name: o.value.slice(0,10) + ' (' + o.count + ')', children: [] })
          else data_.children.push({ name: o.value.slice(0,10), children: [] })
        })
        json.children.filter(o => o.children.length != 0).forEach(element => {
          data_.children.push(
            recursive(data, element)
          )
        });
        return data_
      }

      console.log(root)
      let data = recursive({}, root)
      console.log(data)

      this.createRadialTree(data)
    })
  }

  autoBox() {
    document.body.appendChild(this);
    const { x, y, width, height } = this.getBBox();
    document.body.removeChild(this);
    return [x, y, width, height];
  }

  createRadialTree(input) {
    let height = 1000;
    let width = 1000;

    let svg = d3.select('#chart')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    let diameter = height * 0.75;
    let radius = diameter / 2;

    let tree = d3.tree()
      .size([2 * Math.PI, radius])
      .separation(function (a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

    let data = d3.hierarchy(input)

    let treeData = tree(data);

    let nodes = treeData.descendants();
    let links = treeData.links();

    let graphGroup = svg.append('g')
      .attr('transform', "translate(" + (width / 2) + "," + (height / 2) + ")");

    graphGroup.selectAll(".link")
      .data(links)
      //.join("path")
      .enter().append('path')
      .attr("class", "link")
      .attr("d", d3.linkRadial()
        .angle(d => d.x)
        .radius(d => d.y));

    let node = graphGroup
      .selectAll(".node")
      .data(nodes)
      //.join("g")
      .enter().append('g')
      .attr("class", "node")
      .attr("transform", function (d) {
        return `rotate(${d.x * 180 / Math.PI - 90})` + `translate(${d.y}, 0)`;
      });


    node.append("circle").attr("r", 1);

    node.append("text")
      .attr("font-family", "sans-serif")
      .attr("font-size", 9)
      .attr("dx", function (d) { return d.x < Math.PI ? 8 : -8; })
      .attr("dy", ".31em")
      .attr("text-anchor", function (d) { return d.x < Math.PI ? "start" : "end"; })
      .attr("transform", function (d) { return d.x < Math.PI ? null : "rotate(180)"; })
      .text(function (d) { return d.data.name; });
  }

  render() {
    return (
      <div>
        <div id="main">
          <div id="chart"></div>
        </div>
      </div>
    )
  }
}

export default RadialTree;