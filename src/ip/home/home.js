import React, { Component } from 'react';
import Upload from '../upload/upload';
import './home.css';
import Header from '../header';

class Home extends Component {
    render(){
        return (
            <div>
                <Header></Header>
                <div id="ip_home">
                    <Upload />
                </div>
            </div>
        )
    }
}

export default Home;