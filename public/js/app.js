$(document).ready(function() {
  console.log( 'JS is ready!' );
});

$('button').on('change', showTemplate);

function showTemplate() {
  $('#edit').show();
}
