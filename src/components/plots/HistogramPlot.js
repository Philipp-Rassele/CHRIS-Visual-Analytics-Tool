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

function HistogramPlot(props){
    const [optionsAll, setAllOptions] = useState(props.optionsAll)
    const [optionsNc, setNcOptions] = useState(props.optionsNc)
    const [optionsC, setCOptions] = useState(props.optionsC)

    const [variable, setVariable] = useState(props.variable ? props.variable : null)
    const [animation_variable, setAnimationVariable] = useState(props.an_value ? props.an_value : null)
    const [colour, setColourVar] = useState(props.colour ? props.colour : null)
    const [fa_col, setFa_col] = useState(props.fa_col ? props.fa_col : null)
    const [fa_row, setFa_row] = useState(props.fa_row ? props.fa_row : null)
    const [f_value, setF_value] = useState(props.f_value ? props.f_value : null)
    const [filter_btn_clicks, setFilter_btn_clicks] = useState(0)
    const [uid, setUID] = useState(nanoid())

    const [figure, updateFigure] = useState({data: [], layout: {autosize: true}, frames: [], config: {displaylogo: false}})
    useEffect(() => {
        if (variable){
            const opts = {
                method: "POST",
                body: JSON.stringify({
                    'value': variable,
                    'colour': colour,
                    'fa_col': fa_col,
                    'fa_row': fa_row,
                    'f_value': f_value,
                    'animation_variable': animation_variable,
                    'uid':uid,
                    'path':window.location.pathname
                }),
                headers:{
                    "Content-Type": "application/json",
                }
            }
            
            fetch('/api/histogramplot', opts)
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
    }, [variable, animation_variable, colour, fa_col, fa_row, filter_btn_clicks])
   
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
        props.removeButtonHandler(props.index, 'histogram-plot-'+uid)
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
                        <label id={"hist-variable-label-"+uid}>Variables</label>
                        <Select
                            aria-labelledby={"hist-variable-label-"+uid}
                            name="hist-variable"
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
                    <Col>
                        <label id={"hist-colour-var-label-"+uid}>Colour</label>
                        <Select
                            aria-labelledby={"hist-colour-var-label-"+uid}
                            name="hist-colour-var"
                            defaultValue={props.optionsC.filter(option => option.value === props.colour)}
                            styles={customStyles}
                            options={optionsC}
                            className="basic-single"
                            classNamePrefix="select"
                            isClearable={true}
                            isSearchable={true}
                            onChange={(value, {action}) => setColourVar(value ? value.value : null)}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <label id={"hist-animation-variable-label-"+uid}>Animation variable</label>
                        <Select
                            aria-labelledby={"hist-animation-variable-label-"+uid}
                            name="hist-animation-variable"
                            defaultValue={props.optionsAll.filter(option => option.value === props.an_value)}
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
                        <label id={"hist-fa_col-label-"+uid}>Facet col</label>
                        <Select
                            aria-labelledby={"hist-fa_col-label-"+uid}
                            name="hist-fa_col"
                            defaultValue={props.optionsC.filter(option => option.value === props.fa_col)}
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
                        <label id={"hist-fa_row-label-"+uid}>Facet row</label>
                        <Select
                            aria-labelledby={"hist-fa_row-label-"+uid}
                            name="hist-fa_row"
                            defaultValue={props.optionsC.filter(option => option.value === props.fa_row)}
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
                            f_value={props.f_value ? props.f_value : null}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default HistogramPlot;