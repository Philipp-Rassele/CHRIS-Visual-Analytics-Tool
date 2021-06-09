import React, { useEffect, useState, Component } from "react";
import { Row, Col } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Plot from 'react-plotly.js';
import FilterCustom from "../FilterCustom";
import Select from 'react-select'
// Unique id generator
import { nanoid } from 'nanoid';

function BarPlot(props){
    const [optionsAll, setAllOptions] = useState(props.optionsAll)
    const [optionsNc, setNcOptions] = useState(props.optionsNc)
    const [optionsC, setCOptions] = useState(props.optionsC)

    const [x_variable, setXVariable] = useState(props.x_value ? props.x_value : null)
    const [y_variable, setYVariable] = useState(props.y_value ? props.y_value : null)
    const [animation_variable, setAnimationVariable] = useState(props.an_value ? props.an_value : null)
    const [colour, setColourVar] = useState(props.colour ? props.colour : null)
    const [fa_col, setFa_col] = useState(props.fa_col ? props.fa_col : null)
    const [fa_row, setFa_row] = useState(props.fa_row ? props.fa_row : null)
    const [f_value, setF_value] = useState(props.f_value ? props.f_value : null)
    const [filter_btn_clicks, setFilter_btn_clicks] = useState(0)
    const [uid, setUID] = useState(nanoid())

    const [figure, updateFigure] = useState({data: [], layout: {autosize: true}, frames: [], config: {displaylogo: false}})
    useEffect(() => {
        if (x_variable || y_variable){
            const opts = {
                method: "POST",
                body: JSON.stringify({
                    'x_value': x_variable,
                    'y_value': y_variable,
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
            
            fetch('/api/barplot', opts)
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
    }, [x_variable, y_variable, animation_variable, colour, fa_col, fa_row, filter_btn_clicks])
   
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
        props.removeButtonHandler(props.index, 'bar-plot-'+uid)
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
                        <label id={"bp-x-variable-label-"+uid}>X variable</label>
                        <Select
                            aria-labelledby={"bp-x-variable-label-"+uid}
                            name="bp-x-variable"
                            defaultValue={props.optionsAll.filter(option => option.value === props.x_value)}
                            styles={customStyles}
                            options={optionsAll}
                            className="basic-single"
                            classNamePrefix="select"
                            isClearable={true}
                            isSearchable={true}
                            onChange={(value, {action}) => setXVariable(value ? value.value : null)}
                        />
                    </Col>
                    <Col>
                        <label id={"bp-y-variable-label-"+uid}>Y variable</label>
                        <Select
                            aria-labelledby={"bp-y-variable-label-"+uid}
                            name="bp-y-variable"
                            defaultValue={props.optionsAll.filter(option => option.value === props.y_value)}
                            styles={customStyles}
                            options={optionsAll}
                            className="basic-single"
                            classNamePrefix="select"
                            isClearable={true}
                            isSearchable={true}
                            onChange={(value, {action}) => setYVariable(value ? value.value : null)}
                        />
                    </Col>
                    <Col>
                        <label id={"bp-colour-var-label-"+uid}>Colour</label>
                        <Select
                            aria-labelledby={"bp-colour-var-label-"+uid}
                            name="bp-colour-var"
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
                        <label id={"bp-animation-variable-label-"+uid}>Animation variable</label>
                        <Select
                            aria-labelledby={"bp-animation-variable-label-"+uid}
                            name="bp-animation-variable"
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
                        <label id={"bp-fa_col-label-"+uid}>Facet col</label>
                        <Select
                            aria-labelledby={"bp-fa_col-label-"+uid}
                            name="bp-fa_col"
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
                        <label id={"bp-fa_row-label-"+uid}>Facet row</label>
                        <Select
                            aria-labelledby={"bp-fa_row-label-"+uid}
                            name="bp-fa_row"
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

export default BarPlot;