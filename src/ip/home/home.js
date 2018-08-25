import React, { Component } from 'react';
import Upload from '../upload/upload'
import './home.css'

class Home extends Component {
    render(){
        return(
            <div id="ip_home">
                <Upload />
            </div>
        )
    }
}

export default Home;