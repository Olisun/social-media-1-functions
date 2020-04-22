// Helper function for determining an empty string. 
const isEmpty = string => {
  if (string.trim() === '') {
    return true;
  } else {
    return false;
  }
}

// Helper function to check if an email is a valid email. 
const isEmail = email => {
  const regEx = RegExp(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
  if (email.match(regEx)) {
    return true;
  } else {
    return false;
  }
}

// Helper function to validate email and password. 
exports.validateSignupData = (data) => {
  // Creating an errors object to store any validation errors. 
  let errors = {};

  // Applying the isEmpty helper function. 
  if (isEmpty(data.email)) {
    errors.email = 'Please enter your email'
  } else if (!isEmail(data.email)) {
    errors.email = 'Must be a valid email address'
  }

  if (isEmpty(data.password)) {
    errors.password = 'Please enter a password'
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords don not match'
  }

  if (isEmpty(data.handle)) {
    errors.handle = 'Please enter a handle'
  }
  // Checking to see if there are any errors in the errors object above.  If there are, them there's an error.  If nothing in the errors object, then mno errors. 
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  }
}

exports.validateLoginData = data => {
  // login validations.  Same methods as signup validations. 
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = 'Please enter your email'
  }

  if (isEmpty(data.password)) {
    errors.password = 'Please enter your password'
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  }
}

// Adding bio, website & location to user details. 
exports.reduceUserDetails = data => {
  let userDetails = {};

  if (!isEmpty(data.bio.trim())) {
    userDetails.bio = data.bio;
  }

  if (!isEmpty(data.website.trim())) {
    // Adding "https:// in front of the the user's website incase she does not enter it."
    if (data.website.trim().substring(0, 4) !== 'http') {
      userDetails.website = `http://${data.website.trim()}`;
    } else {
      userDetails.website = data.website;
    }
  }

  if (!isEmpty(data.location.trim())) {
    userDetails.location = data.location;
  }

  return userDetails;
}