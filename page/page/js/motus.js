var enterB =  document.getElementById("answer");
var value=0;
var nbTry=5;
var win= false;

//Validate the answer when pressing enter in the answer text
enterB.addEventListener("keypress", function(event){
  if(event.key === "Enter"){
    //cancel the default action of enter
    event.preventDefault();
    document.getElementById("Check").click();
  }
});

//Show user in nav bar if exist
$.get('/user', function(data){
  if(!(data === 'undefined')){
      $('#user').text(data);
  }
})

//When the page is open, call the api wordNb that return the number of letter in the word to guess
$(document).ready(function(){
  $.get('http://localhost:3000/wordNb',function(data){
  var rNb= $('#nbTry');
  value = parseInt(data)-1;
  rNb.text("Le mot a trouver comporte " + value + " lettres")
  });
})


document.getElementById("Check").addEventListener("click", function(event){
  event.preventDefault();
  const answerValue = $('#answer').val();
  // Check if the answer is empty
  if (answerValue.trim() === "") {
    alert("Veuillez entrer un mot");
    return; // Stop further execution
  } //Check if the lenght is correct
  else if(answerValue.length != value){
    alert("Votre mot doit faire exactement " +value + " charactères");
    return; // Stop further execution
  } // check if you can play the game
  else if(nbTry<=0 ||win){
    alert("Le jeux est fini pour aujourd'hui");
    return; // Stop further execution
  }

  //Call api check to know if the word is found or not. 
  //data is a table with the same size as the word, each index has a number, 0 if the letter doesn't exist in the word, 1 if it is on the wrong place, 2 if it is correct
  $.get('http://localhost:3000/check?word='+$('#answer').val(),function(data){

  var resultsContainer = $('#results-container');
  var resultDiv = $('<div>');
  resultDiv.addClass("resultDiv")

  // Append the new div to the results container
  $('#results-container').append(resultDiv);
  var result = true;
  nbTry--;
  for (var i = 0; i < data.length; i++) {
    // Create a new div for each character
    var charDiv = $('<div class = "box">').text(answerValue[i]);
    //Check if one of the letter isn't correct, to know if it is the good answer
    if(data[i] != 2){
      result = false;
    }
    charDiv.addClass(getColorForCharacter(data[i]))

    // Append the new div to the results container
    resultDiv.append(charDiv);
  }
  var resultA =$('#result');
  if(result){
    resultA.text("Bonne réponse !");
    win=true;
      //Save the score in the Score API, for now we hope that score find the user, otherwise we will have to send it
      $.get('http://localhost:3010/setScore?nb='+(5-nbTry))
  }
  else{
    resultA.text("Mauvaise réponse, veuillez réessayer. Il vous reste " + nbTry + " chance");
  }
});

//function that return the class to add depending of the color we want
function getColorForCharacter(char) {
  switch (char) {
    case 0:
      return 'color-0'; // or any color you want for 0
    case 1:
      return 'color-1';
    case 2:
      return 'color-2';
    default:
      return 'color-0'; // default color for other characters
  }
}
});
