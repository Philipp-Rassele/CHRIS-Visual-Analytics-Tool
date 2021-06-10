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
import hexbin_map_img from '../imgs/hexbin-map.png';
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
import HexbinMap from './plots/HexbinMap';
// Unique id generator
import { nanoid } from 'nanoid';

function IndividualView(props){
    const dstyle = {
        'display':'flex'
        , 'flex-flow':'row wrap'
        , 'justify-content':'space-evenly'
        , 'align-content':'stretch'
    }

    const imgslist = ['violin_plot', 'bar_plot', 'bar_pyramid_plot', 'choropleth_map'
        , 'confidence_interval', 'correlation_plot', 'histogram_plot', 'line_plot'
        , 'scatter_map', 'hexbin_map']
    const [index, setIndex] = useState(0);
    const plotList = props.plotList

    const handleSelect = (selectedIndex, e) => {
        setIndex(selectedIndex);
    };

    const addPlotAction = (event) => {
        const nplot = imgslist[index]
        const nid = nanoid()+plotList.length
        if (nplot == 'violin_plot'){
            props.updateList(plotList => [...plotList, 
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot-'+nid}>
                    {/* lg={4} md={12} xs={12} */}
                    <ViolinPlot removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}
                    />
                </Col>
             ]
            );
        }else if (nplot == 'bar_plot'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot-'+nid}>
                    <Barplot removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}/>
                </Col>
            ]);
        }else if (nplot == 'bar_pyramid_plot'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot-'+nid}>
                    <BarPyramidPlot removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}/>
                </Col>
            ]);
        }else if (nplot == 'choropleth_map'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot-'+nid}>
                    <ChoroplethMap removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}/>
                </Col>
            ]);
        }else if (nplot == 'confidence_interval'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot-'+nid}>
                    <ConfidenceInterval removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}/>
                </Col>
            ]);
        }else if (nplot == 'correlation_plot'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot-'+nid}>
                    <CorrelationPlot removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}/>
                </Col>
            ]);
        }else if (nplot == 'histogram_plot'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot-'+nid}>
                    <HistogramPlot removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}/>
                </Col>
            ]);
        }else if (nplot == 'line_plot'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot-'+nid}>
                    <LinePlot removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}/>
                </Col>
            ]);
        }else if (nplot == 'scatter_map'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot-'+nid}>
                    <ScatterMap removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}/>
                </Col>
            ]);
        }else if (nplot == 'hexbin_map'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot-'+nid}>
                    <HexbinMap removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}/>
                </Col>
            ]);
        }
    }

    return(
        <div className="Individual_view fluid">
            <Row style={dstyle} noGutters={true}>
                {props.plotList}
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
                                <p><span>Violin plot</span></p>
                                <p><span>Usefull to display distributions</span></p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                src={bp_img}
                                alt="Bar plot"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p><span>Bar plot</span></p>
                                <p><span>Usefull to display amounts</span></p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                src={bar_py_img}
                                alt="Bar pyramid plot"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p><span>Bar pyramid plot</span></p>
                                <p><span>Usefull to create age pyramids</span></p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                src={choropleth_map_img}
                                alt="Choropleth map"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p><span>Choropleth map</span></p>
                                <p><span>Spatial visualisation of data</span></p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                src={confidence_interval_img}
                                alt="Confidence interval"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p><span>Confidence interval</span></p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                src={correlation_plot_img}
                                alt="Correlation plot"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p><span>Correlation plot</span></p>
                                <p><span>Usefull to display correlations</span></p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                src={histogram_plot_img}
                                alt="Histogram plot"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p><span>Histogram plot</span></p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                src={line_plot_img}
                                alt="Line plot"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p><span>Line plot</span></p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                src={scatter_map_img}
                                alt="Scatter map"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p><span>Scatter map</span></p>
                                <p><span>Spatial vis of point data</span></p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                src={hexbin_map_img}
                                alt="Hexbin map"
                                style={{'width':'65vmin'}}
                            />
                            <Carousel.Caption>
                                <p><span>Hexbin map</span></p>
                                {/* <p><span>Spatial vis of point data</span></p> */}
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