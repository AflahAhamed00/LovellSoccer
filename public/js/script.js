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

function adminLoginValidation() {
  let email = document.getElementById("form-holder").value.trim();
  let password = document.getElementById("form-holder2").value.trim();
  let error = 0;
  if (email === "") {
    document.getElementById("emailError").innerHTML = "Email is required";
    error = 1;
  } else {
    document.getElementById("emailError").innerHTML = "";
  }
  if (password === "") {
    document.getElementById("passwordError").innerHTML = "Password is required";
    error = 1;
  } else {
    document.getElementById("passwordError").innerHTML = "";
  }
  if (error === 1) {
    return false;
  } else {
    return true;
  }
}

function addToCart(productId, discountPrice, selectedSize) {
  console.log("size = ", selectedSize);
  console.log('id = ',productId);
  // if(validateSize()){
  let count = $("#cartCount").html();
  let wishlistCount = $("#wishlistCount").html();

  $.ajax({
    url: "/product/addToCart",
    type: "post",
    data: {
      price: discountPrice,
      productId: productId,
      size: selectedSize,
    },
    success: (response) => {
      if (response.status == "addedToCart") {
        count = parseInt(count) + 1;
        $("#cartCount").html(count);
        if (wishlistCount > 0) {
          wishlistCount = parseInt(wishlistCount) - 1;
          $("#wishlistCount").html(wishlistCount);
        }
        Toastify({
          text: "Added to cart",
          className: "info",
          duration: 600,
          style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
          },
        }).showToast();
        // Assuming you want to reload content after successful addition to cart
        $(".content").load(location.href + " .content");
      } else if (response.status == "countAdded") {
        count = parseInt(count) + 1;
        $("#cartCount").html(count);
        if (wishlistCount > 0) {
          wishlistCount = parseInt(wishlistCount) - 1;
          $("#wishlistCount").html(wishlistCount);
        }
        Toastify({
          text: "Product count added",
          className: "info",
          duration: 600,
          style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
          },
        }).showToast();
        // Assuming you want to reload content after successful addition to cart
        $(".content").load(location.href + " .content");
      } else if (response.status == "outOfStock") {
        Toastify({
          text: "Out of stock",
          className: "info",
          duration: 600,
          style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
          },
        }).showToast();
      } else {
        location.href = "/userLogin";
      }
    },
    error: (error) => {
      console.error("AJAX error:", error);
      // Handle the error, e.g., show an alert to the user
    },
  });
}

function addToWishlist(productId, selectedSize) {
  let count = $("#wishlistCount").html();
  console.log(selectedSize);
  $.ajax({
    url: "/user/wishlist",
    data: { productId: productId, size: selectedSize },
    method: "post",
    success: (response) => {
      console.log("response : ", response);
      if (response.status == true) {
        count = parseInt(count) + 1;
        $("#wishlistCount").html(count);
        Toastify({
          text: "Added to wishlist",
          className: "info",
          duration: 600,
          style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
          },
        }).showToast();
      } else if (response.status == "alreadyExists") {
        Toastify({
          text: "Product already exists",
          className: "info",
          duration: 600,
          style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
          },
        }).showToast();
      } else if (response.status == "outOfStock") {
        Toastify({
          text: "Out of stock",
          className: "info",
          duration: 600,
          style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
          },
        }).showToast();
      } else {
        location.href = "/userLogin";
      }
    },
  });
}
