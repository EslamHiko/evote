const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  var token = req.headers['authorization'];
  token = token.replace('Bearer ','')
  console.log(token)
  console.log(token)

  // Check for token
  if (!token)
    return res.status(401).json({ msg: 'No token, authorizaton denied' });

  try {
    // Verify token
    const decoded = jwt.verify(token, "top_secret");
    console.log(decoded)
    // Add user from payload
    req.user = (decoded);
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
}

module.exports = auth;
