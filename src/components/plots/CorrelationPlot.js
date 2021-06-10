import React, { useEffect, useState, Component } from "react";
import { Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Plot from 'react-plotly.js';
import FilterCustom from "../FilterCustom";
import Select from 'react-select'
// Unique id generator
import { nanoid } from 'nanoid';
import SliderCustom from "../SliderCustom";
import Plotly from 'plotly.js';

function CorrelationPlot(props){
    const [optionsAll, setAllOptions] = useState(props.optionsAll)
    const [optionsNc, setNcOptions] = useState(props.optionsNc)
    const [optionsC, setCOptions] = useState(props.optionsC)

    const [variable, setVariable] = useState(props.variable ? props.variable : null)
    const [method, setMethod] = useState(props.m_value ? props.m_value : 'pearson')
    const [uid, setUID] = useState(nanoid())

    const [figure, updateFigure] = useState({data: [], layout: {autosize: true}, frames: [], config: {displaylogo: false}})
    useEffect(() => {
        if (variable && variable.length > 1){
            let m_arr = []
            if (typeof(variable[0]) === 'object'){
                variable.forEach((item) => m_arr.push(item.value))
            }else{
                m_arr = variable
            }

            const opts = {
                method: "POST",
                body: JSON.stringify({
                    'value': m_arr,
                    'method': method,
                    'uid':uid,
                    'path':window.location.pathname
                }),
                headers:{
                    "Content-Type": "application/json",
                }
            }
            
            fetch('/api/correaltionplot', opts)
                .then(res => {
                    if (res.ok){
                        return res.json()
                    }
                    throw res
                })
                .then(data => {
                    if ("figure" in data){
                        updateFigure(
                            JSON.parse(data.figure)
                        )
                    }
                })
        }
    }, [variable, method])
   
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
        props.removeButtonHandler(props.index, 'correlation-plot-'+uid)
    }

    const updateInteractiveFigureSize = (value) => {
        let w = window.innerWidth;
        console.log(props.index)
        console.log(uid)
        let el = document.getElementById('block-plot-'+props.index)
        
        if (w < 576){
            el.removeAttribute('class')
            el.classList.add('col-'+value)
            el.classList.add('col-md-12')
            el.classList.add('col-lg-4')
        }else if(w > 768 && w < 992){
            el.removeAttribute('class')
            el.classList.add('col-12')
            el.classList.add('col-md-'+value)
            el.classList.add('col-lg-4')
        }else if (w > 991){
            el.removeAttribute('class')
            el.classList.add('col-12')
            el.classList.add('col-md-12')
            el.classList.add('col-lg-'+value)
        }
        Plotly.relayout(document.getElementById('plot-divId-'+uid), {autosize: true})
    }

    return(
        <div>
            <Row noGutters={true}>
                <Col>
                    <Plot 
                        data={figure.data}
                        layout={figure.layout}
                        frames={figure.frames}
                        config={figure.config}
                        useResizeHandler={true}
                        className="d-flex h-auto"
                        divId={'plot-divId-'+uid}
                    />
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col className="pr-3 pl-3" xs="auto">
                    <p>Size:</p>
                </Col>
                <Col className="pr-0 pl-0">
                    <SliderCustom updateInteractiveFigureSize={updateInteractiveFigureSize}
                        value={(window.innerWidth < 992) ? 12 : 4}
                    />
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
                        <label id="corr-variable-label">Variables</label>
                        <Select
                            aria-labelledby="corr-variable-label"
                            name="corr-variable"
                            defaultValue={props.optionsAll.filter(option => props.variable ? props.variable.includes(option.value) : false)}
                            styles={customStyles}
                            options={optionsAll}
                            className="basic-multiple"
                            classNamePrefix="select"
                            isMulti
                            // isClearable={true}
                            isSearchable={true}
                            onChange={(value) => setVariable(value ? value: null)}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <label id="corr-method-label">Method</label>
                        <Select
                            aria-labelledby="corr-method-label"
                            name="corr-method"
                            styles={customStyles}
                            defaultValue= {props.m_value ? {'label':props.m_value, 'value':props.m_value}:{'label':'pearson', 'value':'pearson'}}
                            options={[{'label':'pearson', 'value':'pearson'}
                            ,{'label':'kendall', 'value':'kendall'}
                            ,{'label':'spearman', 'value':'spearman'}]}
                            className="basic-single"
                            classNamePrefix="select"
                            isClearable={true}
                            isSearchable={true}
                            onChange={(value, {action}) => setMethod(value ? value.value : null)}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default CorrelationPlot;