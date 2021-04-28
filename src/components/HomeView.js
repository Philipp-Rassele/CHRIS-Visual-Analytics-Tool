import React, { useEffect, useState, Component } from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from "react-bootstrap/Table";
import Plot from 'react-plotly.js';

function HomeView(){
    const [info_tbl, setInfo_tbl] = useState() 
    useEffect(() => {
        const opts = {
            method: "GET",
            // body: JSON.stringify({
            //     'value': variable,
            //     'f_value': f_value
            // }),
            // headers:{
            //     "content-type": "application/json",
            // }
        }
        
        fetch('/api/homeviewdfinfo', opts)
            .then(res => {
                if (res.ok){
                    return res.json()
                }
                // throw res
            })
            .then(data => {
                if ("c1l" in data){
                   
                    data.c1l.map((item) => {
                        console.log(item[0], item[1])    
                    })
 
                    const tbl = 
                        <Table responsive bordered>
                            <thead>
                                <tr>
                                    <th colSpan="2"><b>Information about analyzed data</b></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                data.c1l.map((item) => 
                                    <tr key={item}>
                                        <td>{item[0]}</td>
                                        <td>{item[1]}</td>
                                    </tr>    
                                )}
                            </tbody>
                        </Table>

                    setInfo_tbl(tbl)
                }
            })
    }, [])

    // , responsive:true, autosize:true
    const [figure, updateFigure] = useState({data: [], layout: {}, frames: [], config: {displaylogo: false, responsive:true}})
    useEffect(() => {
        const opts = {
            method: "GET",
            // body: JSON.stringify({
            //     'value': variable,
            //     'f_value': f_value
            // }),
            // headers:{
            //     "content-type": "application/json",
            // }
        }
        
        fetch('/api/homeviewscattermap', opts)
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
    }, [])

    return(
        <div className="home_view">
            <Row noGutters={true}>
                <div className="col-3">
                    {info_tbl}
                </div>
                <div className="col">
                    <Plot 
                        data={figure.data}
                        layout={figure.layout}
                        frames={figure.frames}
                        config={figure.config}
                        useResizeHandler={true}
                        style={{"width":"100%"}}
                    />
                </div>
            </Row>
        </div>
    );
}

export default HomeView;