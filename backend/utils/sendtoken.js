//Create token and save in the cookie
export default (user , statuscode, res) => {

    //create JWT token
    const token = user.getJwtToken();

    //options for cookie
    const options = {
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    }


    //set the statuscode with the cookie that has the token value and options
    res.status(statuscode).cookie("token", token, options).json({
        token,
    });
};