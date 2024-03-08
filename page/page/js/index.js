//Show user in nav bar if exist
$.get('/user', function(data){
    if(!(data === 'undefined')){
        $('#user').text(data);
    }
})

document.getElementById("user").addEventListener("click", function(event){
    console.log("here")
    $.get('/logout')
})