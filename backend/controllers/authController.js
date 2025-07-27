const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /signup
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
const trimmedPassword = password.trim();

  try {
    const existing = await User.findOne({ normalizedEmail });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    if (!password) {
    return res.status(400).json({ message: "Password is required and must be at least 6 characters." });
    }

    const passwordHash = await bcrypt.hash(trimmedPassword, 10);
    const user = new User({ name, email: normalizedEmail, passwordHash });
    await user.save();

    const token = jwt.sign(
      { user: {
        _id: user._id,
        name: user.name,
        email: user.email
      } },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ message: "User created successfully",
      token,
      user: {
      _id: user._id,
      name: user.name,
      email: user.email
    }});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /login
exports.login = async (req, res) => {
  let { email, password } = req.body;

  email = email.toLowerCase().trim();
  password = password.trim();

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token and respond
    const token = jwt.sign(
      { user: { _id: user._id, name: user.name, email: user.email } },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

