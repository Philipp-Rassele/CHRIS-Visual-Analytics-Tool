import React, { useEffect, useState, useMemo} from "react";
import { Row, Col } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import Plot from 'react-plotly.js';
import FilterCustom from "../FilterCustom";
import Select from 'react-select'
// Unique id generator
import { nanoid } from 'nanoid';
import SliderCustom from "../SliderCustom";

function ViolinPlot(props){
    const [optionsAll, setAllOptions] = useState(props.optionsAll)
    useEffect(() => {
        if (! props.optionsAll){
            fetch('/api/dropdown-all-options').then(res => res.json()).then(data => {
                setAllOptions(data.options)
            })
        }
    }, [])

    const [optionsNc, setNcOptions] = useState(props.optionsNc)
    useEffect(() => {
        if (! props.optionsNc){
            fetch('/api/dropdown-non-categorical-options').then(res => res.json()).then(data => {
                setNcOptions(data.options)
            })
        }
    }, [])

    const [optionsC, setCOptions] = useState(props.optionsC)
    useEffect(() => {
        if (! props.optionsC){
            fetch('/api/dropdown-categorical-options').then(res => res.json()).then(data => {
                setCOptions(data.options)
            })
        }
    }, [])
    
    const [variable, setVariable] = useState(props.variable ? props.variable : null)
    const [animation_variable, setAnimationVariable] = useState(props.an_value ? props.an_value : null)
    const [fa_col, setFa_col] = useState(props.fa_col ? props.fa_col : null)
    const [fa_row, setFa_row] = useState(props.fa_row ? props.fa_row : null)
    const [f_value, setF_value] = useState(props.f_value ? props.f_value : null)
    const [filter_btn_clicks, setFilter_btn_clicks] = useState(0)
    const [uid, setUID] = useState(props.index ? props.index : nanoid())
    // const uid = nanoid()

    const [figure, updateFigure] = useState({data: [], layout: {autosize: true}, frames: [], config: {displaylogo: false}})
    useEffect(() => {
        if (variable){
            const opts = {
                method: "POST",
                body: JSON.stringify({
                    'value': variable,
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
            
            fetch('/api/violinplot', opts)
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
    }, [variable, animation_variable, fa_col, fa_row, filter_btn_clicks])
   
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

    const sliderStyle = {
        position: "relative",
        width: "100%",
    };

    const [toggleOption, settoggleOption] = useState({'display':'block'})
    const handleRmvBtn = () =>{
        props.removeButtonHandler(props.index, 'violin-plot-'+uid)
    }

//     lg={4} md={12} xs={12}
    const updateInteractiveFigureSize = (value) => {
        if (props.index && props.updateInteractiveFigureSize){
            props.updateInteractiveFigureSize(value, 'block-plot'+props.index, 'plot-'+props.index)
        }
        // else{
        //     let w = window.innerWidth;
        //     let el = document.getElementById('block-plot'+uid)
        //     if (w < 576){
        //         el.removeAttribute('class')
        //         el.classList.add('col-'+value)
        //         el.classList.add('col-md-12')
        //         el.classList.add('col-lg-4')
        //         document.querySelector('[id=plot-'+uid+']').querySelector('[data-title="Autoscale"]').click()
        //     }else if(w > 768 && w < 992){
        //         el.removeAttribute('class')
        //         el.classList.add('col-12')
        //         el.classList.add('col-md-'+value)
        //         el.classList.add('col-lg-4')
        //         document.querySelector('[id=plot-'+uid+']').querySelector('[data-title="Autoscale"]').click()
        //     }else if (w > 991){
        //         el.removeAttribute('class')
        //         el.classList.add('col-12')
        //         el.classList.add('col-md-12')
        //         el.classList.add('col-lg-'+value)
        //         document.querySelector('[id=plot-'+uid+']').querySelector('[data-title="Autoscale"]').click()
        //     }
        // }
    }
    
    return(
        <div>
        {/* lg={4} md={12} xs={12} id={'block-plot'+uid} */}
        {/* xs={xs} md={md} lg={lg}  */}
            <Row noGutters={true}>
                <Col id={'plot-'+uid}>
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
            <Row className="justify-content-center align-items-center">
                <Col className="pr-3 pl-3" xs="auto">
                    <p>Size:</p>
                </Col>
                <Col className="pr-0 pl-0">
                    <SliderCustom updateInteractiveFigureSize={updateInteractiveFigureSize}
                    value={(window.innerWidth < 576) ? 12 : 4}/>
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
                        <label id={"vp-variable--"+uid}>Variables</label>
                        <Select
                            aria-labelledby={"vp-variable-label-"+uid}
                            name="vp-variable"
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
                        <label id={"vp-variable-animation-variable-label-"+uid}>Animation variable</label>
                        <Select
                            aria-labelledby={"vp-variable-animation-variable-label-"+uid}
                            name="vp-variable-animation-variable"
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
                </Row>
                <Row>
                    <Col>
                        <label id={"vp-fa_col-label-"+uid}>Facet col</label>
                        <Select
                            aria-labelledby={"vp-fa_col-label-"+uid}
                            name="vp-fa_col"
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
                        <label id={"vp-fa_row-label"+uid}>Facet row</label>
                        <Select
                            aria-labelledby={"vp-fa_row-label-"+uid}
                            name="vp-fa_row"
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

export default ViolinPlot;