// user signup validation
function signupValidate() {
  let name = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let phoneNo = document.getElementById("phoneNumber").value.trim();
  let password = document.getElementById("password").value.trim();
  let confirmPassword = document
    .getElementById("confirm_Password")
    .value.trim();

  let errorFlag = 0;

  // validation of name
  if (name == "") {
    document.getElementById("nameError").innerHTML = "*Name is required";
    errorFlag = 1;
  } else if (name.length < 2) {
    document.getElementById("nameError").innerHTML = "*Name is too short";
    errorFlag = 1;
  } else {
    document.getElementById("nameError").innerHTML = "";
  }

  //validation of emai;;
  if (email == "") {
    document.getElementById("emailError").innerHTML = "*Email is required";
    errorFlag = 1;
  } else {
    document.getElementById("emailError").innerHTML = "";
  }

  // validation of phone number
  if (phoneNo == "") {
    document.getElementById("phoneError").innerHTML =
      "*Phone number is required";
    errorFlag = 1;
  } else if (phoneNo.length < 10) {
    document.getElementById("phoneError").innerHTML = "*Invalid phone number";
    errorFlag = 1;
  } else {
    document.getElementById("phoneError").innerHTML = "";
  }

  // validation of password
  if (password == "") {
    document.getElementById("passwordError").innerHTML =
      "*Password is required";
    errorFlag = 1;
  } else if (password.length < 6) {
    document.getElementById("passwordError").innerHTML =
      "*Password length should be more than 6";
    errorFlag = 1;
  } else {
    document.getElementById("passwordError").innerHTML = "";
  }

  // validation of confirm password
  if (confirmPassword == "") {
    document.getElementById("confirmPasswordError").innerHTML =
      "*Confirm password is required";
    errorFlag = 1;
  } else if (confirmPassword != password) {
    document.getElementById("confirmPasswordError").innerHTML =
      "*Password doesn't match";
    errorFlag = 1;
  } else {
    document.getElementById("confirmPasswordError").innerHTML = "";
  }

  if (errorFlag == 1) {
    return false;
  } else {
    return true;
  }
}

// userlogin validation

function loginValidate() {
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();
  let errorFlag = 0;

  if (email == "") {
    document.getElementById("emailError").innerHTML = "*Email is required";
    errorFlag = 1;
  } else {
    document.getElementById("emailError").innerHTML = "";
  }
  if (password == "") {
    document.getElementById("passwordError").innerHTML =
      "*Password is required";
    errorFlag = 1;
  } else {
    document.getElementById("passwordError").innerHTML = "";
  }

  if (errorFlag == 1) {
    return false;
  } else {
    return true;
  }
}

function forgotPasswordValidate() {
  let password = document.getElementById("password").value.trim();
  let confirmPassword = document.getElementById("confirmPassword").value.trim();
  let errorFlag = 0;

  if (password == "") {
    document.getElementById("passwordError").innerHTML =
      "*Password is required";
    errorFlag = 1;
  } else if (password.length < 6) {
    document.getElementById("passwordError").innerHTML =
      "*Password length should be more than 6";
    errorFlag = 1;
  } else {
    document.getElementById("passwordError").innerHTML = "";
  }

  if (confirmPassword == "") {
    document.getElementById("confirmPasswordError").innerHTML =
      "*Confirm password is required";
    errorFlag = 1;
  } else if (confirmPassword != password) {
    document.getElementById("confirmPasswordError").innerHTML =
      "*Password doesn't match";
    errorFlag = 1;
  } else {
    document.getElementById("confirmPasswordError").innerHTML = "";
  }

  if (errorFlag == 1) {
    return false;
  } else {
    return true;
  }
}
