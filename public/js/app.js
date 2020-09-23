$(document).ready(function() {
  // $('#edit').hide();
  console.log('JS is ready!');
});

$('#callForm').on('click', showTemplate);

function showTemplate() {
  console.log('in function!!');
  $('#edit').show();
}
