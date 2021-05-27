import React, { useState, useEffect }  from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function FilterCustom(props){
    return(
        <div className="custom_filter">
            <Row>
                <Col><Form.Label>{props.label}</Form.Label></Col>
            </Row>
            <Row>
                <Col>
                    <Form.Control type="text"
                        defaultValue={props.f_value ? props.f_value : null} 
                        onChange={(e) => props.handleChange(e.target.value)}
                        placeholder='var1>10, var2==1, 10 <= var3 <= 15, var4 == "Value1", var5 in [val1, val2, val3, val4]'
                    />
                </Col>
                <Col md="auto">
                    <Button variant="primary" 
                        onClick={() => props.setFilter_btn_clicks(props.count+1)}
                    >Apply</Button>
                </Col>
            </Row>
        </div>
    );
}

export default FilterCustom;