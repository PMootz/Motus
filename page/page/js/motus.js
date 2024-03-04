var enterB =  document.getElementById("answer");
var value=0;
var nbTry=5;
var win= false;

enterB.addEventListener("keypress", function(event){
  if(event.key === "Enter"){
    event.preventDefault();
    document.getElementById("Check").click();
  }
});
$.get('/user', function(data){
  if(!(data === 'undefined')){
      $('#user').text(data);
  }
})

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
  }
  else if(answerValue.length != value){
    alert("Votre mot doit faire exactement " +value + " charactères");
    return; // Stop further execution
  }
  else if(nbTry<=0 ||win){
    alert("Le jeux est fini pour aujourd'hui");
    return; // Stop further execution
  }
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
    var charDiv = $('<div>').text(answerValue[i]);
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
    $.get('http://localhost:3002/setScore?nb='+(5-nbTry))
  }
  else{
    resultA.text("Mauvaise réponse, veuillez réessayer. Il vous reste " + nbTry + " chance");
  }
});

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