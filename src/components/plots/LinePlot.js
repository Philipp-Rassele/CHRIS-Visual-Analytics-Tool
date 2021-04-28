import React, { useEffect, useState, Component } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Plot from 'react-plotly.js';
import FilterCustom from "../FilterCustom";
import Select from 'react-select'
// Unique id generator
import { nanoid } from 'nanoid';

function LinePlot(props){
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

    const [x_variable, setXVariable] = useState()
    const [y_variable, setYVariable] = useState()
    const [animation_variable, setAnimationVariable] = useState()
    const [fa_col, setFa_col] = useState()
    const [fa_row, setFa_row] = useState()
    const [f_value, setF_value] = useState()
    const [filter_btn_clicks, setFilter_btn_clicks] = useState(0)
    const uid = nanoid()

    const [figure, updateFigure] = useState({data: [], layout: {autosize: true}, frames: [], config: {displaylogo: false}})
    useEffect(() => {
        if (x_variable && y_variable){
            const opts = {
                method: "POST",
                body: JSON.stringify({
                    'x_value': x_variable,
                    'y_value': y_variable,
                    'fa_col': fa_col,
                    'fa_row': fa_row,
                    'f_value': f_value,
                    'animation_variable': animation_variable
                }),
                headers:{
                    "Content-Type": "application/json",
                }
            }
            
            fetch('/api/lineplot', opts)
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
    }, [x_variable, y_variable, animation_variable, fa_col, fa_row, filter_btn_clicks])
   
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
                        <label id={"line-normal-x-variable-label-"+uid}>X variable</label>
                        <Select
                            aria-labelledby={"line-normal-x-variable-label-"+uid}
                            name="line-normal-x-variable"
                            styles={customStyles}
                            options={optionsNc}
                            className="basic-single"
                            classNamePrefix="select"
                            isClearable={true}
                            isSearchable={true}
                            onChange={(value, {action}) => setXVariable(value ? value.value : null)}
                        />
                    </Col>
                    <Col>
                        <label id={"line-normal-y-variable-label-"+uid}>Y variable</label>
                        <Select
                            aria-labelledby={"line-normal-y-variable-label-"+uid}
                            name="line-normal-y-variable"
                            styles={customStyles}
                            options={optionsNc}
                            className="basic-single"
                            classNamePrefix="select"
                            isClearable={true}
                            isSearchable={true}
                            onChange={(value, {action}) => setYVariable(value ? value.value : null)}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <label id={"line-animation-variable-label-"+uid}>Animation variable</label>
                        <Select
                            aria-labelledby={"line-animation-variable-label-"+uid}
                            name="line-animation-variable"
                            styles={customStyles}
                            options={optionsAll}
                            className="basic-single"
                            classNamePrefix="select"
                            isClearable={true}
                            isSearchable={true}
                            onChange={(value, {action}) => setAnimationVariable(value ? value.value : null)}
                        /> 
                    </Col>
                    <Col>
                        <label id={"line-normal-fa_col-label-"+uid}>Facet col</label>
                        <Select
                            aria-labelledby={"line-normal-fa_col-label-"+uid}
                            name="line-normal-fa_col"
                            styles={customStyles}
                            options={optionsC}
                            className="basic-single"
                            classNamePrefix="select"
                            isClearable={true}
                            isSearchable={true}
                            onChange={(value, {action}) => setFa_col(value ? value.value : null)}
                        />
                    </Col>
                    <Col>
                        <label id={"line-normal-fa_row-label-"+uid}>Facet row</label>
                        <Select
                            aria-labelledby={"line-normal-fa_row-label-"+uid}
                            name="line-normal-fa_row"
                            styles={customStyles}
                            options={optionsC}
                            className="basic-single"
                            classNamePrefix="select"
                            isClearable={true}
                            isSearchable={true}
                            onChange={(value, {action}) => setFa_row(value ? value.value : null)}
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

export default LinePlot;