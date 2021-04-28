import React from "react";
import Nav from "react-bootstrap/Nav";
import NavLink from "react-bootstrap/NavLink";
import {Link, withRouter} from "react-router-dom";

function Navigation(){
    return(
        <div className="navigation" style={{backgroundColor: "Wheat"}}>
            <Nav className="justify-content-center flex-column" variant="pills">
                <Nav.Item>
                    <p className="text-center h3">Content</p>
                </Nav.Item>
                <NavLink href="/">Home view</NavLink>
                <NavLink href="/ClusteringView">Clustering view</NavLink>
                <NavLink href="/IndividualView">Individual view</NavLink>
            </Nav>
        </div>
    );
}

export default withRouter(Navigation);