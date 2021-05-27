import React, { useState, useEffect, FormControl, ButtonGroup } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import {Navigation, HomeView, IndividualView, ClusteringView} from "./components";
import './App.css';
// Plots components
import ViolinPlot from './components/plots/ViolinPlot';
import Barplot from './components/plots/BarPlot';
import BarPyramidPlot from './components/plots/BarPyramidPlot';
import ChoroplethMap from './components/plots/ChoroplethMap';
import ConfidenceInterval from './components/plots/ConfidenceInterval';
import CorrelationPlot from './components/plots/CorrelationPlot';
import HistogramPlot from './components/plots/HistogramPlot';
import LinePlot from './components/plots/LinePlot';
import ScatterMap from './components/plots/ScatterMap';
import HexbinMap from './components/plots/HexbinMap';
// Unique id generator
import { nanoid } from 'nanoid';

function App() {
  const [open, setOpen] = useState({'display':'block'});
  // Options
  const [optionsAll, setAllOptions] = useState([])
    useEffect(() => {
        fetch('/api/dropdown-all-options').then(res => res.json()).then(data => {
            setAllOptions(data.options)
        })
    }, [])

  const [optionsNc, setNcOptions] = useState([])
    useEffect(() => {
        fetch('/api/dropdown-non-categorical-options').then(res => res.json()).then(data => {
            setNcOptions(data.options)
        })
    }, [])

    const [optionsC, setCOptions] = useState([])
    useEffect(() => {
        fetch('/api/dropdown-categorical-options').then(res => res.json()).then(data => {
            setCOptions(data.options)
        })
    }, [])

    
  

  // IndividualView variables
  const [plotList, updateList] = useState([]);

  const removePlotAction = (index, uid) => {
    updateList(plotList => plotList.filter((item) => item.key != index))
    const opts = {
        method: "POST",
        body: JSON.stringify({
            'uid':uid,
            'path':window.location.pathname
        }),
        headers:{
            "Content-Type": "application/json",
        }
    }
    
    fetch('/api/removeFromSession', opts)
        .then(res => {
            if (res.ok){
                return res.json()
            }
            throw res
        })
        // .then(data => {
        // })
  };


  // Load session
  const loadSession = (e) => {
    const input = document.createElement("input")
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = function(evt){
      try {
        let files = evt.target.files;
        if (!files.length) {
            alert('No file selected!');
            return;
        }
        let file = files[0];
        (async () => {
          const fileContent = await file.text();
          const loadedict = JSON.parse(fileContent)
          // console.log(loadedict)
          if (Object.keys(loadedict).length > 0){
            // Clear session 
            const opts = {
              method: "GET"
            }
            fetch('/api/clearsessionforloadsession', opts)
              .then(res => {
                  if (res.ok){
                      return res.json()
                  }
                  throw res
              })

            let path = window.location.pathname
            if (path == '/IndividualView'){
              if ("IndividualView" in loadedict && Object.keys(loadedict.IndividualView).length > 0){
                for (let key in loadedict.IndividualView){
                  const nid = nanoid()+plotList.length
                  let variables = loadedict.IndividualView[key]
                  if(key.startsWith('violin-plot-')){
                    updateList(plotList => [...plotList, 
                      <Col key={nid} lg={4} md={12} xs={12}>
                          <ViolinPlot removeButton={true} removeButtonHandler={removePlotAction}
                              index={nid} 
                              optionsAll={optionsAll}
                              optionsNc={optionsNc}
                              optionsC={optionsC}
                              variable={variables['value']} 
                              colour={variables['colour']}
                              f_value={variables['f_value']}
                              fa_col={variables['fa_col']}
                              fa_row={variables['fa_row']}
                              an_value={variables['an_value']}
                          />
                      </Col>
                    ]);
                  }else if(key.startsWith('bar-plot-')){
                    updateList(plotList => [...plotList,
                      <Col key={nid} lg={4} md={12} xs={12}>
                        <Barplot removeButton={true} removeButtonHandler={removePlotAction}
                            index={nid}
                            optionsAll={optionsAll}
                            optionsNc={optionsNc}
                            optionsC={optionsC}
                            x_value={variables['x_value']}
                            y_value={variables['y_value']}
                            colour={variables['colour']}
                            f_value={variables['f_value']}
                            fa_col={variables['fa_col']}
                            fa_row={variables['fa_row']}
                            an_value={variables['an_value']}/>
                      </Col>
                    ]);
                  }else if(key.startsWith('bar-pyramid-plot-')){
                    updateList(plotList => [...plotList,
                      <Col key={nid} lg={4} md={12} xs={12}>
                          <BarPyramidPlot removeButton={true} removeButtonHandler={removePlotAction}
                              index={nid}
                              optionsAll={optionsAll}
                              optionsNc={optionsNc}
                              optionsC={optionsC}
                              x_value={variables['x_value']}
                              y_value={variables['y_value']}
                              bi_value={variables['bi_value']}
                              f_value={variables['f_value']}
                              bins={variables['bins']}
                              method={variables['method']}
                              />
                      </Col>
                    ]);
                  }else if(key.startsWith('choropleth-map-')){
                    updateList(plotList => [...plotList,
                      <Col key={nid} lg={4} md={12} xs={12}>
                          <ChoroplethMap removeButton={true} removeButtonHandler={removePlotAction}
                              index={nid}
                              optionsAll={optionsAll}
                              optionsNc={optionsNc}
                              optionsC={optionsC}
                              variable={variables['value']}
                              m_value={variables['m_value']}
                              f_value={variables['f_value']}
                              an_value={variables['an_value']}
                              />
                      </Col>
                    ]);
                  }else if(key.startsWith('confidence-interval-')){
                    updateList(plotList => [...plotList,
                      <Col key={nid} lg={4} md={12} xs={12}>
                          <ConfidenceInterval removeButton={true} removeButtonHandler={removePlotAction}
                              index={nid}
                              optionsAll={optionsAll}
                              optionsNc={optionsNc}
                              optionsC={optionsC}
                              variable={variables['value']}
                              ci_value={variables['ci_value']}
                              f_value={variables['f_value']}
                              />
                      </Col>
                    ]);
                  }else if(key.startsWith('correlation-plot-')){
                    updateList(plotList => [...plotList,
                      <Col key={nid} lg={4} md={12} xs={12}>
                          <CorrelationPlot removeButton={true} removeButtonHandler={removePlotAction}
                              index={nid}
                              optionsAll={optionsAll}
                              optionsNc={optionsNc}
                              optionsC={optionsC}
                              variable={variables['value']}
                              m_value={variables['m_value']}
                              />
                      </Col>
                    ]);
                  }else if(key.startsWith('histogram-plot-')){
                    updateList(plotList => [...plotList,
                      <Col key={nid} lg={4} md={12} xs={12}>
                          <HistogramPlot removeButton={true} removeButtonHandler={removePlotAction}
                              index={nid}
                              optionsAll={optionsAll}
                              optionsNc={optionsNc}
                              optionsC={optionsC}
                              variable={variables['value']}
                              colour={variables['colour']}
                              f_value={variables['f_value']}
                              fa_col={variables['fa_col']}
                              fa_row={variables['fa_row']}
                              an_value={variables['an_value']}
                              />
                      </Col>
                    ]);
                  }else if(key.startsWith('line-plot-')){
                    updateList(plotList => [...plotList,
                      <Col key={nid} lg={4} md={12} xs={12}>
                          <LinePlot removeButton={true} removeButtonHandler={removePlotAction}
                              index={nid}
                              optionsAll={optionsAll}
                              optionsNc={optionsNc}
                              optionsC={optionsC}
                              x_value={variables['x_value']}
                              y_value={variables['y_value']}
                              f_value={variables['f_value']}
                              fa_col={variables['fa_col']}
                              fa_row={variables['fa_row']}
                              an_value={variables['an_value']}
                              />
                      </Col>
                    ]);
                  }else if(key.startsWith('scatter-map-')){
                    updateList(plotList => [...plotList,
                      <Col key={nid} lg={4} md={12} xs={12}>
                          <ScatterMap removeButton={true} removeButtonHandler={removePlotAction}
                              index={nid}
                              optionsAll={optionsAll}
                              optionsNc={optionsNc}
                              optionsC={optionsC}
                              variable={variables['value']} 
                              f_value={variables['f_value']}
                              an_value={variables['an_value']}
                              />
                      </Col>
                    ]);
                  }else if(key.startsWith('hexbin-map-')){
                    updateList(plotList => [...plotList,
                      <Col key={nid} lg={4} md={12} xs={12}>
                          <HexbinMap removeButton={true} removeButtonHandler={removePlotAction}
                              index={nid}
                              optionsAll={optionsAll}
                              optionsNc={optionsNc}
                              optionsC={optionsC}
                              variable={variables['value']}
                              m_value={variables['m_value']}
                              f_value={variables['f_value']}
                              nr_hexs={variables['nr_hexs']}
                              an_value={variables['an_value']}
                              />
                      </Col>
                  ]);
                  }
                }
              }
            }else if (path == '/ClusteringView'){
              if ("ClusteringView" in loadedict && Object.keys(loadedict.ClusteringView).length > 0){
                alert('test')
              }
            }
          }
        })();
      } catch (err) {
          console.error(err);
      }
      
    }
    input.click();
  }

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
          <h1 className="h1 text-center" >VisCHRIS</h1>
          {/* landing page */}
        </Col>
      </Row>
      <Row noGutters={true}>
        <Col xs="auto pr-1" style={open}>
            <div id="navigation_collapse">
              <Navigation loadSession={loadSession}/>
            </div>
        </Col>
        <Col>
          <Router>
            <Switch>
              <Route exact path="/"><HomeView /></Route>
              <Route path="/IndividualView"><IndividualView 
                plotList={plotList}
                updateList={updateList}
                removePlotAction={removePlotAction}
                optionsAll={optionsAll}
                optionsNc={optionsNc}
                optionsC={optionsC}/>
              </Route>
              <Route path="/ClusteringView"><ClusteringView 
                optionsAll={optionsAll}
                optionsNc={optionsNc}
                optionsC={optionsC}/>
              </Route>
            </Switch>
          </Router>
        </Col>
      </Row>
    </div>
  );
}

export default App;
