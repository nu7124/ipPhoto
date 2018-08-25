import React, { Component } from 'react';
import ipfs from '../ipfs'
import './upload.css'

class Upload extends Component {

    constructor(){
        super()
        this.state = {
            ipfsHash: '',
            web3: null,
            buffer: null,
            account: null
        }
    }


    captureFile(event) {
        event.preventDefault()
        const file = event.target.files[0]
        const reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => {
          this.setState({ buffer: Buffer(reader.result) })
          console.log('buffer', this.state.buffer)
        }
    }

    onSubmit(event) {
        event.preventDefault()
        ipfs.files.add(this.state.buffer, (error, result) => {
          if(error) {
            console.error(error)
            return
          }
          this.simpleStorageInstance.set(result[0].hash, { from: this.state.account }).then((r) => {
            return this.setState({ ipfsHash: result[0].hash })
            console.log('ifpsHash', this.state.ipfsHash)
          })
        })
    }

    render(){
        return(
            <div id="upload">
                <form onSubmit={this.onSubmit} >
                    <input type='file' onChange={this.captureFile} />
                    <input type='submit' />
                </form>
            </div>
        )
    }
}

export default Upload;