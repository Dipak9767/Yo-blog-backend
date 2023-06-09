const BlogSchema = require("../Schemas/BlogSchema");
const ObjectId = require("mongodb").ObjectId;

const Blogs = class {
  title;
  textBody;
  userId;
  creationDateTime;
  blogId;
  constructor({ title, textBody, userId, creationDateTime, blogId, username }) {
    this.title = title;
    this.creationDateTime = creationDateTime;
    this.textBody = textBody;
    this.userId = userId;
    this.username = username;
    this.blogId = blogId;
  }

  createBlog() {
    return new Promise(async (resolve, reject) => {
      this.title.trim();
      this.textBody.trim();

      const blog = new BlogSchema({
        title: this.title,
        textBody: this.textBody,
        creationDateTime: this.creationDateTime,
        userId: this.userId,
        username: this.username
      });

      try {
        const blogDb = await blog.save();
        resolve(blogDb);
      } catch (error) {
        reject(error);
      }
    });
  }

  static getBlogs({ skip }) {

    return new Promise(async (resolve, reject) => {
      // sort and pagination
      try {

        const blogsDb = await BlogSchema.aggregate([
          {
            $sort: {
              creationDateTime: 1
            }
          },
          {
            $facet: {
              data: [{ $skip: parseInt(skip) }, { $limit: 10 }],
            },
          },
        ]);
        resolve(blogsDb[0].data);
      }
      catch (error) {
        reject(error)
      }
    })
  }

  static myBlogs({ skip, userId }) {
    return new Promise(async (resolve, reject) => {
      //match, sort, pagination
      try {
        const myBlogsDb = await BlogSchema.aggregate([
          { $match: { userId: new ObjectId(userId) } },
          { $sort: { creationDateTime: 1 } },
          {
            $facet: {
              data: [{ $skip: parseInt(skip) }, { $limit: 5 }],
            },
          },
        ]);
        resolve(myBlogsDb[0].data);
      } catch (error) {
        reject(error);
      }
    });
  }


  static singleBlog({ blogID }) {
    return new Promise(async (resolve, reject) => {
      try {

        // finding blog 
        const blog = await BlogSchema.findOne({
          _id: blogID
        })
      
        // if blog not found
        if (!blog) {
          reject("blog does not exists")
        }

        // all good returning blog
        resolve(blog)
      } catch (error) {
        reject()
      }
    })
  }

  getBlogDataFromId() {
    return new Promise(async (resolve, reject) => {
      try {
        const blogDb = await BlogSchema.findOne({
          _id: this.blogId,
        });

       
        if (!blogDb) {
          reject("Blog not found");
        }

        resolve(blogDb);
      } catch (error) {
        reject(error);
      }
    });
  }

  updateBlog() {
    return new Promise(async (resolve, reject) => {
      let newBlogData = {};
      try {
        if (this.title) {
          newBlogData.title = this.title;
        }

        if (this.textBody) {
          newBlogData.textBody = this.textBody;
        }

        const oldData = await BlogSchema.findOneAndUpdate(
          { _id: this.blogId },
          newBlogData
        );
        return resolve(oldData);
      } catch (error) {
        return reject(error);
      }
    });
  }

  static deleteBlog({ blogId }) {
    return new Promise(async (resolve, reject) => {
      try {
        const oldBlogDb = await BlogSchema.findOneAndDelete({
          _id: blogId,
        });
        resolve(oldBlogDb);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = Blogs;