import React, { useEffect, useState, Component } from "react";
import { Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Plot from 'react-plotly.js';
import FilterCustom from "../FilterCustom";
import Select from 'react-select'
// Unique id generator
import { nanoid } from 'nanoid';

function ChoroplethMap(props){
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
    const [animation_variable, setAnimationVariable] = useState()
    const [method, setMethod] = useState('mean')
    const [f_value, setF_value] = useState()
    const [filter_btn_clicks, setFilter_btn_clicks] = useState(0)
    const uid = nanoid()

    const [figure, updateFigure] = useState({data: [], layout: {autosize: true}, frames: [], config: {displaylogo: false}})
    useEffect(() => {
        if (variable){
            const opts = {
                method: "POST",
                body: JSON.stringify({
                    'value': variable,
                    'method': method,
                    'f_value': f_value,
                    'animation_variable': animation_variable
                }),
                headers:{
                    "content-type": "application/json",
                }
            }
            
            fetch('/api/choroplethmap', opts)
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
    }, [variable, animation_variable, method, filter_btn_clicks])
   
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#80bdff': provided.borderColor,
            outline:state.isFocused ? 0 : provided.outline,
            boxShadow: state.isFocused ? '0 0 0 .2rem rgba(0,123,255,.25)' : provided.boxShadow
          }),
    }

    // Toggle var for options and remove handler for removing plot
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
                        <label id={"map-choropleth-method-label-"+uid}>Method</label>
                        <Select
                            defaultValue={{'label': 'mean', 'value':'mean'}}
                            aria-labelledby={"map-choropleth-method-label-"+uid}
                            name="map-choropleth-method"
                            styles={customStyles}
                            options={[
                                {'label': 'mean', 'value':'mean'},
                                {'label': 'median', 'value':'median'},
                                ]}
                            className="basic-single"
                            classNamePrefix="select"
                            isClearable={true}
                            isSearchable={true}
                            onChange={(value, {action}) => setMethod(value ? value.value : null)}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <label id={"map-choropleth-variable-label-"+uid}>Variables</label>
                        <Select
                            aria-labelledby={"map-choropleth-variable-label-"+uid}
                            name="map-choropleth-variable"
                            styles={customStyles}
                            options={optionsAll}
                            className="basic-single"
                            classNamePrefix="select"
                            isClearable={true}
                            isSearchable={true}
                            onChange={(value, {action}) => setVariable(value ? value.value : null)}
                        />
                    </Col>
                    <Col>
                        <label id={"map-choropleth-animation-variable-label-"+uid}>Animation variable</label>
                        <Select
                            aria-labelledby={"map-choropleth-animation-variable-label-"+uid}
                            name="map-choropleth-animation-variable"
                            styles={customStyles}
                            options={optionsAll}
                            className="basic-single"
                            classNamePrefix="select"
                            isClearable={true}
                            isSearchable={true}
                            onChange={(value, {action}) => setAnimationVariable(value ? value.value : null)}
                        /> 
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FilterCustom handleChange={setF_value} 
                            label='Filters: are applied on plot creation or by pressing the "Apply" button'
                            setFilter_btn_clicks={setFilter_btn_clicks}
                            count={filter_btn_clicks}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default ChoroplethMap;