import React, { useEffect, useState, Component } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import FilterCustom from "../FilterCustom";
import Select from 'react-select'

function ConfidenceInterval(props){
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

    const [variable, setVariable] = useState()
    const [conf_iv_lvl, setConf_iv_lvl] = useState(95)
    const [f_value, setF_value] = useState()
    const [filter_btn_clicks, setFilter_btn_clicks] = useState(0)

    const [figure, updateFigure] = useState()
    useEffect(() => {
        if (variable){
            const opts = {
                method: "POST",
                body: JSON.stringify({
                    'value': variable,
                    'ci_value': conf_iv_lvl,
                    'f_value': f_value
                }),
                headers:{
                    "Content-Type": "application/json",
                }
            }
            
            fetch('/api/confidenceinterval', opts)
                .then(res => {
                    if (res.ok){
                        return res.json()
                    }
                    throw res
                })
                .then(data => {
                    console.log(data)
                    if ("figure" in data){
                        createTable(
                            data.figure
                        )
                    }
                })
        }
    }, [variable, conf_iv_lvl, filter_btn_clicks])
   
    const createTable = ((data) =>{
        if ('sem' in data){
            const conf_iv = 
                <Table responsive bordered>
                    <thead>
                        <tr>
                            <th>mean</th>
                            <th>count</th>
                            <th>sem</th>
                            <th>{conf_iv_lvl}% c.i. lower bound</th>
                            <th>{conf_iv_lvl}% c.i. upper bound</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{data.mean}</td>
                            <td>{data.count}</td>
                            <td>{data.sem}</td>
                            <td>{data.lb}</td>
                            <td>{data.up}</td>
                        </tr>
                    </tbody>
                </Table>;
            updateFigure(conf_iv)
        }
    })

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
                    {figure}
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
                        <label>Confidence Interval of level(%)</label>
                        <input type="number" min="1" max="99"
                            className='form-control'
                            defaultValue={95}
                            onKeyUpCapture={(e) => {
                                if (e.target.value > 0 && e.target.value < 100){
                                    setConf_iv_lvl(e.target.value)
                                }}
                            }
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <label id="conf-iv-variable-label">Variables</label>
                        <Select
                            aria-labelledby="conf-iv-variable-label"
                            name="conf-iv-variable"
                            styles={customStyles}
                            options={optionsNc}
                            className="basic-single"
                            classNamePrefix="select"
                            isClearable={true}
                            isSearchable={true}
                            onChange={(value, {action}) => setVariable(value ? value.value : null)}
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

export default ConfidenceInterval;