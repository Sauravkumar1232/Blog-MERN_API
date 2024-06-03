export const sendToken = (user, statusCode, message, res) => {
  const token = user.getJWTToken();

  console.log(token, "token from jwt");
  // const options = {
  //   expires: new Date(
  //     Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
  //   ),
  //   httpOnly: false,
  // };

  res.cookie("token", token, {
    httpOnly: true, // Accessible only by web server
    secure: true, // Use HTTPS
    sameSite: "None", // CSRF protection
    maxAge: 3600000 * process.env.COOKIE_EXPIRE, // 1 hour in milliseconds
  });
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user,
  });
};
