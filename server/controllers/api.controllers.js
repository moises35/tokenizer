const fs = require('fs');

const home = (req, res) => {
  // Create a file in the root directory
  fs.writeFileSync('hello-world.txt', 'Hello to this great world!');
  res.status(200).json({ message: 'Home page!' });
};





module.exports = { home };