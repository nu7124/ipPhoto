import React, { Component } from 'react';
import ipfs from '../ipfs'
import './upload.css'
import getWeb3 from '../getWeb3'
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/6a24adb56fe24c919b1ca033ff24b8e1'))
const Linnia = require('@linniaprotocol/linnia-js')
const linnia = new Linnia(web3, ipfs)



class Upload extends Component {

    constructor(){
        super()
        this.state = {
            ipfsHash: '',
            web3: null,
            buffer: null,
            account: null
        }

        this.captureFile = this.captureFile.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentWillMount() {
        // Get network provider and web3 instance.
        // See utils/getWeb3 for more info.
        
        getWeb3
        .then(results => {
          this.setState({
            web3: results.web3
          })
          console.log("Got WEB3")
          // Instantiate contract once web3 provided.
        //   this.instantiateContract()
        })
        .catch(() => {
          console.log('Error finding web3.')
        })
    }

    //AFTER AN IMAGE IS UPLOADED TO SAVE THE PIC INFO
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

    //WHEN YOU SUBMIT AN IMAGE IT WILL UPLOAD TO IPFS
    async onSubmit(event) {
        event.preventDefault()
        console.log("ABOUT TO DEFINE records")
        const {records} = await linnia.getContractInstances();

        console.log("STATE BEFORE SUBMIT", this.state)
        console.log("ADDING...")
        ipfs.files.add(this.state.buffer, (error, result) => {
          if(error) {
            console.error(error)
            return
          }
        //   this.simpleStorageInstance.set(result[0].hash, { from: this.state.account }).then((r) => {
            this.setState({ ipfsHash: result[0].hash })
            console.log('ifpsHash', this.state.ipfsHash)
            records.addRecord(this.state.ipfsHash, {name:'test'})
            .then(()=>{
                console.log("IPFS hash has beed added to the record")
            })
        //   })
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