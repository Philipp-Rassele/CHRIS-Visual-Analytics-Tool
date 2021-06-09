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
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot'+nid}>
                    {/* lg={4} md={12} xs={12} */}
                    <ViolinPlot removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}
                        updateInteractiveFigureSize={updateInteractiveFigureSize}
                    />
                </Col>
             ]
            );
        }else if (nplot == 'bar_plot'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot'+nid}>
                    {/* lg={4} md={12} xs={12} */}
                    <Barplot removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}
                        updateInteractiveFigureSize={updateInteractiveFigureSize}
                    />
                </Col>
            ]);
        }else if (nplot == 'bar_pyramid_plot'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot'+nid}>
                    {/* lg={4} md={12} xs={12} */}
                    <BarPyramidPlot removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}
                        updateInteractiveFigureSize={updateInteractiveFigureSize}
                    />
                </Col>
            ]);
        }else if (nplot == 'choropleth_map'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot'+nid}>
                    {/* lg={4} md={12} xs={12} */}
                    <ChoroplethMap removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}
                        updateInteractiveFigureSize={updateInteractiveFigureSize}
                    />
                </Col>
            ]);
        }else if (nplot == 'confidence_interval'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot'+nid}>
                    {/* lg={4} md={12} xs={12} */}
                    <ConfidenceInterval removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}
                        updateInteractiveFigureSize={updateInteractiveFigureSize}
                    />
                </Col>
            ]);
        }else if (nplot == 'correlation_plot'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot'+nid}>
                    {/* lg={4} md={12} xs={12} */}
                    <CorrelationPlot removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}
                        updateInteractiveFigureSize={updateInteractiveFigureSize}
                    />
                </Col>
            ]);
        }else if (nplot == 'histogram_plot'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot'+nid}>
                    {/* lg={4} md={12} xs={12} */}
                    <HistogramPlot removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}
                        updateInteractiveFigureSize={updateInteractiveFigureSize}
                    />
                </Col>
            ]);
        }else if (nplot == 'line_plot'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot'+nid}>
                    {/* lg={4} md={12} xs={12} */}
                    <LinePlot removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}
                        updateInteractiveFigureSize={updateInteractiveFigureSize}
                    />
                </Col>
            ]);
        }else if (nplot == 'scatter_map'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot'+nid}>
                    {/* lg={4} md={12} xs={12} */}
                    <ScatterMap removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}
                        updateInteractiveFigureSize={updateInteractiveFigureSize}
                    />
                </Col>
            ]);
        }else if (nplot == 'hexbin_map'){
            props.updateList(plotList => [...plotList,
                <Col key={nid} lg={4} md={12} xs={12} id={'block-plot'+nid}>
                    {/* lg={4} md={12} xs={12} */}
                    <HexbinMap removeButton={true} removeButtonHandler={props.removePlotAction}
                        index={nid}
                        optionsAll={props.optionsAll}
                        optionsNc={props.optionsNc}
                        optionsC={props.optionsC}
                        updateInteractiveFigureSize={updateInteractiveFigureSize}
                    />
                </Col>
            ]);
        }
    }

    
    //     lg={4} md={12} xs={12}
    const updateInteractiveFigureSize = (value, block_id, plot_id) => {
        let w = window.innerWidth;
        let el = document.getElementById(block_id)
        if (w < 576){
            el.removeAttribute('class')
            el.classList.add('col-'+value)
            el.classList.add('col-md-12')
            el.classList.add('col-lg-4')
            document.querySelector('[id='+plot_id+']').querySelector('[data-title="Autoscale"]').click()
        }else if(w > 768 && w < 992){
            el.removeAttribute('class')
            el.classList.add('col-12')
            el.classList.add('col-md-'+value)
            el.classList.add('col-lg-4')
            document.querySelector('[id='+plot_id+']').querySelector('[data-title="Autoscale"]').click()
        }else if (w > 991){
            el.removeAttribute('class')
            el.classList.add('col-12')
            el.classList.add('col-md-12')
            el.classList.add('col-lg-'+value)
            document.querySelector('[id='+plot_id+']').querySelector('[data-title="Autoscale"]').click()
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
                                <p><span>Usefull to create population pyramids</span></p>
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