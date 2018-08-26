import React, { Component } from 'react';
import ipfs from '../ipfs'
import './upload.css'
import getWeb3 from '../getWeb3'
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import EXIF from 'exif-js';
import PropTypes from 'prop-types';
import 'typeface-roboto';
import store from '../../store'
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/6a24adb56fe24c919b1ca033ff24b8e1'))
const Linnia = require('@linniaprotocol/linnia-js')
const linnia = new Linnia(web3, ipfs, { hubAddress: '0x177bf15e7e703f4980b7ef75a58dc4198f0f1172' })


const styles = theme => ({
    
    input: {
      display: 'none',
    },
     
  });


class Upload extends Component {

    constructor(props){
        super()
        this.state = {
            ipfsHash: '',
            web3: null,
            buffer: null,
            account: null,
            meta:"",
            imagePreviewUrl: '',
            file:''
        }

        this.captureFile = this.captureFile.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        const { classes } = props;
        this.classes = classes;  
        this.onShare = this.onShare.bind(this);
    }

    async componentWillMount() {
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
        this.setState({file})
        console.log(this.state.file)
        reader.onloadend = () => {
          this.setState({ buffer: Buffer(reader.result) })
          console.log('buffer', this.state.buffer)
        }
    }

    _handleImageChange(e) {
        e.preventDefault();
    
        let reader = new FileReader();
        let file = e.target.files[0];
        
        reader.onloadend = () => {
          this.setState({
            file: file,
            buffer: Buffer(reader.result),
            imagePreviewUrl: reader.result
          });
        }
        reader.readAsDataURL(file)
        
      }

    //WHEN YOU SUBMIT AN IMAGE IT WILL UPLOAD TO IPFS
    async onSubmit(event) {
        var img = document.getElementById("imagePreview");
        var makeAndModel = document.getElementById("makeAndModel");
        var make = '';
        var model = '';
        var cameraSettings = '';
        var dateTimeOriginal = '';

        delete img.exifdata;
        
        EXIF.getData(img, function() {
           
            make = EXIF.getTag(this, "Make");
            model = EXIF.getTag(this, "Model");
            cameraSettings = EXIF.getTag(this, "undefined");
            dateTimeOriginal = EXIF.getTag(this, "DateTimeOriginal");

            if(make === undefined && model === undefined ) {
                make = 'No metadata found for this image';
                model = '';
                cameraSettings = '';
                dateTimeOriginal = '';
            }
            // makeAndModel.innerHTML = `${make}, ${model}, ${cameraSettings}, ${dateTimeOriginal}`;
        
        });

        this.setState({
            meta:`${make} ${model} ${cameraSettings} ${dateTimeOriginal}`
        })
        console.log("STAET METEAERAERT", this.state)

        event.preventDefault()
        console.log("ABOUT TO DEFINE records")
        const {records} = await linnia.getContractInstances();
        // const owner = "0x54CE79c444897dCC0E875409eF2b8CFd26d40Baa"
        

        const [owner] = await web3.eth.getAccounts();

        console.log("STATE BEFORE SUBMIT", this.state)
        console.log("ADDING...")
        ipfs.files.add(this.state.buffer, async (error, result) => {
            if(error) {
                console.error(error)
                return
            }
            this.setState({ ipfsHash: result[0].hash })
            console.log('ifpsHash', this.state.ipfsHash)
            const hash = linnia.web3.utils.sha3(JSON.stringify(this.state.buffer));
            console.log("ADDING WITH LINNI", hash)
            console.log("OWNER", owner)
            await records.addRecord(hash, {"name":"test"}, this.state.ipfsHash, {
                from: owner,
                gas: 500000,
                gasPrice: 20000000000
            },)
        })
    }

    onShare(){

    }

    render(){
        let {imagePreviewUrl} = this.state;
        let $imagePreview = null;
        if (imagePreviewUrl) {
          $imagePreview = (<img id="imagePreview" src={imagePreviewUrl} />);
        } else {
          $imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
        }
        return(
            <div id="upload">
                    <input
                        accept="image/*"
                        id="contained-button-file"
                        multiple
                        type="file"
                        className={this.classes.input}
                        onChange={(e)=>this._handleImageChange(e)} 
                    />
                     <label htmlFor="contained-button-file">
                        <Button 
                        variant="contained" 
                        component="span"
                       >
                        Upload
                        </Button>
                    </label>
                    <div className="previewComponent">
                        <div className="imgPreview">
                        {$imagePreview}
                        </div>
                    </div>
                    <div>
                    Metadata:<br></br> <span id="makeAndModel">{this.state.meta}</span>
                    </div>
                    <Button 
                        variant="contained"
                        onClick={this.onSubmit} >
                        Submit
                    </Button>
                
                <h3>Hash: {this.state.ipfsHash}</h3>

                {/* <form onSubmit={this.onShare} id="shareform">
                    <h6>Data Hash</h6>
                    <input type='text' onChange={this.captureFile} />
                    <h6>Recipient Public Key</h6>
                    <input type='text' onChange={this.captureFile} />
                    <h6>Data Hash</h6>
                    <input type='text' onChange={this.captureFile} />
                    <input type='submit' />
                </form> */}
                </div>
        )
    }
}

export default withStyles(styles)(Upload);