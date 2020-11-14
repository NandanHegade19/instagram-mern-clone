import './App.css';
import PostComp from './PostComp';
import React, {useState, useEffect} from 'react';
import {auth} from './firebase';
import Modal from '@material-ui/core/Modal';
import {makeStyles} from '@material-ui/core/styles';
import { Button, Grid, Input } from '@material-ui/core';
import ImageUpload from './ImageUpload';
import Avatar from '@material-ui/core/Avatar'
import Pusher from 'pusher-js';
import axios from './axios';
import HomeIcon from '@material-ui/icons/Home';
import SendIcon from '@material-ui/icons/Send';
import ExploreIcon from '@material-ui/icons/Explore';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';

//Modal styling
function getModalStyle() {
  const top = 50;
  const left = 50; 

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));
//modal styling ends


function App() {

  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [posts, setPosts] = useState([]);
  const [openModal, setModalOpen] = useState(false);
  const [openSignInModal, setSignInModal] = useState(false);
  const [newUsername, setNewUsername] = useState();
  const [newPassword, setNewPassword] = useState();
  const [email, setEmail] = useState();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if(authUser){
        //user logged in
        //console.log(authUser);
        setUser(authUser);
        if(authUser.displayName){
          //dont update username
        }else{
          return authUser.updateProfile({
            displayName: newUsername
          });
        }
      }else{
        //user logged out
        setUser(null);
      }
    })
    return () => {
      unsubscribe();
    }
  }, [user, newUsername]);

  //to pull data from db
  const fetchPosts = async () => await axios.get('/sync').then(response => {
    response.data.sort((a,b) => a-b).reverse();
    setPosts(response.data)
  })

  useEffect(() =>{
    //pull info frm db
    fetchPosts();
  }, []);/*runs once when app component loads coz its empty []*/

 //pusher listening in frontend - pubsub model
  useEffect(() => {
    //got the code from pusher.com front end part
      const pusher = new Pusher('8beb83d45ac75bb69e04', {
      cluster: 'us2'
    });
  
    const channel = pusher.subscribe('posts'); 
    channel.bind('inserted', (data) => { //server.js line 44
      fetchPosts();
    });
  },[])

 const handleSignUp = (evt) => {
   evt.preventDefault();
   auth.createUserWithEmailAndPassword(email, newPassword)
   .then((authUser) => {
     return authUser.user.updateProfile({
       displayName: newUsername
     })
   })
   .catch((error) => alert(error.message));
 }

 const handleSignIn = (event) => {
   event.preventDefault();
   auth
    .signInWithEmailAndPassword(email, newPassword)
    .catch((error) => alert(error.message));
   setSignInModal(false);
 }

  return (

    <div className="app">

      {/**Sing up modal*/}
      <Modal
        open={openModal}
        onClose={() => setModalOpen(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className = "app__signup" >
            <center>
              <img className = "app__insta-logo" src = "https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" alt = "Instagram logo"/>
              <br/>
              <Input type = "text" value = {newUsername} onChange = {(evt) => setNewUsername(evt.target.value)} placeholder = "Enter username"/><br/>
              <Input type = "text" value = {email} onChange = {(evt) => setEmail(evt.target.value)} placeholder = "Enter email"/><br/>
              <Input type = "password" value = {newPassword} onChange = {(e) => setNewPassword(e.target.value)} placeholder = "Enter password"/><br/>
              <Button onClick = {handleSignUp}>Sign up</Button>
            </center>
          </form>
        </div>
      </Modal>

      {/**Sign in modal */}
      <Modal
        open={openSignInModal}
        onClose={() => setSignInModal(false)}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className = "app__signup" >
            <center>
              <img className = "app__insta-logo" src = "https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" alt = "Instagram logo"/>
              <br/>
              <Input type = "text" value = {email} onChange = {(evt) => setEmail(evt.target.value)} placeholder = "Enter email"/><br/>
              <Input type = "password" value = {newPassword} onChange = {(e) => setNewPassword(e.target.value)} placeholder = "Enter password"/><br/>
              <Button onClick = {handleSignIn}>Sign In</Button>
            </center>
          </form>
        </div>
      </Modal>

      {/**Header */}
      <div className = "app__header">
        <img className = "app__insta-logo-header" src = "https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" alt = "Instagram logo"/>
        <div className = "app__header__icons">
          <HomeIcon/>
          <SendIcon/>
          <ExploreIcon/>
          <FavoriteBorderIcon/>
          <Avatar></Avatar>
        </div>
       
        {/**Sign in sign out buttons */}
        {user ? <Button onClick = {() => auth.signOut()} >Sign out</Button> : (
                <div className = "app__loginContainer" >
                  <Button onClick = {() => setSignInModal(true)} >Sign in</Button>
                  <Button onClick = {() => setModalOpen(true)} >Sign up</Button>
                </div>
              )}
      </div>
      <Grid container spacing = {1}>
        <Grid item xs = {12} sm = {2}></Grid>
        <Grid item xs = {12} sm = {5}
              direction="column"
              alignItems="center"
              justify="center">
          {/**Posts */}
          <div className = "app__posts">
            {
              //these de-structured (eachPost) are variables useEffect() => fetchposts ... .... above 
              posts.map((eachPost) => (
                <PostComp key = {eachPost._id} postId = {eachPost._id} username = {eachPost.user} caption = {eachPost.caption} imageURL = {eachPost.image} user = {user}/>
              ))
            }
          </div>
        </Grid>
        <Grid item xs = {12} xs = {3}>
          {/**User profile */}
          <div className = "app__userProfile">
                  <Avatar className = "post__avatar" alt = {newUsername} src = "" />
                  <h3>{user?.displayName}</h3>
                  
          </div>
          {/**Upload functionality */}
          {user?.displayName ? (<ImageUpload username = {user.displayName}/>) : (<h3>Sign in/Sign up to upload</h3>) }
          <div className = "footer">
            <p>About Help Press API Jobs Privacy Terms Locations Top Accounts Hashtags Language English</p>
            <p>INSTAGRAM CLONE FOR DEMO PURPOSES ONLY</p>
            <p>No Copyrights Reserved</p>
          </div>
         
        </Grid>
        <Grid item xs = {12} xs = {2}></Grid>
      </Grid>   
    </div>
  );
}

export default App;
