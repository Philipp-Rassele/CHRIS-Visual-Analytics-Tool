import React, { useState, useEffect, FormControl, ButtonGroup } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import {Navigation, HomeView, IndividualView, ChoroplethMap, ConfidenceInterval
  , CorrelationPlot, HistogramPlot, LinePlot, ScatterMap, ClusteringView} from "./components";
import ViolinPlot from './components/plots/ViolinPlot';
import BarPlot from './components/plots/BarPlot';
import BarPyramidPlot from './components/plots/BarPyramidPlot';
import './App.css';

function App() {
  const [open, setOpen] = useState({'display':'block'});

  return (
    <div className="container-fluid">
      {/* fluid */}
      <Row className="justify-content-center align-items-center">
        <div className="col-auto">
        {/* xs="auto"  */}
          <button 
            // color="primary"
            className="btn btn-primary"
            onClick={(e) => {
              e.preventDefault()
              if (open.display == 'block'){
                setOpen({'display':'none'})
              }else if (open.display == 'none'){
                setOpen({'display':'block'})
              }
            }}
          >
            Toggle content
          </button>
        </div>
        <Col className="col">
          <h1 className="h1 text-center" >VisCHRIS landing page</h1>
        </Col>
      </Row>
      <Row noGutters={true}>
        <Col xs="auto pr-1" style={open}>
            <div id="navigation_collapse">
              <Navigation  />
            </div>
        </Col>
        <Col>
          <Router>
            <Switch>
              <Route exact path="/"><HomeView /></Route>
              <Route path="/IndividualView"><IndividualView /></Route>
              <Route path="/ClusteringView"><ClusteringView /></Route>
            </Switch>
          </Router>
        </Col>
      </Row>
      <Row>
        <Col>
          {/* <ViolinPlot /> */}
          {/* <BarPlot /> */}
          {/* <BarPyramidPlot /> */}
          {/* <ChoroplethMap /> */}
          {/* <ConfidenceInterval /> */}
          {/* <CorrelationPlot /> */}
          {/* <HistogramPlot /> */}
          {/* <LinePlot /> */}
          {/* <ScatterMap /> */}
        </Col>
      </Row>
    </div>
  );
}

export default App;
