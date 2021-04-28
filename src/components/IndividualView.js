import React, { useState, useEffect }from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Carousel from "react-bootstrap/Carousel";
// Add images the easy way
import bp_img from '../imgs/bar-plot.png';
import bar_py_img from '../imgs/bar-pyramid-plot.png';
import choropleth_map_img from '../imgs/choropleth-map.png';
import confidence_interval_img from '../imgs/confidence-interval.png';
import correlation_plot_img from '../imgs/correlation-plot.png';
import histogram_plot_img from '../imgs/histogram-plot.png';
import line_plot_img from '../imgs/line-plot.png';
import scatter_map_img from '../imgs/scatter-map.png';
import violin_plot_img from '../imgs/violin-plot.png';
// Plots components
import ViolinPlot from './plots/ViolinPlot';
import Barplot from './plots/BarPlot';
import BarPyramidPlot from './plots/BarPyramidPlot';
import ChoroplethMap from './plots/ChoroplethMap';
import ConfidenceInterval from './plots/ConfidenceInterval';
import CorrelationPlot from './plots/CorrelationPlot';
import HistogramPlot from './plots/HistogramPlot';
import LinePlot from './plots/LinePlot';
import ScatterMap from './plots/ScatterMap';
// Unique id generator
import { nanoid } from 'nanoid';

function IndividualView(){
    const dstyle = {
        'display':'flex'
        , 'flex-flow':'row wrap'
        , 'justify-content':'space-evenly'
        , 'align-content':'stretch'
    }

    const imgslist = ['violin_plot', 'bar_plot', 'bar_pyramid_plot', 'choropleth_map'
        , 'confidence_interval', 'correlation_plot', 'histogram_plot', 'line_plot'
        , 'scatter_map']
    const [index, setIndex] = useState(0);
    const [plotList, updateList] = useState([]);

    const handleSelect = (selectedIndex, e) => {
        setIndex(selectedIndex);
    };

    const addPlotAction = event => {
        const nplot = imgslist[index];
        const nid = nanoid()+plotList.length
        if (nplot == 'violin_plot'){
            updateList(plotList => [...plotList, 
                <Col key={nid} lg={4} md={12} xs={12}>
                    <ViolinPlot removeButton={true} removeButtonHandler={removePlotAction}
                        index={nid}
                    />
                </Col>
             ]
            );
        }else if (nplot == 'bar_plot'){
            updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12}>
                    <Barplot removeButton={true} removeButtonHandler={removePlotAction}
                        index={nid}/>
                </Col>
            ]);
        }else if (nplot == 'bar_pyramid_plot'){
            updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12}>
                    <BarPyramidPlot removeButton={true} removeButtonHandler={removePlotAction}
                        index={nid}/>
                </Col>
            ]);
        }else if (nplot == 'choropleth_map'){
            updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12}>
                    <ChoroplethMap removeButton={true} removeButtonHandler={removePlotAction}
                        index={nid}/>
                </Col>
            ]);
        }else if (nplot == 'confidence_interval'){
            updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12}>
                    <ConfidenceInterval removeButton={true} removeButtonHandler={removePlotAction}
                        index={nid}/>
                </Col>
            ]);
        }else if (nplot == 'correlation_plot'){
            updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12}>
                    <CorrelationPlot removeButton={true} removeButtonHandler={removePlotAction}
                        index={nid}/>
                </Col>
            ]);
        }else if (nplot == 'histogram_plot'){
            updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12}>
                    <HistogramPlot removeButton={true} removeButtonHandler={removePlotAction}
                        index={nid}/>
                </Col>
            ]);
        }else if (nplot == 'line_plot'){
            updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12}>
                    <LinePlot removeButton={true} removeButtonHandler={removePlotAction}
                        index={nid}/>
                </Col>
            ]);
        }else if (nplot == 'scatter_map'){
            updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12}>
                    <ScatterMap removeButton={true} removeButtonHandler={removePlotAction}
                        index={nid}/>
                </Col>
            ]);
        }
    }

    const removePlotAction = (index) => {
        updateList(plotList => plotList.filter((item) => item.key != index))
    };
    

    return(
        <div className="Individual_view fluid">
            <Row style={dstyle} noGutters={true}>
                {plotList}
            </Row>
            <Row className="justify-content-center text-center">
                <Col>
                    <Carousel activeIndex={index} onSelect={handleSelect} interval={null}>
                        <Carousel.Item>
                            <img 
                                src={violin_plot_img}
                                alt="Violin plot"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p>Violin plot</p>
                                <p>Usefull to display distributions</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                src={bp_img}
                                alt="Bar plot"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p>Bar plot</p>
                                <p>Usefull to display amounts</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                src={bar_py_img}
                                alt="Bar pyramid plot"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p>Bar pyramid plot</p>
                                <p>Usefull to create age pyramids</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                src={choropleth_map_img}
                                alt="Choropleth map"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p>Choropleth map</p>
                                <p>Spatial visualisation of data</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                src={confidence_interval_img}
                                alt="Confidence interval"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p>Confidence interval</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                src={correlation_plot_img}
                                alt="Correlation plot"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p>Correlation plot</p>
                                <p>Usefull to display correlations</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                src={histogram_plot_img}
                                alt="Histogram plot"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p>Histogram plot</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                src={line_plot_img}
                                alt="Line plot"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p>Line plot</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                src={scatter_map_img}
                                alt="Scatter map"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p>Scatter map</p>
                                <p>Spatial vis of point data</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                    </Carousel>
                </Col>
            </Row>
            <Row className="justify-content-center text-center">
                <Col>
                    <Button onClick={addPlotAction}>Add plot</Button>
                </Col>
            </Row>
        </div>
    );
}

export default IndividualView;