const User = require("../models/user");

// module.exports.signup = async (req, res, next) => {
//   console.log("NEXT TYPE:", typeof next);
// }

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

// Add 'next' as the third argument
module.exports.signup = async (req, res, next) => {
  console.log("Value of next:", next);
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err); // Now 'next' exists and works
      }
      req.flash("success", "User Registered!");
      res.redirect("/listings");
    });
  } catch (e) {
    // console.log("--------------- ERROR DETAILS ---------------");
    // console.log(e); // Prints the error name and message
    // console.log(e.stack); // Prints the line number!
    // console.log("---------------------------------------------");
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");
  res.redirect(res.locals.redirectUrl || "/listings");
};

// module.exports.logout = (req, res, next) => {
//   req.logout((err) => {
//     if (err) {
//       return next(err);
//     }
//     req.flash("success", "Successfully Logged out");
//     res.redirect("/listings");
//   });
// };
module.exports.logout = (req, res) => {
  req.logout(() => {
    req.flash("success", "Successfully Logged out");
    res.redirect("/listings");
  });
};
