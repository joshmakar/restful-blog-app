//////////////////////////////////////////////////
// Setup and configure environment
//////////////////////////////////////////////////

// Load Packages
const express           = require('express'),
      app               = express(),
      bodyParser        = require('body-parser'),
      mongoose          = require('mongoose'),
      methodOverride    = require('method-override'),
      expressSanitizer  = require('express-sanitizer');

// App Configuration
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride('_method'));

// Connect to DB
mongoose.connect(
  'mongodb://localhost/restful_blog_app',
  { useNewUrlParser: true }
);


//////////////////////////////////////////////////
// Schema Setup
//////////////////////////////////////////////////

const blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now}
}),
Blog = mongoose.model('Blog', blogSchema);


//////////////////////////////////////////////////
// ReSTful Routes
//////////////////////////////////////////////////

// ROOT
app.get('/', (req, res) => {
  res.redirect('/blogs');
});

// INDEX
app.get('/blogs', (req, res) => {
  Blog.find({}, (err, blogs) => {
    if (err) {
      console.log(err);
    } else {
      res.render('index', {blogs: blogs});
    }
  });
});

// NEW - Display new blog form
app.get('/blogs/new', (req, res) => {
  res.render('new');
});

// CREATE - Save new blog entry to DB then redirect
app.post('/blogs', (req, res) => {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog, (err, newBlog) => {
    if (err) {
      res.render('new');
    } else {
      res.redirect('/blogs');
    }
  });
});

// SHOW - Display new blog entry
app.get('/blogs/:id', (req, res) => {
  Blog.findById(req.params.id, (err, foundBlog) => {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.render('show', {blog: foundBlog});
    }
  });
});

// EDIT - Display edit blog form
app.get('/blogs/:id/edit', (req, res) => {
  Blog.findById(req.params.id, (err, foundBlog) => {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.render('edit', {blog: foundBlog});
    }
  });
});

// UPDATE - Save blog updates to DB
app.put('/blogs/:id', (req, res) => {
  let blogId = req.params.id;
  Blog.findByIdAndUpdate(blogId, req.body.blog, (err, updatedBlog) => {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.redirect(`/blogs/${blogId}`);
    }
  });
});

// DESTROY - Remove blog entry from DB
app.delete('/blogs/:id', (req, res) => {
  let blogId = req.params.id;
  Blog.findByIdAndDelete(blogId, err => {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.redirect('/blogs');
    }
  });
});

// 404 - Page not found
app.get('*', (req, res) => {
  res.render('404');
});


//////////////////////////////////////////////////
// Start listening
//////////////////////////////////////////////////

app.listen(3000, () => {
  console.log('Restful Blog App Running');
});
