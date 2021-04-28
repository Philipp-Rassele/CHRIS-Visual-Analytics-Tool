import React, { useEffect, useState, Component } from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Plot from 'react-plotly.js';
import FilterCustom from "../FilterCustom";
import Select from 'react-select'
import { useDebounce } from "react-use";
// Unique id generator
import { nanoid } from 'nanoid';

function ScatterPlot(props){
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
    const [f_value, setF_value] = useState()
    const [filter_btn_clicks, setFilter_btn_clicks] = useState(0)
    const [min_cl_size, setMinClSize] = useState()
    const [min_samples, setMinSamples] = useState()
    const uid = nanoid()

    const [figure, updateFigure] = useState({data: [], layout: {autosize: true}, frames: [], config: {displaylogo: false}})
    useEffect(() => {
        console.log(variable)
        if (variable && variable.length > 1 && min_cl_size){
            let sv = []
            let el;
            for (el in variable){
                sv.push(variable[el].value)
            }
            const opts = {
                method: "POST",
                body: JSON.stringify({
                    'value': sv,
                    // 'colour': colour,
                    // 'fa_col': fa_col,
                    // 'fa_row': fa_row,
                    'min_value': min_cl_size,
                    'min_samples':min_samples,
                    'f_value': f_value,
                    // 'animation_variable': animation_variable
                }),
                headers:{
                    "Content-Type": "application/json",
                }
            }
            
            fetch('/api/clusteringview', opts)
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
    }, [variable, min_cl_size, min_samples, filter_btn_clicks])
    // animation_variable, colour, fa_col, fa_row, 
   
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
    // Debounce number input
    const [val, setVal] = useState();
    const [, cancel] = useDebounce(
        () => {
            setMinClSize(val)
        },
        850,
        [val]
    );

    const [val1, setVal1] = useState();
    const [, cancel1] = useDebounce(
        () => {
            setMinSamples(val1)
        },
        850,
        [val1]
    );

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
                        <label id={"scatter-plot-variable-label-"+uid}>Variables</label>
                        <Select
                            aria-labelledby={"scatter-plot-variable-label-"+uid}
                            name="scatter-plot-variable"
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
                        <Form.Group>
                            <Form.Label>Minimum cluster size</Form.Label>
                            <Form.Control type="number" min={1} 
                                placeholder='Minimum sample size'
                                value={val}
                                onChange={({currentTarget}) =>{
                                    setVal(currentTarget.value)
                                }}
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                            <Form.Label>Minimum sample size (optional)</Form.Label>
                            <Form.Control type="number" min={1}
                                placeholder='Minimum points that a cluster must contain'
                                value={val1}
                                onChange={({currentTarget}) =>{
                                    setVal1(currentTarget.value)
                                }}
                            />
                        </Form.Group>
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

export default ScatterPlot;