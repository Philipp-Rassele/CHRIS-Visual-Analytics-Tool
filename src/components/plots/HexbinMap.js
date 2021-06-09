import React, { useEffect, useState, Component } from "react";
import { Row, Col, FormControl } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Plot from 'react-plotly.js';
import FilterCustom from "../FilterCustom";
import Select from 'react-select'
import Form from "react-bootstrap/Form";
// Unique id generator
import { nanoid } from 'nanoid';
import { useDebounce } from "react-use";
import SliderCustom from "../SliderCustom";

function HexbinMap(props){
    const [optionsAll, setAllOptions] = useState(props.optionsAll)
    const [optionsNc, setNcOptions] = useState(props.optionsNc)
    const [optionsC, setCOptions] = useState(props.optionsC)

    const [variable, setVariable] = useState(props.variable ? props.variable : null)
    const [animation_variable, setAnimationVariable] = useState(props.an_value ? props.an_value : null)
    const [aggmethod, setMethod] = useState(props.m_value ? props.m_value : 'count')
    const [nr_hexs, setNrHexs] = useState(props.nr_hexs ? String(props.nr_hexs) : null)
    const [f_value, setF_value] = useState(props.f_value ? props.f_value : null)
    const [filter_btn_clicks, setFilter_btn_clicks] = useState(0)
    const [uid, setUID] = useState(props.index ? props.index : nanoid())

    const [figure, updateFigure] = useState({data: [], layout: {autosize: true}, frames: [], config: {displaylogo: false}})
    useEffect(() => {
        if (variable && nr_hexs && nr_hexs != '' && nr_hexs > 0){
            const opts = {
                method: "POST",
                body: JSON.stringify({
                    'value': variable,
                    'method': aggmethod,
                    'nr_hexs': nr_hexs,
                    'f_value': f_value,
                    'animation_variable': animation_variable,
                    'uid':uid,
                    'path':window.location.pathname
                }),
                headers:{
                    "content-type": "application/json",
                }
            }
            
            fetch('/api/hexbinmap', opts)
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
    }, [variable, animation_variable, aggmethod, nr_hexs, filter_btn_clicks])
   
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

    // Toggle var for options and remove handler for removing plot
    const [toggleOption, settoggleOption] = useState({'display':'block'})
    const handleRmvBtn = () =>{
        props.removeButtonHandler(props.index, 'hexbin-map-'+uid)
    }

    // Debounce nr_hex number input
    const [val, setVal] = useState(props.nr_hexs ? String(props.nr_hexs) : null);
    const [, cancel] = useDebounce(
        () => {
            setNrHexs(val)
        },
        850,
        [val]
    );

    const updateInteractiveFigureSize = (value) => {
        if (props.index && props.updateInteractiveFigureSize){
            props.updateInteractiveFigureSize(value, 'block-plot'+props.index, 'plot-'+props.index)
        }
    }

    return(
        <div>
            <Row noGutters={true}>
                <Col id={'plot-'+props.index}>
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
                        <label id={"map-hexbin-variable-label-"+uid}>Variables</label>
                        <Select
                            aria-labelledby={"map-hexbin-variable-label-"+uid}
                            name="map-hexbin-variable"
                            defaultValue={props.optionsAll.filter(option => option.value === props.variable)}
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
                        <label id={"map-hexbin-animation-variable-label-"+uid}>Animation variable</label>
                        <Select
                            aria-labelledby={"map-hexbin-animation-variable-label-"+uid}
                            name="map-hexbin-animation-variable"
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
                        <label id={"map-hexbin-method-label-"+uid}>Aggregation method</label>
                        <Select
                            defaultValue={props.m_value ? {'label':props.m_value, 'value':props.m_value}:{'label': 'count', 'value':'count'}}
                            aria-labelledby={"map-hexbin-method-label-"+uid}
                            name="map-hexbin-method"
                            styles={customStyles}
                            options={[
                                {'label': 'count', 'value':'count'},
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
                    <Col>
                        <Form.Group controlId={'preferredbins'+uid}>
                            <Form.Label>Amount of preferred bins</Form.Label>
                            <Form.Control  type="number"
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

export default HexbinMap;