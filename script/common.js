/*
	Global variables for checking and saving company name
*/

var new_company = false;

function getList(id, list, drug, insertData){
	var value = document.getElementById(id).value;
	console.log(id);
	id = (id.substr(7) == "MarketedBy" || id.substr(7) == "Manftr") ? 'company_name' : id;

	$.ajax({
		url: 'functions/purchaseFunctions.php', // /public_html/tslifecare.com
		type: 'post',
		data: {
			searchTerm: value,
			table: id,
			access:  (drug == true) ? 'getDrug' : 'getList',
		},
		success: function(data){
			console.log(data);
			document.getElementById(list).innerHTML = data;
			
			if (id == 'stockist_name'){
				$('#stockist_name').on('input', function(){
				    var options = $('datalist')[0].options;
				    for (var i=0;i<options.length;i++){
				       if (options[i].value == $(this).val()) 
				         {checkPendingDM(false); break;}
				    }
				});
				if ( document.getElementById('productMarketedBy') !== null){
					document.getElementById('productMarketedBy').value = document.getElementById('company_name').value;
					checkPendingDM();
				}
				if ( document.getElementById('productManftr') !== null ){
					document.getElementById('productManftr').value = document.getElementById('company_name').value;
				}
			}
			// else if(id == 'company_name'){
			// 	$.ajax({
			// 		url: 'functions/purchaseFunctions.php',
			// 		type: 'post',
			// 		data: {
			// 			name: $('#productMarketedBy').val(),
			// 			access: 'get_company_abr'
			// 		},
			// 		success: function(data){
			// 			console.log(data);
			// 			if (data != '0'){
			// 				$('#productMarketedBy').val(data);
			// 				$('#productManftr').val(data);
			// 				$('#productPackSize').focus();
			// 			}
			// 		}
			// 	});
			// }

			if (insertData != null && insertData == true){
				getData('_'+(counter-1), '', '', 'new');
			}
		}
	});
}

function saveStockistCustomer(){
	$.ajax({
		url: 'functions/otherFunctions.php',
		type: 'post',
		data: {
			acType: $('#type').val(),
			name: $('#name').val(),
			city: $('#city').val(),
			address: $('#address').val(),
			phone: $('#phone').val(),
			debit_limit: $('#debit_limit').val(),
			days_limit: $('#days_limit').val(),
			email: $('#email').val(),
			vat_tin_no: $('#vat_tin_no').val(),
			lbtNo: $('#lbtNo').val(),
			openBalance: $('#openBalance').val(),
			onoffswitch: $('.onoffswitch-inner').val(),
			status: $('#saveChanges').html(),
			option: 'save'
		},
		success: function(data){
			document.getElementById('msgCstSupp').innerHTML = data;
			//console.log(data);
			$('input[type=text]').val("");
			$('input[type=number]').val("");
			$('input[type=email]').val("");
			$('textarea').val("");
		}
	});
}

function saveType(){
	$.ajax({
		url: 'functions/otherFunctions.php',
		type: 'post',
		data: {
			productType: $('#productType').val(),
			code: $('#code').val(),
			option: 'savOrUpdate'
		},
		success: function(data){
			document.getElementById('productTypeMsg').innerHTML = data;
		}
	});
}

function deleteType(){
	$.ajax({
		url: 'functions/otherFunctions.php',
		type: 'post',
		data: {
			productType: $('#productType').val(),
			option: 'deleteType'
		},
		success: function(data){
			document.getElementById('productTypeMsg').innerHTML = data;
		}
	});	
}

function saveDrugContent(){
	var drug_content = $('#drug_content').val();
	var sub_Cat = $('#sub_category').val();
	$.ajax({
		url: 'functions/otherFunctions.php',
		type: 'post',
		data: {
			drug_content: drug_content,
			sub_category: sub_Cat,
			option: 'insert_or_update_drugcontent'
		},
		success: function(data){
			console.log(data);
			$('#productContent').val(drug_content);
		}
	});
}

function deleteDrugContent(){
	var drug_content = $('#drug_content').val();
	var sub_Cat = $('#sub_category').val();
	$.ajax({
		url: 'functions/otherFunctions.php',
		type: 'post',
		data: {
			drug_content: drug_content,
			sub_category: sub_Cat,
			option: 'delete_drugcontent'
		},
		success: function(data){
			console.log(data);
		}
	});
}

function convert_to_INV(inv_no, purEntry){
	console.log(purEntry);
	$.ajax({
		url: 'functions/otherFunctions.php',
		type: 'post',
		dataType: 'JSON',
		data: {
			invNo: inv_no,
			purEntry: purEntry > 0 ? purEntry : -1,
			option: 'convert_to_INV'
		},
		success: function(data){
			console.log(data);
			$('#billContent').html(data.bill);
			$('#invoiceNumber').val(data.invoiceNo);
			$('#billDate').val(data.billDate);
			$('#stockist_name').val(data.supplier);
			$('#purchaseEntry').val(data.purEntry);
			$('#debitNote').val(data.debit_note);
			//calculate(data.count+1);
			// Calculate total amount after each entry
			var grandTotal = 0;
			for (var i = 1; i <= data.count; i++){
				// Calculate total amount minus the discount
				grandTotal += parseFloat($('#purchaseRate_'+i).val()) * parseFloat($('#productSize_'+i).val());
				//console.log("total amount"+grandTotal);
			}

			$('#totalAmnt').val(grandTotal.toFixed(2));
			getTotal(data.count+1);
			console.log("Count = "+data.count);
			$('#pendingBillsModal').modal('hide');
			$('#productName_1').focus();
			$('#modify').val('true');
			counter = counter+1;
			$('#counter').val(counter);
		}
	});
}

