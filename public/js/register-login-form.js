//FROM LAB 10 SEAN PAYBA
const registerForm = document.getElementById('registration-form');
const loginForm = document.getElementById('login-form');
const biglittleForm = document.getElementById('biglittle-form');
if (registerForm) {
    registerForm.addEventListener('submit', function (event) {
      if (!validateRegisterForm()) {
        event.preventDefault(); 
      }
    });
  }

if (loginForm) {
  loginForm.addEventListener('submit', function (event) {
    if (!validateLoginForm()) {
      event.preventDefault(); 
    }
  });
}

if (biglittleForm) {
  biglittleForm.addEventListener('submit', function (event) {
    if (!validateBigLittleForm()) {
      event.preventDefault(); 
    }
  });
}

  function validateRegisterForm() {
    const userName = document.getElementById('userNameInput').value;
    const firstName = document.getElementById('firstNameInput').value;
    const lastName = document.getElementById('lastNameInput').value;
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const confirmPassword = document.getElementById('confirmPasswordInput').value;
    if (!isValidUsername(userName)) {
        showError('Invalid userName.');
        return false;
    }
    if (!isValidName(firstName)) {
        showError('Invalid first name.');
        return false;
    }

    if (!isValidName(lastName)) {
        showError('Invalid last name.');
        return false;
    }

    if (!isValidEmail(email)) {
        showError('Invalid email address format.');
        return false;
    }

    if (!isValidPassword(password)) {
        showError('Invalid password format.');
        return false;
    }

    if (password !== confirmPassword) {
        showError('Password and Confirm Password must match.');
        return false;
    }

    if (!isValidString(line)) {
        showError('Invalid line.');
        return false;
    }

    // If all validations pass
    return true;
}

function validateLoginForm() {
    const email = document.getElementById('emailAddressInput').value;
    const password = document.getElementById('passwordInput').value;
  
    if (!isValidEmail(email)) {
      showError('Invalid email address format.');
      return false;
    }
  
    if (!isValidPassword(password)) {
      showError('Invalid password format.');
      return false;
    }
  
    // If all validations pass
    return true;
  }

function validateBigLittleForm(){
    const member = document.getElementById('memberInput').value;
    if(!member){
      showError('Invalid member');
      return false;
    }
}
  function isValidUsername(userName){
    return /^(?!.*[._]{2})[a-zA-Z0-9._]{1,30}(?<![._])$/.test(userName) && userName.length >= 3 && userName.length <= 15;
  }
  function isValidName(name) {
    return /^[a-zA-Z]+$/.test(name) && name.length >= 1 && name.length <= 25;
  }
  
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function isValidPassword(password) {
  const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
  }

  
  
  function showError(message) {
      const errorElement = document.getElementById('error');
      errorElement.innerText = message;
      errorElement.style.display = 'block';
  }