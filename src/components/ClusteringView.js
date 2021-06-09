import React, { useEffect, useState, Component, useRef, useReducer, useMemo} from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup"
import Plot from 'react-plotly.js';
import FilterCustom from "./FilterCustom";
import Select from 'react-select'
import { useDebounce } from "react-use";
// import ScatterPlot from './plots/ScatterPlot';
// Unique id generator
import { nanoid } from 'nanoid';


function ClusteringView(props){
    // const [optionsAll, setAllOptions] = useState(props.optionsAll)
    // const [optionsNc, setNcOptions] = useState(props.optionsNc)
    // const [optionsC, setCOptions] = useState(props.optionsC)

    const [variable, setVariable] = useState()
    const [f_value, setF_value] = useState()
    const [filter_btn_clicks, setFilter_btn_clicks] = useState(0)
    const [min_cl_size, setMinClSize] = useState()
    const [min_samples, setMinSamples] = useState()
    const [comp_vars, setCompVars] = useState()
    const [comp_plot, setComPlotVar] = useState()
    // const [demo_grp_select, setDemoGroupSelect] = useState(false)
    const [uid, setUID] = useState(nanoid())
    
    const [figure, updateFigure] = useState({data: [], layout: {autosize: true}, frames: [], config: {displaylogo: false}})
    const [figure_geo, updateFigureGeo] = useState({data: [], layout: {autosize: true}, frames: [], config: {displaylogo: false}})
    useEffect(() => {
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
                    if ("figure_geo" in data){
                        updateFigureGeo(
                            JSON.parse(data.figure_geo)
                        )
                    }
                })
        }
    }, [variable, min_cl_size, min_samples, filter_btn_clicks])
    
    const [figure_comp, updateFigComp] = useState({data: [], layout: {autosize: true}, frames: [], config: {displaylogo: false}})
    useEffect(() => {
        if (comp_plot && comp_vars.length > 0){
            // let sv = []
            let cv = []
            let ncv = []
            let el;
            // console.log(optionsNc)
            console.log(comp_vars[0])
            for (el in comp_vars){
                // sv.push(variable[el].value)
                console.log(el)
                // console.log(optionsNc.includes(comp_vars[el]))
                if (props.optionsC.some(e => (e.value == comp_vars[el].value))){
                    cv.push(comp_vars[el].value)
                }else if(props.optionsNc.some(e => (e.value == comp_vars[el].value))){
                    ncv.push(comp_vars[el].value)
                }
            }

            const opts = {
                method: "POST",
                body: JSON.stringify({
                    'ncv_values': ncv,
                    'cv_values': cv,
                    'plot_type': comp_plot.value,
                    'f_value': f_value
                }),
                headers:{
                    "Content-Type": "application/json",
                }
            }
            const plot = '/api/selectiongroupcompare'

            if (ncv.length > 0){
                fetch(plot, opts)
                    .then(res => {
                        if (res.ok){
                            return res.json()
                        }
                        return {}
                        // throw res
                        // throw new Error(message);
                    })
                    .then(data => {
                        if ("figure_comp" in data){
                            updateFigComp(
                                JSON.parse(data.figure_comp)
                            )
                        }
                    })
            }
        }
    }, [comp_vars, comp_plot])


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
    const [toggleOption2, settoggleOption2] = useState({'display':'block'})
    // Debounce number inputs
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

    let handleSelect = ((e) =>{
        if (document.getElementById("formBasicCheckbox"+uid).checked){
			let sp = []
			for (const key in figure_geo.data){
                // console.log(figure_geo.data[key])
				// console.log(figure_geo.data[key].selectedpoints)
				const spA = figure_geo.data[key].selectedpoints
				for (const elem in spA){
					sp.push(figure_geo.data[key].customdata[spA[elem]][0])
				}
            }

            if (variable && variable.length > 1){
                let sv = []
                let el;
                for (el in variable){
                    sv.push(variable[el].value)
                }

                const opts = {
                    method: "POST",
                    body: JSON.stringify({
                        'value': sv,
                        'sP': sp,
                        'f_value': f_value
                        // 'selection_count':selection_count
                    }),
                    headers:{
                        "Content-Type": "application/json",
                    }
                }
                
                fetch('/api/clusteringselectioncolourupdate', opts)
                    .then(res => {
                        if (res.ok){
                            return res.json()
                        }
                        throw res
                    })
                    .then(data => {
                        if ("figure_geo" in data){
                            updateFigureGeo(
                                JSON.parse(data.figure_geo)
                            )
                        }
                    })
            }
		}
    })

    const dstyle = {
        'display':'flex'
        , 'flex-flow':'row wrap'
        , 'justify-content':'space-evenly'
        , 'align-content':'stretch'
    }

    const select_plots_options = [
        {'label':'violin plot', 'value':'violin plot'},
        {'label':'bar plot', 'value':'bar plot'},
        {'label':'histogram plot', 'value':'histogram plot'},
        {'label':'line plot', 'value':'line plot'}
    ]


    return(
        <div className="clustering_view">
            <Row style={dstyle} noGutters={true}>
                <Col  lg={6} md={12} xs={12}>
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
                        {/* <Col style={removeButton ? {'display':'block'} : {'display':'none'}}
                            xs="auto"
                        >
                            <Button size="sm" onClick={handleRmvBtn}>
                                Remove plot
                            </Button>
                        </Col> */}
                    </Row>
                    <div style={toggleOption}>
                        <Row>
                            <Col>
                                <label id={"scatter-plot-variable-label-"+uid}>Variables</label>
                                <Select
                                    aria-labelledby={"scatter-plot-variable-label-"+uid}
                                    name="scatter-plot-variable"
                                    styles={customStyles}
                                    options={props.optionsAll}
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
                                        placeholder='Minimum points that a cluster must contain'
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
                                        placeholder='Conservative clustering level. Normally equal to minimum cluster size.'
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
                </Col>
                <Col  lg={6} md={12} xs={12}>
                    <Row noGutters={true}>
                        <Col>
                            <Plot 
                                data={figure_geo.data}
                                layout={figure_geo.layout}
                                frames={figure_geo.frames}
                                config={figure_geo.config}
                                onSelected={(e) => handleSelect(e)}
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
                                if (toggleOption2.display == 'block'){
                                    settoggleOption2({'display':'none'})
                                }else if (toggleOption2.display == 'none'){
                                    settoggleOption2({'display':'block'})
                                }
                            }}>Toggle options</Button>
                        </Col>
                    </Row>
                    <div style={toggleOption2}>
                        <Row noGutters={true}>
                            <Col>
                            <Form.Group controlId={"formBasicCheckbox"+uid} >
                                <Form.Check type="checkbox" 
                                    label="Activate selection of demographic groups" 
                                    // onChange={(e) => {
                                    //     setDemoGroupSelect(e.target.checked)
                                    // }}
                                    />
                            </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <label id={"scatter-plot-compare-variable-label-"+uid}>Variables to compare selections with</label>
                                <Select
                                    aria-labelledby={"scatter-plot-compare-variable-label-"+uid}
                                    name="scatter-plot-compare-variable"
                                    styles={customStyles}
                                    options={props.optionsAll}
                                    className="basic-multiple"
                                    classNamePrefix="select"
                                    isMulti
                                    // isClearable={true}
                                    isSearchable={true}
                                    onChange={(value) => setCompVars(value ? value: null)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <label id={"selection-plot-variable-label-"+uid}>Select plot were variables are compared</label>
                                <Select
                                    aria-labelledby={"selection-plot-variable-label-"+uid}
                                    name="scatter-plot-compare-variable"
                                    styles={customStyles}
                                    options={select_plots_options}
                                    className="basic-select"
                                    classNamePrefix="select"
                                    // isClearable={true}
                                    isSearchable={true}
                                    onChange={(value) => setComPlotVar(value ? value: null)}
                                />
                            </Col>
                        </Row>
                    </div>
                </Col>
                <Col  lg={12} md={12} xs={12}>
                    <Row noGutters={true}>
                        <Col>
                            <Plot 
                                data={figure_comp.data}
                                layout={figure_comp.layout}
                                frames={figure_comp.frames}
                                config={figure_comp.config}
                                useResizeHandler={true}
                                className="d-flex h-auto"
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    );
}

export default ClusteringView;