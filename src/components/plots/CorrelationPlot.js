import React, { useEffect, useState, Component } from "react";
import { Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Plot from 'react-plotly.js';
import FilterCustom from "../FilterCustom";
import Select from 'react-select'

function CorrelationPlot(props){
    // Think about handing down options so not for each plot the api is called unecessary
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

    const [optionsAll, setAllOptions] = useState([])
    useEffect(() => {
        fetch('/api/dropdown-all-options').then(res => res.json()).then(data => {
            setAllOptions(data.options)
        })
    }, [])

    const [variable, setVariable] = useState()
    const [method, setMethod] = useState('pearson')

    const [figure, updateFigure] = useState({data: [], layout: {autosize: true}, frames: [], config: {displaylogo: false}})
    useEffect(() => {
        if (variable && variable.length > 1){
            let m_arr = []
            variable.forEach((item) => m_arr.push(item.value))

            const opts = {
                method: "POST",
                body: JSON.stringify({
                    'value': m_arr,
                    'method': method,
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
    }

    const [toggleOption, settoggleOption] = useState({'display':'block'})
    const handleRmvBtn = () =>{
        props.removeButtonHandler(props.index)
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
                    />
                </Col>
            </Row>
            <Row className="justify-content-center">
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
                        <label id="corr-variable-label">Variables</label>
                        <Select
                            aria-labelledby="corr-variable-label"
                            name="corr-variable"
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
                            defaultValue= {{'label':'pearson', 'value':'pearson'}}
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