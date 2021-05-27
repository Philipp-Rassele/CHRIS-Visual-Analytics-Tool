import React from "react";
import Nav from "react-bootstrap/Nav";
import NavLink from "react-bootstrap/NavLink";
import Button from "react-bootstrap/Button";
import {Link, withRouter} from "react-router-dom";

function Navigation(props){

    const saveSession = (e) => {
        const opts = {
            method: "GET"
            // ,
            // body: JSON.stringify({
            //     'value': variable,
            //     'fa_col': fa_col,
            //     'fa_row': fa_row,
            //     'f_value': f_value,
            //     'animation_variable': animation_variable,
            //     'uid':uid,
            //     'path':window.location.pathname
            // }),
            // headers:{
            //     "Content-Type": "application/json",
            // }
        }
        
        fetch('/api/saveSession', opts)
            .then(res => {
                if (res.ok){
                    return res.json()
                }
                throw res
            })
            .then(data => {
                if ("sdic" in data){
                    const name = prompt("Please enter filename");
                    if (name){
                        const cname = name.replace(/[\W]/gi, '');
                        const a = document.createElement("a");
                        const file = new Blob([JSON.stringify(data.sdic)], {type: "text/plain"});
                        a.href = URL.createObjectURL(file);
                        a.download = 'session'.concat("_", cname, ".json");
                        a.click();
                    }
                    
                }
            })
    }

    const btnStyle = {
        'margin': '0.5rem 1rem'
    }

    return(
        <div className="navigation" style={{backgroundColor: "Wheat"}}>
            <Nav className="justify-content-center flex-column" variant="pills">
                <Nav.Item>
                    <p className="text-center h3">Content</p>
                </Nav.Item>
                <NavLink href="/">Home view</NavLink>
                <NavLink href="/ClusteringView">Clustering view</NavLink>
                <NavLink href="/IndividualView">Individual view</NavLink>
                <Button type="primary" onClick={(e) => saveSession()} style={btnStyle}>Save session</Button>
                <Button type="primary" onClick={(e) => props.loadSession(e)} style={btnStyle}>Load session</Button>
            </Nav>
        </div>
    );
}

export default withRouter(Navigation);