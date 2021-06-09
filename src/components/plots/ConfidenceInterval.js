import React, { useEffect, useState, Component } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FilterCustom from "../FilterCustom";
import Select from 'react-select'
import Plot from 'react-plotly.js';
// Unique id generator
import { nanoid } from 'nanoid';
import { useDebounce } from "react-use";
import SliderCustom from "../SliderCustom";

function ConfidenceInterval(props){
    const [optionsAll, setAllOptions] = useState(props.optionsAll)
    const [optionsNc, setNcOptions] = useState(props.optionsNc)
    const [optionsC, setCOptions] = useState(props.optionsC)

    const [variable, setVariable] = useState(props.variable ? props.variable : null)
    const [conf_iv_lvl, setConf_iv_lvl] = useState(props.ci_value ? props.ci_value : 95)
    const [f_value, setF_value] = useState(props.f_value ? props.f_value : null)
    const [filter_btn_clicks, setFilter_btn_clicks] = useState(0)
    const [uid, setUID] = useState(props.index ? props.index : nanoid())

    const [figure, updateFigure] = useState({data: [], layout: {autosize: true}, frames: [], config: {displaylogo: false}})
    useEffect(() => {
        if (variable){
            if (conf_iv_lvl != '' && conf_iv_lvl > 0 && conf_iv_lvl < 100){
                const opts = {
                    method: "POST",
                    body: JSON.stringify({
                        'value': variable,
                        'ci_value': conf_iv_lvl,
                        'f_value': f_value,
                        'uid':uid,
                        'path':window.location.pathname
                    }),
                    headers:{
                        "Content-Type": "application/json",
                    }
                }
                
                fetch('/api/confidenceinterval', opts)
                    .then(res => {
                        if (res.ok){
                            return res.json()
                        }
                        throw res
                    })
                    .then(data => {
                        if ("figure" in data){
                            updateFigure(JSON.parse(data.figure))
                            // createTable(
                            //     data.figure
                            // )
                        }
                    })
            }
        }
    }, [variable, conf_iv_lvl, filter_btn_clicks])
   
    // const createTable = ((data) =>{
    //     if ('sem' in data){
    //         const conf_iv = 
    //             <Table responsive bordered>
    //                 <thead>
    //                     <tr>
    //                         <th>mean</th>
    //                         <th>count</th>
    //                         <th>sem</th>
    //                         <th>{conf_iv_lvl}% c.i. lower bound</th>
    //                         <th>{conf_iv_lvl}% c.i. upper bound</th>
    //                     </tr>
    //                 </thead>
    //                 <tbody>
    //                     <tr>
    //                         <td>{data.mean}</td>
    //                         <td>{data.count}</td>
    //                         <td>{data.sem}</td>
    //                         <td>{data.lb}</td>
    //                         <td>{data.up}</td>
    //                     </tr>
    //                 </tbody>
    //             </Table>;
    //         updateFigure(conf_iv)
    //     }
    // })

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#80bdff': provided.borderColor,
            outline:state.isFocused ? 0 : provided.outline,
            boxShadow: state.isFocused ? '0 0 0 .2rem rgba(0,123,255,.25)' : provided.boxShadow
          }),
        menu: (provided, state) => ({
            ...provided,
            zIndex:2
        })
    }

    const [toggleOption, settoggleOption] = useState({'display':'block'})
    const handleRmvBtn = () =>{
        props.removeButtonHandler(props.index, 'confidence-interval-'+uid)
    }

    // Debounce ci_value number input
    const [val, setVal] = useState(props.ci_value ? props.ci_value : 95);
    const [, cancel] = useDebounce(
        () => {
            setConf_iv_lvl(val)
        },
        850,
        [val]
    );

    // const updateInteractiveFigureSize = (value) => {
    //     if (props.index && props.updateInteractiveFigureSize){
    //         props.updateInteractiveFigureSize(value, 'block-plot'+props.index, 'plot-'+uid)
    //     }
    // }

    return(
        <div>
            <Row noGutters={true}>
                <Col id={'plot-'+uid}>
                    {/* {figure} */}
                    <Plot 
                        data={figure.data}
                        layout={figure.layout}
                        frames={figure.frames}
                        config={figure.config}
                        useResizeHandler={true}
                        className="d-flex h-auto"
                    />
                </Col>
            </Row>
            <Row className="justify-content-center">
                {/* <Col className="pr-3 pl-3" xs="auto">
                    <p>Size:</p>
                </Col>
                <Col className="pr-0 pl-0">
                    <SliderCustom updateInteractiveFigureSize={updateInteractiveFigureSize}
                    value={(window.innerWidth < 576) ? 12 : 4}/>
                </Col> */}
                <Col>
                </Col>
                <Col xs="auto">
                    <Button size="sm" onClick={(e) => {
                        e.preventDefault()
                        if (toggleOption.display == 'block'){
                            settoggleOption({'display':'none'})
                        }else if (toggleOption.display == 'none'){
                            settoggleOption({'display':'block'})
                        }
                    }}>Toggle options</Button>
                </Col>
                <Col style={props.removeButton ? {'display':'block'} : {'display':'none'}}
                    xs="auto"
                >
                    <Button size="sm" onClick={handleRmvBtn}>
                        Remove plot
                    </Button>
                </Col>
            </Row>
            <div style={toggleOption}>
                <Row>
                    <Col>
                        <Form.Group controlId={'confidence_level'+uid}>
                            <Form.Label>Confidence Interval of level(%)</Form.Label>
                            <Form.Control
                                type="number"
                                value={val}
                                onChange={({currentTarget}) =>{
                                    setVal(currentTarget.value)
                                }}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <label id="conf-iv-variable-label">Variables</label>
                        <Select
                            aria-labelledby="conf-iv-variable-label"
                            name="conf-iv-variable"
                            defaultValue={props.optionsNc.filter(option => option.value === props.variable)}
                            styles={customStyles}
                            options={optionsNc}
                            className="basic-single"
                            classNamePrefix="select"
                            isClearable={true}
                            isSearchable={true}
                            onChange={(value, {action}) => setVariable(value ? value.value : null)}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FilterCustom handleChange={setF_value} 
                            label='Filters: are applied on plot creation or by pressing the "Apply" button'
                            setFilter_btn_clicks={setFilter_btn_clicks}
                            count={filter_btn_clicks}
                            f_value={props.f_value ? props.f_value : null}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default ConfidenceInterval;