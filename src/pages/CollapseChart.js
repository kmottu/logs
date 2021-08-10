import React, { useState, Component } from 'react';
import {
  Container,
  Collapse,
  Row,
  Col
} from 'reactstrap';

const Chart = (props) => {
  const [collapse, setCollapse] = useState(true);

  const toggle = () => setCollapse(!collapse);
  const vv = collapse ? " collapsed" : ""

  //console.log(props)
  return (
    <div className="accordion-item" key={props.idx}>
      <h2 className="accordion-header" >
        <button className={"accordion-button fw-medium" + vv} type="button" onClick={toggle} style={{ cursor: "pointer" }}>
          {props.data.name}
        </button>
      </h2>
      <Collapse isOpen={collapse} className="accordion-collapse">
        <div className="accordion-body">
          {props.data.children ?
            props.data.children.map((item, idx) => {
              return <Chart data={item} idx={idx} />
            })
            : ""}
        </div>
      </Collapse>
    </div>
  );
}

class CollapseChart extends Component {
  constructor() {
    super();
    this.state = {
      data: {}
    }
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
        return Object.values(data.reduce((result, obj) => {
          let objKey = obj[key]
          result[objKey] = result[objKey] || { key: key, count: 0, value: objKey };
          result[objKey].count += 1;
          return result
        }, {}))
      }

      function recursive(data, json) {
        if (json.children.length === 0) return data
        let data_ = {
          name: json.name.slice(0, 10),
          children: []
        }
        let noChilds = json.children.filter(o => o.children.length === 0)
        let grouped = groupByKeys(noChilds, 'name')
        grouped.map(o => {
          if (o.count > 1) data_.children.push({ name: o.value.slice(0, 10) + ' (' + o.count + ')', children: [] })
          else data_.children.push({ name: o.value.slice(0, 10), children: [] })
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
      this.setState({ data: data })
    })
  }

  render() {
    return (
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            <Row>
              <Col >
                <div className="accordion accordion-flush" id="chart">
                  {this.state.data ? <Chart data={this.state.data} /> : ""}
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
    )
  }

}

export default CollapseChart;