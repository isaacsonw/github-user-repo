const getFormData = function () {
  let username = '';
  const inputText = document.querySelector('.input-text').value;
  username = inputText === '' ? 'isaacsonw' : inputText;
  return username;
};

document.getElementById('btn').onclick = () => {
  let inputText = document.querySelector('.input-text');
  document
    .getElementById('myAnchor')
    .setAttribute('href', `user.html?username=${getFormData()}`);
  inputText.value = '';
};
