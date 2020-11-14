import React, {useState} from 'react'
import { Button, Input, ServerStyleSheets } from '@material-ui/core';
import {db, storage} from './firebase';
import firebase from 'firebase';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import axios from './axios';


function ImageUpload({username}) {

    const [caption, setCaption] = useState('');
    const [image, setImage] = useState();
    const [progressbar, setProgressbar] = useState(0);
    const [url, setUrl] = useState('');

    const chooseFile = (event) => {
        if(event.target.files[0]){
            setImage(event.target.files[0]); //helps to pick 1 file
        }
    }

    const handleUpload = () => {
        //there is a "storage" section in firebase, it uploads the image data in its "images" folder.
        const uploadTask = storage.ref(`images/${image.name}`).put(image); //uploads the image to firebase, firebase cerates the url link to it
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                //progress function ...
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgressbar(progress);
            },
            (error) => {
                //error function...
                alert(error.message);
            },
            //complete uploaded (uploadTask)? do below action
            () => {
                //storage in db 
                storage
                    .ref("images")
                    .child(image.name)
                    .getDownloadURL()
                    .then(url => {
                        setUrl(url);
                        //mongo db uses url of the uploaded image stored in firebase and stores the post schema-data in mongodb
                        axios.post('/upload', {
                            caption: caption,
                            user: username,
                            image: url,
                            comments: []
                        });

                        setProgressbar(0);
                        setCaption('');
                        setImage(null);
                    });
            }

        )
    }

    return (
        <div className = "imageUpload" >
            {/**
             * 1 Caption text input 
             * 2 File uploader for image upload
             * 3 Post button!
            */}
            <progress value = {progressbar} max = "100" className = "imageUpload__progress" /><br/>
            <Input type = "text" value = {caption} onChange = {e => setCaption(e.target.value)} placeholder = "Enter caption"/><br/>
            <input type = "file" onChange = {chooseFile}/><br/>
            <Button onClick = {handleUpload} variant="contained" color="default" startIcon = {<CloudUploadIcon/>} className = "imageUpload__button">Post</Button>
        </div>
    )
}

export default ImageUpload
