import React, { useState, useEffect } from 'react'
import Avatar from '@material-ui/core/Avatar'
import Pusher from 'pusher-js';
import axios from './axios';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import SendIcon from '@material-ui/icons/Send';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';


const pusher = new Pusher('8beb83d45ac75bb69e04', {
    cluster: 'us2'
});

function PostComp({postId, username, caption, imageURL, user}) {

    const [comments, setComments] = useState([]);
    const [thiscomment, setComment] = useState([]);
    
    const getConvo = () => {
        axios.get(`/get/comments?id=${postId}`).then((res) => {
            setComments(res.data[0].comments)
        })
    }
    useEffect(() => {
        if (postId) {
            getConvo();
            //pusher
            const channel = pusher.subscribe('messages');  
            channel.bind('newComment', function(data) {
                getConvo()
            });
        }
    }, [postId])

    const postComment = (evt) => {
        evt.preventDefault();
        if (postId) {
            axios.post(`/new/comment?id=${postId}`, {
                comment: thiscomment,
                userDisplayname: user.displayName
            })
        }
        setComment('');
    }

    return (
        <div className = "post">
            {/**Avatar, username */}
            <div className = "post__header">
                <Avatar className = "post__avatar" alt = {username} src = {user?.photoURL} />
                <h3>{username}</h3>
            </div>
            
            {/**Post Image */}
            <img className = "post__post-image" src = {imageURL} 
                 alt = "username_avatar"/>
            <div className = "post_actions">
                <div className = "post_actions_left">
                    <FavoriteBorderIcon/>
                    <ChatBubbleOutlineIcon/>
                    <SendIcon/>
                </div>
                <div className = "post_actions_right">
                    <BookmarkBorderIcon/>
                </div>
            </div>
            {/** Username: caption below image*/}
            <h4 className = "post__caption"><strong>{username}</strong> {caption}</h4>

            {//Show all existing comments on startup of app
                <div className = "post__comments">
                    {comments.map((comm) => (
                        <p><strong> {comm.userDisplayname} </strong> {comm.comment} </p>
                    ))}
                </div> 
            
            }

            {/**Show add comment input only if user is logged in */}
            {
                user && (
                    <form className = "post__commentBox">
                        <input type = "text" value = {thiscomment} onChange = {e => setComment(e.target.value)} placeholder = "Add comment..." className = "post__comment-input"/>
                        <button type = "submit" disabled = {!thiscomment} onClick = {postComment} className = "post__comment-button">Post</button>
                    </form>
                )
            }
                        
        </div>
    )
}

export default PostComp
