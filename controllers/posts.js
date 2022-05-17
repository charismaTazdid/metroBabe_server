import mongoose from "mongoose";
import PostMessage from "../models/postMessage.js";

export const getPosts = async (req, res) => {
    const { page } = req.query;
    try {
        const postLimit = 6;
        const startIndex = (Number(page) - 1) * postLimit;
        const totalPost = await PostMessage.countDocuments({});
        const posts = await PostMessage.find().sort({ _id: -1 }).limit(postLimit).skip(startIndex);

        res.status(200).json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(totalPost / postLimit) })
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
};

//get a single post with id
export const getPost = async (req, res) => {
    const { id } = req.params;
    try {
        const post = await PostMessage.findById(id);
        res.status(200).json(post)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
};


//get post by search
export const getPostsBySearch = async (req, res) => {
    const { searchQuery, tags } = req.query;
    try {
        const title = new RegExp(searchQuery, 'i');
        const posts = await PostMessage.find({ $or: [{ title }, { tags: { $in: tags.split(',') } }, { tags: { $in: ` ${tags.split(',')}` } }] });
        res.json({ data: posts });
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
};


//create new post
export const createPost = async (req, res) => {
    const post = req.body;
    const newPost = new PostMessage({ ...post, creator: req.userId, createdAt: new Date().toISOString() });
    try {
        await newPost.save();
        res.status(201).json(newPost);
    }
    catch (error) {
        res.status(409).json({ message: error.message });
    }
};
//update existing post by id
export const updatePost = async (req, res) => {
    const { id: _id } = req.params;
    const post = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send("Invalid Action....")
    }
    const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, { new: true })
    res.json(updatedPost)
};

//delete existing post
export const deletePost = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send("Invalid Action.... something wrong with this request...")
    }
    await PostMessage.findByIdAndDelete(id)
    res.json({ message: 'Post Deleted Successfully...' })
};

//implement like method
export const likePost = async (req, res) => {
    const { id } = req.params;

    if (!req.userId) return res.json({ message: 'user unauthenticated.' });

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send("Something wrong...")
    }
    const post = await PostMessage.findById(id);
    const index = post.likes.findIndex((id) => id === String(req.userId));
    if (index === -1) {
        //like the post
        post.likes.push(req.userId)
    }
    else {
        //dislike the post
        post.likes = post.likes.filter((id) => id !== String(req.userId))
    }
    // const updatedPost = await PostMessage.findByIdAndUpdate(id, { likeCount: post.likeCount + 1 }, { new: true }) 
    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });
    res.json(updatedPost);
}


//posting a comment method
export const commentPost = async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    try {
        const post = await PostMessage.findById(id);
        post.comments.push(comment);
        const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });
        res.json(updatedPost);
    } catch (error) {
        console.log(error);
        res.status(409).json({ message: error.message })
    }
}