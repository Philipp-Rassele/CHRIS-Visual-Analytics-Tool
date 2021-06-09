import React, { useEffect, useState, Component} from "react";
import { Row, Col, Form } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Plot from 'react-plotly.js';
import FilterCustom from "../FilterCustom";
import Select from 'react-select'
import { useDebounce } from "react-use";
// Unique id generator
import { nanoid } from 'nanoid';

function BarPyramidPlot(props){
    const [optionsAll, setAllOptions] = useState(props.optionsAll)
    const [optionsNc, setNcOptions] = useState(props.optionsNc)
    const [optionsC, setCOptions] = useState(props.optionsC)

    const [x_variable, setXVariable] = useState(props.x_value ? props.x_value : null)
    const [y_variable, setYVariable] = useState(props.y_value ? props.y_value : null)
    const [binary_var, setBinaryVar] = useState(props.bi_value ? props.bi_value : null)
    const [bins, setBinsVar] = useState(props.bins ? String(props.bins) : null)
    const [uid, setUID] = useState(nanoid())

    const [method, setMethod] = useState(props.method ? props.method : 'count')
    const [f_value, setF_value] = useState(props.f_value ? props.f_value : null)
    const [filter_btn_clicks, setFilter_btn_clicks] = useState(0)

    const [figure, updateFigure] = useState({data: [], layout: {autosize: true}, frames: [], config: {displaylogo: false}})

    useEffect(() => {
        if (x_variable && y_variable && binary_var){
            if (bins != '' && bins > 0){
                const opts = {
                    method: "POST",
                    body: JSON.stringify({
                        'x_value': x_variable,
                        'y_value': y_variable,
                        'bi_value': binary_var,
                        'bins': bins,
                        'method': method,
                        'f_value': f_value,
                        'uid':uid,
                        'path':window.location.pathname
                    }),
                    headers:{
                        "Content-Type": "application/json",
                    }
                }
                
                fetch('/api/barpyramidplot', opts)
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
        }
    }, [x_variable, y_variable, binary_var, bins, method, filter_btn_clicks])
   
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
        props.removeButtonHandler(props.index, 'bar-pyramid-plot-'+uid)
    }

    // Debounce number input
    const [val, setVal] = useState(props.bins ? String(props.bins) : null);
    const [, cancel] = useDebounce(
        () => {
            setBinsVar(val)
        },
        850,
        [val]
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
                        <label id="bppy-x-variable-label">X variable</label>
                        <Select
                            aria-labelledby="bppy-x-variable-label"
                            name="bppy-x-variable"
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
                        <label id="bppy-y-variable-label">Y variable</label>
                        <Select
                            aria-labelledby="bppy-y-variable-label"
                            name="bppy-y-variable"
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
                </Row>
                <Row>
                    <Col>
                        <label id="bppy-binary-var-label">Binary variable</label>
                        <Select
                            aria-labelledby="bp-binary-var-label"
                            name="bppy-binary-var"
                            defaultValue={props.optionsC.filter(option => option.value === props.bi_value)}
                            styles={customStyles}
                            options={optionsC}
                            className="basic-single"
                            classNamePrefix="select"
                            isClearable={true}
                            isSearchable={true}
                            onChange={(value, {action}) => setBinaryVar(value ? value.value : null)}
                        />
                    </Col>
                    <Col>
                        <Form.Group controlId={'preferredbins'+uid}>
                            <Form.Label>Amount of preferred bins</Form.Label>
                            <Form.Control type="number" min={1} 
                                placeholder='Amount of preferred bins'
                                value={val}
                                onChange={({currentTarget}) =>{
                                    setVal(currentTarget.value)
                                }}
                                // onKeyUp={(e) => setBinsVar(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <label id="bppy-method-label">Method</label>
                        <Select
                            aria-labelledby="bppy-method-label"
                            name="bppy-method"
                            defaultValue={props.method ? {'label':props.method, 'value':props.method} : {'label': 'count', 'value':'count'}}
                            styles={customStyles}
                            options={[
                                {'label': 'count', 'value':'count'},
                                {'label': 'sum', 'value':'sum'},
                                {'label': 'avg', 'value':'avg'},
                                {'label': 'min', 'value':'min'},
                                {'label': 'max', 'value':'max'}
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

export default BarPyramidPlot;