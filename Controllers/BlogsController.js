const express = require('express');
const { BlogDataValidate } = require('../Utils/BlogUtils');
const User = require('../Models/UserModel');
const Blogs = require('../Models/BlogModel');
const BlogRouter = express.Router();

// Create Blogs
BlogRouter.post('/create-blog', (req, res) => {

    const { title, textBody, userId, username } = req.body;

    const creationDateTime = new Date();


    BlogDataValidate({ title, textBody, userId })
        .then(async () => {

            try {
                await User.verifyUserId({ userId })
            } catch (error) {
                return res.send({
                    status: 400,
                    message: "User ID Error",
                    error: err,
                });
            }

            const blogObj = new Blogs({ title, textBody, userId, creationDateTime, username });

            try {
                const blogDb = await blogObj.createBlog();
              
                return res.send({
                    status: 200,
                    message: "Blog created Successfully",
                    data: blogDb,
                });
            } catch (error) {
                return res.send({
                    status: 500,
                    message: "Database error",
                    error: error,
                });
            }


        })
        .catch((err) => {
          
            return res.send({
                status: 400,
                message: "Data Error",
                error: err,
            });
        });


})

// get All Blogs
BlogRouter.get('/get-all-blogs', async (req, res) => {
    const skip = req.body.skip || 0;
    try {

        const blogs = await Blogs.getBlogs({ skip });

        return res.send({
            status: 200,
            message: "read success",
            data: blogs
        })
    } catch (error) {
        return res.send({
            status: 500,
            message: "Database error",
            error: error,
        });
    }
})

// get muy blogs
BlogRouter.get("/my-blogs", async (req, res) => {
    const skip = req.query.skip || 0;
    const userId = req.query.userId;
    try {
        // await User.verifyUserId({userId})

        const myBlogDb = await Blogs.myBlogs({ skip, userId });

        return res.send({
            status: 200,
            message: "Read Success",
            data: myBlogDb,
        });
    } catch (error) {
    
        return res.send({
            status: 500,
            message: "Database error",
            error: error,
        });
    }
});

BlogRouter.get("/single-blog", async (req, res) => {
    const blogID = req.query.blogID;
    
    try {

       
        const blog = await Blogs.singleBlog({ blogID });

        return res.send({
            status: 200,
            message: "Read Success",
            data: blog,
        });
    } catch (error) {
     
        return res.send({
            status: 500,
            message: "Database error",
            error: error,
        });
    }
});

BlogRouter.post("/edit-blog", async (req, res) => {
  const { title, textBody , userId } = req.body;
  const blogId = req.body._id
 

  try {
    //find the blog with blogId
    const blogObj = new Blogs({ title, textBody, userId, blogId });
    const blogDb = await blogObj.getBlogDataFromId();

    //compare the owner and the user making the request to edit
    //if(userId1.toString() === userId2.toString())
    if (!blogDb.userId.equals(userId)) {
      return res.send({
        status: 401,
        message: "Not allowed to edit, Authorization Failed",
      });
    }
    
    const oldBlogDb = await blogObj.updateBlog();

    return res.send({
      status: 200,
      message: "Update successfull",
      data: oldBlogDb,
    });
  } catch (err) {
    
    return res.send({
      status: 400,
      message: "Data Error",
      error: err,
    });
  }
});

BlogRouter.post("/delete-blog", async (req, res) => {
    const blogId = req.body.blogId;
 
    try {
  
      const oldBlogDb = await Blogs.deleteBlog({blogId});
  
      return res.send({
        status: 200,
        message: "Delete successfull",
        data: oldBlogDb,
      });
    } catch (error) {
   
      return res.send({
        status: 500,
        message: "Data Error",
        error: error,
      });
    }
  });
  

module.exports = BlogRouter;