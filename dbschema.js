import mongoose from 'mongoose';

const instance = mongoose.Schema ({
    caption: String,
    user: String,
    image: String,
    comments: [
        {
            comment: String,
            userDisplayname: String
        }
    ]
});

export default mongoose.model('posts', instance);