$('#purchaseEntry').keydown(function(e){
	if (e.which == 13){
		convert_to_INV(0, $('#purchaseEntry').val());
		getDetails();
	}
});


// function getDetails(){
// 	$.ajax({
// 		url: 'getDetails.php',
// 		type: 'post',
// 		dataType: 'JSON',
// 		data: {
// 			id: $('#patientID').val()
// 		},
// 		success: function(data){
// 			$('#first_name').val(data.first_name);
// 			...
// 		}
// 	});
// }


/*
	Script for new item entry
*/

$('#company_name').keydown(function(e){
	//console.log(e);
	if (e.which == 13){
		console.log("Enter");
		$.ajax({
			url: 'functions/purchaseFunctions.php',
			type: 'post',
			//dataType: 'json',
			data: {
				company_name: $('#company_name').val(),
				save: 'false',
				access: 'check_and_save_company'
			},
			success: function(data){
				console.log(data);
				if (data == "0"){
					new_company = confirm("Company name not found. Save new Company?");
					$('#shortName').focus();
				}else{
					var list = data.split('/');
					$('#company_name').val(list[0]);
					$('#shortName').val(list[1]);
					$('#productManftr').val(list[1]);
					$('#productMarketedBy').val(list[1]);
					$('#stockist_name').focus();
				}
			}
		});
	}
});

$('#shortName').keydown(function(e){
	// Save the new company name
	if (e.which == 13){
		$.ajax({
			url: 'functions/purchaseFunctions.php',
			type: 'post',
			data: {
				company_name: $('#company_name').val(),
				abr: $('#shortName').val(),
				save: 'true',
				access: 'check_and_save_company'
			},
			success: function(data){
				console.log(data);
				if (data == 'saved'){
					$('stockist_name').focus();
					$('#productMarketedBy').val($('#shortName').val());
					$('#productManftr').val($('#shortName').val());
				}
			}
		});
	}

});


$('#stockist_name').keydown(function(e){
	if (e.which == 13){
		$('#stockist_priority').focus();
	}
});

// Keep the stockist name in the list
// and save the stockist names in the stockist table
// along with the company's code

$('#stockist_priority').keydown(function(e){
	console.log(e.which);
	// Append the stockist name and priority in the table
	// Save the data to stockist table
	//console.log("HERER");
	if (e.which == 13){
		if ($('stockist_name').val() == ""){
			alert("Please enter stockist name");
		}else{
			$.ajax({
				url: 'functions/purchaseFunctions.php',
				type: 'post',
				data: {
					stockist_name: $('#stockist_name').val(),
					priority: $('#stockist_priority').val(),
					company_name: $('#company_name').val(),
					access: 'save_stockist'
				},
				success: function(data){
					// Append to table
					console.log(data);
					$('#stockist_list_table').append(data);
					$('#stockist_name').val('');
					$('#stockist_priority').val('');
				}
			});
		}
	}
});

/*
	## Add eventlistener to productMarketedBy field
	## to get the abbreviation of the company name
	## when hit enter
*/

$('#productMarketedBy').keydown(function(e){
	if (e.which == 13){
		$.ajax({
			url: 'functions/purchaseFunctions.php',
			type: 'post',
			data: {
				name: $('#productMarketedBy').val(),
				access: 'get_company_abr'
			},
			success: function(data){
				console.log(data);
				if (data != '0')
					$('#productMarketedBy').val(data);
					$('#productManftr').val(data);
					$('#productPackSize').focus();
			}
		});
	}
});


// function get_drug_content(){
// 	$.ajax({
// 		url: 'functions/purchaseFunctions.php',
// 		type: 'post',

// 	})	;
// }

function getStockistName(){
	console.log($('#type').val());
	if ($('#type').val() == 'Supplier'){
		$.ajax({
			url: 'functions/purchaseFunctions.php',
			type: 'post',
			data: {
				input: $('#name').val(),
				access: 'get_stockist'
			},
			success: function(data){
				console.log(data);
				$('#name_list').html(data);

				get_stockist_data();
			}
		});
	}
}

function get_stockist_data(){
	console.log("here");
	$.ajax({
		url: 'functions/purchaseFunctions.php',
		type: 'post',
		dataType: 'json',
		data: {
			input: $('#name').val(),
			access: 'get_stockist_data'
		},
		success: function(data){
			console.log(data);
			$('#city').val(data.city);
			$('#address').val(data.address);
			$('#phone').val(data.phone);
			$('#debit_limit').val(data.debitLimit);
			$('#days_limit').val(data.daysLimit);
			$('#email').val(data.email);
			$('#vat_tin_no').val(data.vat_tin_no);
			$('#openBalance').val(data.openingBalance);
			$('#saveChanges').html("Update");
		}
	});
}

$('.open_heads_modal').click(function(e){
	$('.modal-heads').modal();
})