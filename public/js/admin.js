

function changeAccess(id, block) {
  $.ajax({
    url: "/admin/customerManagement",
    type: "patch",
    data: {
      userId: id,
      Block: block,
    },
    success: (res) => {
      
      location.reload();
    },
  });
}

function editCategory(id, e, element) {
  e.preventDefault();
  Swal.fire({
    title: "Do you want to edit category?",
    showCancelButton: true,
    confirmButtonText: "Yes, i want to edit category",
  }).then((result) => {
    if (result.isConfirmed) {
      let url = element.getAttribute("href");
      window.location.href = url;
    }
  });
}

function editBrand(id, e, element) {
  e.preventDefault();
  Swal.fire({
    title: "Do you want to edit brand?",
    showCancelButton: true,
    confirmButtonText: "Yes, i want to edit brand",
  }).then((result) => {
    if (result.isConfirmed) {
      let url = element.getAttribute("href");
      window.location.href = url;
    }
  });
}

function changeListing(id){
  $.ajax({
    url: `/admin/productManagement/changeListing/${id}`,
    type: 'patch',

    success: (res) => {
        $("#" + id).load(location.href + " #" + id);
    }
})
}

function editProductsAlertBox(id, e, element) {
  e.preventDefault();
  Swal.fire({
    title: "Do you want to edit product?",
    showCancelButton: true,
    confirmButtonText: "Yes, edit it!",
  }).then((result) => {
    if (result.isConfirmed) {
      let url = element.getAttribute("href");
      window.location.href = url;
    }
  });
}
